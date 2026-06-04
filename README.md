# YiYang Center

东软颐养中心项目仓库，当前采用前后端同仓的组织方式：

- `YiYang_Vue`：Vue 3 + Vite + Element Plus 前端
- `YiYang_Node`：NestJS + Prisma + MySQL 后端

## 仓库结构

```txt
Zzz
|- YiYang_Vue/     # 前端
|- YiYang_Node/    # 后端
|- package.json    # 根目录 workspace 配置
`- README.md
```

## 环境要求

新电脑第一次拉项目，先准备这些环境：

- `Git`
- `Node.js >= 22`
- `npm >= 10`
- `MySQL 8.0` 或 `MariaDB`

建议先确认版本：

```bash
node -v
npm -v
mysql --version
```

## 从 Git 拉下来后怎么跑起来

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd Zzz
```

### 2. 安装依赖

项目使用了 `npm workspaces`，在根目录安装一次即可：

```bash
npm install
```

### 3. 准备数据库

先在本机启动 MySQL，然后创建数据库：

```sql
CREATE DATABASE yiyang_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 配置后端环境变量

复制一份后端环境变量模板：

```bash
cp YiYang_Node/.env.example YiYang_Node/.env
```

Windows PowerShell 也可以这样：

```powershell
Copy-Item YiYang_Node\.env.example YiYang_Node\.env
```

默认配置如下：

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="mysql://root:1111@localhost:3306/yiyang_center"
DB_CONNECTION_LIMIT=10
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
DB_SSL_CA_PATH=""
DB_SSL_CERT_PATH=""
DB_SSL_KEY_PATH=""
DB_ALLOW_PUBLIC_KEY_RETRIEVAL=true
JWT_SECRET="5dc8e739508830d82bdf9e1202625d59c5dfebe3e65410398b98c85e827073c9"
JWT_EXPIRES_IN="7d"
```

如果你的数据库账号密码不是 `root / 1111`，把 `DATABASE_URL` 改成你自己的。

### 5. 生成 Prisma Client

这个项目的 Prisma Client 输出到 `YiYang_Node/generated/prisma`，新机器第一次一定要执行：

```bash
npm run prisma:generate -w YiYang_Node
```

### 6. 执行数据库迁移

```bash
npm run prisma:migrate:dev -w YiYang_Node
```

这一步会把 `prisma/schema.prisma` 对应的表结构建到本地数据库里。

### 7. 初始化种子数据

```bash
npm run db:seed -w YiYang_Node
```

执行后会写入一批演示数据，包括默认登录账号。

### 8. 启动后端

在根目录执行：

```bash
npm run dev:node
```

后端默认地址：

- `http://localhost:3000`
- 健康检查：`http://localhost:3000/api/health`

### 9. 启动前端

重新打开一个终端，在根目录执行：

```bash
npm run dev:vue
```

前端默认地址：

- `http://localhost:5173`

前端开发代理已经配置好：

- `/api -> http://localhost:3000`

也就是说，本地开发时前后端默认可以直接联通，不需要额外改前端请求地址。

## 默认登录账号

执行完种子数据后，可以直接用下面这组账号登录：

- 手机号：`19100001910`
- 密码：`123456`

登录页面默认也已经预填了这组账号。

## 根目录常用命令

```bash
npm run dev:vue
npm run dev:node
npm run build
npm run lint
npm run format
```

## 首次启动排查

### 1. `npm install` 失败

先检查：

- Node 是否为 `22+`
- npm 是否为 `10+`
- 网络是否能正常安装 npm 包

### 2. 后端启动时报数据库连接失败

重点检查：

- MySQL 是否已经启动
- `yiyang_center` 数据库是否已经创建
- `YiYang_Node/.env` 里的 `DATABASE_URL` 是否正确

### 3. 后端启动时报 Prisma Client 相关错误

通常是还没生成 Prisma Client，重新执行：

```bash
npm run prisma:generate -w YiYang_Node
```

### 4. 前端能打开但接口报错

重点检查：

- 后端是否真的启动在 `3000` 端口
- 前端代理配置是否还是指向 `http://localhost:3000`
- 浏览器里请求路径是否以 `/api` 开头

## 推荐启动顺序

如果你是第一次拉项目，建议严格按下面顺序来：

1. 安装 `Node`、`npm`、`MySQL`
2. `npm install`
3. 创建数据库 `yiyang_center`
4. 配置 `YiYang_Node/.env`
5. `npm run prisma:generate -w YiYang_Node`
6. `npm run prisma:migrate:dev -w YiYang_Node`
7. `npm run db:seed -w YiYang_Node`
8. `npm run dev:node`
9. `npm run dev:vue`

## 子项目说明

- 前端说明见 [YiYang_Vue/README.md](./YiYang_Vue/README.md)
- 后端说明见 [YiYang_Node/README.md](./YiYang_Node/README.md)
