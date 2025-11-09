# 修复 502 Bad Gateway 错误 - 部署指南

## 问题描述
访问 `http://45.77.44.161/api/auth/login` 时返回 502 Bad Gateway 错误。

## 原因分析
502 错误通常由以下原因引起：
1. 后端服务未运行或崩溃
2. Nginx 无法连接到后端服务
3. systemd service 配置不正确
4. 端口配置错误

## 解决方案

### 方法一：自动修复（推荐）

SSH 登录服务器后，执行以下命令：

```bash
# 登录服务器
ssh root@45.77.44.161

# 进入项目目录
cd /opt/CP3405-TR3-2025-P1T4

# 拉取最新代码（包含修复文件）
git pull origin main

# 给脚本执行权限
chmod +x deploy-fix.sh diagnose.sh

# 运行修复脚本
./deploy-fix.sh

# 检查服务状态
./diagnose.sh
```

### 方法二：手动修复

如果自动脚本失败，请手动执行以下步骤：

#### 1. 更新代码和依赖
```bash
cd /opt/CP3405-TR3-2025-P1T4
git pull origin main

cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### 2. 安装 systemd service
```bash
sudo cp /opt/CP3405-TR3-2025-P1T4/cp3405-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
```

#### 3. 安装 Nginx 配置
```bash
sudo cp /opt/CP3405-TR3-2025-P1T4/cp3405.conf /etc/nginx/conf.d/
sudo nginx -t  # 测试配置文件语法
```

#### 4. 重启服务
```bash
# 启动后端服务
sudo systemctl restart cp3405-backend.service
sudo systemctl enable cp3405-backend.service

# 重载 Nginx
sudo systemctl reload nginx
```

#### 5. 检查服务状态
```bash
# 查看后端服务状态
sudo systemctl status cp3405-backend.service

# 查看后端日志
sudo journalctl -u cp3405-backend.service -f

# 测试后端直连
curl http://127.0.0.1:8000/health

# 测试通过 Nginx
curl http://127.0.0.1/api/auth/login
```

## 验证修复

修复完成后，在浏览器中访问：
- http://45.77.44.161/ - 应该显示前端页面
- http://45.77.44.161/api/auth/login - 应该返回 405 或 401（不再是 502）
- http://45.77.44.161/docs - 应该显示 API 文档

## 故障排查

### 如果后端服务启动失败

```bash
# 查看详细日志
sudo journalctl -u cp3405-backend.service -n 100

# 手动启动后端测试
cd /opt/CP3405-TR3-2025-P1T4/backend
source venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 如果 Nginx 配置有问题

```bash
# 测试 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 重启 Nginx
sudo systemctl restart nginx
```

### 如果端口被占用

```bash
# 查看端口占用情况
sudo netstat -tlnp | grep :8000
sudo lsof -i :8000

# 如果需要，杀死占用进程
sudo kill -9 <PID>
```

## 关键配置说明

### systemd Service 配置
- **工作目录**: `/opt/CP3405-TR3-2025-P1T4/backend`
- **监听地址**: `127.0.0.1:8000`
- **Worker 数量**: 4
- **自动重启**: 启用

### Nginx 配置
- **监听端口**: 80
- **后端地址**: `http://127.0.0.1:8000`
- **静态文件**: `/var/www/cp3405-frontend`
- **API 路径**: `/api/*` 代理到后端

### CORS 配置
已添加服务器 IP 到允许列表：
- `http://45.77.44.161`
- `http://45.77.44.161:80`

## 后续维护

### 查看服务状态
```bash
sudo systemctl status cp3405-backend.service
```

### 查看实时日志
```bash
sudo journalctl -u cp3405-backend.service -f
```

### 重启服务
```bash
sudo systemctl restart cp3405-backend.service
```

### 更新代码
```bash
cd /opt/CP3405-TR3-2025-P1T4
./cp3405-update.sh
```
