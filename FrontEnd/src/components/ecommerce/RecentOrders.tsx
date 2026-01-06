import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { dashboardService } from "../../service/dashboardService";
import type { OrderResponse } from "../../service/orderService";

export default function RecentOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const data = await dashboardService.getRecentOrders(5);
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusBadgeColor = (status: string): "success" | "warning" | "error" | "light" => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "DELIVERED":
        return "success";
      case "PENDING":
      case "PROCESSING":
        return "warning";
      case "CANCELED":
      case "CANCELLED":
      case "FAILED":
        return "error";
      default:
        return "light";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "Delivered";
      case "PENDING":
        return "Pending";
      case "PROCESSING":
        return "Processing";
      case "CANCELED":
      case "CANCELLED":
        return "Canceled";
      case "FAILED":
        return "Failed";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Orders
            </h3>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800">
            <svg
              className="fill-white stroke-current"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filter
          </button>
          <button className="text-theme-sm shadow-theme-xs inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800">
            See all
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-y border-gray-100">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500"
              >
                Products
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500"
              >
                Customer
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500"
              >
                Price
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs py-3 text-start font-medium text-gray-500"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}

          <TableBody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-gray-500"
                >
                  No recent orders
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.orderId} className="">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-theme-sm font-medium text-gray-800">
                          {order.items.length === 1
                            ? order.items[0].courseTitle
                            : `${order.items.length} courses`}
                        </p>
                        <span className="text-theme-xs text-gray-500">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500">
                    {order.userName}
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500">
                    ${order.finalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-theme-sm py-3 text-gray-500">
                    <Badge size="sm" color={getStatusBadgeColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
