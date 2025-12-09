package com.booking.mapper;

import com.booking.entity.BalanceChange;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 余额变动记录Mapper接口
 */
@Mapper
public interface BalanceChangeMapper {
    int insert(BalanceChange record);
    List<BalanceChange> findByUserId(@Param("userId") Integer userId);
}

