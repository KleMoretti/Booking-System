// 管理后台页面
import { useState, useEffect } from "react";
import { Layout, Menu, Card, Row, Col, Statistic, Typography } from "antd";
import {
  DashboardOutlined,
  EnvironmentOutlined,
  CarOutlined,
  DollarOutlined,
  UserOutlined,
  CloudUploadOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import StationManagement from "./StationManagement";
import TripManagement from "./TripManagement";
import PriceManagement from "./PriceManagement";
import UserManagement from "./UserManagement";
import BatchTripManagement from "./BatchTripManagement";
import FinancialReport from "./FinancialReport";
// import TripTemplateManagement from "./TripTemplateManagement";
import { getStatistics } from "../../api/admin";
import "./style.css";

const { Sider, Content } = Layout;
const { Title } = Typography;

function Admin() {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayTickets: 0,
    totalTrips: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStatistics();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("获取统计数据失败", error);
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "数据总览",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "用户管理",
    },
    {
      key: "stations",
      icon: <EnvironmentOutlined />,
      label: "站点管理",
    },
    {
      key: "trips",
      icon: <CarOutlined />,
      label: "车次管理",
    },
    {
      key: "batch-trips",
      icon: <CloudUploadOutlined />,
      label: "批量车次管理",
    },
    // {
    //   key: "trip-templates",
    //   icon: <CloudUploadOutlined />,
    //   label: "车次模板管理",
    // },
    {
      key: "prices",
      icon: <DollarOutlined />,
      label: "票价管理",
    },
    {
      key: "financial",
      icon: <BarChartOutlined />,
      label: "财务报表",
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return (
          <div>
            <div style={{ marginBottom: 24 }}>
              <Title level={3} style={{ margin: 0 }}>
                数据概览
              </Title>
              <div style={{ color: "#666", fontSize: "14px", marginTop: 4 }}>
                系统运营数据统计
              </div>
            </div>

            {/* 核心指标卡片 */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: 8,
                        }}
                      >
                        今日订单
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#09090b",
                          marginBottom: 4,
                        }}
                      >
                        {stats.todayOrders}
                      </div>
                      <div style={{ fontSize: "12px", color: "#16a34a" }}>
                        📈 运营中
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      📋
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: 8,
                        }}
                      >
                        今日售票
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#09090b",
                          marginBottom: 4,
                        }}
                      >
                        {stats.todayTickets}
                      </div>
                      <div style={{ fontSize: "12px", color: "#16a34a" }}>
                        🎫 张车票
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#f0fdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🎫
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: 8,
                        }}
                      >
                        车次总数
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#09090b",
                          marginBottom: 4,
                        }}
                      >
                        {stats.totalTrips}
                      </div>
                      <div style={{ fontSize: "12px", color: "#ea580c" }}>
                        🚄 条线路
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#fff7ed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      🚄
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Card
                  bordered={false}
                  style={{
                    background: "#fff",
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          marginBottom: 8,
                        }}
                      >
                        注册用户
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "600",
                          color: "#09090b",
                          marginBottom: 4,
                        }}
                      >
                        {stats.totalUsers}
                      </div>
                      <div style={{ fontSize: "12px", color: "#7c3aed" }}>
                        👥 位会员
                      </div>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: "#faf5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                      }}
                    >
                      👥
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 快捷操作 */}
            <Card
              title={
                <span style={{ fontSize: "16px", fontWeight: 600 }}>
                  快捷操作
                </span>
              }
              bordered={false}
              style={{
                marginTop: 16,
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={12} sm={8} md={6}>
                  <div
                    onClick={() => setSelectedKey("users")}
                    style={{
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3b82f6";
                      e.currentTarget.style.background = "#eff6ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: 8 }}>👤</div>
                    <div style={{ fontSize: "14px", color: "#374151" }}>
                      用户管理
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <div
                    onClick={() => setSelectedKey("trips")}
                    style={{
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#10b981";
                      e.currentTarget.style.background = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: 8 }}>🚆</div>
                    <div style={{ fontSize: "14px", color: "#374151" }}>
                      车次管理
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <div
                    onClick={() => setSelectedKey("batch-trips")}
                    style={{
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#f59e0b";
                      e.currentTarget.style.background = "#fffbeb";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: 8 }}>📤</div>
                    <div style={{ fontSize: "14px", color: "#374151" }}>
                      批量导入
                    </div>
                  </div>
                </Col>
                <Col xs={12} sm={8} md={6}>
                  <div
                    onClick={() => setSelectedKey("financial")}
                    style={{
                      padding: "16px",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#8b5cf6";
                      e.currentTarget.style.background = "#faf5ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div style={{ fontSize: "24px", marginBottom: 8 }}>📊</div>
                    <div style={{ fontSize: "14px", color: "#374151" }}>
                      财务报表
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "stations":
        return <StationManagement />;
      // case "trip-templates":
      //   return <TripTemplateManagement />;
      case "trips":
        return <TripManagement />;
      case "batch-trips":
        return <BatchTripManagement />;
      case "prices":
        return <PriceManagement />;
      case "financial":
        return <FinancialReport />;
      default:
        return null;
    }
  };

  return (
    <div className="page-admin page-container">
      <Layout style={{ minHeight: "100%", background: "#f0f2f5" }}>
        <Sider
          width={200}
          style={{
            background: "#001529",
            boxShadow: "2px 0 8px rgba(0,21,41,0.08)",
          }}
        >
          <div
            style={{
              padding: "24px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Title
              level={4}
              style={{ margin: 0, color: "#fff", fontSize: "18px" }}
            >
              管理后台
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={({ key }) => setSelectedKey(key)}
            style={{
              borderRight: 0,
              paddingTop: "16px",
              background: "transparent",
            }}
            theme="dark"
          />
        </Sider>
        <Content
          style={{
            padding: "24px",
            minHeight: "calc(100vh - 200px)",
            background: "#f0f2f5",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </div>
  );
}

export default Admin;
