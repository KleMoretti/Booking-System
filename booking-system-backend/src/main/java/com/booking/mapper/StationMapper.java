package com.booking.mapper;

import com.booking.entity.Station;
import java.util.List;

/**
 * 车站Mapper接口
 */
public interface StationMapper {
    int insert(Station station);
    int update(Station station);
    Station findById(Integer stationId);
    List<Station> findAll();
}

