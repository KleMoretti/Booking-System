# 网上订票系统启动指南

## 📋 前置准备

### 1. 环境要求

**必需软件：**
- ✅ JDK 21 或更高版本
- ✅ Maven 3.6+
- ✅ Node.js 16+ 和 npm/yarn
- ✅ MySQL 8.0+
- ✅ Redis 6.0+

**检查环境：**
```bash
# 检查 Java 版本
java -version

# 检查 Maven 版本
mvn -version

# 检查 Node.js 版本
node -v
npm -v

# 检查 MySQL 版本
mysql --version

# 检查 Redis 版本
redis-server --version
```

## 🚀 启动步骤

### 第一步：启动 MySQL 数据库

#### Windows:
```bash
# 启动 MySQL 服务
net start MySQL

# 或使用服务管理器启动 MySQL80 服务
```

#### 创建数据库并导入数据：
```bash
# 进入 MySQL 命令行
mysql -u root -p

# 输入密码后，执行以下命令
mysql> exit;

# 方式1：在命令行中直接导入
cd C:\JavaCode\Test\Booking-System\booking-system-backend\src\main\resources\db
mysql -u root -p < schema.sql
mysql -u root -p < test_data.sql

# 方式2：在 MySQL 命令行中导入
mysql -u root -p
mysql> source C:/JavaCode/Test/Booking-System/booking-system-backend/src/main/resources/db/schema.sql;
mysql> source C:/JavaCode/Test/Booking-System/booking-system-backend/src/main/resources/db/test_data.sql;
```

**验证数据库：**
```sql
USE booking_system;
SHOW TABLES;  -- 应该显示9张表
SELECT COUNT(*) FROM users;  -- 应该显示6条用户记录
```

### 第二步：启动 Redis

#### Windows:
```bash
# 启动 Redis 服务器（如果已安装为Windows服务）
redis-server

# 或者直接运行 redis-server.exe
cd C:\Redis
redis-server.exe redis.windows.conf
```

**验证 Redis：**
```bash
# 新开一个命令行窗口
redis-cli
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> exit
```

### 第三步：配置后端

检查配置文件：`booking-system-backend/src/main/resources/application.yml`

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/booking_system?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: 123456  # 修改为你的MySQL密码
    
  redis:
    host: localhost
    port: 6379
    # password:  # 如果Redis设置了密码，取消注释并填写

server:
  port: 8080
  servlet:
    context-path: /api
```

**注意：** 如果你的MySQL密码不是 `123456`，请修改 `application.yml` 中的密码。

### 第四步：启动后端服务

#### 方式1：使用 Maven 命令（推荐用于开发）
```bash
# 进入后端项目目录
cd C:\JavaCode\Test\Booking-System\booking-system-backend

# 清理并启动
mvn clean spring-boot:run

# 或者分步执行
mvn clean package
java -jar target/booking-system-backend-0.0.1-SNAPSHOT.jar
```

#### 方式2：使用 IDEA（推荐用于开发调试）
1. 打开 IDEA
2. 导入项目：`File` -> `Open` -> 选择 `booking-system-backend` 目录
3. 等待 Maven 依赖下载完成
4. 找到主类：`com.booking.BookingApplication`
5. 右键 -> `Run 'BookingApplication'`

**验证后端启动成功：**

访问：http://localhost:8080/api

如果看到 Whitelabel Error Page，说明后端已成功启动（因为根路径没有映射）。

**测试API：**
```bash
# 使用 curl 测试登录接口
curl -X POST http://localhost:8080/api/user/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"zhangsan\",\"password\":\"123456\"}"
```

### 第五步：启动前端服务

#### 首次启动需要安装依赖：
```bash
# 进入前端项目目录
cd C:\JavaCode\Test\Booking-System\booking-system-frontend

# 安装依赖（首次运行或依赖更新后需要）
npm install

# 或使用 yarn
yarn install
```

#### 启动前端开发服务器：
```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev

# 或使用 Vue CLI
npm run serve
```

**验证前端启动成功：**

启动后会显示类似信息：
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

在浏览器中访问：http://localhost:5173 或 http://localhost:3000（根据实际端口）

## 🔍 常见问题排查

### 问题1：后端启动失败 - 数据库连接错误

**错误信息：**
```
Communications link failure
Access denied for user 'root'@'localhost'
```

**解决方案：**
1. 检查 MySQL 服务是否启动
2. 检查 `application.yml` 中的数据库密码是否正确
3. 检查数据库 `booking_system` 是否已创建

### 问题2：后端启动失败 - Redis 连接错误

**错误信息：**
```
Unable to connect to Redis
Connection refused
```

**解决方案：**
1. 检查 Redis 服务是否启动
2. 执行 `redis-cli ping` 测试连接
3. 检查防火墙是否阻止了 6379 端口

### 问题3：后端启动失败 - 端口被占用

**错误信息：**
```
Port 8080 was already in use
```

**解决方案：**
```bash
# 查找占用端口的进程
netstat -ano | findstr :8080

# 结束进程（找到PID后）
taskkill /PID <进程ID> /F

# 或修改 application.yml 中的端口
server:
  port: 8081  # 改为其他端口
```

### 问题4：前端启动失败 - 依赖安装失败

**错误信息：**
```
npm ERR! network timeout
```

**解决方案：**
```bash
# 切换 npm 镜像源
npm config set registry https://registry.npmmirror.com

# 清理缓存后重新安装
npm cache clean --force
npm install
```

### 问题5：前端无法访问后端 API

**错误信息：**
```
CORS error
Network Error
```

**解决方案：**
1. 检查后端是否已启动（http://localhost:8080/api）
2. 检查前端配置文件中的 API 地址
3. 检查浏览器控制台的具体错误信息

## 📝 测试账号

启动成功后，可以使用以下账号登录：

**管理员账号：**
- 用户名：`admin`
- 密码：`admin123`

**普通用户账号：**
- 用户名：`zhangsan` / `lisi` / `wangwu`
- 密码：`123456`

## 🎯 完整启动流程（快速版）

```bash
# 1. 启动 MySQL 和 Redis
net start MySQL
redis-server

# 2. 导入数据（首次运行）
cd C:\JavaCode\Test\Booking-System\booking-system-backend\src\main\resources\db
mysql -u root -p < schema.sql
mysql -u root -p < test_data.sql

# 3. 启动后端（新开命令行窗口）
cd C:\JavaCode\Test\Booking-System\booking-system-backend
mvn spring-boot:run

# 4. 启动前端（新开命令行窗口）
cd C:\JavaCode\Test\Booking-System\booking-system-frontend
npm install  # 首次运行
npm run dev
```

## 🌐 访问地址

启动成功后，访问以下地址：

- **前端页面：** http://localhost:5173 或 http://localhost:3000
- **后端API：** http://localhost:8080/api
- **API文档：** http://localhost:8080/api/swagger-ui.html（如果配置了Swagger）

## 🛠️ 开发工具推荐

- **后端开发：** IntelliJ IDEA / Eclipse
- **前端开发：** Visual Studio Code / WebStorm
- **API测试：** Postman / Apifox
- **数据库管理：** Navicat / MySQL Workbench / DBeaver
- **Redis管理：** RedisInsight / Another Redis Desktop Manager

## 📚 下一步

1. 使用 `zhangsan` 账号登录前端系统
2. 测试订票流程：查询班次 -> 选择座位 -> 创建订单 -> 支付
3. 查看数据库中的订单和车票记录
4. 测试退改签功能

---

**提示：** 开发时建议同时打开3个命令行窗口，分别用于后端、前端和数据库/Redis操作。
