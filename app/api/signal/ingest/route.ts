import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { NextResponse } from "next/server";

/**
 * POST /api/signal/ingest — Chain A 信号接收端点（PlanetX → DemoPPI）。
 *
 * 对齐信号桥指南 §4.4 / §5.4（chain A 信封）：
 * - 信封：{ signal_type, user_email_hash, data{personality_type, traits?, score?}, timestamp, nonce }
 * - 签名：X-Signal-Signature = HMAC-SHA256(SIGNAL_BRIDGE_SECRET, raw body)，hex 小写
 * - 幂等：本地 JSONL（data/signal_ingest.jsonl）按 nonce 去重
 * - 响应：200 {status:"ok"|"duplicate"} / 401 invalid_signature / 422 invalid_envelope
 */
const HASH_RE = /^[a-f0-9]{64}$/;

function sign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a.toLowerCase(), "utf8");
  const bb = Buffer.from(b.toLowerCase(), "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function logFile(): string {
  return path.join(process.cwd(), "data", "signal_ingest.jsonl");
}

function isDuplicate(nonce: string): boolean {
  const file = logFile();
  if (!fs.existsSync(file)) return false;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      if (JSON.parse(line).nonce === nonce) return true;
    } catch {
      // skip malformed line
    }
  }
  return false;
}

interface Envelope {
  signal_type?: unknown;
  user_email_hash?: unknown;
  data?: unknown;
  timestamp?: unknown;
  nonce?: unknown;
}

function validateEnvelope(
  env: Envelope
): { ok: true } | { ok: false; code: string; detail: string } {
  if (env.signal_type !== "personality_beacon") {
    return {
      ok: false,
      code: "unsupported_signal",
      detail: `unknown signal_type: ${String(env.signal_type)}`,
    };
  }
  if (typeof env.user_email_hash !== "string" || !HASH_RE.test(env.user_email_hash)) {
    return { ok: false, code: "invalid_envelope", detail: "user_email_hash required: 64 hex" };
  }
  if (typeof env.nonce !== "string" || env.nonce.length < 8) {
    return { ok: false, code: "invalid_envelope", detail: "nonce required: min 8 chars" };
  }
  if (typeof env.data !== "object" || env.data === null || Array.isArray(env.data)) {
    return { ok: false, code: "invalid_envelope", detail: "data required: object" };
  }
  const data = env.data as Record<string, unknown>;
  if (typeof data.personality_type !== "string" || !data.personality_type.trim()) {
    return { ok: false, code: "invalid_envelope", detail: "data.personality_type required" };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const secret = (process.env.SIGNAL_BRIDGE_SECRET ?? "").trim();
  if (!secret) {
    return NextResponse.json(
      { code: "server_misconfigured", detail: "SIGNAL_BRIDGE_SECRET not configured" },
      { status: 503 }
    );
  }

  const raw = await request.text();
  const signature = request.headers.get("X-Signal-Signature") ?? "";
  if (!signature || !safeEqual(sign(secret, raw), signature)) {
    return NextResponse.json(
      { code: "invalid_signature", detail: "X-Signal-Signature HMAC mismatch" },
      { status: 401 }
    );
  }

  let env: Envelope;
  try {
    env = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { code: "invalid_envelope", detail: "request body must be JSON" },
      { status: 422 }
    );
  }

  const result = validateEnvelope(env);
  if (!result.ok) {
    return NextResponse.json({ code: result.code, detail: result.detail }, { status: 422 });
  }

  const nonce = env.nonce as string;
  if (isDuplicate(nonce)) {
    return NextResponse.json({ status: "duplicate" });
  }

  const signalId = randomUUID();
  const record = {
    signal_id: signalId,
    signal_type: env.signal_type,
    user_email_hash: env.user_email_hash,
    nonce,
    data: env.data,
    timestamp: env.timestamp ?? new Date().toISOString(),
    received_at: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(logFile()), { recursive: true });
  fs.appendFileSync(logFile(), JSON.stringify(record) + "\n", "utf8");

  return NextResponse.json({ status: "ok", signal_id: signalId });
}
