# 数据库设计变更记录

## 2024-12-08 变更

### 删除的表
根据用户要求，已从项目中删除以下表及相关代码：

1. **payments 表** - 支付记录表
   - 原因：决定不使用独立的支付表
   - 影响：
     - ✅ 实体类 `Payment.java` 已标记为 @Deprecated
     - ✅ 测试数据中已删除相关数据
     - ✅ 文档已更新

2. **operation_logs 表** - 操作日志表
   - 原因：决定不使用操作日志表
   - 影响：
     - ✅ 实体类 `OperationLog.java` 已标记为 @Deprecated
     - ✅ 测试数据中已删除相关数据
     - ✅ 文档已更新

### 当前数据库表结构

系统现在包含 **9张核心表**：

1. **users** - 用户表
2. **stations** - 车站表
3. **trips** - 班次表
4. **seats** - 座位表
5. **orders** - 订单表
6. **tickets** - 车票表
7. **balance_changes** - 余额变更记录表
8. **ticket_changes** - 票务变更记录表（改签、退票）

### 支付处理方式

由于删除了 payments 表，支付相关信息现在通过以下方式处理：

1. **订单表 (orders)** 中的字段：
   - `paid_amount` - 实付金额
   - `pay_time` - 支付时间
   - `order_status` - 订单状态（0=待支付，1=已支付，2=已取消）

2. **余额变更表 (balance_changes)** 记录：
   - 充值、消费、退款等余额变动
   - 包含变动类型、金额、时间等信息

### 建议的替代方案

如果后续需要详细的支付记录，可以考虑：

1. **使用 balance_changes 表**
   - 通过 `change_type` 区分支付类型
   - 在 `note` 字段中记录支付方式和交易流水号

2. **扩展 orders 表**
   - 添加 `payment_method` 字段
   - 添加 `transaction_id` 字段

3. **使用日志系统**
   - 使用应用层日志（如 log4j/logback）
   - 记录到文件或 ELK 等日志系统

### 需要删除的文件（建议）

以下文件已标记为废弃，建议手动删除：

```
src/main/java/com/booking/entity/Payment.java
src/main/java/com/booking/entity/OperationLog.java
```

删除命令：
```bash
rm src/main/java/com/booking/entity/Payment.java
rm src/main/java/com/booking/entity/OperationLog.java
```

### 测试数据更新

`test_data.sql` 已更新：
- ✅ 删除了 payments 表的 TRUNCATE 语句
- ✅ 删除了 operation_logs 表的 TRUNCATE 语句
- ✅ 删除了支付记录的测试数据插入
- ✅ 删除了操作日志的测试数据插入
- ✅ 更新了数据统计查询

### 文档更新

已更新以下文档：
- ✅ `README_IMPLEMENTATION.md` - 删除了 payments 和 operation_logs 的相关说明
- ✅ `test_data.sql` - 删除了相关测试数据

---

**注意**：schema.sql 中原本就没有定义这两个表，因此无需修改。
