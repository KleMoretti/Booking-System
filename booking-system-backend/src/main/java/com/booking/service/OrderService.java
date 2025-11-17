package com.booking.service;

import com.booking.entity.Order;
import com.booking.entity.Ticket;

import java.util.List;

public interface OrderService {
    /**
     * 创建订单并锁定座位、生成车票（简化版）
     */
    Order createOrder(Integer userId, Integer tripId, List<Integer> seatIds, List<Ticket> ticketInfos);

    Order getById(Long orderId);

    List<Order> listByUser(Integer userId);
}

