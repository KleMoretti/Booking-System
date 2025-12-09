# Mapper层修复说明

## 问题
启动时报错：`No MyBatis mapper was found` 和 `No qualifying bean of type 'com.booking.mapper.UserMapper'`

## 原因
所有Mapper接口缺少 `@Mapper` 注解，导致MyBatis无法识别和注册这些接口为Bean。

## 已完成的修复 ✅

### 1. 为所有Mapper接口添加 @Mapper 注解
- ✅ UserMapper
- ✅ BalanceChangeMapper
- ✅ OrderMapper  
- ✅ TripMapper
- ✅ SeatMapper
- ✅ TicketMapper
- ✅ StationMapper
- ✅ TicketChangeMapper
- ⚠️ PaymentMapper (已标记为废弃)

### 2. 添加 @Param 注解
为所有方法参数添加了 `@Param` 注解，确保参数名正确映射到XML中。

### 3. 更新 UserMapper.xml
修正了 UserMapper.xml 中的方法名，使其与接口一致：
- `findById` → `selectById`
- `findByUsername` → `selectByUsername`
- `update` → `updateById`
- 新增 `selectByEmail`
- 新增 `selectByPhone`
- 新增 `deleteById`

## 现在可以启动项目了！

重新运行后端项目：

```bash
cd C:\JavaCode\Test\Booking-System\booking-system-backend
mvn spring-boot:run
```

或在IDEA中重新运行 `BookingApplication`。

## 预期结果

启动成功后，应该看到类似的日志：
```
Tomcat started on port(s): 8080 (http) with context path '/api'
Started BookingApplication in X.XXX seconds
```

## 如果仍有错误

### 错误：找不到对应的SQL映射
检查 `src/main/resources/mapper` 目录下的XML文件，确保：
1. `namespace` 与Mapper接口的全限定名一致
2. SQL的 `id` 与接口方法名一致
3. 参数名与 `@Param` 注解中的名称一致

### 错误：Redis连接失败
确保Redis已启动：
```bash
redis-server
```

### 错误：数据库连接失败  
1. 确保MySQL已启动
2. 检查 `application.yml` 中的数据库密码
3. 确保数据库 `booking_system` 已创建

## 废弃文件建议删除

以下文件已标记为 @Deprecated，建议删除：
- `src/main/java/com/booking/entity/Payment.java`
- `src/main/java/com/booking/entity/OperationLog.java`
- `src/main/java/com/booking/mapper/PaymentMapper.java`
- `src/main/resources/mapper/PaymentMapper.xml`
