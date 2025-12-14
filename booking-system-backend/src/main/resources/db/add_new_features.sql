-- 新功能数据库扩展脚本
-- 包含：常用联系人、发票管理、电子车票增强

USE booking_system;

-- 1. 常用联系人表（Passengers）
-- 保存用户的常用乘车人信息
CREATE TABLE IF NOT EXISTS passengers (
    passenger_id      INT PRIMARY KEY AUTO_INCREMENT COMMENT '联系人唯一标识',
    user_id           INT          NOT NULL COMMENT '所属用户ID',
    passenger_name    VARCHAR(50)  NOT NULL COMMENT '乘客姓名',
    id_card_type      TINYINT      DEFAULT 0 COMMENT '证件类型：0=身份证，1=护照，2=其他',
    id_card_no        VARCHAR(32)  NOT NULL COMMENT '证件号码',
    phone             VARCHAR(20)  COMMENT '联系电话',
    passenger_type    TINYINT      DEFAULT 0 COMMENT '旅客类型：0=成人，1=儿童，2=学生',
    is_default        TINYINT      DEFAULT 0 COMMENT '是否默认：0=否，1=是',
    create_time       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted        TINYINT      DEFAULT 0 COMMENT '删除标记：0=未删除，1=已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_id_card (id_card_no),
    CONSTRAINT fk_passengers_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='常用联系人表';

-- 2. 发票表（Invoices）
-- 保存用户的发票申请和开具记录
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id        BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '发票唯一标识',
    user_id           INT          NOT NULL COMMENT '用户ID',
    order_id          BIGINT       NOT NULL COMMENT '关联订单ID',
    invoice_type      TINYINT      DEFAULT 0 COMMENT '发票类型：0=电子普通发票，1=增值税专用发票',
    invoice_title     VARCHAR(200) NOT NULL COMMENT '发票抬头',
    tax_number        VARCHAR(50)  COMMENT '纳税人识别号',
    invoice_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '发票金额',
    invoice_status    TINYINT      DEFAULT 0 COMMENT '发票状态：0=待开具，1=已开具，2=已发送',
    invoice_number    VARCHAR(50)  COMMENT '发票号码',
    invoice_url       VARCHAR(500) COMMENT '电子发票PDF地址',
    email             VARCHAR(100) COMMENT '接收邮箱',
    apply_time        DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    issue_time        DATETIME     COMMENT '开具时间',
    send_time         DATETIME     COMMENT '发送时间',
    note              TEXT         COMMENT '备注',
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_invoice_status (invoice_status),
    INDEX idx_apply_time (apply_time),
    CONSTRAINT fk_invoices_user  FOREIGN KEY (user_id)  REFERENCES users(user_id),
    CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票表';

-- 3. 发票抬头表（InvoiceTitles）
-- 保存用户常用的发票抬头信息
CREATE TABLE IF NOT EXISTS invoice_titles (
    title_id          INT PRIMARY KEY AUTO_INCREMENT COMMENT '抬头唯一标识',
    user_id           INT          NOT NULL COMMENT '用户ID',
    title_type        TINYINT      DEFAULT 0 COMMENT '抬头类型：0=个人，1=企业',
    title_name        VARCHAR(200) NOT NULL COMMENT '发票抬头名称',
    tax_number        VARCHAR(50)  COMMENT '纳税人识别号',
    bank_name         VARCHAR(200) COMMENT '开户银行',
    bank_account      VARCHAR(50)  COMMENT '银行账号',
    company_address   VARCHAR(200) COMMENT '企业地址',
    company_phone     VARCHAR(50)  COMMENT '企业电话',
    is_default        TINYINT      DEFAULT 0 COMMENT '是否默认：0=否，1=是',
    create_time       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    is_deleted        TINYINT      DEFAULT 0 COMMENT '删除标记：0=未删除，1=已删除',
    INDEX idx_user_id (user_id),
    CONSTRAINT fk_invoice_titles_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票抬头表';

-- 4. 增强车票表字段（添加电子车票相关信息）
ALTER TABLE tickets 
    ADD COLUMN ticket_code VARCHAR(50) COMMENT '取票号/票据编号' AFTER ticket_id,
    ADD COLUMN qr_code_url VARCHAR(500) COMMENT '二维码图片地址' AFTER passenger_id_card,
    ADD COLUMN check_in_gate VARCHAR(20) COMMENT '检票口' AFTER qr_code_url,
    ADD COLUMN boarding_time DATETIME COMMENT '检票开始时间' AFTER check_in_gate,
    ADD COLUMN notes TEXT COMMENT '乘车须知/备注信息' AFTER boarding_time;

-- 5. 为车票表添加索引（便于查询取票码）
ALTER TABLE tickets
    ADD UNIQUE INDEX uk_ticket_code (ticket_code);

-- 6. 增强订单表字段（添加行程单相关）
ALTER TABLE orders
    ADD COLUMN itinerary_url VARCHAR(500) COMMENT '行程单PDF地址' AFTER update_time,
    ADD COLUMN contact_phone VARCHAR(20) COMMENT '联系电话' AFTER itinerary_url,
    ADD COLUMN contact_email VARCHAR(100) COMMENT '联系邮箱' AFTER contact_phone;

-- 脚本结束
