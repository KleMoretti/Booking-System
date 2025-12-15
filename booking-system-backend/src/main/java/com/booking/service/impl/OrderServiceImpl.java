package com.booking.service.impl;

import com.booking.dto.ChangeOrderDTO;
import com.booking.dto.CreateOrderDTO;
import com.booking.dto.OrderVO;
import com.booking.dto.RefundOrderDTO;
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
import java.math.RoundingMode;
import java.time.Duration;
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
        
        // 校验发车时间，发车后不允许购票
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime departureTime = trip.getDepartureTime();
        if (departureTime == null) {
            throw new IllegalStateException("车次发车时间异常，无法购买车票");
        }
        if (!departureTime.isAfter(now)) {
            throw new IllegalStateException("该车次已发车，无法购买车票");
        }

        ensureSeatsForTrip(trip);
        
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

    private void ensureSeatsForTrip(Trip trip) {
        if (trip == null || trip.getTripId() == null || trip.getTotalSeats() == null || trip.getTotalSeats() <= 0) {
            return;
        }
        List<Seat> seats = seatMapper.findByTripId(trip.getTripId());
        if (seats != null && !seats.isEmpty()) {
            return;
        }
        int totalSeats = trip.getTotalSeats();
        for (int i = 1; i <= totalSeats; i++) {
            Seat seat = new Seat();
            seat.setTripId(trip.getTripId());
            seat.setSeatNumber(generateSeatNumber(i));
            seat.setSeatStatus((byte) 0);
            seatMapper.insert(seat);
        }
    }

    private String generateSeatNumber(int index) {
        int rowIndex = (index - 1) / 10;
        int numberInRow = (index - 1) % 10 + 1;
        char rowChar = (char) ('A' + rowIndex);
        return rowChar + String.valueOf(numberInRow);
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
        
        // 校验车次是否已发车，已发车订单不允许支付
        List<Ticket> tickets = ticketMapper.findByOrderId(orderId);
        if (tickets == null || tickets.isEmpty()) {
            throw new IllegalStateException("订单没有关联的车票");
        }
        Ticket firstTicket = tickets.get(0);
        Trip trip = tripMapper.findById(firstTicket.getTripId());
        if (trip == null) {
            throw new IllegalStateException("车次信息不存在");
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime departureTime = trip.getDepartureTime();
        if (departureTime == null) {
            throw new IllegalStateException("车次发车时间异常，无法支付订单");
        }
        if (!departureTime.isAfter(now)) {
            throw new IllegalStateException("该车次已发车，无法支付订单");
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
    @Transactional(rollbackFor = Exception.class)
    public void refundOrder(Long orderId, Integer userId, RefundOrderDTO refundDTO) {
        // 获取订单信息
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalStateException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("无权操作此订单");
        }
        if (order.getOrderStatus() != 1 && order.getOrderStatus() != 3) {
            throw new IllegalStateException("只能退已支付或已完成的订单");
        }
        
        // 获取订单车票信息
        List<Ticket> tickets = ticketMapper.findByOrderId(orderId);
        if (tickets == null || tickets.isEmpty()) {
            throw new IllegalStateException("订单没有关联的车票");
        }
        
        // 获取第一张车票的车次信息来计算退票费用
        Ticket firstTicket = tickets.get(0);
        Trip trip = tripMapper.findById(firstTicket.getTripId());
        if (trip == null) {
            throw new IllegalStateException("车次信息不存在");
        }
        
        // 计算退票费用
        LocalDateTime departureTime = trip.getDepartureTime();
        LocalDateTime now = LocalDateTime.now();
        long hoursLeft = Duration.between(now, departureTime).toHours();
        
        BigDecimal feeRate;
        if (hoursLeft >= 48) {
            feeRate = new BigDecimal("0.05"); // 5%
        } else if (hoursLeft >= 24) {
            feeRate = new BigDecimal("0.10"); // 10%
        } else if (hoursLeft >= 2) {
            feeRate = new BigDecimal("0.20"); // 20%
        } else {
            throw new IllegalStateException("发车前2小时内不可退票");
        }
        
        // 计算退款金额
        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal refundFee = totalAmount.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal refundAmount = totalAmount.subtract(refundFee);
        
        // 退款到用户余额
        balanceService.refund(userId, refundAmount);
        
        // 更新订单状态
        order.setOrderStatus((byte) 4); // 4=已退票
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.update(order);
        
        // 更新车票状态并释放座位
        for (Ticket ticket : tickets) {
            ticket.setTicketStatus((byte) 2); // 2=已退票
            ticketMapper.update(ticket);
            
            // 释放座位
            Seat seat = seatMapper.findById(ticket.getSeatId());
            if (seat != null && seat.getSeatStatus() == 2) {
                seat.setSeatStatus((byte) 0); // 0=可用
                seat.setLockExpireTime(null);
                seatMapper.update(seat);
            }
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void changeOrder(Long orderId, Integer userId, ChangeOrderDTO changeDTO) {
        // 获取原订单信息
        Order order = orderMapper.findById(orderId);
        if (order == null) {
            throw new IllegalStateException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new IllegalStateException("无权操作此订单");
        }
        if (order.getOrderStatus() != 1 && order.getOrderStatus() != 3) {
            throw new IllegalStateException("只能改签已支付或已完成的订单");
        }
        
        // 获取原订单车票信息
        List<Ticket> oldTickets = ticketMapper.findByOrderId(orderId);
        if (oldTickets == null || oldTickets.isEmpty()) {
            throw new IllegalStateException("订单没有关联的车票");
        }
        
        // 获取新车次信息
        Integer newTripId = changeDTO.getNewTripId();
        Trip newTrip = tripMapper.findById(newTripId);
        if (newTrip == null) {
            throw new IllegalStateException("新车次不存在");
        }
        
        // 确保新车次有座位
        ensureSeatsForTrip(newTrip);
        
        // 检查新车次余票
        int requestCount = oldTickets.size();
        int availableCount = seatMapper.countAvailableSeats(newTripId);
        if (availableCount < requestCount) {
            throw new IllegalStateException("新车次余票不足");
        }
        
        // 锁定新座位
        List<Seat> newSeats = new ArrayList<>();
        for (int i = 0; i < requestCount; i++) {
            Seat seat = seatMapper.findAvailableSeat(newTripId);
            if (seat == null) {
                throw new IllegalStateException("没有可用座位");
            }
            seat.setSeatStatus((byte) 2); // 直接标记为已售
            seat.setLockExpireTime(null);
            seatMapper.update(seat);
            newSeats.add(seat);
        }
        
        // 计算差价
        BigDecimal oldAmount = order.getTotalAmount();
        BigDecimal newAmount = newTrip.getBasePrice().multiply(new BigDecimal(requestCount));
        BigDecimal priceDiff = newAmount.subtract(oldAmount);
        
        // 如果需要补差价
        if (priceDiff.compareTo(BigDecimal.ZERO) > 0) {
            balanceService.consume(userId, priceDiff);
        } else if (priceDiff.compareTo(BigDecimal.ZERO) < 0) {
            // 如果新车次便宜，退还差价
            balanceService.refund(userId, priceDiff.abs());
        }
        
        // 释放原座位
        for (Ticket oldTicket : oldTickets) {
            Seat oldSeat = seatMapper.findById(oldTicket.getSeatId());
            if (oldSeat != null && oldSeat.getSeatStatus() == 2) {
                oldSeat.setSeatStatus((byte) 0); // 0=可用
                oldSeat.setLockExpireTime(null);
                seatMapper.update(oldSeat);
            }
        }
        
        // 更新原订单状态为已改签
        order.setOrderStatus((byte) 5); // 5=已改签
        order.setUpdateTime(LocalDateTime.now());
        orderMapper.update(order);
        
        // 更新原车票状态
        for (Ticket oldTicket : oldTickets) {
            oldTicket.setTicketStatus((byte) 3); // 3=已改签
            ticketMapper.update(oldTicket);
        }
        
        // 创建新订单
        Order newOrder = new Order();
        newOrder.setUserId(userId);
        newOrder.setOrderNumber(generateOrderNumber());
        newOrder.setTotalAmount(newAmount);
        newOrder.setPaidAmount(newAmount);
        newOrder.setOrderStatus((byte) 1); // 1=已支付
        newOrder.setCreateTime(LocalDateTime.now());
        newOrder.setPayTime(LocalDateTime.now());
        orderMapper.insert(newOrder);
        
        // 创建新车票
        for (int i = 0; i < oldTickets.size(); i++) {
            Ticket oldTicket = oldTickets.get(i);
            Seat newSeat = newSeats.get(i);
            
            Ticket newTicket = new Ticket();
            newTicket.setOrderId(newOrder.getOrderId());
            newTicket.setTripId(newTripId);
            newTicket.setSeatId(newSeat.getSeatId());
            newTicket.setPassengerName(oldTicket.getPassengerName());
            newTicket.setPassengerIdCard(oldTicket.getPassengerIdCard());
            newTicket.setActualPrice(newTrip.getBasePrice());
            newTicket.setTicketStatus((byte) 0); // 0=未使用
            newTicket.setCreateTime(LocalDateTime.now());
            ticketMapper.insert(newTicket);
        }
    }

    @Override
    public Order getById(Long orderId) {
        return orderMapper.findById(orderId);
    }

    @Override
    public List<OrderVO> listByUser(Integer userId) {
        return orderMapper.listOrderDetailByUser(userId);
    }

    private String generateOrderNumber() {
        // 生成唯一订单号：日期时间 + UUID后8位
        String dateTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return dateTime + uuid;
    }
}

