-- 设置admin用户为管理员
-- 使用场景：通过API注册admin后，执行此脚本将其提升为管理员

USE booking_system;

-- 将admin用户设置为管理员（user_type = 1）
UPDATE users 
SET user_type = 1 
WHERE username = 'admin';

-- 验证修改
SELECT user_id, username, user_type, 
       CASE user_type 
         WHEN 0 THEN '普通用户' 
         WHEN 1 THEN '管理员' 
         ELSE '未知' 
       END AS '用户类型'
FROM users 
WHERE username = 'admin';
