package com.booking.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.read.builder.ExcelReaderBuilder;
import com.alibaba.excel.support.ExcelTypeEnum;
import com.booking.dto.TripTemplateExcelDTO;
import com.booking.entity.Station;
import com.booking.entity.TripTemplate;
import com.booking.mapper.StationMapper;
import com.booking.mapper.TripTemplateMapper;
import com.booking.service.TripTemplateService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.IOException;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * 车次模板服务实现类
 */
@Service
public class TripTemplateServiceImpl implements TripTemplateService {

    @Resource
    private TripTemplateMapper tripTemplateMapper;

    @Resource
    private StationMapper stationMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls") && !filename.endsWith(".csv"))) {
            throw new IllegalArgumentException("只支持Excel或CSV文件格式（.xlsx, .xls, .csv）");
        }

        List<TripTemplate> templates = new ArrayList<>();
        List<String> errorMessages = new ArrayList<>();
        
        // 获取所有车站，用于匹配车站名称
        List<Station> allStations = stationMapper.findAll();
        Map<String, Integer> stationNameToId = new HashMap<>();
        for (Station station : allStations) {
            stationNameToId.put(station.getStationName(), station.getStationId());
        }

        try {
            ExcelReaderBuilder readerBuilder = EasyExcel.read(file.getInputStream(), TripTemplateExcelDTO.class, new AnalysisEventListener<TripTemplateExcelDTO>() {
                @Override
                public void invoke(TripTemplateExcelDTO data, AnalysisContext context) {
                    Integer rowNum = context.readRowHolder().getRowIndex() + 1;
                    try {
                        TripTemplate template = convertToTemplate(data, stationNameToId);
                        templates.add(template);
                    } catch (Exception e) {
                        errorMessages.add("第" + rowNum + "行: " + e.getMessage());
                    }
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {
                    // 读取完成
                }
            });

            if (filename != null && filename.toLowerCase().endsWith(".csv")) {
                readerBuilder.excelType(ExcelTypeEnum.CSV);
            }

            readerBuilder.sheet().doRead();

            // 批量插入数据库
            if (!templates.isEmpty()) {
                for (TripTemplate template : templates) {
                    // 检查车次号是否已存在
                    TripTemplate existing = tripTemplateMapper.findByTripNumber(template.getTripNumber());
                    if (existing != null) {
                        errorMessages.add("车次号 " + template.getTripNumber() + " 已存在，已跳过");
                    } else {
                        tripTemplateMapper.insert(template);
                    }
                }
            }

        } catch (IOException e) {
            throw new RuntimeException("读取Excel文件失败: " + e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("successCount", templates.size() - errorMessages.size());
        result.put("failCount", errorMessages.size());
        result.put("errors", errorMessages);
        
        return result;
    }

    /**
     * 将Excel DTO转换为TripTemplate实体
     */
    private TripTemplate convertToTemplate(TripTemplateExcelDTO dto, Map<String, Integer> stationNameToId) {
        TripTemplate template = new TripTemplate();
        
        // 验证必填字段
        if (dto.getTripNumber() == null || dto.getTripNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("车次号不能为空");
        }
        if (dto.getDepartureStationName() == null || dto.getDepartureStationName().trim().isEmpty()) {
            throw new IllegalArgumentException("出发站不能为空");
        }
        if (dto.getArrivalStationName() == null || dto.getArrivalStationName().trim().isEmpty()) {
            throw new IllegalArgumentException("到达站不能为空");
        }
        
        template.setTripNumber(dto.getTripNumber().trim());
        template.setVehicleInfo(dto.getVehicleInfo() != null ? dto.getVehicleInfo().trim() : "");
        template.setTotalSeats(dto.getTotalSeats() != null ? dto.getTotalSeats() : 0);
        
        // 匹配车站ID
        String departureStationName = dto.getDepartureStationName().trim();
        Integer departureStationId = stationNameToId.get(departureStationName);
        if (departureStationId == null) {
            throw new IllegalArgumentException("出发站 '" + departureStationName + "' 不存在");
        }
        template.setDepartureStationId(departureStationId);
        
        String arrivalStationName = dto.getArrivalStationName().trim();
        Integer arrivalStationId = stationNameToId.get(arrivalStationName);
        if (arrivalStationId == null) {
            throw new IllegalArgumentException("到达站 '" + arrivalStationName + "' 不存在");
        }
        template.setArrivalStationId(arrivalStationId);
        
        // 解析时间
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        try {
            if (dto.getDepartureTime() != null && !dto.getDepartureTime().trim().isEmpty()) {
                template.setDepartureTime(LocalTime.parse(dto.getDepartureTime().trim(), timeFormatter));
            } else {
                throw new IllegalArgumentException("出发时间不能为空");
            }
            
            if (dto.getArrivalTime() != null && !dto.getArrivalTime().trim().isEmpty()) {
                template.setArrivalTime(LocalTime.parse(dto.getArrivalTime().trim(), timeFormatter));
            } else {
                throw new IllegalArgumentException("到达时间不能为空");
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("时间格式错误，请使用 HH:mm 格式（如 08:30）");
        }
        
        template.setBasePrice(dto.getBasePrice() != null ? dto.getBasePrice() : java.math.BigDecimal.ZERO);
        template.setIsActive((byte) 1);
        
        return template;
    }

    @Override
    public List<TripTemplate> listAll() {
        return tripTemplateMapper.findAll();
    }

    @Override
    public List<TripTemplate> listActive() {
        return tripTemplateMapper.findActive();
    }

    @Override
    public TripTemplate getById(Integer templateId) {
        return tripTemplateMapper.findById(templateId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addTemplate(TripTemplate template) {
        // 检查车次号是否已存在
        TripTemplate existing = tripTemplateMapper.findByTripNumber(template.getTripNumber());
        if (existing != null) {
            throw new IllegalArgumentException("车次号已存在");
        }
        
        if (template.getIsActive() == null) {
            template.setIsActive((byte) 1);
        }
        
        tripTemplateMapper.insert(template);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTemplate(TripTemplate template) {
        TripTemplate existing = tripTemplateMapper.findById(template.getTemplateId());
        if (existing == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        
        // 如果修改了车次号，检查新车次号是否已被占用
        if (!existing.getTripNumber().equals(template.getTripNumber())) {
            TripTemplate duplicate = tripTemplateMapper.findByTripNumber(template.getTripNumber());
            if (duplicate != null && !duplicate.getTemplateId().equals(template.getTemplateId())) {
                throw new IllegalArgumentException("车次号已被占用");
            }
        }
        
        tripTemplateMapper.update(template);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteTemplate(Integer templateId) {
        TripTemplate existing = tripTemplateMapper.findById(templateId);
        if (existing == null) {
            throw new IllegalArgumentException("模板不存在");
        }
        
        tripTemplateMapper.delete(templateId);
    }
}
