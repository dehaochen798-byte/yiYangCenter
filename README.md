# YiYang Center

东软颐养中心项目仓库，当前采用前后端同仓库的组织方式：

- [YiYang_Vue](d:/work/vscode-work/Zzz/YiYang_Vue/README.md)
- [YiYang_Node](d:/work/vscode-work/Zzz/YiYang_Node/README.md)

## 仓库结构

```txt
Zzz
├─ YiYang_Vue/     # Vue 3 + Vite + Element Plus 前端
├─ YiYang_Node/    # NestJS + Prisma + MySQL 后端
└─ package.json    # 仓库根工作区配置
```

## 当前工程组织

这个仓库已经整理成 `npm workspaces` 结构，目的有两个：

1. 让前后端仍然保持各自独立
2. 又能在根目录统一执行脚本，符合当前主流 monorepo 思路

## 根目录常用命令

```bash
npm run dev:vue
npm run dev:node
npm run build
npm run lint
```

## Node 版本建议

- `Node.js >= 22`
- `npm >= 10`

## 学习顺序建议

如果你是边学边搭项目，推荐这样看：

1. 先读 `YiYang_Vue/README.md`
2. 再读 `YiYang_Node/README.md`
3. 先从登录注册链路打通前后端
4. 再做床位管理、入住登记、护理记录
