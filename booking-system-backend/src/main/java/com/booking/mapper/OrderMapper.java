package com.booking.mapper;

import com.booking.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 订单Mapper接口
 */
@Mapper
public interface OrderMapper {
    int insert(Order order);
    int update(Order order);
    Order findById(@Param("orderId") Long orderId);
    Order findByOrderNumber(@Param("orderNumber") String orderNumber);
    List<Order> findByUserId(@Param("userId") Integer userId);
}
