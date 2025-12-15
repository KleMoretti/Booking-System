package com.booking.controller;

import com.booking.common.Result;
import com.booking.service.InvoiceService;
import com.booking.utils.JwtUtil;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    @Resource
    private InvoiceService invoiceService;

    @Resource
    private JwtUtil jwtUtil;

    @GetMapping
    public Result<List<Map<String, Object>>> listInvoices(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            List<Map<String, Object>> list = invoiceService.listInvoices(userId);
            return Result.success(list);
        } catch (Exception e) {
            return Result.error("获取发票记录失败：" + e.getMessage());
        }
    }

    @PostMapping("/apply")
    public Result<Void> applyInvoice(@RequestHeader(value = "Authorization", required = false) String token,
                                     @RequestBody Map<String, Object> data) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);

            String orderNumber = (String) data.get("orderNumber");
            Number typeNumber = (Number) data.get("invoiceType");
            Byte invoiceType = typeNumber != null ? typeNumber.byteValue() : 0;
            String invoiceTitle = (String) data.get("invoiceTitle");
            String taxNumber = (String) data.get("taxNumber");
            String email = (String) data.get("email");
            String note = (String) data.get("note");

            invoiceService.applyInvoice(userId, orderNumber, invoiceType, invoiceTitle, taxNumber, email, note);
            return Result.success("发票申请成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("发票申请失败：" + e.getMessage());
        }
    }
}
