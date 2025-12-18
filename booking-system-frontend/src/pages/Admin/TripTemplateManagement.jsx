import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Upload,
  Table,
  message,
  Space,
  Modal,
  Descriptions,
  Tag,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  importTripTemplate,
  getTripTemplateList,
  deleteTripTemplate,
} from "@/api/tripTemplate";
import "./TripTemplateManagement.css";

const TripTemplateManagement = () => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await getTripTemplateList();
      if (res.code === 200) {
        setTemplates(res.data || []);
      } else {
        message.error(res.msg || "加载失败");
      }
    } catch (error) {
      message.error("加载模板列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // 处理文件上传
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await importTripTemplate(formData);

      if (res.code === 200) {
        const { successCount, failCount, errors } = res.data;

        if (failCount === 0) {
          message.success(`成功导入 ${successCount} 条记录`);
        } else {
          Modal.warning({
            title: "导入完成",
            content: (
              <div>
                <p>成功: {successCount} 条</p>
                <p>失败: {failCount} 条</p>
                {errors && errors.length > 0 && (
                  <div
                    style={{ marginTop: 10, maxHeight: 200, overflow: "auto" }}
                  >
                    <p>错误信息:</p>
                    {errors.map((err, idx) => (
                      <p key={idx} style={{ color: "red", fontSize: 12 }}>
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ),
            width: 600,
          });
        }

        // 刷新列表
        loadTemplates();
      } else {
        message.error(res.msg || "导入失败");
      }
    } catch (error) {
      message.error("导入失败: " + (error.message || "网络错误"));
    } finally {
      setLoading(false);
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    // 创建模板内容
    const template = [
      [
        "车次号",
        "车辆信息",
        "总座位数",
        "出发站",
        "到达站",
        "出发时间",
        "到达时间",
        "基础票价",
      ],
      [
        "G1001",
        "CRH380A",
        "556",
        "北京南站",
        "上海虹桥站",
        "08:00",
        "12:28",
        "553.5",
      ],
      [
        "D2001",
        "CRH2A",
        "613",
        "广州南站",
        "深圳北站",
        "09:30",
        "10:15",
        "79.5",
      ],
    ];

    // 转换为CSV
    const csvContent = template.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "车次模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("模板已下载");
  };

  // 查看详情
  const handleViewDetail = (record) => {
    setCurrentTemplate(record);
    setDetailVisible(true);
  };

  // 删除模板
  const handleDelete = async (templateId) => {
    try {
      const res = await deleteTripTemplate(templateId);
      if (res.code === 200) {
        message.success("删除成功");
        loadTemplates();
      } else {
        message.error(res.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  const columns = [
    {
      title: "车次号",
      dataIndex: "tripNumber",
      key: "tripNumber",
      width: 120,
    },
    {
      title: "车辆信息",
      dataIndex: "vehicleInfo",
      key: "vehicleInfo",
      width: 120,
    },
    {
      title: "出发站",
      dataIndex: "departureStationName",
      key: "departureStationName",
      width: 150,
    },
    {
      title: "到达站",
      dataIndex: "arrivalStationName",
      key: "arrivalStationName",
      width: 150,
    },
    {
      title: "出发时间",
      dataIndex: "departureTime",
      key: "departureTime",
      width: 100,
    },
    {
      title: "到达时间",
      dataIndex: "arrivalTime",
      key: "arrivalTime",
      width: 100,
    },
    {
      title: "座位数",
      dataIndex: "totalSeats",
      key: "totalSeats",
      width: 80,
    },
    {
      title: "票价",
      dataIndex: "basePrice",
      key: "basePrice",
      width: 100,
      render: (price) => `¥${price}`,
    },
    {
      title: "状态",
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive) => (
        <Tag color={isActive === 1 ? "green" : "red"}>
          {isActive === 1 ? "启用" : "禁用"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定要删除这个模板吗？"
            onConfirm={() => handleDelete(record.templateId)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="trip-template-management">
      <Card
        title="车次模板管理"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
              下载模板
            </Button>
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              customRequest={handleUpload}
              disabled={loading}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={loading}
              >
                导入Excel
              </Button>
            </Upload>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="templateId"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="车次模板详情"
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentTemplate && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="模板ID">
              {currentTemplate.templateId}
            </Descriptions.Item>
            <Descriptions.Item label="车次号">
              {currentTemplate.tripNumber}
            </Descriptions.Item>
            <Descriptions.Item label="车辆信息">
              {currentTemplate.vehicleInfo}
            </Descriptions.Item>
            <Descriptions.Item label="总座位数">
              {currentTemplate.totalSeats}
            </Descriptions.Item>
            <Descriptions.Item label="出发站">
              {currentTemplate.departureStationName}
            </Descriptions.Item>
            <Descriptions.Item label="到达站">
              {currentTemplate.arrivalStationName}
            </Descriptions.Item>
            <Descriptions.Item label="出发时间">
              {currentTemplate.departureTime}
            </Descriptions.Item>
            <Descriptions.Item label="到达时间">
              {currentTemplate.arrivalTime}
            </Descriptions.Item>
            <Descriptions.Item label="基础票价">
              ¥{currentTemplate.basePrice}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={currentTemplate.isActive === 1 ? "green" : "red"}>
                {currentTemplate.isActive === 1 ? "启用" : "禁用"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={2}>
              {currentTemplate.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {currentTemplate.updateTime}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TripTemplateManagement;
