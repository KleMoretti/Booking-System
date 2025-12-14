package com.booking.service.impl;

import com.booking.entity.Station;
import com.booking.mapper.StationMapper;
import com.booking.service.StationService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 车站服务实现类
 */
@Service
public class StationServiceImpl implements StationService {

    @Resource
    private StationMapper stationMapper;

    @Override
    public List<Station> getAllStations() {
        return stationMapper.findAll();
    }

    @Override
    public Station getById(Integer stationId) {
        return stationMapper.findById(stationId);
    }

    @Override
    public void addStation(Station station) {
        stationMapper.insert(station);
    }

    @Override
    public void updateStation(Station station) {
        stationMapper.update(station);
    }

    @Override
    public void deleteStation(Integer stationId) {
        stationMapper.delete(stationId);
    }
}
