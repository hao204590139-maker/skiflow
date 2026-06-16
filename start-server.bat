@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ╔══════════════════════════════════════════╗
echo ║  🏔️  Skiflow 雪迹 — 本地服务器        ║
echo ╚══════════════════════════════════════════╝
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    goto :found_ip
)
:found_ip

echo ┌──────────────────────────────────────────┐
echo │  本机访问：http://localhost:8080         │
if defined ip echo │  手机访问：http://!ip!:8080         │
echo │                                          │
echo │  确保手机和电脑在同一 WiFi 网络下        │
echo │  按 Ctrl+C 停止服务器                    │
echo └──────────────────────────────────────────┘
echo.

REM Open browser
start http://localhost:8080

REM Try Python 3 first, then Python
python -m http.server 8080 2>nul
if %errorlevel% neq 0 (
    python3 -m http.server 8080 2>nul
)
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python。请安装 Python 3：
    echo https://www.python.org/downloads/
    pause
)
