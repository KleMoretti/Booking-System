package com.booking.controller;

import com.booking.common.PageListResult;
import com.booking.common.Result;
import com.booking.dto.TripDTO;
import com.booking.dto.TripManagementVO;
import com.booking.dto.UserManagementVO;
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

import javax.annotation.Resource;
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
    
    /**
     * 获取统计数据
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalUsers = userMapper.countActiveUsers();
        Long totalTrips = tripService.countTrips(null, null, null, null);
        Long todayOrders = orderMapper.countTodayOrders();
        Long todayTickets = ticketMapper.countTodayTickets();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("todayOrders", todayOrders);
        stats.put("todayTickets", todayTickets);
        
        return Result.success(stats);
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
        List<TripManagementVO> list = tripService.getTripList(tripNumber, departureDate, departureStation, arrivalStation, sortBy, sortOrder, offset, pageSize);
        Long total = tripService.countTrips(tripNumber, departureDate, departureStation, arrivalStation);
        
        // 返回前端期望的格式
        PageListResult<TripManagementVO> result = new PageListResult<>(list, total);
        
        return Result.success(result);
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
            
            tripService.updateTripPrice(id, newPrice);
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
                tripService.updateTripPrice(tripId, newPrice);
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

        String dateStr = tripVO.getDate();
        String departureTimeStr = tripVO.getDepartureTime();
        String arrivalTimeStr = tripVO.getArrivalTime();

        if (dateStr == null || departureTimeStr == null || arrivalTimeStr == null) {
            throw new IllegalArgumentException("发车日期和时间不能为空");
        }

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        LocalDate date = LocalDate.parse(dateStr, dateFormatter);
        LocalTime departureTime = LocalTime.parse(departureTimeStr, timeFormatter);
        LocalTime arrivalTime = LocalTime.parse(arrivalTimeStr, timeFormatter);

        LocalDateTime departureDateTime = LocalDateTime.of(date, departureTime);
        LocalDateTime arrivalDateTime = LocalDateTime.of(date, arrivalTime);

        if (arrivalDateTime.isBefore(departureDateTime)) {
            arrivalDateTime = arrivalDateTime.plusDays(1);
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
            Long count = tripService.countTrips(null, null, null, null);
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
            List<TripManagementVO> trips = tripService.getTripList(null, null, null, null, null, null, 0, 100);
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
