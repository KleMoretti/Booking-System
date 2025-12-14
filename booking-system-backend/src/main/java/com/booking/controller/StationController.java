package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.Station;
import com.booking.service.StationService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 车站控制器
 */
@RestController
@RequestMapping("/station")
public class StationController {

    @Resource
    private StationService stationService;

    /**
     * 获取所有车站列表
     */
    @GetMapping("/list")
    public Result<List<Station>> getStationList() {
        List<Station> stations = stationService.getAllStations();
        return Result.success(stations);
    }

    /**
     * 根据ID获取车站
     */
    @GetMapping("/{id}")
    public Result<Station> getStationById(@PathVariable Integer id) {
        Station station = stationService.getById(id);
        if (station == null) {
            return Result.error("车站不存在");
        }
        return Result.success(station);
    }

    /**
     * 添加车站（管理员功能）
     */
    @PostMapping
    public Result<Void> addStation(@RequestBody Station station) {
        stationService.addStation(station);
        return Result.success();
    }

    /**
     * 更新车站（管理员功能）
     */
    @PutMapping("/{id}")
    public Result<Void> updateStation(@PathVariable Integer id, @RequestBody Station station) {
        station.setStationId(id);
        stationService.updateStation(station);
        return Result.success();
    }

    /**
     * 删除车站（管理员功能）
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteStation(@PathVariable Integer id) {
        stationService.deleteStation(id);
        return Result.success();
    }
}
