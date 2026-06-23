#!/bin/bash
# 自动打 tag + 创建 GitHub release
set -e

# 1. 读版本号
VERSION=$(cat package.json | grep '"version"' | sed 's/.*"version": "\(.*\)".*/\1/')
echo "当前版本: $VERSION"

# 2. 跑测试
echo "跑测试..."
bun test 2>&1 | tail -20

# 3. git tag
echo "打 tag v$VERSION..."
git tag -a "v$VERSION" -m "Release v$VERSION"

# 4. push tag
git push origin "v$VERSION"

# 5. 创建 GitHub release
echo "创建 GitHub release..."
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes "Auto-release by scripts/release.sh" \
  --draft

echo "✅ Done! v$VERSION"
