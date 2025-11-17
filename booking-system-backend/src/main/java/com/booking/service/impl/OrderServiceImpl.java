package com.booking.service.impl;

import com.booking.entity.Order;
import com.booking.entity.Seat;
import com.booking.entity.Ticket;
import com.booking.mapper.OrderMapper;
import com.booking.mapper.SeatMapper;
import com.booking.mapper.TicketMapper;
import com.booking.service.BalanceService;
import com.booking.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Resource
    private OrderMapper orderMapper;

    @Resource
    private SeatMapper seatMapper;

    @Resource
    private TicketMapper ticketMapper;

    @Resource
    private BalanceService balanceService;

    @Override
    @Transactional
    public Order createOrder(Integer userId, Integer tripId, List<Integer> seatIds, List<Ticket> ticketInfos) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("座位不能为空");
        }
        if (ticketInfos == null || ticketInfos.size() != seatIds.size()) {
            throw new IllegalArgumentException("车票信息与座位数量不一致");
        }

        // 计算总金额
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (Ticket t : ticketInfos) {
            totalAmount = totalAmount.add(t.getActualPrice());
        }

        // 创建订单，初始状态为待支付
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderNumber(generateOrderNumber());
        order.setTotalAmount(totalAmount);
        order.setPaidAmount(BigDecimal.ZERO);
        order.setOrderStatus((byte)0);
        order.setCreateTime(LocalDateTime.now());
        orderMapper.insert(order);

        // 锁定座位并生成车票（这里简化为将座位状态设为已售）
        for (int i = 0; i < seatIds.size(); i++) {
            Integer seatId = seatIds.get(i);
            Seat seat = seatMapper.findById(seatId);
            if (seat == null) {
                throw new IllegalStateException("座位不存在: " + seatId);
            }
            if (seat.getSeatStatus() != null && seat.getSeatStatus() != 0) {
                throw new IllegalStateException("座位已售或已锁定: " + seatId);
            }
            seat.setSeatStatus((byte)2); // 2=已售
            seatMapper.update(seat);

            Ticket info = ticketInfos.get(i);
            Ticket ticket = new Ticket();
            ticket.setOrderId(order.getOrderId());
            ticket.setTripId(tripId);
            ticket.setSeatId(seatId);
            ticket.setPassengerName(info.getPassengerName());
            ticket.setPassengerIdCard(info.getPassengerIdCard());
            ticket.setActualPrice(info.getActualPrice());
            ticket.setTicketStatus((byte)0); // 未使用
            ticket.setCreateTime(LocalDateTime.now());
            ticketMapper.insert(ticket);
        }

        return order;
    }

    @Override
    public Order getById(Long orderId) {
        return orderMapper.findById(orderId);
    }

    @Override
    public List<Order> listByUser(Integer userId) {
        return orderMapper.findByUserId(userId);
    }

    private String generateOrderNumber() {
        return String.valueOf(System.currentTimeMillis());
    }
}

