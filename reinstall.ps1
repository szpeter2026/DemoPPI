# 清理并重新安装依赖
# 用法：在 PowerShell 中运行 .\reinstall.ps1
# 建议：先关闭 Cursor/VS Code，以管理员身份运行 PowerShell

Write-Host "正在清理 node_modules 和 package-lock.json..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

Write-Host "清理 npm 缓存..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "正在安装依赖（可能需要几分钟）..." -ForegroundColor Green
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "安装成功！运行 npm run dev 启动开发服务器" -ForegroundColor Green
} else {
    Write-Host "安装失败，请查看 TROUBLESHOOTING.md" -ForegroundColor Red
}
