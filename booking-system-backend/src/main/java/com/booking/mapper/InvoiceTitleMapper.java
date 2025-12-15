package com.booking.mapper;

import com.booking.entity.InvoiceTitle;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface InvoiceTitleMapper {
    int insert(InvoiceTitle title);

    int update(InvoiceTitle title);

    InvoiceTitle findById(@Param("titleId") Integer titleId);

    List<InvoiceTitle> findByUserId(@Param("userId") Integer userId);

    InvoiceTitle findDefaultByUserId(@Param("userId") Integer userId);

    int deleteLogical(@Param("titleId") Integer titleId, @Param("userId") Integer userId);

    int clearDefaultByUserId(@Param("userId") Integer userId);
}
