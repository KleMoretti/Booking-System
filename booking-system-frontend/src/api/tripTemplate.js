import request from "@/utils/request";

/**
 * 车次模板API
 */

// 导入Excel
export const importTripTemplate = (formData) => {
  return request({
    url: "/admin/trip-templates/import",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 获取所有模板
export const getTripTemplateList = () => {
  return request({
    url: "/admin/trip-templates/list",
    method: "get",
  });
};

// 获取启用的模板
export const getActiveTripTemplates = () => {
  return request({
    url: "/admin/trip-templates/list/active",
    method: "get",
  });
};

// 根据ID获取模板
export const getTripTemplateById = (id) => {
  return request({
    url: `/admin/trip-templates/${id}`,
    method: "get",
  });
};

// 添加模板
export const addTripTemplate = (data) => {
  return request({
    url: "/admin/trip-templates",
    method: "post",
    data,
  });
};

// 更新模板
export const updateTripTemplate = (id, data) => {
  return request({
    url: `/admin/trip-templates/${id}`,
    method: "put",
    data,
  });
};

// 删除模板
export const deleteTripTemplate = (id) => {
  return request({
    url: `/admin/trip-templates/${id}`,
    method: "delete",
  });
};
