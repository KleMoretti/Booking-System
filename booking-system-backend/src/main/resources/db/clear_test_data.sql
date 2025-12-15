-- 清空 booking_system 数据库测试数据脚本
-- 注意：此脚本会删除所有数据，请谨慎使用！
-- 建议仅在开发和测试环境中使用

USE booking_system;

-- 禁用外键检查（可选，加快删除速度）
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 清空票务变更记录表
-- 该表依赖 tickets, orders, trips, seats
TRUNCATE TABLE ticket_changes;
SELECT '✓ 已清空 ticket_changes 表' AS status;

-- 2. 清空车票表
-- 该表依赖 orders, trips, seats
TRUNCATE TABLE tickets;
SELECT '✓ 已清空 tickets 表' AS status;

-- 3. 清空订单表
-- 该表依赖 users
TRUNCATE TABLE orders;
SELECT '✓ 已清空 orders 表' AS status;

-- 4. 清空余额变动记录表
-- 该表依赖 users
TRUNCATE TABLE balance_changes;
SELECT '✓ 已清空 balance_changes 表' AS status;

-- 5. 清空座位表
-- 该表依赖 trips
TRUNCATE TABLE seats;
SELECT '✓ 已清空 seats 表' AS status;

-- 6. 清空班次表
-- 该表依赖 stations
TRUNCATE TABLE trips;
SELECT '✓ 已清空 trips 表' AS status;

-- 7. 清空车站表
TRUNCATE TABLE stations;
SELECT '✓ 已清空 stations 表' AS status;

-- 8. 清空用户表
-- TRUNCATE TABLE users;
-- SELECT '✓ 已清空 users 表' AS status;



-- 重新启用外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- 显示最终统计信息
SELECT 
    '所有测试数据已清空完成！' AS message,
    NOW() AS execution_time;

-- 验证表是否已清空
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
