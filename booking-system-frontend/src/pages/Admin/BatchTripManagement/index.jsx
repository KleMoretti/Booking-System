// 管理员 - 批量车次管理页面
import {
  Card,
  Button,
  Upload,
  message,
  Table,
  Space,
  Modal,
  Form,
  DatePicker,
  Select,
  Tag,
  Divider,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  StopOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState, useCallback, useEffect } from "react";
import {
  batchImportTrips,
  batchOfflineTrips,
  batchOnlineTrips,
  downloadTripTemplate,
  getAdminTripList,
} from "../../../api/admin";
import { formatDateTime } from "../../../utils/format";
import { API_CODE, PAGINATION } from "../../../utils/constants";
import PageHeader from "../../../components/PageHeader";
import dayjs from "dayjs";
import "./style.css";

const { RangePicker } = DatePicker;

function BatchTripManagement() {
  const [loading, setLoading] = useState(false);
  const [tripList, setTripList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [addTripModalVisible, setAddTripModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  // 加载车次列表
  const loadTripList = useCallback(
    async (page = 1, pageSize = PAGINATION.DEFAULT_PAGE_SIZE) => {
      setLoading(true);
      try {
        const response = await getAdminTripList({
          page,
          pageSize,
        });

        if (response.code === API_CODE.SUCCESS) {
          const list = response.data.list || [];
          const total = response.data.total || 0;

          // 只在有真实数据时显示
          // setTripList(list.filter((trip) => trip && trip.tripNo));
          setTripList(list);
          setPagination({
            current: page,
            pageSize,
            total: total,
          });
        } else {
          message.error(response.message || "加载车次列表失败");
        }
      } catch (error) {
        console.error("加载车次列表失败：", error);
        message.error("网络错误");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadTripList();
  }, [loadTripList]);

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      const response = await downloadTripTemplate();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "车次导入模板.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("模板下载成功");
    } catch (error) {
      console.error("下载模板失败：", error);
      message.error("下载模板失败");
    }
  };

  // 上传文件配置
  const uploadProps = {
    accept: ".xlsx,.xls,.csv",
    maxCount: 1,
    fileList,
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.type === "text/csv" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");
      if (!isExcel) {
        message.error("只能上传Excel或CSV文件！");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("文件大小不能超过5MB！");
        return false;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  // 批量导入
  const handleBatchImport = async () => {
    if (fileList.length === 0) {
      message.warning("请先选择要上传的文件");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);

    setLoading(true);
    try {
      const response = await batchImportTrips(formData);

      if (response.code === API_CODE.SUCCESS) {
        const {
          successCount = 0,
          failCount = 0,
          errors = [],
        } = response.data || {};

        if (failCount === 0) {
          message.success(`成功导入 ${successCount} 条车次`);
        } else {
          Modal.warning({
            title: "导入完成",
            content: (
              <div>
                <p>成功: {successCount} 条</p>
                <p>失败: {failCount} 条</p>
                {Array.isArray(errors) && errors.length > 0 && (
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

        setUploadModalVisible(false);
        setFileList([]);
        loadTripList();
      } else {
        message.error(response.message || "导入失败");
      }
    } catch (error) {
      console.error("批量导入失败：", error);
      message.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  // 批量下线
  const handleBatchOffline = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要下线的车次");
      return;
    }

    Modal.confirm({
      title: "批量下线车次",
      content: `确定要下线选中的 ${selectedRowKeys.length} 个车次吗？下线后用户将无法订票。`,
      onOk: async () => {
        try {
          const response = await batchOfflineTrips({
            tripIds: selectedRowKeys,
          });

          if (response.code === API_CODE.SUCCESS) {
            message.success("批量下线成功");
            setSelectedRowKeys([]);
            loadTripList();
          } else {
            message.error(response.message || "批量下线失败");
          }
        } catch (error) {
          console.error("批量下线失败：", error);
          message.error("网络错误");
        }
      },
    });
  };

  // 批量上线
  const handleBatchOnline = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("请先选择要上线的车次");
      return;
    }

    Modal.confirm({
      title: "批量上线车次",
      content: `确定要上线选中的 ${selectedRowKeys.length} 个车次吗？`,
      onOk: async () => {
        try {
          const response = await batchOnlineTrips({
            tripIds: selectedRowKeys,
          });

          if (response.code === API_CODE.SUCCESS) {
            message.success("批量上线成功");
            setSelectedRowKeys([]);
            loadTripList();
          } else {
            message.error(response.message || "批量上线失败");
          }
        } catch (error) {
          console.error("批量上线失败：", error);
          message.error("网络错误");
        }
      },
    });
  };

  // 加开车次
  const handleAddTrip = () => {
    setAddTripModalVisible(true);
    form.resetFields();
  };

  const handleAddTripConfirm = async () => {
    try {
      const values = await form.validateFields();
      // 这里只是展示表单，实际导入通过批量导入实现
      message.info("请使用批量导入功能添加车次");
      setAddTripModalVisible(false);
    } catch (error) {
      if (error.errorFields) {
        return;
      }
    }
  };

  const columns = [
    {
      title: "车次号",
      dataIndex: "tripNumber",
      width: "10%",
      render: (text) => text || "-",
    },
    {
      title: "出发站",
      dataIndex: "departureStation",
      width: "12%",
      render: (text) => text || "-",
    },
    {
      title: "到达站",
      dataIndex: "arrivalStation",
      width: "12%",
      render: (text) => text || "-",
    },
    {
      title: "出发时间",
      dataIndex: "departureTime",
      width: "15%",
      render: (_, record) => {
        if (record.date && record.departureTime) {
          return `${record.date} ${record.departureTime}`;
        }
        return record.departureTime || "-";
      },
    },
    {
      title: "到达时间",
      dataIndex: "arrivalTime",
      width: "15%",
      render: (_, record) => {
        // 简单处理，如果需要精确日期需要后端返回arrivalDate或计算
        if (record.date && record.arrivalTime) {
          return `${record.date} ${record.arrivalTime}`;
        }
        return record.arrivalTime || "-";
      },
    },
    {
      title: "票价",
      dataIndex: "price",
      width: "8%",
      align: "right",
      render: (_, record) => {
        const price = record.seats ? record.seats.price : record.price;
        return price != null ? `¥${price}` : "-";
      },
    },
    {
      title: "余票",
      dataIndex: "availableSeats",
      width: "8%",
      align: "center",
      render: (_, record) => {
        const seats = record.seats
          ? record.seats.available
          : record.availableSeats;
        return seats != null ? seats : "-";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: "8%",
      align: "center",
      render: (status) => {
        // 0=计划中，1=进行中，2=已结束
        const statusMap = {
          0: { text: "计划中", color: "blue" },
          1: { text: "进行中", color: "green" },
          2: { text: "已结束", color: "default" },
        };
        const config = statusMap[status];
        if (config) {
          return <Tag color={config.color}>{config.text}</Tag>;
        }
        return <Tag color="default">未知</Tag>;
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      width: "12%",
      render: (time) => (time ? formatDateTime(time) : "-"),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="page-admin-batch-trip-management page-container">
      <PageHeader
        title="批量车次管理"
        description="批量导入、上线/下线、节假日加开车次"
      />

      <Card className="page-card" variant="borderless">
        <div className="action-bar">
          <Space size="middle">
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              批量导入车次
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              下载导入模板
            </Button>
            <Divider type="vertical" />
            <Button icon={<PlusOutlined />} onClick={handleAddTrip}>
              加开车次
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchOnline}
            >
              批量上线
            </Button>
            <Button
              danger
              icon={<StopOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchOffline}
            >
              批量下线
            </Button>
          </Space>
          {selectedRowKeys.length > 0 && (
            <span style={{ marginLeft: 16, color: "#1890ff" }}>
              已选择 {selectedRowKeys.length} 个车次
            </span>
          )}
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={tripList}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) =>
            loadTripList(newPagination.current, newPagination.pageSize)
          }
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 批量导入Modal */}
      <Modal
        title="批量导入车次"
        open={uploadModalVisible}
        onOk={handleBatchImport}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileList([]);
        }}
        width={600}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>操作步骤：</strong>
          </p>
          <ol style={{ paddingLeft: 20 }}>
            <li>下载导入模板</li>
            <li>
              按照模板格式填写车次信息（车次号、出发站、到达站、时间、票价、座位数等）
            </li>
            <li>保存为Excel文件并上传</li>
            <li>系统将自动检查数据格式并导入</li>
          </ol>
        </div>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        <p style={{ marginTop: 8, color: "#999", fontSize: 12 }}>
          支持 .xlsx、.xls、.csv 格式，文件大小不超过5MB
        </p>
      </Modal>

      {/* 加开车次Modal */}
      <Modal
        title="加开车次"
        open={addTripModalVisible}
        onOk={handleAddTripConfirm}
        onCancel={() => setAddTripModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="dateRange"
            label="加开日期范围"
            rules={[{ required: true, message: "请选择日期范围" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="tripTemplate"
            label="参考车次"
            rules={[{ required: true, message: "请选择参考车次" }]}
          >
            <Select
              placeholder="选择一个现有车次作为模板"
              options={tripList.map((trip) => ({
                label: `${trip.tripNumber} (${trip.departureStation} → ${trip.arrivalStation})`,
                value: trip.id,
              }))}
            />
          </Form.Item>
          <p style={{ color: "#999", fontSize: 12 }}>
            提示：选择参考车次后，系统将复制其线路、时间、票价等信息，并在指定日期范围内自动生成车次。
            也可以使用"批量导入车次"功能手动上传Excel文件。
          </p>
        </Form>
      </Modal>
    </div>
  );
}

export default BatchTripManagement;
