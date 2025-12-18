package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.TripTemplate;
import com.booking.service.TripTemplateService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * 车次模板控制器
 */
@RestController
@RequestMapping("/admin/trip-templates")
public class TripTemplateController {

    @Resource
    private TripTemplateService tripTemplateService;

    /**
     * 导入Excel文件
     */
    @PostMapping("/import")
    public Result<Map<String, Object>> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = tripTemplateService.importFromExcel(file);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error("导入失败: " + e.getMessage());
        }
    }

    /**
     * 查询所有模板
     */
    @GetMapping("/list")
    public Result<List<TripTemplate>> listAll() {
        try {
            List<TripTemplate> templates = tripTemplateService.listAll();
            return Result.success(templates);
        } catch (Exception e) {
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 查询启用的模板
     */
    @GetMapping("/list/active")
    public Result<List<TripTemplate>> listActive() {
        try {
            List<TripTemplate> templates = tripTemplateService.listActive();
            return Result.success(templates);
        } catch (Exception e) {
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询
     */
    @GetMapping("/{id}")
    public Result<TripTemplate> getById(@PathVariable("id") Integer templateId) {
        try {
            TripTemplate template = tripTemplateService.getById(templateId);
            if (template == null) {
                return Result.error("模板不存在");
            }
            return Result.success(template);
        } catch (Exception e) {
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 添加模板
     */
    @PostMapping
    public Result<Void> addTemplate(@RequestBody TripTemplate template) {
        try {
            tripTemplateService.addTemplate(template);
            return Result.success(null);
        } catch (Exception e) {
            return Result.error("添加失败: " + e.getMessage());
        }
    }

    /**
     * 更新模板
     */
    @PutMapping("/{id}")
    public Result<Void> updateTemplate(@PathVariable("id") Integer templateId, 
                                      @RequestBody TripTemplate template) {
        try {
            template.setTemplateId(templateId);
            tripTemplateService.updateTemplate(template);
            return Result.success(null);
        } catch (Exception e) {
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除模板
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteTemplate(@PathVariable("id") Integer templateId) {
        try {
            tripTemplateService.deleteTemplate(templateId);
            return Result.success(null);
        } catch (Exception e) {
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
