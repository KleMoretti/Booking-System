package com.booking.service.impl;

import com.booking.entity.Ticket;
import com.booking.entity.TicketChange;
import com.booking.mapper.TicketChangeMapper;
import com.booking.mapper.TicketMapper;
import com.booking.service.BalanceService;
import com.booking.service.TicketChangeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TicketChangeServiceImpl implements TicketChangeService {

    @Resource
    private TicketChangeMapper ticketChangeMapper;

    @Resource
    private TicketMapper ticketMapper;

    @Resource
    private BalanceService balanceService;

    @Override
    @Transactional
    public TicketChange submitChange(TicketChange change) {
        change.setProcessStatus((byte)0); // 待处理
        change.setRequestTime(LocalDateTime.now());
        ticketChangeMapper.insert(change);
        return change;
    }

    @Override
    @Transactional
    public void processChange(Long changeId, boolean approved) {
        TicketChange change = ticketChangeMapper.findById(changeId);
        if (change == null) {
            throw new IllegalArgumentException("变更记录不存在");
        }
        if (approved) {
            // 简化逻辑：如果是退票，则标记票据已退票并退款；改签逻辑只记录费用
            Ticket ticket = ticketMapper.findById(change.getTicketId());
            if (ticket == null) {
                throw new IllegalStateException("车票不存在");
            }
            if (change.getChangeType() != null && change.getChangeType() == 2) { // 2=退票
                ticket.setTicketStatus((byte)2); // 已退票
                ticketMapper.update(ticket);
                BigDecimal refundAmount = change.getRefundAmount() == null ? ticket.getActualPrice() : change.getRefundAmount();
                // 假设订单所属用户ID在业务上已知，这里简化为从外部传入或在上层处理
                // 这里只记录余额服务调用的示例
                // balanceService.refund(userId, refundAmount);
            }
            change.setProcessStatus((byte)1); // 已处理
            change.setProcessTime(LocalDateTime.now());
        } else {
            change.setProcessStatus((byte)2); // 已拒绝
            change.setProcessTime(LocalDateTime.now());
        }
        ticketChangeMapper.update(change);
    }
}

