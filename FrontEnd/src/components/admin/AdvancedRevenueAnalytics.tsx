import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { revenueService } from "../../service/revenueService";
import type {
  InstructorRevenue,
  PaymentMethodRevenue,
  MonthlyRevenue,
  DiscountImpact,
} from "../../service/revenueService";
import {
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export const AdvancedRevenueAnalytics = () => {
  const [instructorRevenue, setInstructorRevenue] = useState<
    InstructorRevenue[]
  >([]);
  const [paymentMethodRevenue, setPaymentMethodRevenue] = useState<
    PaymentMethodRevenue[]
  >([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [discountImpact, setDiscountImpact] = useState<DiscountImpact | null>(
    null,
  );
  const [timeRange, setTimeRange] = useState<string>("30");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange(parseInt(timeRange));

      const [instructorData, paymentData, monthlyData, discountData] =
        await Promise.all([
          revenueService.getRevenueByInstructor(startDate, endDate),
          revenueService.getRevenueByPaymentMethod(startDate, endDate),
          revenueService.getMonthlyRevenue(startDate, endDate),
          revenueService.getDiscountImpact(startDate, endDate),
        ]);

      setInstructorRevenue(instructorData);
      setPaymentMethodRevenue(paymentData);
      setMonthlyRevenue(monthlyData);
      setDiscountImpact(discountData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Không thể tải dữ liệu phân tích");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Phân Tích Nâng Cao
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chi tiết doanh thu theo giảng viên, phương thức thanh toán và giảm
            giá
          </Typography>
        </Box>
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel>Khoảng thời gian</InputLabel>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            label="Khoảng thời gian"
          >
            <MenuItem value="7">7 ngày gần đây</MenuItem>
            <MenuItem value="30">30 ngày gần đây</MenuItem>
            <MenuItem value="90">90 ngày gần đây</MenuItem>
            <MenuItem value="365">1 năm</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Revenue by Instructor */}
            <Box sx={{ flex: "1 1 48%", minWidth: 300 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Doanh Thu Theo Giảng Viên
                  </Typography>
                  {instructorRevenue.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu doanh thu từ giảng viên
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={instructorRevenue.slice(0, 10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="instructorName"
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          fontSize={12}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip
                          formatter={(value?: number) =>
                            value ? `$${value.toFixed(2)}` : "$0"
                          }
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ paddingTop: 20 }} />
                        <Bar
                          dataKey="revenue"
                          fill="#667eea"
                          name="Tổng Doanh Thu"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="instructorEarnings"
                          fill="#43e97b"
                          name="Thu Nhập GV"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="commissionAmount"
                          fill="#fa709a"
                          name="Hoa Hồng Nền Tảng"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Revenue by Payment Method */}
            <Box sx={{ flex: "1 1 48%", minWidth: 300 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Doanh Thu Theo Phương Thức Thanh Toán
                  </Typography>
                  {paymentMethodRevenue.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu thanh toán
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={
                            paymentMethodRevenue as unknown as Record<
                              string,
                              unknown
                            >[]
                          }
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: { payload?: PaymentMethodRevenue }) =>
                            props.payload
                              ? `${props.payload.paymentMethod}: ${props.payload.percentage.toFixed(1)}%`
                              : ""
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {paymentMethodRevenue.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value?: number) =>
                            value ? `$${value.toFixed(2)}` : "$0"
                          }
                          contentStyle={{ borderRadius: 8 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Monthly Revenue Trend */}
            <Box sx={{ flex: "1 1 100%" }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Xu Hướng Doanh Thu Theo Tháng
                  </Typography>
                  {monthlyRevenue.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu doanh thu theo tháng
                      </Typography>
                    </Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="period" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip
                          formatter={(value?: number) =>
                            value ? value.toFixed(0) : "0"
                          }
                          contentStyle={{ borderRadius: 8 }}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          fill="#667eea"
                          name="Doanh Thu"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="orderCount"
                          fill="#43e97b"
                          name="Số Đơn"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Discount Impact */}
            <Box sx={{ flex: "1 1 100%" }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Phân Tích Ảnh Hưởng Giảm Giá
                  </Typography>
                  {!discountImpact ? (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        Chưa có dữ liệu về giảm giá
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                    >
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 1 }}
                          >
                            Tổng Trước Giảm
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            ${discountImpact.totalBeforeDiscount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                            color: "white",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 1 }}
                          >
                            Tổng Giảm Giá
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            ${discountImpact.totalDiscount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            color: "white",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 1 }}
                          >
                            Tổng Sau Giảm
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            ${discountImpact.totalAfterDiscount.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                            color: "white",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ opacity: 0.9, mb: 1 }}
                          >
                            Tỷ Lệ Giảm
                          </Typography>
                          <Typography variant="h5" fontWeight={700}>
                            {discountImpact.discountPercentage.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: "1 1 100%" }}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "background.default",
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            gutterBottom
                          >
                            Đơn Hàng Có Giảm Giá
                          </Typography>
                          <Typography variant="h6" fontWeight={600}>
                            {discountImpact.ordersWithDiscount} /{" "}
                            {discountImpact.orderCount} (
                            {discountImpact.orderDiscountRate.toFixed(1)}%)
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
