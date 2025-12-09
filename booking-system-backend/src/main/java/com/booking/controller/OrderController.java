package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.Order;
import com.booking.service.OrderService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 订单控制器
 */
@RestController
@RequestMapping("/order")
public class OrderController {
    
    @Resource
    private OrderService orderService;
    
    @Resource
    private JwtUtil jwtUtil;
    
    /**
     * 获取当前用户的订单列表
     */
    @GetMapping("/list")
    public Result<List<Order>> getOrderList(HttpServletRequest request) {
        // 从请求头获取token
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        // 从token中获取用户ID
        Integer userId = jwtUtil.getUserIdFromToken(token);
        
        // 查询订单列表
        List<Order> orders = orderService.listByUser(userId);
        return Result.success(orders);
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Result<Order> getOrderDetail(@PathVariable Long id, HttpServletRequest request) {
        // 从请求头获取token验证用户身份
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        Integer userId = jwtUtil.getUserIdFromToken(token);
        
        // 获取订单详情
        Order order = orderService.getById(id);
        
        if (order == null) {
            return Result.error("订单不存在");
        }
        
        // 验证订单是否属于当前用户
        if (!order.getUserId().equals(userId)) {
            return Result.error("无权访问该订单");
        }
        
        return Result.success(order);
    }
}

