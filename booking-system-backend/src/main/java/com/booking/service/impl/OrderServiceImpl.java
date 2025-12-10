package com.booking.service.impl;

import com.booking.dto.CreateOrderDTO;
import com.booking.dto.OrderVO;
import com.booking.entity.Order;
import com.booking.entity.Seat;
import com.booking.entity.Ticket;
import com.booking.entity.Trip;
import com.booking.mapper.OrderMapper;
import com.booking.mapper.SeatMapper;
import com.booking.mapper.TicketMapper;
import com.booking.mapper.TripMapper;
import com.booking.service.BalanceService;
import com.booking.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
    
    @Resource
    private TripMapper tripMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderVO createOrder(Integer userId, CreateOrderDTO createOrderDTO) {
        Integer tripId = createOrderDTO.getTripId();
        List<CreateOrderDTO.PassengerInfo> passengers = createOrderDTO.getPassengers();
        // 验证乘客信息
        if (passengers == null || passengers.isEmpty()) {
            throw new IllegalStateException("乘客信息不能为空");
        }
        
        // 验证车次是否存在
        Trip trip = tripMapper.findById(tripId);
        if (trip == null) {
            throw new IllegalStateException("车次不存在");
        }
        
        // 检查余票数量
        int requestCount = passengers.size();
        int availableCount = seatMapper.countAvailableSeats(tripId);
        if (availableCount < requestCount) {
            throw new IllegalStateException("余票不足，剩余" + availableCount + "张");
        }
        
        // 锁定座位
        List<Seat> lockedSeats = new ArrayList<>();
        for (CreateOrderDTO.PassengerInfo passenger : passengers) {
            Seat seat;
            if (passenger.getSeatId() != null) {
                // 指定了座位ID
                seat = seatMapper.findById(passenger.getSeatId());
                if (seat == null || !seat.getTripId().equals(tripId)) {
                    throw new IllegalStateException("座位不存在或不属于该车次");
                }
                if (seat.getSeatStatus() != 0) {
                    throw new IllegalStateException("座位" + seat.getSeatNumber() + "已被占用");
                }
            } else {
                // 自动分配座位
                seat = seatMapper.findAvailableSeat(tripId);
                if (seat == null) {
                    throw new IllegalStateException("没有可用座位");
                }
            }
            
            // 锁定座位（状态1=锁定，15分钟后过期）
            seat.setSeatStatus((byte) 1);
            seat.setLockExpireTime(LocalDateTime.now().plusMinutes(15));
            seatMapper.update(seat);
            lockedSeats.add(seat);
        }
        
        // 计算总金额
        BigDecimal totalAmount = trip.getBasePrice().multiply(new BigDecimal(requestCount));

        // 创建订单
        Order order = new Order();
        order.setUserId(userId);
        order.setOrderNumber(generateOrderNumber());
        order.setTotalAmount(totalAmount);
        order.setPaidAmount(BigDecimal.ZERO);
        order.setOrderStatus((byte) 0); // 0=待支付
        order.setCreateTime(LocalDateTime.now());
        orderMapper.insert(order);

        // 创建车票
        for (int i = 0; i < passengers.size(); i++) {
            CreateOrderDTO.PassengerInfo passengerInfo = passengers.get(i);
            Seat seat = lockedSeats.get(i);
            
            Ticket ticket = new Ticket();
            ticket.setOrderId(order.getOrderId());
            ticket.setTripId(tripId);
            ticket.setSeatId(seat.getSeatId());
            ticket.setPassengerName(passengerInfo.getName());
            ticket.setPassengerIdCard(passengerInfo.getIdCard());
            ticket.setActualPrice(trip.getBasePrice());
            ticket.setTicketStatus((byte) 0); // 0=未使用
            ticket.setCreateTime(LocalDateTime.now());
            ticketMapper.insert(ticket);
        }
        
        // 返回订单详情
        return getOrderDetail(order.getOrderId());
    }

    @Override
    public OrderVO getOrderDetail(Long orderId) {
        return orderMapper.getOrderDetail(orderId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void payOrder(Long orderId, Integer userId, String paymentMethod) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalStateException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("无权操作此订单");
        }
        if (order.getOrderStatus() != 0) {
            throw new IllegalStateException("订单状态异常");
        }
        
        // 扣除余额（消费）
        balanceService.consume(userId, order.getTotalAmount());
        
        // 更新订单状态
        order.setOrderStatus((byte) 1); // 1=已支付
        order.setPaidAmount(order.getTotalAmount());
        order.setPayTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.update(order);
        
        // 将锁定的座位改为已售
        List<Ticket> tickets = ticketMapper.findByOrderId(orderId);
        for (Ticket ticket : tickets) {
            Seat seat = seatMapper.findById(ticket.getSeatId());
            if (seat != null && seat.getSeatStatus() == 1) {
                seat.setSeatStatus((byte) 2); // 2=已售
                seat.setLockExpireTime(null);
                seatMapper.update(seat);
            }
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void cancelOrder(Long orderId, Integer userId) {
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalStateException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("无权操作此订单");
        }
        if (order.getOrderStatus() != 0) {
            throw new IllegalStateException("只能取消待支付的订单");
        }
        
        // 更新订单状态
        order.setOrderStatus((byte) 2); // 2=已取消
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.update(order);
        
        // 释放锁定的座位
        List<Ticket> tickets = ticketMapper.findByOrderId(orderId);
        for (Ticket ticket : tickets) {
            Seat seat = seatMapper.findById(ticket.getSeatId());
            if (seat != null && seat.getSeatStatus() == 1) {
                seat.setSeatStatus((byte) 0); // 0=可用
                seat.setLockExpireTime(null);
                seatMapper.update(seat);
            }
        }
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
        // 生成唯一订单号：日期时间 + UUID后8位
        String dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return dateTime + uuid;
    }
}

