import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Target,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ActivitySquare,
} from "lucide-react";
import { formatDate } from "../../libs/dateUtils";
import { formatCurrency } from "../../libs/utils";

interface Promotion {
  promotionId: number;
  name: string;
  type: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
  ordersCount: number;
  revenueImpact: number;
  priority: number;
}

const AdminPromotionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "expired">(
    "active",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const stats = {
    totalPromotions: 24,
    activeNow: 3,
    revenueImpact: 125000000,
    ordersUsed: 1234,
  };

  const promotions: Promotion[] = [
    {
      promotionId: 1,
      name: "Black Friday 2024",
      type: "SEASONAL",
      discount: "50%",
      startDate: "2024-11-24",
      endDate: "2024-11-27",
      status: "active",
      ordersCount: 1234,
      revenueImpact: 61700000,
      priority: 10,
    },
    {
      promotionId: 2,
      name: "Flash Sale Morning",
      type: "FLASH_SALE",
      discount: "30%",
      startDate: "2024-12-01",
      endDate: "2024-12-03",
      status: "scheduled",
      ordersCount: 0,
      revenueImpact: 0,
      priority: 8,
    },
    {
      promotionId: 3,
      name: "New Year 2025",
      type: "SPECIAL_EVENT",
      discount: "40%",
      startDate: "2025-01-01",
      endDate: "2025-01-07",
      status: "scheduled",
      ordersCount: 0,
      revenueImpact: 0,
      priority: 9,
    },
    {
      promotionId: 4,
      name: "React Category Sale",
      type: "SEASONAL",
      discount: "20%",
      startDate: "2024-11-20",
      endDate: "2024-11-30",
      status: "active",
      ordersCount: 234,
      revenueImpact: 11700000,
      priority: 5,
    },
    {
      promotionId: 5,
      name: "Cyber Monday",
      type: "FLASH_SALE",
      discount: "60%",
      startDate: "2024-11-27",
      endDate: "2024-11-28",
      status: "expired",
      ordersCount: 567,
      revenueImpact: 28350000,
      priority: 10,
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs = {
      active: {
        bg: "bg-gradient-to-r from-green-500 to-emerald-500",
        icon: CheckCircle2,
        text: "Active",
      },
      scheduled: {
        bg: "bg-gradient-to-r from-yellow-500 to-orange-500",
        icon: Clock,
        text: "Scheduled",
      },
      expired: {
        bg: "bg-gradient-to-r from-gray-400 to-gray-500",
        icon: XCircle,
        text: "Expired",
      },
    };
    return configs[status as keyof typeof configs] || configs.active;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      SEASONAL: {
        color: "from-blue-500 to-cyan-500",
        icon: Calendar,
      },
      FLASH_SALE: {
        color: "from-red-500 to-pink-500",
        icon: Zap,
      },
      SPECIAL_EVENT: {
        color: "from-purple-500 to-indigo-500",
        icon: Target,
      },
    };
    return configs[type as keyof typeof configs] || configs.SEASONAL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-black text-transparent">
                Promotions Management
              </h1>
              <p className="font-medium text-gray-600">
                Manage your marketing campaigns and special offers
              </p>
            </div>
            <button className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <span className="font-bold">Create Promotion</span>
              </div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="group relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors group-focus-within:text-blue-500" />
              <input
                type="text"
                placeholder="Search promotions by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white/80 py-4 pl-12 pr-4 shadow-lg backdrop-blur-lg transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
              />
            </div>
            <button className="rounded-2xl border-2 border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-lg transition-all duration-300 hover:border-blue-500 hover:shadow-xl">
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 rounded-2xl bg-white/60 p-2 shadow-lg backdrop-blur-lg">
            {["active", "upcoming", "expired"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 rounded-xl px-6 py-3 font-bold capitalize transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Cards - Premium Design */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/10"></div>
            <div className="relative p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <ActivitySquare className="h-5 w-5 opacity-50" />
              </div>
              <p className="mb-1 text-sm font-medium opacity-90">
                Total Promotions
              </p>
              <p className="mb-1 text-4xl font-black">
                {stats.totalPromotions}
              </p>
              <p className="text-xs opacity-75">All campaigns</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/10"></div>
            <div className="relative p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <TrendingUp className="h-7 w-7" />
                </div>
                <CheckCircle2 className="h-5 w-5 opacity-50" />
              </div>
              <p className="mb-1 text-sm font-medium opacity-90">Active Now</p>
              <p className="mb-1 text-4xl font-black">{stats.activeNow}</p>
              <p className="text-xs opacity-75">Running campaigns</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/10"></div>
            <div className="relative p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <TrendingDown className="h-7 w-7" />
                </div>
                <Target className="h-5 w-5 opacity-50" />
              </div>
              <p className="mb-1 text-sm font-medium opacity-90">
                Revenue Impact
              </p>
              <p className="mb-1 text-4xl font-black">
                {formatCurrency(stats.revenueImpact)}
              </p>
              <p className="text-xs opacity-75">Total discounts given</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-white/10"></div>
            <div className="relative p-6 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Calendar className="h-7 w-7" />
                </div>
                <Zap className="h-5 w-5 opacity-50" />
              </div>
              <p className="mb-1 text-sm font-medium opacity-90">Orders Used</p>
              <p className="mb-1 text-4xl font-black">
                {stats.ordersUsed.toLocaleString()}
              </p>
              <p className="text-xs opacity-75">Successful orders</p>
            </div>
          </div>
        </div>

        {/* Table - Premium Design */}
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded-lg border-2 border-gray-300 focus:ring-4 focus:ring-blue-500/20"
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    ID
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Promotion
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Type
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Discount
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Period
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Performance
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-black uppercase tracking-wider text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promotions.map((promo) => {
                  const StatusConfig = getStatusConfig(promo.status);
                  const TypeConfig = getTypeConfig(promo.type);
                  const StatusIcon = StatusConfig.icon;
                  const TypeIcon = TypeConfig.icon;

                  return (
                    <tr
                      key={promo.promotionId}
                      className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
                    >
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded-lg border-2 border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-gray-500">
                          #{promo.promotionId}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-12 w-12 rounded-xl bg-gradient-to-br ${TypeConfig.color} flex items-center justify-center shadow-lg`}
                          >
                            <TypeIcon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                              {promo.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-bold ${TypeConfig.color} text-white shadow-lg`}
                        >
                          <TypeIcon className="h-4 w-4" />
                          {promo.type}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-black text-transparent">
                          {promo.discount}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="font-medium">
                              {formatDate(promo.startDate)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            to {formatDate(promo.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${StatusConfig.bg} text-white shadow-lg`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {StatusConfig.text}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-bold text-gray-900">
                              {promo.ordersCount > 0
                                ? promo.ordersCount.toLocaleString()
                                : "-"}
                            </span>
                            <span className="text-xs text-gray-500">
                              orders
                            </span>
                          </div>
                          {promo.revenueImpact > 0 && (
                            <div className="text-xs font-medium text-red-600">
                              -{formatCurrency(promo.revenueImpact)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button className="rounded-xl bg-blue-50 p-2.5 text-blue-600 shadow-sm transition-all hover:bg-blue-100 hover:shadow-lg">
                            <Eye className="h-5 w-5" />
                          </button>
                          <button className="rounded-xl bg-gray-100 p-2.5 text-gray-600 shadow-sm transition-all hover:bg-gray-200 hover:shadow-lg">
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button className="rounded-xl bg-red-50 p-2.5 text-red-600 shadow-sm transition-all hover:bg-red-100 hover:shadow-lg">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
            <p className="text-sm font-medium text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                1-{promotions.length}
              </span>{" "}
              of <span className="font-bold">{stats.totalPromotions}</span>{" "}
              promotions
            </p>
            <div className="flex gap-2">
              <button className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-blue-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:shadow-xl">
                1
              </button>
              <button className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-blue-500 hover:bg-gray-50">
                2
              </button>
              <button className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-blue-500 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPromotionManagement;
