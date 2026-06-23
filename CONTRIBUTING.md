# Contributing to myagent

## 开发流程

1. Fork 仓库
2. 创建特性分支: `git checkout -b feature/your-feature`
3. 提交改动: `git commit -m "feat: your feature"`
4. 推送: `git push origin feature/your-feature`
5. 创建 PR

## 代码规范

- TypeScript strict mode
- 函数 < 50 行
- code < 300 lines
- 测试覆盖新代码
- 触发词 < 10/文档

## 测试

```bash
bun test          # 跑测试
bun test --coverage  # 覆盖率
```

## 提交格式

```
feat: 新功能
fix: 修 bug
docs: 文档
test: 测试
refactor: 重构
chore: 杂项
```

## 优先级

P0: 核心功能 / bug
P1: 增强
P2: nice-to-have
