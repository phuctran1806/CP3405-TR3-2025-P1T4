#!/usr/bin/env bash
# 修复 502 Bad Gateway 错误的部署脚本

set -e

echo "========================================="
echo "开始修复 CP3405 后端服务"
echo "========================================="

REPO_DIR="/opt/CP3405-TR3-2025-P1T4"

# 1. 更新代码
echo "1. 拉取最新代码..."
cd "$REPO_DIR"
git pull origin main

# 2. 安装/更新后端依赖
echo "2. 更新后端依赖..."
cd "$REPO_DIR/backend"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 3. 复制 systemd service 文件
echo "3. 安装 systemd service..."
sudo cp "$REPO_DIR/cp3405-backend.service" /etc/systemd/system/
sudo systemctl daemon-reload

# 4. 复制 nginx 配置
echo "4. 安装 Nginx 配置..."
sudo cp "$REPO_DIR/cp3405.conf" /etc/nginx/conf.d/
sudo nginx -t

# 5. 重启服务
echo "5. 重启服务..."
sudo systemctl restart cp3405-backend.service
sudo systemctl enable cp3405-backend.service
sudo systemctl reload nginx

# 6. 检查服务状态
echo "========================================="
echo "检查服务状态："
echo "========================================="
echo ""
echo "后端服务状态："
sudo systemctl status cp3405-backend.service --no-pager -l
echo ""
echo "Nginx 状态："
sudo systemctl status nginx --no-pager -l
echo ""
echo "========================================="
echo "测试 API 端点："
echo "========================================="
sleep 2
curl -I http://127.0.0.1:8000/health || echo "后端健康检查失败"
curl -I http://45.77.44.161/api/auth/login || echo "Nginx 代理检查失败"

echo ""
echo "========================================="
echo "修复完成！"
echo "========================================="
echo "如果还有问题，请检查日志："
echo "  sudo journalctl -u cp3405-backend.service -n 50"
echo "  sudo tail -n 50 /var/log/nginx/error.log"
