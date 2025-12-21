package com.booking.controller;

import com.booking.common.PageListResult;
import com.booking.common.Result;
import com.booking.dto.FinancialReportDTO;
import com.booking.dto.TripDTO;
import com.booking.dto.TripManagementVO;
import com.booking.dto.UserManagementVO;
import com.booking.service.FinancialReportService;
import com.booking.vo.FinancialReportVO;
import com.booking.entity.Order;
import com.booking.entity.Station;
import com.booking.entity.User;
import com.booking.mapper.OrderMapper;
import com.booking.mapper.StationMapper;
import com.booking.mapper.TicketMapper;
import com.booking.mapper.UserMapper;
import com.booking.service.OrderService;
import com.booking.service.TripService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/admin")
public class AdminController {
    
    @Resource
    private OrderService orderService;
    
    @Resource
    private TripService tripService;
    
    @Resource
    private StationMapper stationMapper;
    
    @Resource
    private UserMapper userMapper;
    
    @Resource
    private TicketMapper ticketMapper;
    
    @Resource
    private OrderMapper orderMapper;
    
    @Resource
    private PasswordEncoder passwordEncoder;

    @Resource
    private FinancialReportService financialReportService;
    
    /**
     * 获取统计数据
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalUsers = userMapper.countActiveUsers();
        Long totalTrips = tripService.countTrips(null, null, null, null, null);
        Long todayOrders = orderMapper.countTodayOrders();
        Long todayTickets = ticketMapper.countTodayTickets();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("todayOrders", todayOrders);
        stats.put("todayTickets", todayTickets);
        
        return Result.success(stats);
    }

    @GetMapping("/financial/report")
    public Result<FinancialReportVO> getFinancialReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "daily") String reportType) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            FinancialReportVO data = financialReportService.getFinancialReport(start, end, reportType);
            return Result.success(data);
        } catch (Exception e) {
            return Result.error("获取财务报表失败：" + e.getMessage());
        }
    }

    @GetMapping("/financial/sales")
    public Result<FinancialReportVO> getSalesStatistics(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "daily") String reportType) {
        return getFinancialReport(startDate, endDate, reportType);
    }

    @GetMapping("/financial/export")
    public void exportFinancialReport(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false, defaultValue = "daily") String reportType,
            HttpServletResponse response) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            FinancialReportVO data = financialReportService.getFinancialReport(start, end, reportType);

            response.setContentType("text/csv;charset=UTF-8");
            String fileName = "financial_report_" + startDate + "_" + endDate + ".csv";
            String encodedFileName = java.net.URLEncoder.encode(fileName, "UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=" + encodedFileName);

            java.io.PrintWriter writer = response.getWriter();
            writer.println("日期,销售额,退票金额,净收入,订单数,退票数");

            if (data != null && data.getDetails() != null) {
                for (FinancialReportDTO dto : data.getDetails()) {
                    String dateStr = dto.getDate() != null ? dto.getDate().toString() : "";
                    String salesStr = dto.getSales() != null ? dto.getSales().toPlainString() : "0";
                    String refundStr = dto.getRefund() != null ? dto.getRefund().toPlainString() : "0";
                    String netIncomeStr = dto.getNetIncome() != null ? dto.getNetIncome().toPlainString() : "0";
                    int orderCount = dto.getOrderCount() != null ? dto.getOrderCount() : 0;
                    int refundCount = dto.getRefundCount() != null ? dto.getRefundCount() : 0;

                    writer.print(dateStr);
                    writer.print(',');
                    writer.print(salesStr);
                    writer.print(',');
                    writer.print(refundStr);
                    writer.print(',');
                    writer.print(netIncomeStr);
                    writer.print(',');
                    writer.print(orderCount);
                    writer.print(',');
                    writer.print(refundCount);
                    writer.println();
                }
            }

            writer.flush();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * 获取用户列表
     */
    @GetMapping("/users")
    public Result<PageListResult<UserManagementVO>> getUserList(
            @RequestParam(required = false) String username,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        // 参数验证
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        // 计算偏移量
        Integer offset = (page - 1) * pageSize;
        
        try {
            List<User> users;
            Long total;
            
            // 如果有用户名搜索条件，使用搜索查询
            if (username != null && !username.trim().isEmpty()) {
                users = userMapper.searchUsers(username.trim(), offset, pageSize);
                total = userMapper.countSearchUsers(username.trim());
            } else {
                // 否则查询所有用户
                users = userMapper.getAllUsersWithPagination(offset, pageSize);
                total = userMapper.countActiveUsers();
            }
            
            // 转换为VO
            List<UserManagementVO> userVOs = users.stream().map(user -> {
                UserManagementVO vo = new UserManagementVO();
                vo.setUserId(user.getUserId());
                vo.setUsername(user.getUsername());
                vo.setRealName(user.getRealName());
                vo.setPhone(user.getPhone());
                vo.setEmail(user.getEmail());
                vo.setIdCard(user.getIdCardNo());
                vo.setUserType(user.getUserType() != null ? user.getUserType().intValue() : 0);
                vo.setBalance(user.getBalance());
                vo.setCreateTime(user.getCreateTime());
                vo.setUpdateTime(user.getUpdateTime());
                
                // 查询订单数量
                Long orderCount = userMapper.countUserOrders(user.getUserId());
                vo.setOrderCount(orderCount);
                
                return vo;
            }).collect(Collectors.toList());
            
            PageListResult<UserManagementVO> result = new PageListResult<>(userVOs, total);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("获取用户列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取所有订单列表（管理员）
     */
    @GetMapping("/orders")
    public Result<List<Order>> getAdminOrderList(
            @RequestParam(required = false) String orderNumber,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        // TODO: 实现分页、筛选和搜索
        // 暂时返回空列表
        return Result.success(List.of());
    }
    
    /**
     * 获取车次列表（管理员）- 分页
     */
    @GetMapping("/trips")
    public Result<PageListResult<TripManagementVO>> getAdminTripList(
            @RequestParam(required = false) String tripNumber,
            @RequestParam(required = false) String departureDate,
            @RequestParam(required = false) String departureStation,
            @RequestParam(required = false) String arrivalStation,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        // 参数验证
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        // 计算偏移量
        Integer offset = (page - 1) * pageSize;
        
        // 查询数据
        List<TripManagementVO> list = tripService.getTripList(tripNumber, departureDate, departureStation, arrivalStation, status, sortBy, sortOrder, offset, pageSize);
        Long total = tripService.countTrips(tripNumber, departureDate, departureStation, arrivalStation, status);
        
        // 返回前端期望的格式
        PageListResult<TripManagementVO> result = new PageListResult<>(list, total);
        
        return Result.success(result);
    }
    
    /**
     * 批量导入车次
     */
    @PostMapping("/trips/batch-import")
    public Result<Map<String, Object>> batchImportTrips(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = tripService.importTripsFromExcel(file);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("批量导入失败：" + e.getMessage());
        }
    }

    /**
     * 下载车次导入模板（Excel格式，UTF-8 BOM编码）
     */
    @GetMapping("/trips/template")
    public void downloadTripTemplate(HttpServletResponse response) {
        try {
            response.setContentType("text/csv;charset=UTF-8");
            String fileName = "车次导入模板.csv";
            String encodedFileName = java.net.URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''" + encodedFileName);
            response.setCharacterEncoding("UTF-8");

            // 添加UTF-8 BOM头，确保Excel能正确识别中文编码
            java.io.OutputStream out = response.getOutputStream();
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);
            
            java.io.PrintWriter writer = new java.io.PrintWriter(new java.io.OutputStreamWriter(out, "UTF-8"));
            writer.println("车次号,车辆信息,总座位数,出发站,到达站,出发日期,出发时间,到达日期,到达时间,基础票价");
            writer.println("G1001,CRH380A,556,北京南站,上海虹桥站,2025-12-20,08:00,2025-12-20,12:30,553.5");
            writer.println("D2001,CRH2A,613,广州南站,深圳北站,2025-12-21,09:30,2025-12-21,10:15,79.5");
            writer.flush();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * 添加车次
     */
    @PostMapping("/trips")
    public Result<Void> createTrip(@RequestBody TripManagementVO tripVO) {
        try {
            TripDTO tripDTO = convertToTripDTO(tripVO);
            tripService.addTrip(tripDTO);
            return Result.success("车次添加成功", null);
        } catch (Exception e) {
            return Result.error("添加车次失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新车次
     */
    @PutMapping("/trips/{id}")
    public Result<Void> updateTrip(@PathVariable Integer id, @RequestBody TripManagementVO tripVO) {
        try {
            TripDTO tripDTO = convertToTripDTO(tripVO);
            tripService.updateTrip(id, tripDTO);
            return Result.success("车次更新成功", null);
        } catch (Exception e) {
            return Result.error("更新车次失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除车次
     */
    @DeleteMapping("/trips/{id}")
    public Result<Void> deleteTrip(@PathVariable Integer id) {
        try {
            tripService.deleteTrip(id);
            return Result.success("车次删除成功", null);
        } catch (Exception e) {
            return Result.error("删除车次失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新票价
     */
    @PutMapping("/trips/{id}/price")
    public Result<Void> updateTripPrice(@PathVariable Integer id, @RequestBody Map<String, Object> data) {
        try {
            Object priceObj = data.get("price");
            if (priceObj == null) {
                return Result.error("票价不能为空");
            }
            
            BigDecimal newPrice = new BigDecimal(priceObj.toString());
            
            // 验证票价合法性
            if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
                return Result.error("票价必须大于0");
            }
            if (newPrice.compareTo(new BigDecimal("10000")) > 0) {
                return Result.error("票价不能超过10000元");
            }
            
            // 处理总座位数
            Integer totalSeats = null;
            Object totalSeatsObj = data.get("totalSeats");
            if (totalSeatsObj != null) {
                totalSeats = Integer.parseInt(totalSeatsObj.toString());
                if (totalSeats < 0) {
                    return Result.error("总座位数不能为负数");
                }
            }
            
            tripService.updateTripPrice(id, newPrice, totalSeats);
            return Result.success("票价更新成功", null);
        } catch (Exception e) {
            return Result.error("更新票价失败：" + e.getMessage());
        }
    }
    
    /**
     * 批量更新票价
     */
    @PutMapping("/trips/batch-price")
    public Result<Void> batchUpdateTripPrice(@RequestBody Map<String, Object> data) {
        try {
            // 获取车次ID列表
            @SuppressWarnings("unchecked")
            List<Integer> tripIds = (List<Integer>) data.get("tripIds");
            if (tripIds == null || tripIds.isEmpty()) {
                return Result.error("车次ID列表不能为空");
            }
            
            // 获取新票价
            Object priceObj = data.get("price");
            if (priceObj == null) {
                return Result.error("票价不能为空");
            }
            
            BigDecimal newPrice = new BigDecimal(priceObj.toString());
            
            // 验证票价合法性
            if (newPrice.compareTo(BigDecimal.ZERO) <= 0) {
                return Result.error("票价必须大于0");
            }
            
            // 批量更新
            for (Integer tripId : tripIds) {
                tripService.updateTripPrice(tripId, newPrice, null);
            }
            
            return Result.success("批量更新票价成功", null);
        } catch (Exception e) {
            return Result.error("批量更新票价失败：" + e.getMessage());
        }
    }
    
    private TripDTO convertToTripDTO(TripManagementVO tripVO) {
        if (tripVO == null) {
            throw new IllegalArgumentException("车次数据不能为空");
        }

        TripDTO tripDTO = new TripDTO();
        tripDTO.setTripNumber(tripVO.getTripNumber());
        tripDTO.setVehicleInfo(tripVO.getVehicleInfo());

        String departureStationName = tripVO.getDepartureStationName();
        String arrivalStationName = tripVO.getArrivalStationName();

        if (departureStationName == null || arrivalStationName == null) {
            throw new IllegalArgumentException("出发站和到达站不能为空");
        }

        Station departureStation = stationMapper.findByName(departureStationName);
        Station arrivalStation = stationMapper.findByName(arrivalStationName);

        if (departureStation == null || arrivalStation == null) {
            throw new IllegalArgumentException("出发站或到达站不存在");
        }

        tripDTO.setDepartureStationId(departureStation.getStationId());
        tripDTO.setArrivalStationId(arrivalStation.getStationId());

        String departureDateStr = tripVO.getDate();
        String arrivalDateStr = tripVO.getArrivalDate();
        String departureTimeStr = tripVO.getDepartureTime();
        String arrivalTimeStr = tripVO.getArrivalTime();

        if (departureDateStr == null || departureTimeStr == null || arrivalTimeStr == null) {
            throw new IllegalArgumentException("发车日期和时间不能为空");
        }

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalDate departureDate = LocalDate.parse(departureDateStr, dateFormatter);
        LocalTime departureTime = LocalTime.parse(departureTimeStr, timeFormatter);
        LocalTime arrivalTime = LocalTime.parse(arrivalTimeStr, timeFormatter);

        LocalDate arrivalDate;
        if (arrivalDateStr != null && !arrivalDateStr.isEmpty()) {
            arrivalDate = LocalDate.parse(arrivalDateStr, dateFormatter);
        } else {
            // 兼容旧前端：如果未传到达日期，根据时间判断是否跨天
            if (arrivalTime.isBefore(departureTime)) {
                arrivalDate = departureDate.plusDays(1);
            } else {
                arrivalDate = departureDate;
            }
        }

        LocalDateTime departureDateTime = LocalDateTime.of(departureDate, departureTime);
        LocalDateTime arrivalDateTime = LocalDateTime.of(arrivalDate, arrivalTime);

        if (arrivalDateTime.isBefore(departureDateTime)) {
            throw new IllegalArgumentException("到达时间不能早于出发时间");
        }

        tripDTO.setDepartureTime(departureDateTime);
        tripDTO.setArrivalTime(arrivalDateTime);

        TripManagementVO.SeatInfo seatInfo = tripVO.getSeats();
        if (seatInfo != null) {
            tripDTO.setTotalSeats(seatInfo.getTotal());
            tripDTO.setBasePrice(seatInfo.getPrice());
        }

        return tripDTO;
    }
    
    /**
     * 获取改签退票请求列表
     */
    @GetMapping("/refund-change/list")
    public Result<List<Object>> getRefundChangeList(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        // TODO: 实现改签退票请求列表
        return Result.success(List.of());
    }
    
    /**
     * 审核改签退票请求
     */
    @PostMapping("/refund-change/{id}/process")
    public Result<Void> processRefundChange(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        // TODO: 实现审核逻辑
        return Result.success();
    }
    
    /**
     * 测试接口 - 获取车次总数
     */
    @GetMapping("/test/trips/count")
    public Result<Map<String, Object>> testTripsCount() {
        Map<String, Object> result = new HashMap<>();
        try {
            Long count = tripService.countTrips(null, null, null, null, null);
            result.put("totalTrips", count);
            result.put("status", "success");
            result.put("message", "数据库连接正常");
            return Result.success(result);
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", e.getMessage());
            result.put("error", e.toString());
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 测试接口 - 获取所有车次（不分页）
     */
    @GetMapping("/test/trips/all")
    public Result<List<TripManagementVO>> testGetAllTrips() {
        try {
            List<TripManagementVO> trips = tripService.getTripList(null, null, null, null, null, null, null, 0, 100);
            return Result.success(trips);
        } catch (Exception e) {
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    // ==================== 用户管理 ====================
    
    /**
     * 搜索用户
     */
    @GetMapping("/users/search")
    public Result<PageListResult<UserManagementVO>> searchUsers(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize) {
        
        if (keyword == null || keyword.trim().isEmpty()) {
            return Result.error("搜索关键词不能为空");
        }
        
        // 参数验证
        if (page == null || page < 1) {
            page = 1;
        }
        if (pageSize == null || pageSize < 1) {
            pageSize = 10;
        }
        if (pageSize > 100) {
            pageSize = 100;
        }
        
        // 计算偏移量
        Integer offset = (page - 1) * pageSize;
        
        try {
            // 搜索用户
            List<User> users = userMapper.searchUsers(keyword.trim(), offset, pageSize);
            Long total = userMapper.countSearchUsers(keyword.trim());
            
            // 转换为VO
            List<UserManagementVO> userVOs = users.stream().map(user -> {
                UserManagementVO vo = new UserManagementVO();
                vo.setUserId(user.getUserId());
                vo.setUsername(user.getUsername());
                vo.setRealName(user.getRealName());
                vo.setPhone(user.getPhone());
                vo.setEmail(user.getEmail());
                vo.setIdCard(user.getIdCardNo());
                vo.setUserType(user.getUserType() != null ? user.getUserType().intValue() : 0);
                vo.setBalance(user.getBalance());
                vo.setCreateTime(user.getCreateTime());
                vo.setUpdateTime(user.getUpdateTime());
                
                // 查询订单数量
                Long orderCount = userMapper.countUserOrders(user.getUserId());
                vo.setOrderCount(orderCount);
                
                return vo;
            }).collect(Collectors.toList());
            
            PageListResult<UserManagementVO> result = new PageListResult<>(userVOs, total);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("搜索用户失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取用户详情
     */
    @GetMapping("/users/{userId}")
    public Result<UserManagementVO> getUserDetail(@PathVariable Integer userId) {
        try {
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            UserManagementVO vo = new UserManagementVO();
            vo.setUserId(user.getUserId());
            vo.setUsername(user.getUsername());
            vo.setRealName(user.getRealName());
            vo.setPhone(user.getPhone());
            vo.setEmail(user.getEmail());
            vo.setIdCard(user.getIdCardNo());
            vo.setUserType(user.getUserType() != null ? user.getUserType().intValue() : 0);
            vo.setBalance(user.getBalance());
            vo.setCreateTime(user.getCreateTime());
            vo.setUpdateTime(user.getUpdateTime());
            
            // 查询订单数量
            Long orderCount = userMapper.countUserOrders(userId);
            vo.setOrderCount(orderCount);
            
            return Result.success(vo);
        } catch (Exception e) {
            return Result.error("获取用户详情失败：" + e.getMessage());
        }
    }
    
    /**
     * 重置用户密码
     */
    @PostMapping("/users/{userId}/reset-password")
    public Result<Void> resetUserPassword(@PathVariable Integer userId, @RequestBody Map<String, String> data) {
        try {
            String newPassword = data.get("newPassword");
            String reason = data.get("reason");
            
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return Result.error("新密码不能为空");
            }
            
            if (newPassword.length() < 6 || newPassword.length() > 20) {
                return Result.error("密码长度必须在6-20位之间");
            }
            
            if (reason == null || reason.trim().isEmpty()) {
                return Result.error("重置原因不能为空");
            }
            
            // 检查用户是否存在
            User user = userMapper.selectById(userId);
            if (user == null) {
                return Result.error("用户不存在");
            }
            
            // 加密新密码
            String encodedPassword = passwordEncoder.encode(newPassword);
            
            // 更新密码
            int result = userMapper.updatePassword(userId, encodedPassword);
            
            if (result > 0) {
                // TODO: 记录操作日志
                return Result.success("密码重置成功", null);
            } else {
                return Result.error("密码重置失败");
            }
        } catch (Exception e) {
            return Result.error("重置密码失败：" + e.getMessage());
        }
    }
}
