package com.booking.service.impl;

import com.booking.entity.Station;
import com.booking.mapper.StationMapper;
import com.booking.mapper.TripMapper;
import com.booking.service.StationService;
import com.booking.service.TripService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

/**
 * 车站服务实现类
 */
@Service
public class StationServiceImpl implements StationService {

    @Resource
    private StationMapper stationMapper;

    @Resource
    private TripMapper tripMapper;

    @Resource
    private TripService tripService;

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
    @Transactional(rollbackFor = Exception.class)
    public void deleteStation(Integer stationId) {
        // 先删除所有使用该站点的车次
        List<Integer> tripIds = tripMapper.findTripIdsByStationId(stationId);
        if (tripIds != null && !tripIds.isEmpty()) {
            for (Integer tripId : tripIds) {
                tripService.deleteTrip(tripId);
            }
        }

        // 再删除车站本身
        stationMapper.delete(stationId);
    }
}
