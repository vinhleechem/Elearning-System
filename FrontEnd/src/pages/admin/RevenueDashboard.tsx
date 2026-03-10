import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Stack,
  TextField,
  Tabs,
  Tab,
  Button,
  ButtonGroup,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
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
import { useToast } from "../../hooks/useToast";
import { revenueService } from "../../service/revenueService";
import type {
  RevenueStats,
  DailyRevenue,
  CategoryRevenue,
  CourseRevenue,
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
  const theme = useTheme();
  const { enqueueSnackbar } = useToast();
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
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Báo Cáo Doanh Thu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Phân tích chi tiết doanh thu và xu hướng kinh doanh
          </Typography>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Card
        sx={{
          mb: 3,
          borderRadius: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          border: "1px solid",
          borderColor: "grey.100",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
          }}
        >
          <Tab label="Tổng Quan" />
          <Tab label="Phân Tích Nâng Cao" />
          <Tab label="Quản Lý Thanh Toán" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      {activeTab === 1 && <AdvancedRevenueAnalytics />}
      {activeTab === 2 && <InstructorPayoutManagement />}
      {activeTab === 0 && (
        <Box>
          {/* Date Range Picker with Quick Filters */}
          <Card
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              border: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <ButtonGroup size="small" variant="outlined">
                <Button
                  onClick={() => setQuickRange(7)}
                  sx={{
                    borderRadius: "8px 0 0 8px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  7 ngày
                </Button>
                <Button
                  onClick={() => setQuickRange(30)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  30 ngày
                </Button>
                <Button
                  onClick={() => setQuickRange(90)}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  90 ngày
                </Button>
                <Button
                  onClick={() => setQuickRange(365)}
                  sx={{
                    borderRadius: "0 8px 8px 0",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  1 năm
                </Button>
              </ButtonGroup>
              <TextField
                label="Từ ngày"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            </Stack>
          </Card>

          {/* KPI Cards */}
          <Grid container spacing={3} mb={4}>
            {[
              {
                label: "Tổng Doanh Thu",
                value: formatCurrency(stats?.totalRevenue || 0),
                subtext: `${stats?.totalOrders || 0} đơn hàng`,
                color: "#2563eb",
                icon: "💰",
              },
              {
                label: "Doanh Thu Tháng Này",
                value: formatCurrency(stats?.monthRevenue || 0),
                subtext: `${stats?.growthRate?.toFixed(1)}% so với tháng trước`,
                color: "#10b981",
                icon: "📈",
                trend: stats?.growthRate || 0,
              },
              {
                label: "Doanh Thu Hôm Nay",
                value: formatCurrency(stats?.todayRevenue || 0),
                subtext: `${stats?.todayOrders || 0} đơn hàng`,
                color: "#f59e0b",
                icon: "📅",
              },
              {
                label: "Giá Trị Đơn Trung Bình",
                value: formatCurrency(stats?.averageOrderValue || 0),
                subtext: "Trung bình mỗi đơn",
                color: "#8b5cf6",
                icon: "💳",
              },
            ].map((stat, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                    border: "1px solid",
                    borderColor: "grey.100",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: alpha(stat.color, 0.1),
                          fontSize: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box flex={1}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={0.5}
                        >
                          {stat.label}
                        </Typography>
                        <Typography variant="h5" fontWeight="700" mb={0.5}>
                          {stat.value}
                        </Typography>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                        >
                          {stat.trend !== undefined && (
                            <>
                              {stat.trend >= 0 ? (
                                <TrendingUpIcon
                                  fontSize="small"
                                  sx={{ color: "success.main" }}
                                />
                              ) : (
                                <TrendingDownIcon
                                  fontSize="small"
                                  sx={{ color: "error.main" }}
                                />
                              )}
                            </>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtext}
                          </Typography>
                        </Stack>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Charts Row 1: Line Chart */}
          <Card
            sx={{
              p: 3,
              mb: 3,
              borderRadius: "20px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              border: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Xu Hướng Doanh Thu
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha(theme.palette.divider, 0.5)}
                />
                <XAxis dataKey="date" style={{ fontSize: "0.875rem" }} />
                <YAxis style={{ fontSize: "0.875rem" }} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: theme.palette.divider,
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  name="Doanh thu"
                  dot={{ fill: theme.palette.primary.main, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Charts Row 2: Pie + Bar */}
          <Grid container spacing={3} mb={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  border: "1px solid",
                  borderColor: "grey.100",
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Doanh Thu Theo Danh Mục
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryRevenue as any}
                      dataKey="revenue"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                      labelLine={true}
                    >
                      {categoryRevenue.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, _name: any, props: any) => [
                        formatCurrency(Number(value) || 0),
                        props.payload?.categoryName,
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: theme.palette.divider,
                      }}
                    />
                    <Legend
                      formatter={(value: any) => (
                        <span style={{ fontSize: "0.8rem" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  border: "1px solid",
                  borderColor: "grey.100",
                  height: "100%",
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={3}>
                  Top 10 Khóa Học Bán Chạy
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCourses} layout="horizontal">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={alpha(theme.palette.divider, 0.5)}
                    />
                    <XAxis type="number" style={{ fontSize: "0.875rem" }} />
                    <YAxis
                      dataKey="courseTitle"
                      type="category"
                      width={150}
                      style={{ fontSize: "0.75rem" }}
                    />
                    <Tooltip
                      formatter={(value: any) =>
                        formatCurrency(Number(value) || 0)
                      }
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid",
                        borderColor: theme.palette.divider,
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={theme.palette.primary.main}
                      name="Doanh thu"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default RevenueDashboard;
