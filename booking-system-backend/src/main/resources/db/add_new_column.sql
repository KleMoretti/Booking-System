USE booking_system;
    -- 在 users 表中新增“用户姓名”和“身份证号”两列
ALTER TABLE users
    ADD COLUMN real_name VARCHAR(50) COMMENT '用户姓名',
    ADD COLUMN id_card_no VARCHAR(18) COMMENT '身份证号';