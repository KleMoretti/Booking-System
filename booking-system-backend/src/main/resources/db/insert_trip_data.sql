-- 插入车次数据脚本
-- 时间范围：2025-12-18 至 2025-12-27（10天）
-- 包含：车站、车次、座位数据

USE booking_system;

-- ============================================
-- 1. 插入车站数据
-- ============================================
INSERT INTO stations (station_name, city, station_code, address) VALUES
('北京南站', '北京', 'BJS', '北京市丰台区永外大街12号'),
('上海虹桥站', '上海', 'SHH', '上海市闵行区申虹路1500号'),
('广州南站', '广州', 'GZS', '广东省广州市番禺区石壁街道石壁村'),
('深圳北站', '深圳', 'SZB', '广东省深圳市龙华区民治街道'),
('杭州东站', '杭州', 'HGH', '浙江省杭州市江干区天城路1号'),
('南京南站', '南京', 'NKH', '江苏省南京市雨花台区玉兰路98号'),
('武汉站', '武汉', 'WHN', '湖北省武汉市洪山区杨春湖路'),
('成都东站', '成都', 'ICW', '四川省成都市成华区保和街道'),
('西安北站', '西安', 'EAY', '陕西省西安市未央区元朔路'),
('重庆北站', '重庆', 'CQW', '重庆市渝北区龙头寺'),
('天津西站', '天津', 'TXP', '天津市红桥区西站前街2号'),
('郑州东站', '郑州', 'ZAF', '河南省郑州市郑东新区'),
('长沙南站', '长沙', 'CWQ', '湖南省长沙市雨花区黎托乡'),
('济南西站', '济南', 'JNK', '山东省济南市槐荫区齐鲁大道6号'),
('青岛站', '青岛', 'QDK', '山东省青岛市市南区泰安路2号')
ON DUPLICATE KEY UPDATE station_name=VALUES(station_name);

-- ============================================
-- 2. 插入车次数据（10天，每天多个班次）
-- ============================================

-- 获取车站ID（假设按顺序插入，ID从1开始）
SET @beijing_id = 1;
SET @shanghai_id = 2;
SET @guangzhou_id = 3;
SET @shenzhen_id = 4;
SET @hangzhou_id = 5;
SET @nanjing_id = 6;
SET @wuhan_id = 7;
SET @chengdu_id = 8;
SET @xian_id = 9;
SET @chongqing_id = 10;
SET @tianjin_id = 11;
SET @zhengzhou_id = 12;
SET @changsha_id = 13;
 SET @jinan_id = 14;
 SET @qingdao_id = 15;
 
-- ============================================
-- 第1天：2025-12-18
-- ============================================

-- G1: 北京南 → 上海虹桥（高铁）
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-18 07:00:00', '2025-12-18 11:30:00', 553.00, 0);

-- G2: 上海虹桥 → 北京南
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-18 08:00:00', '2025-12-18 12:30:00', 553.00, 0);

-- G7: 北京西 → 广州南
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-18 08:00:00', '2025-12-18 16:30:00', 862.00, 0);

-- D101: 上海虹桥 → 杭州东
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-18 09:00:00', '2025-12-18 10:00:00', 73.00, 0);

-- G15: 北京南 → 深圳北
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-18 09:30:00', '2025-12-18 18:30:00', 933.50, 0);

-- G55: 杭州东 → 广州南
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-18 10:00:00', '2025-12-18 17:30:00', 694.50, 0);

-- G123: 南京南 → 北京南
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-18 11:00:00', '2025-12-18 14:30:00', 443.50, 0);

-- D202: 武汉 → 广州南
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-18 12:00:00', '2025-12-18 16:00:00', 463.50, 0);

-- G87: 成都东 → 重庆北
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-18 13:00:00', '2025-12-18 14:30:00', 154.50, 0);

-- G91: 西安北 → 郑州东
INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES ('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-18 14:00:00', '2025-12-18 16:00:00', 234.50, 0);

-- ============================================
-- 第2天：2025-12-19
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-19 07:00:00', '2025-12-19 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-19 08:00:00', '2025-12-19 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-19 08:00:00', '2025-12-19 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-19 09:00:00', '2025-12-19 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-19 09:30:00', '2025-12-19 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-19 10:00:00', '2025-12-19 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-19 11:00:00', '2025-12-19 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-19 12:00:00', '2025-12-19 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-19 13:00:00', '2025-12-19 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-19 14:00:00', '2025-12-19 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-19 15:00:00', '2025-12-19 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-19 16:00:00', '2025-12-19 19:00:00', 314.50, 0);

-- ============================================
-- 第3天：2025-12-20
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-20 07:00:00', '2025-12-20 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-20 08:00:00', '2025-12-20 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-20 08:00:00', '2025-12-20 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-20 09:00:00', '2025-12-20 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-20 09:30:00', '2025-12-20 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-20 10:00:00', '2025-12-20 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-20 11:00:00', '2025-12-20 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-20 12:00:00', '2025-12-20 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-20 13:00:00', '2025-12-20 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-20 14:00:00', '2025-12-20 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-20 15:00:00', '2025-12-20 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-20 16:00:00', '2025-12-20 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-20 17:00:00', '2025-12-20 19:30:00', 184.50, 0);

-- ============================================
-- 第4天：2025-12-21
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-21 07:00:00', '2025-12-21 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-21 08:00:00', '2025-12-21 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-21 08:00:00', '2025-12-21 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-21 09:00:00', '2025-12-21 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-21 09:30:00', '2025-12-21 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-21 10:00:00', '2025-12-21 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-21 11:00:00', '2025-12-21 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-21 12:00:00', '2025-12-21 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-21 13:00:00', '2025-12-21 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-21 14:00:00', '2025-12-21 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-21 15:00:00', '2025-12-21 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-21 16:00:00', '2025-12-21 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-21 17:00:00', '2025-12-21 19:30:00', 184.50, 0);

-- ============================================
-- 第5天：2025-12-22
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-22 07:00:00', '2025-12-22 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-22 08:00:00', '2025-12-22 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-22 08:00:00', '2025-12-22 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-22 09:00:00', '2025-12-22 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-22 09:30:00', '2025-12-22 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-22 10:00:00', '2025-12-22 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-22 11:00:00', '2025-12-22 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-22 12:00:00', '2025-12-22 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-22 13:00:00', '2025-12-22 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-22 14:00:00', '2025-12-22 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-22 15:00:00', '2025-12-22 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-22 16:00:00', '2025-12-22 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-22 17:00:00', '2025-12-22 19:30:00', 184.50, 0);

-- ============================================
-- 第6天：2025-12-23
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-23 07:00:00', '2025-12-23 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-23 08:00:00', '2025-12-23 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-23 08:00:00', '2025-12-23 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-23 09:00:00', '2025-12-23 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-23 09:30:00', '2025-12-23 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-23 10:00:00', '2025-12-23 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-23 11:00:00', '2025-12-23 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-23 12:00:00', '2025-12-23 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-23 13:00:00', '2025-12-23 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-23 14:00:00', '2025-12-23 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-23 15:00:00', '2025-12-23 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-23 16:00:00', '2025-12-23 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-23 17:00:00', '2025-12-23 19:30:00', 184.50, 0);

-- ============================================
-- 第7天：2025-12-24
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-24 07:00:00', '2025-12-24 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-24 08:00:00', '2025-12-24 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-24 08:00:00', '2025-12-24 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-24 09:00:00', '2025-12-24 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-24 09:30:00', '2025-12-24 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-24 10:00:00', '2025-12-24 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-24 11:00:00', '2025-12-24 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-24 12:00:00', '2025-12-24 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-24 13:00:00', '2025-12-24 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-24 14:00:00', '2025-12-24 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-24 15:00:00', '2025-12-24 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-24 16:00:00', '2025-12-24 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-24 17:00:00', '2025-12-24 19:30:00', 184.50, 0);

-- ============================================
-- 第8天：2025-12-25
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-25 07:00:00', '2025-12-25 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-25 08:00:00', '2025-12-25 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-25 08:00:00', '2025-12-25 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-25 09:00:00', '2025-12-25 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-25 09:30:00', '2025-12-25 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-25 10:00:00', '2025-12-25 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-25 11:00:00', '2025-12-25 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-25 12:00:00', '2025-12-25 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-25 13:00:00', '2025-12-25 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-25 14:00:00', '2025-12-25 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-25 15:00:00', '2025-12-25 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-25 16:00:00', '2025-12-25 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-25 17:00:00', '2025-12-25 19:30:00', 184.50, 0);

-- ============================================
-- 第9天：2025-12-26
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-26 07:00:00', '2025-12-26 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-26 08:00:00', '2025-12-26 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-26 08:00:00', '2025-12-26 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-26 09:00:00', '2025-12-26 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-26 09:30:00', '2025-12-26 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-26 10:00:00', '2025-12-26 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-26 11:00:00', '2025-12-26 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-26 12:00:00', '2025-12-26 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-26 13:00:00', '2025-12-26 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-26 14:00:00', '2025-12-26 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-26 15:00:00', '2025-12-26 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-26 16:00:00', '2025-12-26 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-26 17:00:00', '2025-12-26 19:30:00', 184.50, 0);

-- ============================================
-- 第10天：2025-12-27
-- ============================================

INSERT INTO trips (trip_number, vehicle_info, total_seats, departure_station_id, arrival_station_id, departure_time, arrival_time, base_price, trip_status)
VALUES 
('G1', 'CRH380A', 556, @beijing_id, @shanghai_id, '2025-12-27 07:00:00', '2025-12-27 11:30:00', 553.00, 0),
('G2', 'CRH380A', 556, @shanghai_id, @beijing_id, '2025-12-27 08:00:00', '2025-12-27 12:30:00', 553.00, 0),
('G7', 'CRH380B', 556, @beijing_id, @guangzhou_id, '2025-12-27 08:00:00', '2025-12-27 16:30:00', 862.00, 0),
('D101', 'CRH2A', 610, @shanghai_id, @hangzhou_id, '2025-12-27 09:00:00', '2025-12-27 10:00:00', 73.00, 0),
('G15', 'CRH380A', 556, @beijing_id, @shenzhen_id, '2025-12-27 09:30:00', '2025-12-27 18:30:00', 933.50, 0),
('G55', 'CRH380B', 556, @hangzhou_id, @guangzhou_id, '2025-12-27 10:00:00', '2025-12-27 17:30:00', 694.50, 0),
('G123', 'CRH380D', 556, @nanjing_id, @beijing_id, '2025-12-27 11:00:00', '2025-12-27 14:30:00', 443.50, 0),
('D202', 'CRH2C', 610, @wuhan_id, @guangzhou_id, '2025-12-27 12:00:00', '2025-12-27 16:00:00', 463.50, 0),
('G87', 'CRH3C', 610, @chengdu_id, @chongqing_id, '2025-12-27 13:00:00', '2025-12-27 14:30:00', 154.50, 0),
('G91', 'CRH380B', 556, @xian_id, @zhengzhou_id, '2025-12-27 14:00:00', '2025-12-27 16:00:00', 234.50, 0),
('G303', 'CRH380A', 556, @tianjin_id, @shanghai_id, '2025-12-27 15:00:00', '2025-12-27 19:30:00', 598.50, 0),
('D305', 'CRH2A', 610, @changsha_id, @shenzhen_id, '2025-12-27 16:00:00', '2025-12-27 19:00:00', 314.50, 0),
('G401', 'CRH380B', 556, @jinan_id, @qingdao_id, '2025-12-27 17:00:00', '2025-12-27 19:30:00', 184.50, 0);

-- ============================================
-- 3. 为所有车次创建座位数据
-- ============================================

-- 创建存储过程，为指定车次生成座位
DELIMITER $$

DROP PROCEDURE IF EXISTS generate_seats$$

CREATE PROCEDURE generate_seats(IN p_trip_id INT, IN p_total_seats INT)
BEGIN
    DECLARE v_seat_num INT DEFAULT 1;
    DECLARE v_car_num INT DEFAULT 1;
    DECLARE v_seat_letter CHAR(1);
    DECLARE v_row_num INT;
    
    WHILE v_seat_num <= p_total_seats DO
        -- 计算车厢号（每车厢100座）
        SET v_car_num = CEILING(v_seat_num / 100);
        -- 计算排号（每排5座）
        SET v_row_num = ((v_seat_num - 1) MOD 100) DIV 5 + 1;
        -- 计算座位字母（A-E）
        SET v_seat_letter = CHAR(65 + ((v_seat_num - 1) MOD 5));
        
        INSERT INTO seats (trip_id, seat_number, seat_status)
        VALUES (p_trip_id, CONCAT(v_car_num, '车', LPAD(v_row_num, 2, '0'), v_seat_letter), 0);
        
        SET v_seat_num = v_seat_num + 1;
    END WHILE;
END$$

DELIMITER ;

-- 为所有车次生成座位（使用游标遍历）
DELIMITER $$

DROP PROCEDURE IF EXISTS generate_all_seats$$

CREATE PROCEDURE generate_all_seats()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_trip_id INT;
    DECLARE v_total_seats INT;
    DECLARE cur CURSOR FOR SELECT trip_id, total_seats FROM trips WHERE trip_id NOT IN (SELECT DISTINCT trip_id FROM seats);
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO v_trip_id, v_total_seats;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL generate_seats(v_trip_id, v_total_seats);
    END LOOP;
    
    CLOSE cur;
END$$

DELIMITER ;

-- 执行座位生成
CALL generate_all_seats();

-- 清理存储过程
DROP PROCEDURE IF EXISTS generate_seats;
DROP PROCEDURE IF EXISTS generate_all_seats;

-- ============================================
-- 4. 数据验证查询
-- ============================================

-- 查看车站数量
SELECT COUNT(*) AS station_count FROM stations;

-- 查看车次数量（按日期分组）
SELECT DATE(departure_time) AS trip_date, COUNT(*) AS trip_count
FROM trips
GROUP BY DATE(departure_time)
ORDER BY trip_date;

-- 查看总车次数
SELECT COUNT(*) AS total_trips FROM trips;

-- 查看座位总数
SELECT COUNT(*) AS total_seats FROM seats;

-- 查看每个车次的座位数
SELECT t.trip_number, t.departure_time, COUNT(s.seat_id) AS seat_count
FROM trips t
LEFT JOIN seats s ON t.trip_id = s.trip_id
GROUP BY t.trip_id
ORDER BY t.departure_time;

-- 查看热门线路（前5名）
SELECT 
    CONCAT(ds.station_name, ' → ', as_.station_name) AS route,
    COUNT(*) AS trip_count
FROM trips t
JOIN stations ds ON t.departure_station_id = ds.station_id
JOIN stations as_ ON t.arrival_station_id = as_.station_id
GROUP BY route
ORDER BY trip_count DESC
LIMIT 5;

-- ============================================
-- 数据插入完成！
-- ============================================
-- 总结：
-- - 15个车站
-- - 10天（2025-12-18 至 2025-12-27）
-- - 每天约13个车次
-- - 总计约130个车次
-- - 每个车次556或610个座位
-- - 总座位数约75,000个
-- ============================================
