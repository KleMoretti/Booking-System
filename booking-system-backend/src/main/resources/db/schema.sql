-- 网上订票系统数据库脚本（与 README 数据字典方案A 对齐）

-- 1. 创建数据库
CREATE DATABASE IF NOT EXISTS booking_system
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE booking_system;

-- 2. 用户表（User）
-- 保存用户账户与基本信息，包括余额与逻辑删除标记
CREATE TABLE IF NOT EXISTS users (
    user_id       INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户唯一标识',
    username      VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户登录名',
    password      VARCHAR(255) NOT NULL COMMENT '密码哈希值',
    email         VARCHAR(100)     UNIQUE COMMENT '用户邮箱',
    phone         VARCHAR(20)      UNIQUE COMMENT '用户手机号',
    user_type     TINYINT      DEFAULT 0 COMMENT '用户类型：0=普通用户，1=管理员',
    balance       DECIMAL(12,2) DEFAULT 0.00 COMMENT '用户余额，单位：元',
    create_time   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted    TINYINT      DEFAULT 0 COMMENT '删除标记：0=未删除，1=已删除',
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 3. 车站表（Stations）
-- 标准化出发/到达站点信息
CREATE TABLE IF NOT EXISTS stations (
    station_id    INT PRIMARY KEY AUTO_INCREMENT COMMENT '车站唯一标识',
    station_name  VARCHAR(100) COMMENT '站点名称',
    city          VARCHAR(100) COMMENT '所在城市',
    station_code  VARCHAR(50)  COMMENT '站点代码（如城市缩写+编号）',
    address       VARCHAR(255) COMMENT '站点详细地址',
    create_time   DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_station_code (station_code),
    INDEX idx_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车站表';

-- 4. 班次表（Trips）
-- 描述具体运行班次及相关参数
CREATE TABLE IF NOT EXISTS trips (
    trip_id              INT PRIMARY KEY AUTO_INCREMENT COMMENT '班次唯一标识',
    trip_number          VARCHAR(50)  COMMENT '车次号（如G123、D456）',
    vehicle_info         VARCHAR(100) COMMENT '车辆信息（如CRH380A）',
    total_seats          INT          NOT NULL DEFAULT 0 COMMENT '总座位数',
    departure_station_id INT          NOT NULL COMMENT '出发站ID',
    arrival_station_id   INT          NOT NULL COMMENT '到达站ID',
    departure_time       DATETIME     COMMENT '出发时间',
    arrival_time         DATETIME     COMMENT '到达时间',
    base_price           DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '基础票价',
    trip_status          TINYINT      DEFAULT 0 COMMENT '班次状态：0=计划中，1=进行中，2=已结束',
    create_time          DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_trip_number (trip_number),
    INDEX idx_departure_station (departure_station_id, departure_time),
    INDEX idx_arrival_station (arrival_station_id, arrival_time),
    CONSTRAINT fk_trips_departure_station FOREIGN KEY (departure_station_id) REFERENCES stations(station_id),
    CONSTRAINT fk_trips_arrival_station   FOREIGN KEY (arrival_station_id)   REFERENCES stations(station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='班次表';

-- 5. 座位表（Seats）
-- 记录每个班次下的座位号与状态
CREATE TABLE IF NOT EXISTS seats (
    seat_id          INT PRIMARY KEY AUTO_INCREMENT COMMENT '座位唯一标识',
    trip_id          INT          NOT NULL COMMENT '班次ID',
    seat_number      VARCHAR(20)  NOT NULL COMMENT '座位号（如A1、B2）',
    seat_status      TINYINT      DEFAULT 0 COMMENT '座位状态：0=可售，1=已锁定，2=已售',
    lock_expire_time DATETIME     COMMENT '锁定到期时间',
    create_time      DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_trip_seat (trip_id, seat_number),
    INDEX idx_trip_id (trip_id),
    INDEX idx_seat_status (seat_status),
    CONSTRAINT fk_seats_trip FOREIGN KEY (trip_id) REFERENCES trips(trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='座位表';

-- 6. 订单表（Orders）
-- 用户购买行为记录，可包含多张票
CREATE TABLE IF NOT EXISTS orders (
    order_id      BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单唯一标识',
    order_number  VARCHAR(64) NOT NULL UNIQUE COMMENT '订单编号（如2023100112345）',
    user_id       INT         NOT NULL COMMENT '用户ID',
    total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '订单总金额',
    paid_amount   DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '实付金额',
    order_status  TINYINT     DEFAULT 0 COMMENT '订单状态：0=待支付，1=已支付，2=已取消',
    create_time   DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    pay_time      DATETIME    COMMENT '支付时间',
    update_time   DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_order_status (order_status),
    INDEX idx_create_time (create_time),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 7. 车票表（Tickets）
-- 每张实际票，绑定订单、班次、座位与乘客信息
CREATE TABLE IF NOT EXISTS tickets (
    ticket_id          BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '车票唯一标识',
    order_id           BIGINT      NOT NULL COMMENT '订单ID',
    trip_id            INT         NOT NULL COMMENT '班次ID',
    seat_id            INT         NOT NULL COMMENT '座位ID',
    passenger_name     VARCHAR(50) COMMENT '乘客姓名',
    passenger_id_card  VARCHAR(32) COMMENT '乘客证件号',
    actual_price       DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '实付票价',
    ticket_status      TINYINT     DEFAULT 0 COMMENT '票据状态：0=未使用，1=已使用，2=已退票',
    create_time        DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time        DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_order_id (order_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_seat_id (seat_id),
    INDEX idx_ticket_status (ticket_status),
    CONSTRAINT fk_tickets_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_tickets_trip  FOREIGN KEY (trip_id)  REFERENCES trips(trip_id),
    CONSTRAINT fk_tickets_seat  FOREIGN KEY (seat_id)  REFERENCES seats(seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车票表';

-- 8. 余额变动记录表（BalanceChanges）
-- 用户余额变动审计记录
CREATE TABLE IF NOT EXISTS balance_changes (
    record_id       BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录唯一标识',
    user_id         INT         NOT NULL COMMENT '用户ID',
    change_amount   DECIMAL(12,2) COMMENT '变动金额，正为增加，负为减少',
    balance_before  DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '变动前余额',
    balance_after   DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '变动后余额',
    change_type     TINYINT     COMMENT '变动类型：0=充值，1=消费，2=退款',
    create_time     DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
    note            TEXT        COMMENT '备注',
    INDEX idx_user_id (user_id),
    INDEX idx_change_time (create_time),
    CONSTRAINT fk_balance_changes_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 9. 票务变更记录表（TicketChanges）
-- 改签与退票统一记录表
CREATE TABLE IF NOT EXISTS ticket_changes (
    change_id       BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '请求唯一标识',
    change_type     TINYINT     COMMENT '请求类型：1=改签，2=退票',
    ticket_id       BIGINT      NOT NULL COMMENT '车票ID',
    order_id        BIGINT      NOT NULL COMMENT '订单ID',
    target_trip_id  INT         COMMENT '目标班次ID',
    target_seat_id  INT         COMMENT '目标座位ID',
    change_fee      DECIMAL(12,2) COMMENT '改签费',
    refund_amount   DECIMAL(12,2) COMMENT '退款金额',
    process_status  TINYINT     DEFAULT 0 COMMENT '处理状态：0=待处理，1=已处理，2=已拒绝',
    request_time    DATETIME    DEFAULT CURRENT_TIMESTAMP COMMENT '请求时间',
    process_time    DATETIME    COMMENT '处理时间',
    note            TEXT        COMMENT '备注',
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_order_id (order_id),
    INDEX idx_process_status (process_status),
    INDEX idx_request_time (request_time),
    CONSTRAINT fk_ticket_changes_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
    CONSTRAINT fk_ticket_changes_order  FOREIGN KEY (order_id)  REFERENCES orders(order_id),
    CONSTRAINT fk_ticket_changes_trip   FOREIGN KEY (target_trip_id) REFERENCES trips(trip_id),
    CONSTRAINT fk_ticket_changes_seat   FOREIGN KEY (target_seat_id) REFERENCES seats(seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票务变更记录表';


-- 脚本结束
