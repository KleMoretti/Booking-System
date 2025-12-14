package com.booking.controller;

import com.booking.common.Result;
import com.booking.dto.ChangeOrderDTO;
import com.booking.dto.CreateOrderDTO;
import com.booking.dto.OrderVO;
import com.booking.dto.RefundOrderDTO;
import com.booking.entity.Order;
import com.booking.service.OrderService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

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
    public Result<List<OrderVO>> getOrderList(HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            List<OrderVO> orders = orderService.listByUser(userId);
            return Result.success(orders);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("获取订单列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取订单详情
     */
    @GetMapping("/{id}")
    public Result<OrderVO> getOrderDetail(@PathVariable Long id, HttpServletRequest request) {
        Integer userId = getUserIdFromRequest(request);
        
        OrderVO order = orderService.getOrderDetail(id);
        
        if (order == null) {
            return Result.error("订单不存在");
        }
        
        return Result.success(order);
    }
    
    /**
     * 创建订单（订票）
     */
    @PostMapping("/create")
    public Result<OrderVO> createOrder(@Valid @RequestBody CreateOrderDTO createOrderDTO, 
                                       HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            
            OrderVO order = orderService.createOrder(userId, createOrderDTO);
            return Result.success("订单创建成功", order);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("创建订单失败：" + e.getMessage());
        }
    }
    
    /**
     * 支付订单
     */
    @PostMapping("/{id}/pay")
    public Result<Void> payOrder(@PathVariable Long id, 
                                @RequestBody Map<String, String> data,
                                HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            String paymentMethod = data.get("paymentMethod");
            
            orderService.payOrder(id, userId, paymentMethod);
            return Result.success("支付成功", null);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("支付失败：" + e.getMessage());
        }
    }
    
    /**
     * 取消订单
     */
    @PostMapping("/{id}/cancel")
    public Result<Void> cancelOrder(@PathVariable Long id, HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            
            orderService.cancelOrder(id, userId);
            return Result.success("订单已取消", null);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("取消订单失败：" + e.getMessage());
        }
    }
    
    /**
     * 退票
     */
    @PostMapping("/{id}/refund")
    public Result<Void> refundOrder(@PathVariable Long id, 
                                    @RequestBody RefundOrderDTO refundDTO,
                                    HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            
            orderService.refundOrder(id, userId, refundDTO);
            return Result.success("退票成功，退款将在3-5个工作日内到账", null);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("退票失败：" + e.getMessage());
        }
    }
    
    /**
     * 改签
     */
    @PostMapping("/{id}/change")
    public Result<Void> changeOrder(@PathVariable Long id, 
                                    @RequestBody ChangeOrderDTO changeDTO,
                                    HttpServletRequest request) {
        try {
            Integer userId = getUserIdFromRequest(request);
            
            orderService.changeOrder(id, userId, changeDTO);
            return Result.success("改签成功", null);
        } catch (IllegalStateException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("改签失败：" + e.getMessage());
        }
    }
    
    /**
     * 从请求中获取用户ID
     */
    private Integer getUserIdFromRequest(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) {
            throw new IllegalStateException("未登录或登录已过期");
        }

        token = token.substring(7);
        Integer userId = jwtUtil.getUserIdFromToken(token);
        if (userId == null) {
            throw new IllegalStateException("登录状态无效，请重新登录");
        }
        return userId;
    }
}

