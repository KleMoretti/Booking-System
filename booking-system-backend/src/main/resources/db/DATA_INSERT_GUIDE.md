# 车次数据插入指南

## 数据概览

- **时间范围**: 2025-12-14 至 2025-12-23（10天）
- **车站数量**: 15个主要城市车站
- **车次总数**: 约130个班次
- **座位总数**: 约75,000个座位

## 车站列表

| ID | 车站名称 | 城市 | 代码 |
|----|---------|------|------|
| 1 | 北京南站 | 北京 | BJS |
| 2 | 上海虹桥站 | 上海 | SHH |
| 3 | 广州南站 | 广州 | GZS |
| 4 | 深圳北站 | 深圳 | SZB |
| 5 | 杭州东站 | 杭州 | HGH |
| 6 | 南京南站 | 南京 | NKH |
| 7 | 武汉站 | 武汉 | WHN |
| 8 | 成都东站 | 成都 | ICW |
| 9 | 西安北站 | 西安 | EAY |
| 10 | 重庆北站 | 重庆 | CQW |
| 11 | 天津西站 | 天津 | TXP |
| 12 | 郑州东站 | 郑州 | ZAF |
| 13 | 长沙南站 | 长沙 | CWQ |
| 14 | 济南西站 | 济南 | JNK |
| 15 | 青岛站 | 青岛 | QDK |

## 主要线路

### 京沪线
- **G1**: 北京南 → 上海虹桥（07:00-11:30，4.5小时，553元）
- **G2**: 上海虹桥 → 北京南（08:00-12:30，4.5小时，553元）

### 京广线
- **G7**: 北京西 → 广州南（08:00-16:30，8.5小时，862元）
- **G15**: 北京南 → 深圳北（09:30-18:30，9小时，933.5元）

### 沪杭线
- **D101**: 上海虹桥 → 杭州东（09:00-10:00，1小时，73元）

### 杭广线
- **G55**: 杭州东 → 广州南（10:00-17:30，7.5小时，694.5元）

### 其他热门线路
- **G123**: 南京南 → 北京南
- **D202**: 武汉 → 广州南
- **G87**: 成都东 → 重庆北
- **G91**: 西安北 → 郑州东
- **G303**: 天津西 → 上海虹桥
- **D305**: 长沙南 → 深圳北
- **G401**: 济南西 → 青岛站

## 车型配置

- **CRH380A/B/D**: 高速动车组，556座
- **CRH2A/C**: 动车组，610座
- **CRH3C**: 动车组，610座

## 座位编号规则

- 格式: `{车厢号}车{排号}{座位字母}`
- 示例: `1车01A`、`2车15C`
- 每车厢100座
- 每排5座（A-E）

## 执行步骤

### 1. 备份现有数据（可选）

```bash
mysqldump -u root -p booking_system > backup_$(date +%Y%m%d).sql
```

### 2. 执行插入脚本

```bash
mysql -u root -p booking_system < insert_trip_data.sql
```

或在MySQL客户端中：

```sql
USE booking_system;
SOURCE d:/DataBase/Booking-System/booking-system-backend/src/main/resources/db/insert_trip_data.sql;
```

### 3. 验证数据

脚本会自动执行验证查询，输出：

- 车站总数
- 每天的车次数量
- 总车次数
- 总座位数
- 每个车次的座位数
- 热门线路统计

### 4. 预期结果

```
station_count: 15
total_trips: ~130
total_seats: ~75,000
```

## 数据特点

1. **真实性**: 参考实际高铁线路和时刻
2. **完整性**: 每天13个固定班次，覆盖10天
3. **多样性**: 包含G字头（高铁）和D字头（动车）
4. **可扩展**: 可以基于此模式添加更多日期或线路

## 注意事项

1. **外键约束**: 确保按顺序执行，先插入车站，再插入车次，最后生成座位
2. **ID分配**: 车站ID假设按插入顺序1-15，如有差异需调整变量
3. **性能**: 座位生成使用存储过程，约75,000条记录可能需要几分钟
4. **清理**: 脚本会自动删除临时存储过程

## 故障排除

### 问题1: 外键约束错误

**原因**: 车站ID不匹配

**解决**: 
```sql
SELECT station_id, station_name FROM stations ORDER BY station_id;
-- 根据实际ID调整脚本中的变量
```

### 问题2: 座位未生成

**原因**: 存储过程执行失败

**手动修复**:
```sql
-- 查看缺失座位的车次
SELECT t.trip_id, t.trip_number, t.total_seats, COUNT(s.seat_id) AS actual_seats
FROM trips t
LEFT JOIN seats s ON t.trip_id = s.trip_id
GROUP BY t.trip_id
HAVING actual_seats = 0;

-- 手动调用生成（替换trip_id和座位数）
CALL generate_seats(1, 556);
```

### 问题3: 重复数据

**清理重复**:
```sql
-- 删除指定日期的车次
DELETE FROM tickets WHERE trip_id IN (SELECT trip_id FROM trips WHERE DATE(departure_time) BETWEEN '2025-12-14' AND '2025-12-23');
DELETE FROM seats WHERE trip_id IN (SELECT trip_id FROM trips WHERE DATE(departure_time) BETWEEN '2025-12-14' AND '2025-12-23');
DELETE FROM trips WHERE DATE(departure_time) BETWEEN '2025-12-14' AND '2025-12-23';
```

## 扩展数据

### 添加更多日期

修改脚本，复制最后一天的INSERT语句，更新日期：

```sql
-- 第11天：2025-12-24
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-24 07:00:00', '2025-12-24 11:30:00', 553.00, 0),
-- ... 其他车次
```

### 添加新线路

1. 插入新车站（如需要）
2. 添加新车次配置
3. 调用座位生成

## 完成确认

执行完成后，应看到：

```
✓ 15个车站已插入
✓ 130个车次已创建
✓ 约75,000个座位已生成
✓ 所有验证查询通过
```
