package com.booking.service;

import com.booking.dto.CreateOrderDTO;
import com.booking.dto.OrderVO;
import com.booking.entity.Order;

import java.util.List;

public interface OrderService {
    /**
     * 创建订单（订票）
     */
    OrderVO createOrder(Integer userId, CreateOrderDTO createOrderDTO);
    
    /**
     * 获取订单详情
     */
    OrderVO getOrderDetail(Long orderId);
    
    /**
     * 支付订单
     */
    void payOrder(Long orderId, Integer userId, String paymentMethod);
    
    /**
     * 取消订单
     */
    void cancelOrder(Long orderId, Integer userId);
    
    /**
     * 获取用户的订单列表
     */
    List<Order> listByUser(Integer userId);
    
    Order getById(Long orderId);
}

