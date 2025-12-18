package com.booking.mapper;

import com.booking.dto.TripManagementVO;
import com.booking.dto.TripVO;
import com.booking.entity.Trip;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 班次Mapper接口
 */
@Mapper
public interface TripMapper {
    // 基础CRUD
    int insert(Trip trip);
    int update(Trip trip);
    int delete(@Param("tripId") Integer tripId);
    Trip findById(@Param("tripId") Integer tripId);
    
    // 用户端查询
    List<TripVO> searchTrips(@Param("departureStationId") Integer departureStationId, 
                             @Param("arrivalStationId") Integer arrivalStationId, 
                             @Param("departureTimeFrom") LocalDateTime departureTimeFrom, 
                             @Param("departureTimeTo") LocalDateTime departureTimeTo);
    
    // 管理端查询
    List<TripManagementVO> getTripList(@Param("tripNumber") String tripNumber,
                                       @Param("departureDate") String departureDate,
                                       @Param("departureStation") String departureStation,
                                       @Param("arrivalStation") String arrivalStation,
                                       @Param("sortBy") String sortBy,
                                       @Param("sortOrder") String sortOrder,
                                       @Param("offset") Integer offset,
                                       @Param("pageSize") Integer pageSize);
    Long countTrips(@Param("tripNumber") String tripNumber,
                    @Param("departureDate") String departureDate,
                    @Param("departureStation") String departureStation,
                    @Param("arrivalStation") String arrivalStation);
    int updatePrice(@Param("tripId") Integer tripId, @Param("basePrice") BigDecimal basePrice);

    /**
     * 根据站点ID查询所有使用该站点的车次ID（出发站或到达站）
     */
    List<Integer> findTripIdsByStationId(@Param("stationId") Integer stationId);

    /**
     * 更新发车车次状态为进行中
     */
    int updateStatusToInProgress(@Param("currentTime") LocalDateTime currentTime);

    /**
     * 更新到达车次状态为已结束
     */
    int updateStatusToFinished(@Param("currentTime") LocalDateTime currentTime);
}
