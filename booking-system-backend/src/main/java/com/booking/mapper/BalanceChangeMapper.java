package com.booking.mapper;

import com.booking.entity.BalanceChange;
import java.util.List;

/**
 * 余额变动记录Mapper接口
 */
public interface BalanceChangeMapper {
    int insert(BalanceChange record);
    List<BalanceChange> findByUserId(Integer userId);
}

