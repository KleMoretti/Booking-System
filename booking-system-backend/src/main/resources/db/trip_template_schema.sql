-- 模板车次表
-- 用于存储车次模板，便于批量创建车次
USE booking_system;

CREATE TABLE IF NOT EXISTS trip_templates (
    template_id          INT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
    trip_number          VARCHAR(50)  NOT NULL COMMENT '车次号（如G123、D456）',
    vehicle_info         VARCHAR(100) COMMENT '车辆信息（如CRH380A）',
    total_seats          INT          NOT NULL DEFAULT 0 COMMENT '总座位数',
    departure_station_id INT          NOT NULL COMMENT '出发站ID',
    arrival_station_id   INT          NOT NULL COMMENT '到达站ID',
    departure_time       TIME         NOT NULL COMMENT '出发时间（仅时分秒）',
    arrival_time         TIME         NOT NULL COMMENT '到达时间（仅时分秒）',
    base_price           DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT '基础票价',
    is_active            TINYINT      DEFAULT 1 COMMENT '是否启用：0=禁用，1=启用',
    create_time          DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_trip_number (trip_number),
    INDEX idx_departure_station (departure_station_id),
    INDEX idx_arrival_station (arrival_station_id),
    CONSTRAINT fk_trip_templates_departure_station FOREIGN KEY (departure_station_id) REFERENCES stations(station_id),
    CONSTRAINT fk_trip_templates_arrival_station   FOREIGN KEY (arrival_station_id)   REFERENCES stations(station_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车次模板表';
