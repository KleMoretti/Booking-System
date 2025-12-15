package com.booking.controller;

import com.booking.common.Result;
import com.booking.entity.InvoiceTitle;
import com.booking.service.InvoiceTitleService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

@RestController
@RequestMapping("/invoice-titles")
public class InvoiceTitleController {

    @Resource
    private InvoiceTitleService invoiceTitleService;

    @Resource
    private JwtUtil jwtUtil;

    @GetMapping
    public Result<List<InvoiceTitle>> listTitles(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            List<InvoiceTitle> list = invoiceTitleService.listTitles(userId);
            return Result.success(list);
        } catch (Exception e) {
            return Result.error("获取发票抬头失败：" + e.getMessage());
        }
    }

    @PostMapping
    public Result<InvoiceTitle> createTitle(@RequestHeader(value = "Authorization", required = false) String token,
                                            @RequestBody InvoiceTitle title) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            InvoiceTitle created = invoiceTitleService.createTitle(userId, title);
            return Result.success("添加成功", created);
        } catch (Exception e) {
            return Result.error("添加发票抬头失败：" + e.getMessage());
        }
    }

    @PutMapping("/{titleId}")
    public Result<InvoiceTitle> updateTitle(@RequestHeader(value = "Authorization", required = false) String token,
                                            @PathVariable Integer titleId,
                                            @RequestBody InvoiceTitle title) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            InvoiceTitle updated = invoiceTitleService.updateTitle(userId, titleId, title);
            return Result.success("更新成功", updated);
        } catch (Exception e) {
            return Result.error("更新发票抬头失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/{titleId}")
    public Result<Void> deleteTitle(@RequestHeader(value = "Authorization", required = false) String token,
                                    @PathVariable Integer titleId) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            invoiceTitleService.deleteTitle(userId, titleId);
            return Result.success("删除成功", null);
        } catch (Exception e) {
            return Result.error("删除发票抬头失败：" + e.getMessage());
        }
    }

    @GetMapping("/default")
    public Result<InvoiceTitle> getDefaultTitle(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            InvoiceTitle title = invoiceTitleService.getDefaultTitle(userId);
            return Result.success(title);
        } catch (Exception e) {
            return Result.error("获取默认发票抬头失败：" + e.getMessage());
        }
    }
}
