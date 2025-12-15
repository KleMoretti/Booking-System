package com.booking.controller;

import com.booking.common.Result;
import com.booking.service.InvoiceService;
import com.booking.utils.JwtUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/{invoiceId}/issue")
    public Result<Void> issueInvoice(@RequestHeader(value = "Authorization", required = false) String token,
                                     @PathVariable Long invoiceId) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            invoiceService.issueInvoice(userId, invoiceId);
            return Result.success("受票开具成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("开具发票失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/{invoiceId}")
    public Result<Void> deleteInvoice(@RequestHeader(value = "Authorization", required = false) String token,
                                      @PathVariable Long invoiceId) {
        try {
            if (token == null || token.isEmpty()) {
                return Result.error("请先登录");
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);
            invoiceService.deleteInvoice(userId, invoiceId);
            return Result.success("删除成功", null);
        } catch (IllegalArgumentException e) {
            return Result.error(e.getMessage());
        } catch (Exception e) {
            return Result.error("删除发票失败：" + e.getMessage());
        }
    }

    @GetMapping("/{invoiceId}/download")
    public ResponseEntity<byte[]> downloadInvoice(@RequestHeader(value = "Authorization", required = false) String token,
                                                   @PathVariable Long invoiceId) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String jwt = token.replace("Bearer ", "");
            Integer userId = jwtUtil.getUserIdFromToken(jwt);

            byte[] pdfData = invoiceService.generateInvoicePdf(invoiceId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "invoice_" + invoiceId + ".txt");
            headers.setContentLength(pdfData.length);

            return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
