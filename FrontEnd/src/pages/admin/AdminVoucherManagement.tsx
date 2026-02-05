import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Copy,
  Edit2,
  Trash2,
  MoreVertical,
  Tag,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatDate } from "../../libs/dateUtils";
import { formatCurrency } from "../../libs/utils";

interface Voucher {
  voucherId: number;
  code: string;
  name: string;
  type: "PUBLIC" | "PERSONAL" | "INSTRUCTOR" | "REFERRAL";
  status: "active" | "inactive" | "expired";
  discountValue: number;
  discountType: "FIXED" | "PERCENTAGE";
  used: number;
  total: number;
  validFrom: string;
  validTo: string;
  instructorName?: string;
}

const AdminVoucherManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Mock data
  const stats = {
    totalVouchers: 156,
    claimed: 89,
    used: 45,
    remaining: 44,
  };

  const vouchers: Voucher[] = [
    {
      voucherId: 1,
      code: "WELCOME2024",
      name: "Welcome Gift",
      type: "PUBLIC",
      status: "active",
      discountValue: 50000,
      discountType: "FIXED",
      used: 124,
      total: 1000,
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
    },
    {
      voucherId: 2,
      code: "BF2024",
      name: "Black Friday Special",
      type: "PERSONAL",
      status: "active",
      discountValue: 30,
      discountType: "PERCENTAGE",
      used: 45,
      total: 500,
      validFrom: "2024-11-24",
      validTo: "2024-11-27",
    },
    {
      voucherId: 3,
      code: "INSTRUCTOR50",
      name: "Instructor Promo",
      type: "INSTRUCTOR",
      status: "active",
      discountValue: 50,
      discountType: "PERCENTAGE",
      used: 23,
      total: 100,
      validFrom: "2024-11-01",
      validTo: "2024-12-31",
      instructorName: "Trần Văn B",
    },
    {
      voucherId: 4,
      code: "REFER100K",
      name: "Referral Bonus",
      type: "REFERRAL",
      status: "active",
      discountValue: 100000,
      discountType: "FIXED",
      used: 67,
      total: 200,
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
    },
    {
      voucherId: 5,
      code: "SUMMER2024",
      name: "Summer Sale",
      type: "PUBLIC",
      status: "expired",
      discountValue: 25,
      discountType: "PERCENTAGE",
      used: 156,
      total: 300,
      validFrom: "2024-06-01",
      validTo: "2024-08-31",
    },
    {
      voucherId: 6,
      code: "NEWUSER",
      name: "First Purchase",
      type: "PERSONAL",
      status: "active",
      discountValue: 75000,
      discountType: "FIXED",
      used: 12,
      total: 50,
      validFrom: "2024-11-01",
      validTo: "2024-12-31",
    },
  ];

  const getTypeBadge = (type: string) => {
    const badges = {
      PUBLIC: "bg-blue-100 text-blue-800",
      PERSONAL: "bg-purple-100 text-purple-800",
      INSTRUCTOR: "bg-green-100 text-green-800",
      REFERRAL: "bg-orange-100 text-orange-800",
    };
    return badges[type as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      expired: "bg-red-100 text-red-800",
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // Add toast notification here
  };

  const usagePercentage = (used: number, total: number) => {
    return (used / total) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Vouchers Management
          </h1>
          <button className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg transition hover:bg-green-700">
            <Plus className="h-5 w-5" />
            Create Voucher
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Types</option>
            <option value="PUBLIC">Public</option>
            <option value="PERSONAL">Personal</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="REFERRAL">Referral</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 transition hover:bg-gray-50">
            <Filter className="h-5 w-5" />
            More Filters
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Tag className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm opacity-90">Total Vouchers</p>
          <p className="text-3xl font-bold">{stats.totalVouchers}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm opacity-90">Claimed</p>
          <p className="text-3xl font-bold">{stats.claimed}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm opacity-90">Used</p>
          <p className="text-3xl font-bold">{stats.used}</p>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <div className="rounded-lg bg-white bg-opacity-20 p-3">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="mb-1 text-sm opacity-90">Remaining</p>
          <p className="text-3xl font-bold">{stats.remaining}</p>
        </div>
      </div>

      {/* Voucher Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vouchers.map((voucher) => {
          const percentage = usagePercentage(voucher.used, voucher.total);
          const isActive = voucher.status === "active";

          return (
            <div
              key={voucher.voucherId}
              className={`overflow-hidden rounded-xl bg-white shadow-sm transition hover:shadow-lg ${
                isActive
                  ? "border-2 border-green-200"
                  : "border border-gray-200"
              }`}
            >
              {/* Card Header */}
              <div
                className={`p-4 ${isActive ? "bg-gradient-to-r from-green-50 to-blue-50" : "bg-gray-50"}`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getTypeBadge(voucher.type)}`}
                      >
                        {voucher.type}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadge(voucher.status)}`}
                      >
                        {voucher.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {voucher.name}
                    </h3>
                  </div>
                  <button className="rounded-lg p-2 transition hover:bg-white">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Voucher Code */}
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <code className="font-mono text-2xl font-bold text-gray-900">
                      {voucher.code}
                    </code>
                    <button
                      onClick={() => copyToClipboard(voucher.code)}
                      className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                      <Copy className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Discount Value */}
                <div className="mb-4">
                  <p className="mb-1 text-sm text-gray-600">Discount Value</p>
                  <p className="text-2xl font-bold text-green-600">
                    {voucher.discountType === "FIXED"
                      ? formatCurrency(voucher.discountValue)
                      : `${voucher.discountValue}%`}
                  </p>
                </div>

                {/* Usage Stats */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className="text-sm font-medium text-gray-900">
                      {voucher.used}/{voucher.total}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage >= 80
                          ? "bg-red-500"
                          : percentage >= 50
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Valid Period */}
                <div className="mb-4">
                  <p className="mb-1 text-xs text-gray-500">Valid Period</p>
                  <p className="text-sm text-gray-700">
                    {formatDate(voucher.validFrom)} -{" "}
                    {formatDate(voucher.validTo)}
                  </p>
                </div>

                {/* Instructor Info */}
                {voucher.instructorName && (
                  <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-200">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created by</p>
                      <p className="text-sm font-medium text-gray-900">
                        {voucher.instructorName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2 border-t border-gray-200 pt-4">
                  <button className="flex-1 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-100">
                    <Edit2 className="mr-1 inline h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100">
                    <Trash2 className="mr-1 inline h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button className="rounded-lg border border-gray-300 bg-white px-6 py-3 transition hover:bg-gray-50">
          Load More Vouchers
        </button>
      </div>
    </div>
  );
};

export default AdminVoucherManagement;
