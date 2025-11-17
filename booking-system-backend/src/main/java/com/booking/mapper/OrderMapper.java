package com.booking.mapper;

import com.booking.entity.Order;
import java.util.List;

/**
 * 订单Mapper接口
 */
public interface OrderMapper {
    int insert(Order order);
    int update(Order order);
    Order findById(Long orderId);
    Order findByOrderNumber(String orderNumber);
    List<Order> findByUserId(Integer userId);
}
