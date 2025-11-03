#!/usr/bin/env bash
# 诊断脚本 - 检查服务状态

echo "========================================="
echo "CP3405 服务诊断"
echo "========================================="
echo ""

# 1. 检查后端服务
echo "1. 后端服务状态："
systemctl is-active cp3405-backend.service || echo "❌ 后端服务未运行"
echo ""

# 2. 检查端口监听
echo "2. 端口监听状态："
sudo netstat -tlnp | grep :8000 || echo "❌ 端口 8000 未监听"
sudo netstat -tlnp | grep :80 || echo "❌ 端口 80 未监听"
echo ""

# 3. 检查后端服务日志（最近20行）
echo "3. 后端服务日志（最近20行）："
sudo journalctl -u cp3405-backend.service -n 20 --no-pager
echo ""

# 4. 检查 Nginx 错误日志（最近20行）
echo "4. Nginx 错误日志（最近20行）："
sudo tail -n 20 /var/log/nginx/error.log
echo ""

# 5. 测试后端连接
echo "5. 测试后端直连："
curl -s http://127.0.0.1:8000/health | head -5 || echo "❌ 后端连接失败"
echo ""

# 6. 测试 Nginx 代理
echo "6. 测试 Nginx 代理："
curl -s http://127.0.0.1/api/auth/login | head -5 || echo "❌ Nginx 代理失败"
echo ""

# 7. 检查配置文件
echo "7. 配置文件位置："
echo "   Systemd: /etc/systemd/system/cp3405-backend.service"
ls -lh /etc/systemd/system/cp3405-backend.service 2>/dev/null || echo "   ❌ Service 文件不存在"
echo "   Nginx: /etc/nginx/conf.d/cp3405.conf"
ls -lh /etc/nginx/conf.d/cp3405.conf 2>/dev/null || echo "   ❌ Nginx 配置不存在"
echo ""

echo "========================================="
echo "诊断完成"
echo "========================================="
