import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  TextField,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSnackbar } from "notistack";
import { revenueService } from "../../service/revenueService";
import type {
  RevenueStats,
  DailyRevenue,
  CategoryRevenue,
  CourseRevenue,
  InstructorRevenue,
  PaymentMethodRevenue,
  MonthlyRevenue,
  DiscountImpact,
} from "../../service/revenueService";
import { formatCurrency } from "../../libs/utils";
import { format, subDays } from "date-fns";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { AdvancedRevenueAnalytics } from "../../components/admin/AdvancedRevenueAnalytics";
import { InstructorPayoutManagement } from "../../components/admin/InstructorPayoutManagement";

const COLORS = [
  "#667eea",
  "#f093fb",
  "#43e97b",
  "#fa709a",
  "#4facfe",
  "#feca57",
];

const RevenueDashboard: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [topCourses, setTopCourses] = useState<CourseRevenue[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Quick date range helpers
  const setQuickRange = (days: number) => {
    setEndDate(format(new Date(), "yyyy-MM-dd"));
    setStartDate(format(subDays(new Date(), days), "yyyy-MM-dd"));
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, dailyData, categoryData, coursesData] =
        await Promise.all([
          revenueService.getStats(),
          revenueService.getDailyRevenue(startDate, endDate),
          revenueService.getRevenueByCategory(startDate, endDate),
          revenueService.getTopCourses(10, startDate, endDate),
        ]);

      setStats(statsData);
      setDailyRevenue(dailyData);
      setCategoryRevenue(categoryData);
      setTopCourses(coursesData);
    } catch (error: any) {
      enqueueSnackbar(error.message || "Lỗi khi tải dữ liệu", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Báo Cáo Doanh Thu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Phân tích chi tiết doanh thu và xu hướng kinh doanh
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Tổng Quan" />
          <Tab label="Phân Tích Nâng Cao" />
          <Tab label="Quản Lý Thanh Toán" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 1 && <AdvancedRevenueAnalytics />}
      {activeTab === 2 && <InstructorPayoutManagement />}
      {activeTab === 0 && (
        <Box>
          {/* Date Range Picker with Quick Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <ButtonGroup size="small" variant="outlined">
                <Button onClick={() => setQuickRange(7)}>7 ngày</Button>
                <Button onClick={() => setQuickRange(30)}>30 ngày</Button>
                <Button onClick={() => setQuickRange(90)}>90 ngày</Button>
                <Button onClick={() => setQuickRange(365)}>1 năm</Button>
              </ButtonGroup>
              <TextField
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Stack>
          </Paper>

          {/* KPI Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 3,
              mb: 3,
            }}
          >
            <Paper
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {formatCurrency(stats?.totalRevenue || 0)}
              </Typography>
              <Typography variant="caption">
                {stats?.totalOrders || 0} đơn hàng
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Doanh Thu Tháng Này
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {formatCurrency(stats?.monthRevenue || 0)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {(stats?.growthRate || 0) >= 0 ? (
                  <TrendingUpIcon fontSize="small" />
                ) : (
                  <TrendingDownIcon fontSize="small" />
                )}
                <Typography variant="caption">
                  {stats?.growthRate?.toFixed(1)}% so với tháng trước
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Doanh Thu Hôm Nay
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
                {formatCurrency(stats?.todayRevenue || 0)}
              </Typography>
              <Typography variant="caption">
                {stats?.todayOrders || 0} đơn hàng
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "white",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Giá Trị Đơn Trung Bình
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {formatCurrency(stats?.averageOrderValue || 0)}
              </Typography>
            </Paper>
          </Box>

          {/* Charts Row 1: Line Chart */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Xu Hướng Doanh Thu
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#667eea"
                  strokeWidth={3}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Charts Row 2: Pie + Bar */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
              mb: 3,
            }}
          >
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Doanh Thu Theo Danh Mục
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryRevenue}
                    dataKey="revenue"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) =>
                      `${entry.categoryName}: ${entry.percentage.toFixed(1)}%`
                    }
                  >
                    {categoryRevenue.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Top 10 Khóa Học Bán Chạy
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCourses} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="courseTitle" type="category" width={150} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="#667eea" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RevenueDashboard;
