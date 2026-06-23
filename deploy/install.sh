#!/bin/bash
# myagent 一键生产部署
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== myagent 部署 ===${NC}"

# 检查 root
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}❌ 需要 root 权限${NC}"
  exit 1
fi

# 1. 创建用户
if ! id myagent &>/dev/null; then
  echo "创建 myagent 用户..."
  useradd -r -s /bin/false myagent
fi

# 2. 准备目录
mkdir -p /opt/myagent
mkdir -p /opt/myagent/data
mkdir -p /opt/myagent/logs
chown -R myagent:myagent /opt/myagent

# 3. 复制文件
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_DIR=$(dirname "$SCRIPT_DIR")

echo "复制项目文件..."
cp -r "$PROJECT_DIR"/* /opt/myagent/
chown -R myagent:myagent /opt/myagent

# 4. 安装依赖
echo "安装依赖..."
cd /opt/myagent
sudo -u myagent bun install --production 2>/dev/null || \
  sudo -u myagent bun install

# 5. 准备 .env
if [ ! -f /opt/myagent/.env ]; then
  echo -e "${YELLOW}⚠️  创建 .env(请编辑填入 API key)${NC}"
  cp .env.example /opt/myagent/.env
  chown myagent:myagent /opt/myagent/.env
  chmod 600 /opt/myagent/.env
fi

# 6. 安装 systemd
echo "安装 systemd service..."
cp deploy/myagent.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable myagent

# 7. 启动
echo "启动服务..."
systemctl start myagent
sleep 2
systemctl status myagent --no-pager

echo -e "\n${GREEN}✅ 部署完成!${NC}"
echo ""
echo "下一步:"
echo "  1. 编辑 .env:  sudo nano /opt/myagent/.env"
echo "  2. 重启服务:  sudo systemctl restart myagent"
echo "  3. 查看日志:  sudo journalctl -u myagent -f"
echo "  4. Metrics:    http://localhost:9090/metrics"
echo "  5. Health:     http://localhost:9090/health"
