-- 网上订票系统数据库脚本
-- 创建数据库
CREATE DATABASE IF NOT EXISTS booking_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE booking_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密）',
    email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号',
    user_type TINYINT DEFAULT 0 COMMENT '用户类型：0-普通用户，1-管理员',
    status TINYINT DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 票务表
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '票务ID',
    ticket_type VARCHAR(20) NOT NULL COMMENT '票务类型：train-火车，plane-飞机',
    ticket_no VARCHAR(50) NOT NULL COMMENT '车次/航班号',
    departure VARCHAR(50) NOT NULL COMMENT '出发地',
    destination VARCHAR(50) NOT NULL COMMENT '目的地',
    departure_time DATETIME NOT NULL COMMENT '出发时间',
    arrival_time DATETIME COMMENT '到达时间',
    duration INT COMMENT '行程时长（分钟）',
    price DECIMAL(10,2) NOT NULL COMMENT '基础价格',
    total_seats INT NOT NULL COMMENT '总座位数',
    available_seats INT NOT NULL COMMENT '剩余座位数',
    status TINYINT DEFAULT 1 COMMENT '状态：0-下架，1-在售',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_route (departure, destination, departure_time),
    INDEX idx_ticket_no (ticket_no),
    INDEX idx_departure_time (departure_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票务表';

-- 座位表
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '座位ID',
    ticket_id INT NOT NULL COMMENT '票务ID',
    seat_type VARCHAR(20) NOT NULL COMMENT '座位类型：一等座、二等座、商务座等',
    seat_no VARCHAR(10) NOT NULL COMMENT '座位号',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    status TINYINT DEFAULT 0 COMMENT '状态：0-可用，1-已锁定，2-已售',
    lock_time DATETIME COMMENT '锁定时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_ticket_seat (ticket_id, seat_no),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='座位表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单ID',
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
    user_id INT NOT NULL COMMENT '用户ID',
    ticket_id INT NOT NULL COMMENT '票务ID',
    seat_id INT NOT NULL COMMENT '座位ID',
    passenger_name VARCHAR(50) NOT NULL COMMENT '乘客姓名',
    passenger_id_card VARCHAR(18) NOT NULL COMMENT '乘客身份证',
    passenger_phone VARCHAR(20) COMMENT '乘客手机号',
    order_status TINYINT DEFAULT 0 COMMENT '订单状态：0-待支付，1-已支付，2-已取消，3-已退款，4-已完成',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    payment_method VARCHAR(20) COMMENT '支付方式',
    pay_time DATETIME COMMENT '支付时间',
    cancel_time DATETIME COMMENT '取消时间',
    refund_time DATETIME COMMENT '退款时间',
    refund_amount DECIMAL(10,2) COMMENT '退款金额',
    expire_time DATETIME COMMENT '过期时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_order_status (order_status),
    INDEX idx_create_time (create_time),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 支付表
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '支付ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    payment_no VARCHAR(64) NOT NULL UNIQUE COMMENT '支付流水号',
    payment_method VARCHAR(20) NOT NULL COMMENT '支付方式：alipay-支付宝，wechat-微信',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
    payment_status TINYINT DEFAULT 0 COMMENT '支付状态：0-待支付，1-支付成功，2-支付失败',
    transaction_id VARCHAR(64) COMMENT '第三方交易号',
    pay_time DATETIME COMMENT '支付时间',
    notify_time DATETIME COMMENT '回调通知时间',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_payment_no (payment_no),
    INDEX idx_transaction_id (transaction_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付表';

-- 退改签表
CREATE TABLE IF NOT EXISTS refund_change (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
    order_id BIGINT NOT NULL COMMENT '订单ID',
    user_id INT NOT NULL COMMENT '用户ID',
    type TINYINT NOT NULL COMMENT '类型：1-退票，2-改签',
    reason VARCHAR(255) COMMENT '申请原因',
    status TINYINT DEFAULT 0 COMMENT '状态：0-待审核，1-已通过，2-已拒绝',
    fee DECIMAL(10,2) DEFAULT 0 COMMENT '手续费',
    refund_amount DECIMAL(10,2) COMMENT '退款金额',
    new_ticket_id INT COMMENT '改签后的票务ID（改签时）',
    new_seat_id INT COMMENT '改签后的座位ID（改签时）',
    audit_user_id INT COMMENT '审核人ID',
    audit_time DATETIME COMMENT '审核时间',
    audit_remark VARCHAR(255) COMMENT '审核备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退改签表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id INT COMMENT '用户ID',
    username VARCHAR(50) COMMENT '用户名',
    operation VARCHAR(50) NOT NULL COMMENT '操作类型',
    method VARCHAR(200) COMMENT '请求方法',
    params TEXT COMMENT '请求参数',
    ip VARCHAR(50) COMMENT 'IP地址',
    location VARCHAR(100) COMMENT '操作地点',
    execute_time INT COMMENT '执行时长（毫秒）',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_user_id (user_id),
    INDEX idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- 插入测试数据
-- 管理员账号 (密码: admin123)
INSERT INTO users (username, password, email, phone, real_name, user_type) 
VALUES ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'admin@booking.com', '13800000000', '管理员', 1);

-- 测试用户 (密码: user123)
INSERT INTO users (username, password, email, phone, real_name, id_card, user_type) 
VALUES ('testuser', '$2a$10$5ZH2.hXjG6pANVLUx0VbWuMCT5qKJ4.hXjG6pANVLUx0VbWu', 'user@test.com', '13900000001', '测试用户', '110101199001011234', 0);

