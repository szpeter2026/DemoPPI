# Genzer 终端机与共识网络 — 团队研讨记录

> **日期**：2026-07-12  
> **参与者**：Jason（产品/架构方向） + AI 辅助分析  
> **目的**：记录关于「首次星际匹配」子项目选型、共识网络架构、Genzer 终端机建设的对话结论，供团队研讨。  
> **状态**：讨论记录，非实施规格；跨域身份与可信连接由自研协议层负责，本文不展开。

---

## 1. 背景与初始问题

闯关任务第三环「首次星际匹配」在 looma-zervi（PlanetX）中目前为占位（toast「即将上线」）。团队有一份接口契约文档：

- 路径：`/Users/jason/Projects/looma-zervi/首次星际匹配_子项目接口契约.md`
- 内容：梳理主项目已就位的对接点（`mission_id=match`、`POST /v1/game/mission-complete`、`GET /v1/game/profile` 等）

初始问题是：**现有子项目仓库能否适配该契约？**

候选仓库：

| 仓库 | 路径 |
|------|------|
| Iamgeek | `szjason72/Iamgeek` |
| DemoPPI | `szpeter2026/DemoPPI` |
| 契约真源 | `looma-zervi`（PlanetX 主项目） |
| 链上信号真源 | `xiajason/genzer-contracts` |

---

## 2. Iamgeek 适配性分析（结论：不能直接接入）

### 2.1 契约要求摘要

| 层面 | 要求 |
|------|------|
| 输入 | `personality_type`、`personality_detail`、`fleet_members`（来自 PlanetX JWT + game profile） |
| 输出 | `POST /v1/game/mission-complete`、更新本地 store、弹出成就 |
| 前端 | 小程序 `pages/match` + Web `MatchScreen` |
| 算法 | 基于人格类型的 1:1 配对（舰队范围内） |

### 2.2 Iamgeek 现状

- 独立 Next.js + FastAPI 应用，自有 JWT 与用户库
- 匹配基于 `value_tags` + `interest_tags`（Layer 0 共识度），非 PlanetX 人格类型
- `/discover` 为**推荐列表**，非 1:1 配对
- 无小程序、无舰队概念、无 mission-complete 回写

### 2.3 结论

| 问题 | 答案 |
|------|------|
| 能否直接适配？ | **不能** |
| 能否作为子项目即插即用？ | **不能** |
| 可复用价值 | 共识算法思路、`/discover` UI 参考 |

**适配度约 25%** — 仅可作「功能参考书」（与 PPI 战略文档定位一致）。

---

## 3. DemoPPI 适配性分析（结论：略优于 Iamgeek，仍不能直接接入）

### 3.1 相对 Iamgeek 的优势

| 能力 | 状态 |
|------|------|
| MBTI 人格（可选自报） | ✅ Onboarding 第 5 步 |
| `mbti-data.ts` 兼容矩阵 | ✅ 目前仅用于 SEO/展示，**未接入匹配算法** |
| 小程序基础设施 | ⚠️ `/api/auth/miniprogram` + 薄壳（2 页） |
| `consensus_match` 声誉事件 | ✅ DB + API 已预留 |
| Genzer 镜像 | ✅ `reputation_events` / `badges` 对标 genzer-contracts |
| 战略文档 | 明确「不与 PlanetX 打通」（MVP 阶段） |

### 3.2 与 PlanetX 人格测试的差异

| | PlanetX | DemoPPI |
|--|---------|---------|
| 测试方式 | 8 题结构化测评 → 6 种星际人格 | 用户自选 MBTI（可跳过） |
| 人格体系 | 星云艺术家、黑洞程序员等 | 16 种 MBTI |
| 算法输入 | `personality_type` | `value_tags` + `interest_tags` |

**在「人格测试」语义上，DemoPPI 并不更符合 PlanetX 契约** — 只是多了一层 MBTI 展示面。

### 3.3 结论

**适配度约 35–40%** — 更适合作为终端机参考实现，而非 PlanetX 子模块。

---

## 4. 架构方向澄清（Jason 定调 · 关键转折）

团队**不打算**把 PPI 集成进 PlanetX，而是：

```
DemoPPI  = 千千万万的终端机，分布全网
PlanetX  = 游戏化封闭世界，星际人格为游戏内资产
匹配算法 = 训练产物（非硬编码规则）
跨域协作 = 信号发送 / 信号接收（非共享 DB、非统一 Auth）
```

这是对「共识网络」原型的定义：**各自发育，通过信号层协作**。

### 4.1 与接口契约文档的关系

| 文档 | 层级 | 作用 |
|------|------|------|
| `首次星际匹配_子项目接口契约.md` | PlanetX 域内 | 本地回写规范（mission-complete、store、成就） |
| 信号协议（genzer-contracts 延伸） | 跨域 | 终端机 ↔ 游戏域 ↔ 其他终端 的协作层 |

两份文档服务不同层，**可以并存，不矛盾**。

---

## 5. 「信号」的形态（genzer-contracts 启发）

参考 `xiajason/genzer-contracts`（GenzBadge + GenzReputation），信号不是 REST 数据包，而是**可验证的行为事件协议**：

```
Layer 1 — 链上信号真源（genzer-contracts）
  ActionType 枚举        → 信号类型
  ReputationChanged 事件 → 不可篡改广播
  GenzBadge SBT          → 信号确认凭证（灵魂绑定）
  Checkpoint[]           → 信号时间序列

Layer 2 — 终端机链下快路径（DemoPPI）
  reputation_events 表   → ActionType 镜像
  badges 表              → SBT V1 镜像
  consensus_match        → 已预留的「匹配确认」信号类型

Layer 3 — 游戏域（PlanetX）
  人格测试 → 本地资产
  匹配任务 → 发信号 → 收 ack → 本地 mission-complete
```

匹配模型消费的是**信号流**，不是用户表 join。

### 5.1 信号流示意（概念）

```
PlanetX 完成人格测试
  → 本地生成 embedding（不出域）
  → 发出 MatchIntent 类信号（仅摘要/哈希）
        ↓
  匹配模型（训练产物）处理信号流
        ↓
  PPI 终端 / 其他终端响应
        ↓
  发回 consensus_match ack 信号
        ↓
PlanetX 验证 ack → 本地 mission-complete
```

### 5.2 待团队确认的 ActionType 扩展

| 信号 | 方向 | DemoPPI 现状 |
|------|------|-------------|
| `MatchIntent` | 游戏域 → 网络 | ❌ 需在 genzer-contracts 扩展 |
| `consensus_match` | 网络 → 终端/游戏域 | ✅ DemoPPI 已有 action_type |
| `PersonalityBeacon` | 游戏域 → 网络 | ❌ 待定义（可能与闯关第 4 环「发送星际信号」相关） |

---

## 6. 研讨中提出、由协议层负责的问题（本文不展开）

以下议题在对话中提出，**团队明确由自研协议层解决**，终端机实现无需重复考虑：

- 跨域身份绑定（UUID vs 钱包地址 vs 身份图谱）
- 信号可信度与验签
- 链上真源 vs 链下快路径的运行时策略
- 舰队范围 vs 全网匹配的信号作用域编码

---

## 7. Genzer 终端机（DemoPPI）建设焦点

Jason 定调：**实现精力放在构建 Genzer 终端机**，而非 PlanetX 集成或跨域身份。

### 7.1 终端机定义

自治节点，职责：

1. **本地用户生命周期** — 邀请 → 注册 → Layer0 → 发现 → 关注
2. **信号处理引擎** — 收信号 → 本地动作 → 发信号
3. **声誉 + 勋章** — GenzReputation / GenzBadge 链下镜像
4. **终端 UI** — Web + 小程序

### 7.2 现状完成度（2026-07-12 快照）

| 能力 | 状态 |
|------|------|
| Layer 0 / 发现 / 关注 / 邀请 | ✅ |
| 声誉事件 RPC + 防刷 | ✅ |
| SBT 勋章自动升级 | ✅ |
| 治理提案/投票 + Trust FSS 可选 | ✅ |
| `/api/reputation/score` | ✅ |
| 小程序登录 API | ⚠️ |
| **consensus_match 业务闭环** | ❌ |
| **信号 ingress / egress 适配器** | ❌ |
| 声誉/勋章前端页面 | ❌ |
| 小程序主体（架构 ~22 页，实际 2 页） | ❌ |

**评估**：社区基础设施 ~70%；作为共识网络节点 ~20%。

### 7.3 建议实施优先级（研讨用，非已批准排期）

#### P0 — 信号边界（Terminal Adapter）

```
app/api/terminal/
  ingress/   ← 协议层推信号（验签在协议层完成）
  egress/    ← 本地事件发信号
  health/    ← 终端存活
```

本地新增 `terminal_signals` 审计表（方向 in/out、signal_type、payload、local_action），不替代协议层。

ingress 路由表示意：

| signal_type | 本地动作 |
|-------------|---------|
| `consensus_match` | `record_reputation_event("consensus_match")` |
| `match_result` | 更新匹配 UI 状态 |
| `personality_beacon` | 可选：影响发现页筛选 |

#### P1 — consensus_match 本地闭环

第一个可自测的端到端信号流（**不依赖 PlanetX**）：

```
发现页高共识用户 → 用户确认匹配
  → POST /api/match/confirm
  → record_reputation_event("consensus_match")
  → egress 发信号
  → /match/result 展示（终端版「匹配星图」）
```

#### P2 — 终端 UI 补全

| 页面 | 用途 |
|------|------|
| `/profile/reputation` | 声誉分、事件流、勋章墙 |
| `/match/result` | 匹配结果展示 |
| 发现页「确认匹配」CTA | 区别于「关注」 |
| 小程序 TabBar | 发现 / 我的（原生或 webview 桥接） |

### 7.4 与 genzer-contracts 对齐表

| 链上（genzer-contracts） | 终端链下镜像（DemoPPI） |
|--------------------------|-------------------------|
| `ActionType` enum | `reputation_events.action_type` |
| `ReputationChanged` event | `record_reputation_event` RPC |
| `GenzBadge` SBT | `badges` 表 |
| Checkpoint 历史 | `reputation_events` 时间序列 |

终端先跑通链下 V1，链上锚定可后续再做。

---

## 8. 关键决策汇总（供团队表决）

| # | 议题 | 当前倾向 | 待表决 |
|---|------|---------|--------|
| 1 | PlanetX 匹配是否嵌入 PPI？ | **否**，各自发育 | 确认 |
| 2 | 跨域协作机制 | **信号收发**，非 API 集成 | 确认 |
| 3 | 子项目选型（Iamgeek / DemoPPI） | 均**非即插即用**；DemoPPI 作终端机主线 | 确认 |
| 4 | 终端机近期焦点 | 信号边界 + consensus_match 闭环 + UI | 排期 |
| 5 | 接口契约文档定位 | PlanetX **域内回写**规范，非跨域协议 | 文档标注 |
| 6 | 身份/验签 | **协议层**负责，终端不实现 | 确认 |
| 7 | 链上锚定时机 | 终端链下 V1 先行 | 排期 |

---

## 9. 未决问题（留给下一轮研讨）

1. **闯关第 4 环「发送星际信号」** 与 `consensus_match` ack、`PersonalityBeacon` 的时序关系？
2. **genzer-contracts** 是否在本阶段扩展 `MatchIntent` 等新 ActionType？
3. **匹配模型** 部署形态：集中服务 vs 各终端本地 vs 第三方中枢？
4. **小程序** 路线：原生开发（架构文档方案）vs WebView 桥接为主？
5. **XP 不一致**（契约中卡片 100 vs 常量 40）是否在 PlanetX 侧单独统一？

---

## 10. 相关仓库与文档索引

| 资源 | 路径 / 链接 |
|------|------------|
| 接口契约 | `looma-zervi/首次星际匹配_子项目接口契约.md` |
| DemoPPI README | `szpeter2026/DemoPPI/README.md` |
| DemoPPI Supabase 文档 | `szpeter2026/DemoPPI/supabase/README.md` |
| 小程序架构设计 | `szpeter2026/DemoPPI/docs/miniprogram-architecture.md` |
| PPI 战略决策 | `szpeter2026/DemoPPI/docs/strategy.md` |
| genzer-contracts | `xiajason/genzer-contracts` |
| Iamgeek | `szjason72/Iamgeek` |
| PPI 原始战略 | `p4zrht9hpm-sketch/progressive-professional-identity/` |

---

## 11. 对话时间线

| 阶段 | 内容 |
|------|------|
| ① | 分析 Iamgeek 对 looma-zervi 契约的适配性 → 不能直接接入 |
| ② | 分析 DemoPPI 适配性 → 略优，仍不能直接接入；MBTI ≠ PlanetX 星际人格 |
| ③ | Jason 澄清架构：终端机分布全网，PlanetX 游戏内化，信号协作，算法为训练产物 |
| ④ | 基于 genzer-contracts 重新定义「信号」= ActionType + Event + SBT |
| ⑤ | Jason 收窄范围：跨域身份归协议层，**聚焦 Genzer 终端机实现** |
| ⑥ | 输出终端机缺口与 P0/P1/P2 建议（本记录，不含代码实现） |

---

*本文档由对话整理生成，供内部研讨。实施前须经团队确认优先级与协议层接口规格。*
