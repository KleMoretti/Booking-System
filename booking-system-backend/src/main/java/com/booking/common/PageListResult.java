package com.booking.common;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * 分页列表结果类（前端期望的格式：list + total）
 */
public class PageListResult<T> {
    
    @JsonProperty("list")
    private List<T> list;
    
    @JsonProperty("total")
    private Long total;

    public PageListResult() {
    }

    public PageListResult(List<T> list, Long total) {
        this.list = list;
        this.total = total;
    }

    public List<T> getList() {
        return list;
    }

    public void setList(List<T> list) {
        this.list = list;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }
}
