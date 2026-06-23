# 启用 GitHub Pages(项目主页)

## 步骤 1: 进入 repo Settings

1. 打开 https://github.com/YOUR-USERNAME/myagent
2. 点击 **Settings** 标签
3. 左侧菜单找到 **Pages**

## 步骤 2: 配置 Pages

- **Source**: `GitHub Actions`
- 不要选 "Deploy from a branch"(我们用 Actions 部署)

## 步骤 3: 等待部署

- 第一次 push 到 main 后,Actions 自动跑
- 大约 2-3 分钟部署完成
- 访问 https://YOUR-USERNAME.github.io/myagent/

## 项目结构

```
docs/
├── index.html      # 项目主页(已经在 v0.3 加了)
├── style.css       # 样式
├── ARCHITECTURE.md # 架构文档
└── TUTORIAL.md     # 使用教程
```

## 自定义域名(可选)

如果你有自己的域名:

1. 在 `docs/CNAME` 写 `yourdomain.com`
2. DNS 添加 CNAME 记录
3. 在 Pages 设置里填自定义域名
