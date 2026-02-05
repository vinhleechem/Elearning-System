import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatCurrency } from "../../libs/utils";
import {
  ArrowLeft,
  Download,
  Calendar,
  CreditCard,
  Check,
  Tag,
  Gift,
  User,
  Mail,
  Package,
  Percent,
  Clock,
  Info,
  Sparkles,
  TrendingDown,
  Star,
  Zap,
  Award,
  Phone,
  BadgeCheck,
  Receipt,
  DollarSign,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  adminOrderService,
  type OrderDetailResponse,
} from "../../service/adminOrderService";

const AdminOrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [orderData, setOrderData] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await adminOrderService.getOrderById(Number(orderId));
        setOrderData(data);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const formatDateLocal = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return formatDateLocal(dateString);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-lg font-medium text-slate-600">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            {error || "Order not found"}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const savingsPercent =
    orderData.totalDiscount && orderData.subtotal
      ? Math.round((orderData.totalDiscount / orderData.subtotal) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Header - Premium Design */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-[1400px] px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
              >
                <div className="rounded-lg p-2 transition-colors group-hover:bg-slate-100">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {orderData.orderCode || `Order #${orderData.orderId}`}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <Check className="h-3.5 w-3.5" />
                    {orderData.status}
                  </span>
                </div>
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  {formatDateLocal(orderData.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Customer Information - Premium Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <User className="h-5 w-5" />
                  Customer Information
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-5">
                  <div className="relative">
                    <img
                      src={
                        orderData.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(orderData.user?.fullName || orderData.userName || "User")}&background=6366f1&color=fff&size=128`
                      }
                      alt={orderData.user?.fullName || orderData.userName}
                      className="h-20 w-20 rounded-2xl ring-4 ring-indigo-100"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-4 border-white bg-emerald-500">
                      <BadgeCheck className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                      {orderData.user?.fullName || orderData.userName || "N/A"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        <span>{orderData.user?.email || "N/A"}</span>
                      </div>
                      {orderData.user?.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-indigo-500" />
                          <span>{orderData.user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                      <Receipt className="h-3.5 w-3.5" />
                      Customer ID: #
                      {(orderData.user?.userId || orderData.userId)
                        .toString()
                        .padStart(6, "0")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items - Premium Design */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Package className="h-5 w-5" />
                    Order Items
                  </h2>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                    {orderData.items?.length || 0} courses
                  </span>
                </div>
              </div>
              <div className="space-y-5 p-6">
                {orderData.items?.map((item, index) => (
                  <div
                    key={item.orderItemId || item.courseId || index}
                    className="group relative rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/50 p-5 transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex gap-5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            item.courseThumbnail ||
                            "https://via.placeholder.com/300x200?text=Course"
                          }
                          alt={item.courseTitle}
                          className="h-28 w-44 rounded-xl object-cover shadow-md"
                        />
                        {item.rating && (
                          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-yellow-500 px-2 py-1 text-xs font-bold text-white shadow-lg">
                            <Star className="h-3 w-3 fill-current" />
                            {item.rating}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {item.courseTitle}
                        </h3>
                        {(item.instructorName || item.students) && (
                          <div className="mb-3 flex items-center gap-3">
                            {item.instructorAvatar && (
                              <img
                                src={item.instructorAvatar}
                                alt={item.instructorName}
                                className="h-6 w-6 rounded-full"
                              />
                            )}
                            {item.instructorName && (
                              <span className="text-sm font-medium text-slate-600">
                                {item.instructorName}
                              </span>
                            )}
                            {item.students && (
                              <>
                                <span className="text-xs text-slate-400">
                                  •
                                </span>
                                <span className="text-xs text-slate-500">
                                  {item.students.toLocaleString()} students
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="grid flex-1 grid-cols-3 gap-3">
                            {item.originalPrice && (
                              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                                <p className="mb-0.5 text-xs text-slate-500">
                                  Original
                                </p>
                                <p className="text-sm font-bold text-slate-400 line-through">
                                  {formatCurrency(item.originalPrice)}
                                </p>
                              </div>
                            )}
                            <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
                              <p className="mb-0.5 text-xs text-emerald-600">
                                Final Price
                              </p>
                              <p className="text-sm font-bold text-emerald-600">
                                {formatCurrency(item.finalPrice || item.price)}
                              </p>
                            </div>
                            {item.savings && (
                              <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-500 px-3 py-2">
                                <p className="mb-0.5 text-xs text-white/90">
                                  You Saved
                                </p>
                                <p className="text-sm font-bold text-white">
                                  {formatCurrency(item.savings)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts & Promotions - ULTRA PREMIUM */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Gift className="h-5 w-5" />
                    Applied Discounts & Promotions
                  </h2>
                  <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {orderData.discountsApplied?.length || 0} Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-6">
                {orderData.discountsApplied &&
                orderData.discountsApplied.length > 0 ? (
                  orderData.discountsApplied.map(
                    (discount: any, index: number) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-2xl border-2 ${
                          discount.type === "PROMOTION"
                            ? "border-orange-300 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
                            : "border-purple-300 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50"
                        }`}
                      >
                        {/* Decorative elements */}
                        <div className="absolute right-0 top-0 h-40 w-40 opacity-10">
                          {discount.type === "PROMOTION" ? (
                            <Zap className="h-full w-full text-orange-500" />
                          ) : (
                            <Award className="h-full w-full text-purple-500" />
                          )}
                        </div>

                        <div className="relative p-6">
                          {/* Header */}
                          <div className="mb-5 flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div
                                className={`rounded-2xl p-4 shadow-lg ${
                                  discount.type === "PROMOTION"
                                    ? "bg-gradient-to-br from-orange-500 to-red-600"
                                    : "bg-gradient-to-br from-purple-500 to-indigo-600"
                                }`}
                              >
                                {discount.type === "PROMOTION" ? (
                                  <Zap className="h-7 w-7 text-white" />
                                ) : (
                                  <Award className="h-7 w-7 text-white" />
                                )}
                              </div>
                              <div>
                                <div className="mb-2 flex items-center gap-2.5">
                                  <h3 className="text-xl font-black text-slate-900">
                                    {discount.name}
                                  </h3>
                                  <span
                                    className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${
                                      discount.type === "PROMOTION"
                                        ? "bg-orange-600 text-white"
                                        : "bg-purple-600 text-white"
                                    }`}
                                  >
                                    {discount.type}
                                  </span>
                                </div>
                                {discount.code && (
                                  <div className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-white px-3 py-2 shadow-sm">
                                    <Tag className="h-4 w-4 text-slate-600" />
                                    <span className="font-mono text-sm font-bold tracking-wider text-slate-900">
                                      {discount.code}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                You Saved
                              </p>
                              <div className="flex items-center justify-end gap-2">
                                <TrendingDown className="h-6 w-6 text-red-600" />
                                <span className="text-3xl font-black text-red-600">
                                  {formatCurrency(discount.amount)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="mb-5 pl-16 leading-relaxed text-slate-700">
                            {discount.description}
                          </p>

                          {/* Details Grid */}
                          <div className="mb-5 grid grid-cols-4 gap-3">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="mb-2 flex items-center gap-2">
                                {discount.discountType === "PERCENTAGE" ? (
                                  <Percent className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <DollarSign className="h-4 w-4 text-emerald-600" />
                                )}
                                <span className="text-xs font-semibold uppercase text-slate-500">
                                  Discount
                                </span>
                              </div>
                              <p className="text-lg font-bold text-slate-900">
                                {discount.discountType === "PERCENTAGE"
                                  ? `${discount.discountValue}%`
                                  : formatCurrency(discount.discountValue)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <div className="mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                <span className="text-xs font-semibold uppercase text-slate-500">
                                  Applies To
                                </span>
                              </div>
                              <p className="text-sm font-bold text-slate-900">
                                {discount.applicableTo.replace(/_/g, " ")}
                              </p>
                            </div>

                            {discount.minOrderValue && (
                              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2">
                                  <Info className="h-4 w-4 text-amber-600" />
                                  <span className="text-xs font-semibold uppercase text-slate-500">
                                    Min Order
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-slate-900">
                                  {formatCurrency(discount.minOrderValue)}
                                </p>
                              </div>
                            )}

                            {discount.usageCount && (
                              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-2 flex items-center gap-2">
                                  <Receipt className="h-4 w-4 text-indigo-600" />
                                  <span className="text-xs font-semibold uppercase text-slate-500">
                                    Usage
                                  </span>
                                </div>
                                <p className="text-lg font-bold text-slate-900">
                                  {discount.usageCount}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Validity Period */}
                          <div className="flex items-center justify-between border-t-2 border-slate-200 pt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">Valid Period:</span>
                              <span className="font-bold text-slate-900">
                                {formatShortDate(discount.startDate)}
                              </span>
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                              <span className="font-bold text-slate-900">
                                {formatShortDate(discount.endDate)}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Applied: {formatShortDate(discount.appliedAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-center text-slate-500">
                    No discounts applied
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="col-span-4">
            <div className="sticky top-8 space-y-6">
              {/* Payment Summary Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </h2>
                </div>

                <div className="p-6">
                  {/* Price Breakdown */}
                  <div className="mb-6 space-y-4">
                    {orderData.subtotal && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatCurrency(orderData.subtotal)}
                        </span>
                      </div>
                    )}
                    {orderData.totalDiscount && orderData.totalDiscount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          Total Discounts
                        </span>
                        <span className="text-lg font-bold text-red-600">
                          -{formatCurrency(orderData.totalDiscount)}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-slate-900">
                        Final Amount
                      </span>
                      <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-3xl font-black text-transparent">
                        {formatCurrency(orderData.finalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Savings Badge */}
                  {orderData.totalDiscount && orderData.totalDiscount > 0 && (
                    <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-5 shadow-lg">
                      <div className="absolute right-0 top-0 h-32 w-32 opacity-20">
                        <Sparkles className="h-full w-full text-white" />
                      </div>
                      <div className="relative text-center">
                        <p className="mb-1 text-2xl font-black text-white">
                          🎉 {formatCurrency(orderData.totalDiscount)}
                        </p>
                        <p className="text-sm font-medium text-white/90">
                          Total Saved • {savingsPercent}% OFF
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="space-y-3 border-t border-slate-200 pt-6">
                  <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
                    <Receipt className="h-4 w-4 text-slate-600" />
                    Payment Details
                  </h3>

                  {orderData.payment ? (
                    <>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-600">Method</span>
                        <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                          {orderData.payment.method}
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-600">Status</span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <Check className="h-3 w-3" />
                          {orderData.payment.status}
                        </span>
                      </div>

                      {orderData.payment.transactionId && (
                        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                          <span className="text-sm text-slate-600">
                            Transaction
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {orderData.payment.transactionId}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                        <span className="text-sm text-slate-600">Paid At</span>
                        <span className="text-xs font-medium text-slate-900">
                          {formatShortDate(orderData.payment.paidAt)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      Payment information not available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
