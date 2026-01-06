import { useEffect, useState } from "react";
import { ArrowDownward, ArrowUpward, Group, Inbox } from "@mui/icons-material";
import { dashboardService } from "../../service/dashboardService";
import type { DashboardStats } from "../../service/dashboardService";
import { useAuthStore } from "../../store/authStore";

export default function EcommerceMetrics() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCourses: 0,
    userGrowth: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    courseGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Connect to WebSocket for real-time updates
    // TODO: Re-enable after fixing WebSocket authentication in backend
    // if (user?.userId) {
    //   webSocketService.connect(user.userId.toString(), (notification) => {
    //     // Khi có notification về order mới hoặc user mới, refresh stats
    //     if (
    //       notification.type === "ORDER_CREATED" ||
    //       notification.type === "USER_REGISTERED"
    //     ) {
    //       fetchStats();
    //     }
    //   });
    // }

    // return () => {
    //   webSocketService.disconnect();
    // };
  }, [user]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatGrowth = (growth: number) => {
    return Math.abs(growth).toFixed(2) + "%";
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
          >
            <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
            <div className="mt-5 space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
          <Group className="size-6 text-primary-500" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800">
              {formatNumber(stats.totalUsers)}
            </h4>
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${stats.userGrowth >= 0
                ? "bg-success-50 text-success-500"
                : "bg-error-50 text-error-500"
              }`}
          >
            {stats.userGrowth >= 0 ? (
              <ArrowUpward sx={{ fontSize: 14 }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 14 }} />
            )}
            {formatGrowth(stats.userGrowth)}
          </span>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md md:p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
          <Inbox className="size-6 text-primary-500" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800">
              {formatNumber(stats.totalOrders)}
            </h4>
          </div>

          <span
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${stats.orderGrowth >= 0
                ? "bg-success-50 text-success-500"
                : "bg-error-50 text-error-500"
              }`}
          >
            {stats.orderGrowth >= 0 ? (
              <ArrowUpward sx={{ fontSize: 14 }} />
            ) : (
              <ArrowDownward sx={{ fontSize: 14 }} />
            )}
            {formatGrowth(stats.orderGrowth)}
          </span>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
