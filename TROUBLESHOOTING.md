# 安装故障排除 (Windows)

## 问题：TAR_ENTRY_ERROR、EBUSY、EPERM

通常由以下原因引起：
- 文件被占用（IDE、杀毒软件、其他进程）
- Node.js 版本不兼容（当前 v23 非 LTS）
- Windows 路径过长

## 解决步骤

### 方案 1：完全清理后重装（推荐）

1. **关闭 Cursor/VS Code**（或至少关闭 web 文件夹）
2. 打开 **PowerShell 或 CMD**（以管理员身份运行）
3. 执行：

```powershell
cd C:\Users\szben\kungfu\web

# 删除 node_modules 和 lock 文件
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 清理 npm 缓存
npm cache clean --force

# 重新安装
npm install
```

### 方案 2：使用 Node 20 LTS

Node 23 为非 LTS 版本，部分包可能不兼容。建议使用 Node 20：

- 安装 [nvm-windows](https://github.com/coreybutler/nvm-windows) 或 [fnm](https://github.com/Schniz/fnm)
- 然后执行：

```powershell
nvm install 20
nvm use 20
# 或
fnm install 20
fnm use 20

cd C:\Users\szben\kungfu\web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### 方案 3：临时排除杀毒软件

将项目目录加入 Windows Defender 排除列表：
- 设置 → 隐私和安全 → Windows 安全中心 → 病毒和威胁防护 → 管理设置 → 排除项

### 方案 4：使用 pnpm（备选）

```powershell
npm install -g pnpm
cd C:\Users\szben\kungfu\web
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
pnpm install
pnpm dev
```
