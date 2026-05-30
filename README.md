# DemoPPI — Progressive Professional Identity (Demo)

> 共识社区：通过价值观对齐发现志同道合的人

## 项目定位

DemoPPI 是 Iamgeek 社区产品的 **MVP 演示版本**，实现「邀请 → 注册 → Layer 0 → 发现 → 关注 → 公开主页」完整闭环。

技术栈：**Next.js 15 + Supabase + Tailwind CSS + shadcn/ui**

## MVP 功能

| 模块 | 功能 | 状态 |
|:--|:--|:--|
| **认证系统** | 邮箱注册/登录、OAuth（Google/GitHub）、中间件路由守卫 | ✅ |
| **Layer 0 Onboarding** | 价值观选择（40%）+ 兴趣标签（30%）+ 经验领域（20%）+ 位置（10%） | ✅ |
| **共识算法** | Jaccard 相似度计算，多维度加权评分 | ✅ |
| **发现页** | 共识度排序、标签筛选、分值展示 | ✅ |
| **邀请系统** | 邀请码生成/校验/消耗、额度管理、Dashboard 管理 | ✅ |
| **关注系统** | 关注/取关、关注状态、发现页+个人主页关注按钮 | ✅ |
| **个人主页** | `/p/[username]` 公开页、共识度详情、关注 CTA | ✅ |
| **邀请管理 Dashboard** | 生成邀请码、复制链接、查看状态 | ✅ |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase URL + Anon Key

# 3. 执行数据库迁移
# 在 Supabase SQL Editor 中依次执行:
#   - supabase/migrations/20260220000000_initial_schema.sql
#   - supabase/migrations/20260220000001_storage_avatars.sql
#   - supabase/migrations/20260530000000_invites.sql

# 4. 启动开发服务器
npm run dev
```

## MVP 用户路径

```
收到邀请链接（?invite=XXXX）
  → 注册页面（邀请码必填 + 实时校验）
    → Layer 0 Onboarding（价值观/兴趣/经验/位置）
      → 发现页（共识度排序 + 关注）
        → 公开主页（关注 CTA）
```

## 项目结构

```
├── app/
│   ├── api/
│   │   ├── invites/          # 邀请系统 API（validate/generate/list）
│   │   ├── connections/      # 关注系统 API（follow/unfollow/status）
│   │   ├── discover/         # 发现页数据
│   │   ├── recommendations/  # 推荐算法
│   │   └── profile/          # Layer 0 / 个人资料
│   ├── dashboard/invites/   # 邀请码管理页面
│   ├── discover/             # 发现页
│   ├── p/[username]/         # 个人公开主页
│   ├── protected/            # 认证后首页
│   └── auth/                 # 认证页面
├── components/
│   ├── follow-button.tsx     # 关注/取关按钮
│   ├── sign-up-form.tsx      # 注册表单（含邀请码）
│   ├── discover/            # 发现页组件
│   ├── profile/              # 个人主页组件
│   └── onboarding/           # Layer 0 引导
├── lib/
│   ├── supabase/             # Supabase client（browser + server）
│   └── consensus/            # 共识算法
├── supabase/
│   └── migrations/           # 数据库迁移文件
└── docs/
    ├── strategy.md           # 战略决策记录（从 PPI 摘取）
    └── SQL_MIGRATION_INSTRUCTIONS.md
```

## 战略文档

- [`docs/strategy.md`](docs/strategy.md) — 从 PPI 文档摘取的 8 条战略决策

## 历史参考

- `szjason72/kung-fu` — 原始代码主线（已合并到本项目）
- `szjason72/Iamgeek` — FastAPI 参考实现（邀请制 + 关注闭环）
- `p4zrht9hpm-sketch/progressive-professional-identity` — 战略决策原始文档

## License

MIT
