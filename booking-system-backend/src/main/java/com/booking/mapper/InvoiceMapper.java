package com.booking.mapper;

import com.booking.entity.Invoice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InvoiceMapper {
    int insert(Invoice invoice);

    int update(Invoice invoice);

    Invoice findById(@Param("invoiceId") Long invoiceId);

    List<Invoice> findByUserId(@Param("userId") Integer userId);

    int delete(@Param("invoiceId") Long invoiceId, @Param("userId") Integer userId);
}
