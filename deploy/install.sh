#!/bin/bash
# myagent 一键部署脚本
set -e

echo "=== myagent 部署脚本 ==="

# 1. 创建用户
if ! id myagent &>/dev/null; then
  echo "创建 myagent 用户..."
  sudo useradd -r -s /bin/false myagent
fi

# 2. 准备目录
sudo mkdir -p /opt/myagent
sudo mkdir -p /opt/myagent/data
sudo mkdir -p /opt/myagent/logs
sudo chown -R myagent:myagent /opt/myagent

# 3. 复制文件
echo "复制项目文件..."
sudo cp -r ./* /opt/myagent/
sudo chown -R myagent:myagent /opt/myagent

# 4. 安装依赖
echo "安装依赖..."
cd /opt/myagent
sudo -u myagent bun install --production

# 5. 配置 .env(如果没有)
if [ ! -f /opt/myagent/.env ]; then
  echo "创建 .env(从模板)..."
  sudo cp .env.example /opt/myagent/.env
  echo "⚠️  请编辑 /opt/myagent/.env 配置你的 API key"
fi

# 6. 安装 systemd service
echo "安装 systemd service..."
sudo cp deploy/myagent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable myagent

echo ""
echo "✅ 部署完成!"
echo ""
echo "下一步:"
echo "  1. 编辑 .env: sudo nano /opt/myagent/.env"
echo "  2. 启动服务: sudo systemctl start myagent"
echo "  3. 查看日志: sudo journalctl -u myagent -f"
