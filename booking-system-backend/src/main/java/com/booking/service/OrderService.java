package com.booking.service;

import com.booking.dto.ChangeOrderDTO;
import com.booking.dto.CreateOrderDTO;
import com.booking.dto.OrderVO;
import com.booking.dto.RefundOrderDTO;
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
     * 退票
     */
    void refundOrder(Long orderId, Integer userId, RefundOrderDTO refundDTO);
    
    /**
     * 改签
     */
    void changeOrder(Long orderId, Integer userId, ChangeOrderDTO changeDTO);
    
    /**
     * 获取用户的订单列表（包含车次和车票信息）
     */
    List<OrderVO> listByUser(Integer userId);
    
    Order getById(Long orderId);
}

