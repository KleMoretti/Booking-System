package com.booking.mapper;

import com.booking.entity.Station;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 车站Mapper接口
 */
@Mapper
public interface StationMapper {
    int insert(Station station);
    int update(Station station);
    Station findById(@Param("stationId") Integer stationId);
    Station findByName(@Param("stationName") String stationName);
    List<Station> findAll();
    int delete(@Param("stationId") Integer stationId);
}
