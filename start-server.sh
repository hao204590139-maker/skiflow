#!/bin/bash
cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  🏔️  Skiflow 雪迹 — 本地服务器        ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "未知")
else
    IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "未知")
fi

echo "┌──────────────────────────────────────────┐"
echo "│  本机访问：http://localhost:8080         │"
echo "│  手机访问：http://${IP}:8080         │"
echo "│                                          │"
echo "│  确保手机和电脑在同一 WiFi 网络下        │"
echo "│  按 Ctrl+C 停止服务器                    │"
echo "└──────────────────────────────────────────┘"
echo ""

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:8080
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:8080 2>/dev/null || true
fi

# Start server
python3 -m http.server 8080 2>/dev/null || python -m http.server 8080 2>/dev/null || {
    echo "[错误] 未找到 Python。请安装 Python 3"
    exit 1
}
