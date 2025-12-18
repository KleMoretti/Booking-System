package com.booking.mapper;

import com.booking.entity.TripTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 车次模板Mapper
 */
@Mapper
public interface TripTemplateMapper {
    
    /**
     * 插入模板
     */
    void insert(@Param("template") TripTemplate template);
    
    /**
     * 根据ID查询
     */
    TripTemplate findById(@Param("templateId") Integer templateId);
    
    /**
     * 根据车次号查询
     */
    TripTemplate findByTripNumber(@Param("tripNumber") String tripNumber);
    
    /**
     * 查询所有模板
     */
    List<TripTemplate> findAll();
    
    /**
     * 查询启用的模板
     */
    List<TripTemplate> findActive();
    
    /**
     * 更新模板
     */
    void update(@Param("template") TripTemplate template);
    
    /**
     * 删除模板
     */
    void delete(@Param("templateId") Integer templateId);
    
    /**
     * 批量插入
     */
    void batchInsert(@Param("templates") List<TripTemplate> templates);
}
