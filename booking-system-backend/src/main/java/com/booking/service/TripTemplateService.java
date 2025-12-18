package com.booking.service;

import com.booking.entity.TripTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 车次模板服务接口
 */
public interface TripTemplateService {
    
    /**
     * 导入Excel文件
     * @param file Excel文件
     * @return 导入结果
     */
    Map<String, Object> importFromExcel(MultipartFile file);
    
    /**
     * 查询所有模板
     */
    List<TripTemplate> listAll();
    
    /**
     * 查询启用的模板
     */
    List<TripTemplate> listActive();
    
    /**
     * 根据ID查询
     */
    TripTemplate getById(Integer templateId);
    
    /**
     * 添加模板
     */
    void addTemplate(TripTemplate template);
    
    /**
     * 更新模板
     */
    void updateTemplate(TripTemplate template);
    
    /**
     * 删除模板
     */
    void deleteTemplate(Integer templateId);
}
