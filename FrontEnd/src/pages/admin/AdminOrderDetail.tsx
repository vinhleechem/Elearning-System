import React from 'react';
import { useNavigate } from 'react-router-dom';
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
    MapPin,
    Phone,
    BadgeCheck,
    Receipt,
    DollarSign,
    ChevronRight
} from 'lucide-react';

const AdminOrderDetail = () => {
    const navigate = useNavigate();

    const orderData = {
        orderId: 123,
        orderCode: 'ORD-20241124-123',
        status: 'PAID',
        createdAt: '2024-11-24T15:30:00',
        user: {
            userId: 1,
            fullName: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com',
            phone: '+84 912 345 678',
            avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=6366f1&color=fff&size=128'
        },
        subtotal: 1000000,
        totalDiscount: 600000,
        finalAmount: 400000,
        items: [
            {
                orderItemId: 1,
                courseId: 5,
                courseTitle: 'React.js Advanced Course - Complete Guide 2024',
                courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop',
                instructorName: 'Trần Văn B',
                instructorAvatar: 'https://ui-avatars.com/api/?name=Tran+Van+B&background=10B981&color=fff',
                originalPrice: 500000,
                discountPrice: 250000,
                finalPrice: 218750,
                savings: 281250,
                rating: 4.8,
                students: 12500
            },
            {
                orderItemId: 2,
                courseId: 8,
                courseTitle: 'Python Masterclass - From Zero to Hero',
                courseThumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=300&h=200&fit=crop',
                instructorName: 'Lê Thị C',
                instructorAvatar: 'https://ui-avatars.com/api/?name=Le+Thi+C&background=F59E0B&color=fff',
                originalPrice: 500000,
                discountPrice: 250000,
                finalPrice: 181250,
                savings: 318750,
                rating: 4.9,
                students: 8300
            }
        ],
        discountsApplied: [
            {
                type: 'PROMOTION',
                code: null,
                name: 'Black Friday 2024',
                description: '50% off all courses - Biggest sale of the year',
                discountType: 'PERCENTAGE',
                discountValue: 50,
                amount: 500000,
                appliedAt: '2024-11-24T15:30:00',
                startDate: '2024-11-20T00:00:00',
                endDate: '2024-11-30T23:59:59',
                applicableTo: 'ALL_COURSES'
            },
            {
                type: 'VOUCHER',
                code: 'WELCOME2024',
                name: 'Welcome Gift',
                description: 'Special gift for new users - One time use',
                discountType: 'FIXED_AMOUNT',
                discountValue: 100000,
                amount: 100000,
                appliedAt: '2024-11-24T15:30:00',
                startDate: '2024-11-01T00:00:00',
                endDate: '2024-12-31T23:59:59',
                applicableTo: 'ALL_COURSES',
                minOrderValue: 300000,
                usageCount: '1/1'
            }
        ],
        payment: {
            paymentId: 456,
            method: 'VNPAY',
            status: 'SUCCESS',
            amount: 400000,
            paidAt: '2024-11-24T15:31:23',
            transactionId: 'VNP20241124153123'
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const savingsPercent = Math.round((orderData.totalDiscount / orderData.subtotal) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Header - Premium Design */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <div className="p-2 rounded-lg group-hover:bg-slate-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Back</span>
                            </button>
                            <div className="h-8 w-px bg-slate-200"></div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {orderData.orderCode}
                                    </h1>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                        <Check className="w-3.5 h-3.5" />
                                        {orderData.status}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(orderData.createdAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium text-slate-700">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-8 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="col-span-8 space-y-6">
                        {/* Customer Information - Premium Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Customer Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-5">
                                    <div className="relative">
                                        <img
                                            src={orderData.user.avatar}
                                            alt={orderData.user.fullName}
                                            className="w-20 h-20 rounded-2xl ring-4 ring-indigo-100"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                                            <BadgeCheck className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                                            {orderData.user.fullName}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="w-4 h-4 text-indigo-500" />
                                                <span>{orderData.user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="w-4 h-4 text-indigo-500" />
                                                <span>{orderData.user.phone}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                                            <Receipt className="w-3.5 h-3.5" />
                                            Customer ID: #{orderData.user.userId.toString().padStart(6, '0')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items - Premium Design */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Package className="w-5 h-5" />
                                        Order Items
                                    </h2>
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                                        {orderData.items.length} courses
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                {orderData.items.map((item) => (
                                    <div
                                        key={item.orderItemId}
                                        className="group relative bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                                    >
                                        <div className="flex gap-5">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={item.courseThumbnail}
                                                    alt={item.courseTitle}
                                                    className="w-44 h-28 object-cover rounded-xl shadow-md"
                                                />
                                                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-yellow-500 rounded-lg text-white text-xs font-bold shadow-lg">
                                                    <Star className="w-3 h-3 fill-current" />
                                                    {item.rating}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {item.courseTitle}
                                                </h3>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <img
                                                        src={item.instructorAvatar}
                                                        alt={item.instructorName}
                                                        className="w-6 h-6 rounded-full"
                                                    />
                                                    <span className="text-sm font-medium text-slate-600">
                                                        {item.instructorName}
                                                    </span>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-500">
                                                        {item.students.toLocaleString()} students
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                                        <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                                                            <p className="text-xs text-slate-500 mb-0.5">Original</p>
                                                            <p className="text-sm font-bold text-slate-400 line-through">
                                                                {formatCurrency(item.originalPrice)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                                                            <p className="text-xs text-emerald-600 mb-0.5">Final Price</p>
                                                            <p className="text-sm font-bold text-emerald-600">
                                                                {formatCurrency(item.finalPrice)}
                                                            </p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg px-3 py-2">
                                                            <p className="text-xs text-white/90 mb-0.5">You Saved</p>
                                                            <p className="text-sm font-bold text-white">
                                                                {formatCurrency(item.savings)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Discounts & Promotions - ULTRA PREMIUM */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Gift className="w-5 h-5" />
                                        Applied Discounts & Promotions
                                    </h2>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                                        <Sparkles className="w-4 h-4 text-white" />
                                        <span className="text-sm font-semibold text-white">
                                            {orderData.discountsApplied.length} Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-5">
                                {orderData.discountsApplied.map((discount: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`relative overflow-hidden rounded-2xl border-2 ${discount.type === 'PROMOTION'
                                                ? 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-orange-300'
                                                : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-300'
                                            }`}
                                    >
                                        {/* Decorative elements */}
                                        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                                            {discount.type === 'PROMOTION' ? (
                                                <Zap className="w-full h-full text-orange-500" />
                                            ) : (
                                                <Award className="w-full h-full text-purple-500" />
                                            )}
                                        </div>

                                        <div className="relative p-6">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`p-4 rounded-2xl shadow-lg ${discount.type === 'PROMOTION'
                                                                ? 'bg-gradient-to-br from-orange-500 to-red-600'
                                                                : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                            }`}
                                                    >
                                                        {discount.type === 'PROMOTION' ? (
                                                            <Zap className="w-7 h-7 text-white" />
                                                        ) : (
                                                            <Award className="w-7 h-7 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <h3 className="text-xl font-black text-slate-900">
                                                                {discount.name}
                                                            </h3>
                                                            <span
                                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${discount.type === 'PROMOTION'
                                                                        ? 'bg-orange-600 text-white'
                                                                        : 'bg-purple-600 text-white'
                                                                    }`}
                                                            >
                                                                {discount.type}
                                                            </span>
                                                        </div>
                                                        {discount.code && (
                                                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-slate-300 rounded-lg shadow-sm">
                                                                <Tag className="w-4 h-4 text-slate-600" />
                                                                <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                                                                    {discount.code}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                        You Saved
                                                    </p>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <TrendingDown className="w-6 h-6 text-red-600" />
                                                        <span className="text-3xl font-black text-red-600">
                                                            {formatCurrency(discount.amount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-slate-700 mb-5 pl-16 leading-relaxed">
                                                {discount.description}
                                            </p>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-4 gap-3 mb-5">
                                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {discount.discountType === 'PERCENTAGE' ? (
                                                            <Percent className="w-4 h-4 text-blue-600" />
                                                        ) : (
                                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                                        )}
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">
                                                            Discount
                                                        </span>
                                                    </div>
                                                    <p className="text-lg font-bold text-slate-900">
                                                        {discount.discountType === 'PERCENTAGE'
                                                            ? `${discount.discountValue}%`
                                                            : formatCurrency(discount.discountValue)}
                                                    </p>
                                                </div>

                                                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                                        <span className="text-xs font-semibold text-slate-500 uppercase">
                                                            Applies To
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {discount.applicableTo.replace(/_/g, ' ')}
                                                    </p>
                                                </div>

                                                {discount.minOrderValue && (
                                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Info className="w-4 h-4 text-amber-600" />
                                                            <span className="text-xs font-semibold text-slate-500 uppercase">
                                                                Min Order
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-900">
                                                            {formatCurrency(discount.minOrderValue)}
                                                        </p>
                                                    </div>
                                                )}

                                                {discount.usageCount && (
                                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Receipt className="w-4 h-4 text-indigo-600" />
                                                            <span className="text-xs font-semibold text-slate-500 uppercase">
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
                                            <div className="flex items-center justify-between pt-4 border-t-2 border-slate-200">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">Valid Period:</span>
                                                    <span className="font-bold text-slate-900">
                                                        {formatShortDate(discount.startDate)}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
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
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Payment Summary */}
                    <div className="col-span-4">
                        <div className="sticky top-8 space-y-6">
                            {/* Payment Summary Card */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Summary
                                    </h2>
                                </div>

                                <div className="p-6">
                                    {/* Price Breakdown */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-600">Subtotal</span>
                                            <span className="text-lg font-bold text-slate-900">
                                                {formatCurrency(orderData.subtotal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-red-600 flex items-center gap-1.5">
                                                <TrendingDown className="w-4 h-4" />
                                                Total Discounts
                                            </span>
                                            <span className="text-lg font-bold text-red-600">
                                                -{formatCurrency(orderData.totalDiscount)}
                                            </span>
                                        </div>
                                        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-lg font-semibold text-slate-900">Final Amount</span>
                                            <span className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                {formatCurrency(orderData.finalAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Savings Badge */}
                                    <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl p-5 mb-6 shadow-lg">
                                        <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
                                            <Sparkles className="w-full h-full text-white" />
                                        </div>
                                        <div className="relative text-center">
                                            <p className="text-white font-black text-2xl mb-1">
                                                🎉 {formatCurrency(orderData.totalDiscount)}
                                            </p>
                                            <p className="text-white/90 text-sm font-medium">
                                                Total Saved • {savingsPercent}% OFF
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="space-y-3 pt-6 border-t border-slate-200">
                                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Receipt className="w-4 h-4 text-slate-600" />
                                            Payment Details
                                        </h3>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Method</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold">
                                                {orderData.payment.method}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Status</span>
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                                                <Check className="w-3 h-3" />
                                                {orderData.payment.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Transaction</span>
                                            <span className="font-mono text-xs text-slate-900 font-semibold">
                                                {orderData.payment.transactionId}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm text-slate-600">Paid At</span>
                                            <span className="text-xs font-medium text-slate-900">
                                                {formatShortDate(orderData.payment.paidAt)}
                                            </span>
                                        </div>
                                    </div>
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
