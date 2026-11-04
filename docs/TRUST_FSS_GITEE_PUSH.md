# Trust FSS 0.1 · Gitee `demo-ppi-mvp` 推送勾选清单

> 合同：`SurfaceZervi/docs/TRUST_FSS_PPI_0.1.md`  
> Verifier 在 **DemoPeter :5200**，不在本仓。

## DemoPPI 仓内（推送到 Gitee）

| 状态 | 路径 / 项 |
|:----:|-----------|
| ☐ | `lib/trust/types.ts` |
| ☐ | `lib/trust/verify-proposal.ts` |
| ☐ | `lib/trust/governance-vote.ts` |
| ☐ | `lib/supabase/service.ts` |
| ☐ | `app/api/trust/verify-proposal/route.ts` |
| ☐ | `app/api/governance/votes/route.ts`（含可选门禁） |
| ☐ | `supabase/migrations/20260604000000_trust_fss_records_optional.sql` |
| ☐ | `.env.example` → `TRUST_VERIFIER_URL`、`TRUST_FSS_ENABLED`、`SUPABASE_SERVICE_ROLE_KEY` 说明 |

## 环境变量（Gitee 部署 / 本地 `.env.local`）

| 变量 | 必填 | 默认 | 说明 |
|------|:----:|------|------|
| `TRUST_VERIFIER_URL` | 演示时 | `http://127.0.0.1:5200` | Nazha Verifier 根地址 |
| `TRUST_FSS_ENABLED` | 否 | `false` | `true` 时投票前强制验证据 |
| `SUPABASE_SERVICE_ROLE_KEY` | 审计时 | — | 写入 `trust_fss_records`；无则仅跳过审计 |

## 仓库外（联调，不放进 demo-ppi-mvp）

| 状态 | 项 |
|:----:|-----|
| ☐ | `DemoPeter` 启动 Web（`:5200`） |
| ☐ | `TRUST_FSS_MOCK=true` 跑 A/B/C |
| ☐ | `POST /api/trust/verify-proposal?selfcheck=1` 或 `python scripts/trust_fss_abc_demo.py` |

## 推送后自检

```bash
# 1. Verifier
curl -s http://127.0.0.1:5200/trust/v1/health | jq .

# 2. DemoPPI A/B/C 代理
curl -s -X POST 'http://localhost:3000/api/trust/verify-proposal?selfcheck=1' | jq .

# 3. 门禁关闭 — 投票照常
# TRUST_FSS_ENABLED=false
# POST /api/governance/votes { proposal_id, vote }

# 4. 门禁开启 — 需 evidence_refs + Verifier normal
# TRUST_FSS_ENABLED=true
# POST /api/governance/votes {
#   proposal_id, vote,
#   evidence_refs: [{ "kind": "nazha.chunk", "id": "chunk_mock_ok" }],
#   proposal_text: "根据社区宪章调整邀请额度"
# }
```
