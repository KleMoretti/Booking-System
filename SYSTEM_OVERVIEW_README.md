# 网上订票系统 – 功能与排查速览（简版）

> 本文整合了多个零散文档：认证排查、用户信息完善、后端修复、错误处理、UI 定制、新功能说明等，作为开发和联调时的快速入口。

---

## 1. 用户注册 / 登录 / 信息完善

- **注册简化**：只需用户名 + 手机号 + 密码，实名信息登录后再补充。
- **登录后检查**：
  - 若 `realName` 或 `idCard` 为空，弹出“完善个人信息”弹窗，用户必须填写真实姓名 + 身份证号（+ 邮箱，可选）。
- **关键接口**：
  - `POST /api/user/register` – 注册
  - `POST /api/user/login` – 登录，返回 `token + user`（含 `userType`）
  - `GET /api/user/profile` – 获取当前用户信息
  - `PUT /api/user/profile` – 更新实名信息
- **前端位置**：
  - 补充信息弹窗：`src/components/CompleteProfileModal/index.jsx`
  - 登录后检查：`src/App.jsx`（判断 `userInfo.realName` / `userInfo.idCard`）

---

## 2. 完善信息后端实现要点

- **DTO**：使用 `UpdateProfileDTO` 接收前端数据：`realName`, `idCard`, `email`
- **Service**：`IUserService.updateProfile(userId, dto)`：
  - 验证用户存在
  - 校验身份证号格式与唯一性
  - 只更新实名相关字段，不影响用户名、密码、余额等
- **Mapper（简化说明）**：
  - `updateProfile(userId, realName, idCard, email)`
  - 使用 MyBatis 动态 SQL，仅当字段非空时才更新对应列：`real_name`、`id_card_no`、`email`
- **数据库字段（users 表）建议**：
  - `real_name VARCHAR(50)` – 真实姓名
  - `id_card_no VARCHAR(18)` – 身份证号（唯一索引）
  - `email VARCHAR(100)` – 邮箱

---

## 3. 认证 / Token 常见问题速查

**现象举例：**
- 完善信息时提示：`登录已失效，请重新登录` 或 `系统繁忙，请稍后重试`
- 后端报错：`Required request header 'Authorization' ... not present`

**排查步骤：**
1. 浏览器控制台检查登录状态：
   ```js
   localStorage.getItem('auth_token')
   localStorage.getItem('user_info')
   ```
2. Network 面板查看 `PUT /api/user/profile`：
   - 是否带有 `Authorization: Bearer xxx`
3. 区分环境：
   - `VITE_USE_MOCK=true`：前端 Mock，无需后端
   - `VITE_USE_MOCK=false`：必须启动后端 + 数据库
4. 若后端报 500：优先检查 users 表是否有 `real_name` / `id_card_no` 字段，以及身份证号唯一索引是否存在。

---

## 4. 全局错误处理策略（前端）

- 统一位置：
  - `src/utils/request.js` – Axios 拦截器
  - `src/utils/errorHandler.js` – 错误文案转换工具
- 主要规则（示意）：
  - 包含 SQL / database / SQLException / Mapper 等 → 显示：`系统繁忙，请稍后重试`
  - 包含 `Duplicate` + `username/phone/id_card` → 显示：用户名/手机号/身份证号已被使用
  - 包含 `Authorization` / `token` / `not present` → 显示：`登录已失效，请重新登录` 或 `请先登录`
- 使用方式：
  ```js
  import { handleApiError, handleException } from '@/utils/errorHandler'
  
  try {
    const res = await api()
    if (handleApiError(res, message, '操作失败')) {
      // 成功逻辑
    }
  } catch (e) {
    handleException(e, message, '操作失败，请稍后重试')
  }
  ```

---

## 5. 前端主要新增功能一览

**搜索与首页：**
- 历史搜索（最多 5 条，本地存储）：`useSearchHistory` + Home 页面
- 日期快捷按钮：今天 / 明天 / 后天，一键填充出发日期

**车票列表：**
- 日期切换：前一天 / 后一天
- 筛选：时间段、车次类型、价格范围、仅显示有票
- 排序：出发时间、到达时间、历时、价格

**订单与支付：**
- 订单状态标签：待支付 / 已支付 / 已完成 / 已取消
- 支付倒计时（示例 15 分钟）、价格明细、余额不足提示与充值入口

**退改签：**
- 退票手续费规则展示
- 改签费与差价说明，退改前给出预览金额

> 具体页面与实现文件可参考 `NEW_FEATURES.md`，此处只保留概览。

---

## 6. 设计与主题定制（精简版）

**设计风格：**
- 目标：现代、极简、干净
- 推荐方案：黑白灰主色 + 大量留白 + 简单边框与微弱交互

**极简设计要点（对应 `MINIMAL_DESIGN.md`）：**
- 主色：黑 `#000`、深灰 `#333`、中灰 `#666`、浅灰 `#999`
- 卡片：白底 + 1px 细灰边框 + 4px 圆角，悬停仅加重边框
- 输入框 / 按钮：统一使用 8px 倍数间距，焦点边框变黑，无阴影

**自定义 Header 图标与主题色（对应 `CUSTOMIZATION_GUIDE.md`）：**
- 修改 Header Emoji：`src/components/Header/index.jsx` 中 `<span className="logo-mark">🚄</span>`
- 使用自定义 SVG：放入 `public/icons/logo.svg`，在 Header 中 `<img src="/icons/logo.svg" />`
- 渐变或主色调整：在各页面 `style.css` 中修改对应 background / color

---

## 7. 启动与联调简要流程

1. **准备数据库（真实后端）**
   - 执行 `schema.sql` 建库与建表
   - 执行 `add_user_profile_fields.sql` 添加 `real_name` / `id_card_no` 等字段
2. **启动后端**
   ```bash
   cd booking-system-backend
   mvn clean package
   mvn spring-boot:run
   ```
3. **启动前端**
   ```bash
   cd booking-system-frontend
   # Mock 模式
   # VITE_USE_MOCK=true
   # 或真实后端
   # VITE_USE_MOCK=false
   npm run dev
   ```
4. **验证完善信息流程**
   - 注册并登录新用户
   - 确认登录后自动弹出完善信息弹窗
   - 填写姓名 + 身份证号 + 邮箱并提交
   - 弹窗关闭，个人中心与数据库中的实名信息已更新

---

## 8. 数据库初始化与测试数据

### 8.1 数据库结构

系统使用MySQL数据库，包含以下核心表：
- `users` – 用户表（含实名信息字段）
- `stations` – 车站表
- `trips` – 车次表
- `seats` – 座位表
- `orders` – 订单表
- `tickets` – 车票表
- `balance_changes` – 余额变动记录
- `ticket_changes` – 改签退票记录

### 8.2 初始化脚本

**位置**: `booking-system-backend/src/main/resources/db/`

1. **schema.sql** – 创建数据库和表结构
2. **insert_trip_data.sql** – 插入测试车次数据（10天，130+班次，75000+座位）
3. **DATA_INSERT_GUIDE.md** – 详细的数据导入指南

### 8.3 快速初始化

```bash
# 1. 创建数据库和表
mysql -u root -p < booking-system-backend/src/main/resources/db/schema.sql

# 2. 导入测试数据（2025-12-14至2025-12-23）
mysql -u root -p booking_system < booking-system-backend/src/main/resources/db/insert_trip_data.sql
```

### 8.4 测试数据概览

- **时间范围**: 2025-12-14 至 2025-12-23（10天）
- **车站数量**: 15个（北京、上海、广州、深圳、杭州等主要城市）
- **车次总数**: 约130个班次
- **主要线路**:
  - G1/G2: 北京南 ⇄ 上海虹桥（553元）
  - G7: 北京西 → 广州南（862元）
  - G15: 北京南 → 深圳北（933.5元）
  - D101: 上海虹桥 → 杭州东（73元）
  - 更多线路详见 `DATA_INSERT_GUIDE.md`

### 8.5 验证数据

```sql
-- 查看车站
SELECT * FROM stations;

-- 查看今日车次
SELECT t.trip_number, ds.station_name AS departure, as_.station_name AS arrival, 
       t.departure_time, t.base_price
FROM trips t
JOIN stations ds ON t.departure_station_id = ds.station_id
JOIN stations as_ ON t.arrival_station_id = as_.station_id
WHERE DATE(t.departure_time) = CURDATE()
ORDER BY t.departure_time;

-- 查看座位统计
SELECT t.trip_number, COUNT(s.seat_id) AS seat_count
FROM trips t
LEFT JOIN seats s ON t.trip_id = s.trip_id
GROUP BY t.trip_id
LIMIT 10;
```

---

## 9. 出问题时从哪里看？

- 认证 / Token 问题 → 原 `AUTH_TROUBLESHOOTING.md`
- 完善信息更新接口后端实现细节 → 原 `BACKEND_FIX_UPDATE_USER.md` / `PROFILE_UPDATE_FIX.md`
- 完善信息前后端调试步骤 → 原 `DEBUG_PROFILE_UPDATE.md`
- 错误文案与过滤规则 → 原 `ERROR_HANDLING_SUMMARY.md`
- 用户补充信息业务说明 → 原 `USER_PROFILE_COMPLETION.md`
- 后端注册 / 用户类型 / 管理员配置 → 原 `BACKEND_UPDATES_NEEDED.md`
- UI 设计规范与自定义 → 原 `MINIMAL_DESIGN.md` / `CUSTOMIZATION_GUIDE.md`
- 新功能总览 → 原 `NEW_FEATURES.md`

> 上述原始文档可以在熟悉后按需保留或删除，本 README 作为统一入口与精简版说明。
