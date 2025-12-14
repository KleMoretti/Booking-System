package com.booking.service;

import com.booking.entity.Station;
import java.util.List;

/**
 * 车站服务接口
 */
public interface StationService {
    
    /**
     * 获取所有车站
     */
    List<Station> getAllStations();
    
    /**
     * 根据ID获取车站
     */
    Station getById(Integer stationId);
    
    /**
     * 添加车站
     */
    void addStation(Station station);
    
    /**
     * 更新车站
     */
    void updateStation(Station station);

    /**
     * 删除车站
     */
    void deleteStation(Integer stationId);
}
