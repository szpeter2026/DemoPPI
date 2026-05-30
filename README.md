# DemoPPI — Progressive Professional Identity (Demo)

> 渐进式专业身份 — 共识驱动连接的 MVP 演示项目  
> **拿来主义**：从 kung-fu / Iamgeek / PPI 文档中摘取有用片段与战略理念，新建不迁移

---

## 项目定位

DemoPPI 是 PPI（Progressive Professional Identity）战略的**本地演示实现**，用于：

1. **验证核心假设**：「价值观共识能否驱动真实连接？」
2. **演示关键技术选型**：Next.js + Supabase（单栈，最低运维成本）
3. **记录战略决策**：为什么选这个栈、为什么停其他仓、MVP 范围如何裁剪

**不属于 DemoPPI 的：**
- ❌ 不是生产产品（生产代码在 `kung-fu`）
- ❌ 不承载业务逻辑（只做最小演示）
- ❌ 不重复文档（战略文档在 `progressive-professional-identity`）

---

## 核心战略理念（从 PPI 文档摘取）

### 1. 渐进式身份披露

```
Layer 0  →  基础身份（5 步 onboarding，价值观标签）
Layer 1  →  兴趣标签（可选补充）
Layer 2  →  完整档案（共识网络，Phase 2+）
```

MVP 只做 **Layer 0**，验证「共识度」是否能驱动关注决策。

### 2. 技术选型结论

| 选项 | 结论 | 原因 |
|------|------|------|
| Next.js + FastAPI + JWT（Iamgeek 栈） | ❌ 不选 | 双服务运维成本高 |
| Next.js + Supabase（kung-fu 栈） | ✅ 选 | 单栈，Vercel + Supabase 免费档可跑完 MVP |
| 多仓库并行开发 | ❌ 禁止 | 已证明会导致迷失（3 个同日 init 的平行仓库） |

### 3. MVP 范围（ruthlessly 裁剪）

**只验证一条用户路径：**

```
收到邀请 → 注册 → 填 Layer 0 → 发现页看共识度 → 关注一人 → 查看公开主页
```

| MVP 必须有 | 明确不做（Phase 2+） |
|-----------|---------------------|
| 邀请码注册 | Layer 1/2 完整录入 |
| Layer 0 onboarding | 名片多主题 |
| 发现页 + 共识排序 | 复杂搜索/筛选 |
| 关注 / 取关 | Admin 后台 |
| `/p/[username]` 公开主页 | Consensus Claw |
| 1 个 Supabase 生产项目 | 三云 / Gitea CI / 新 GitHub 仓 |

### 4. 成功标准（30 天内）

不是「部署成功」，而是：

| 指标 | 目标 |
|------|------|
| 种子用户 | 20 人收到邀请并完成注册 |
| Layer 0 完成率 | ≥ 80% |
| 人均连接数 | ≥ 1（至少关注 1 人）|
| 高共识连接占比 | 共识度 ≥ 70% 的连接占全部连接的 ≥ 50% |

未达标 → **调整产品假设，而不是换技术栈或开新仓。**

---

## 从已有代码摘取的片段

### kung-fu 有用片段

```
web/app/api/
├── consensus/[userId]/route.ts    ← 共识算法 API
├── discover/route.ts              ← 发现页推荐
├── profile/layer0/[userId]/route.ts  ← Layer 0 读写
├── recommendations/route.ts       ← 推荐引擎
└── tags/interests/route.ts      ← 兴趣标签

web/components/consensus/
├── consensus-detail.tsx          ← 共识度详情组件
└── consensus-radar.tsx          ← 共识雷达图（可复用）
```

### Iamgeek 可移植逻辑

| 功能 | Iamgeek 参考文件 | 移植要点 |
|------|-----------------|---------|
| 邀请码校验 | `invite_service.py` | Supabase `invites` 表 + RLS；注册前实时校验 |
| 关注/取关 | `connection_service.py` | 已有 `connections` 表；补 API + UI |

---

## 项目结构

```
DemoPPI/
├── README.md              ← 本文件
├── docs/
│   ├── strategy.md      ← 战略决策记录（从 PPI 摘取）
│   └── mvp-checklist.md ← MVP 完成度追踪
├── src/
│   ├── consensus.js     ← 共识算法（从 kung-fu 摘取核心逻辑）
│   └── invite-util.js  ← 邀请码工具函数（从 Iamgeek 移植思路）
└── scripts/
    └── init-supabase.sql ← Supabase schema 初始化（从 kung-fu/migrations 摘取）
```

---

## 与现有仓库的关系

| 仓库 | 角色 | DemoPPI 与其关系 |
|------|------|-----------------|
| `szjason72/kung-fu` | 生产代码主线（Next.js + Supabase） | 参考其 API 设计与组件实现 |
| `szjason72/Iamgeek` | 功能参考书（FastAPI 版） | 移植邀请制与关注闭环逻辑 |
| `p4zrht9hpm-sketch/progressive-professional-identity` | 战略文档仓 | 摘取战略决策与 MVP 范围定义 |
| `szpeter2026/DemoPPI` | **本仓库** | 演示 + 文档收敛，不承载生产代码 |

---

## 个人原则（避免重蹈覆辙）

1. **停止新建 GitHub 仓库** — 已有仓库够多了，DemoPPI 是最后一个新建的
2. **文档减写、代码多加** — MVP 阶段只维护本 README + checklist
3. **与 PlanetX 交付线切割** — DemoPPI 是 content 线，不是 JobFirst SKU
4. **checklist 与代码同步** — 每完成一项打勾，避免「以为没做其实做了」

---

*创建于：2026-05-31 · 拿来主义原则：新建不迁移，摘取不复制*
