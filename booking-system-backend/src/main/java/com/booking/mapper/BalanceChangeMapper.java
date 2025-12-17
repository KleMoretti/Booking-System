package com.booking.mapper;

import com.booking.entity.BalanceChange;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 余额变动记录Mapper接口
 */
@Mapper
public interface BalanceChangeMapper {
    int insert(BalanceChange record);
    List<BalanceChange> findByUserId(@Param("userId") Integer userId);

    List<BalanceChange> findByTimeRange(@Param("startTime") LocalDateTime startTime,
                                        @Param("endTime") LocalDateTime endTime);
}
