-- 清空 booking_system 数据库测试数据脚本（安全版本）
-- 使用 DELETE 而非 TRUNCATE，保留表结构和自增ID设置
-- 建议执行前先备份数据库：mysqldump -u root -p booking_system > backup_$(date +%Y%m%d_%H%M%S).sql

USE booking_system;

-- ========================================
-- 警告：此脚本将删除所有业务数据！
-- 请确认您真的要执行此操作！
-- ========================================

-- 查看当前数据量
SELECT '========== 当前数据统计 ==========' AS info;
SELECT 
    'users' AS table_name, 
    COUNT(*) AS record_count 
FROM users
UNION ALL
SELECT 'stations', COUNT(*) FROM stations
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'seats', COUNT(*) FROM seats
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'balance_changes', COUNT(*) FROM balance_changes
UNION ALL
SELECT 'ticket_changes', COUNT(*) FROM ticket_changes;

-- 取消下面这行注释以继续执行删除操作
-- 或者将整个 BEGIN...END 块复制到单独的查询窗口执行

/*
BEGIN;

-- 禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;

-- 按依赖顺序删除数据
DELETE FROM ticket_changes;
DELETE FROM tickets;
DELETE FROM orders;
DELETE FROM balance_changes;
DELETE FROM seats;
DELETE FROM trips;
DELETE FROM stations;
DELETE FROM users;

-- 重置自增ID（可选）
ALTER TABLE ticket_changes AUTO_INCREMENT = 1;
ALTER TABLE tickets AUTO_INCREMENT = 1;
ALTER TABLE orders AUTO_INCREMENT = 1;
ALTER TABLE balance_changes AUTO_INCREMENT = 1;
ALTER TABLE seats AUTO_INCREMENT = 1;
ALTER TABLE trips AUTO_INCREMENT = 1;
ALTER TABLE stations AUTO_INCREMENT = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

SELECT '========== 数据清空完成 ==========' AS info;
*/

-- 执行后验证
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM stations;
-- SELECT COUNT(*) FROM trips;
-- SELECT COUNT(*) FROM seats;
-- SELECT COUNT(*) FROM orders;
-- SELECT COUNT(*) FROM tickets;
-- SELECT COUNT(*) FROM balance_changes;
-- SELECT COUNT(*) FROM ticket_changes;
