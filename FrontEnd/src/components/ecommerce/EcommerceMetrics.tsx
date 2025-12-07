import { Badge } from "@mui/material";
import { ArrowDownward, ArrowUpward, Group, Inbox } from "@mui/icons-material";

export default function EcommerceMetrics() {
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
              3,782
            </h4>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-success-50 px-2 py-1 text-xs font-medium text-success-500">
            <ArrowUpward sx={{ fontSize: 14 }} />
            11.01%
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
              5,359
            </h4>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-error-50 px-2 py-1 text-xs font-medium text-error-500">
            <ArrowDownward sx={{ fontSize: 14 }} />
            9.05%
          </span>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
}
