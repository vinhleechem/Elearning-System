import React, { useState } from 'react';
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
    ActivitySquare
} from 'lucide-react';

interface Promotion {
    promotionId: number;
    name: string;
    type: string;
    discount: string;
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'expired';
    ordersCount: number;
    revenueImpact: number;
    priority: number;
}

const AdminPromotionManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'expired'>('active');
    const [searchTerm, setSearchTerm] = useState('');

    const stats = {
        totalPromotions: 24,
        activeNow: 3,
        revenueImpact: 125000000,
        ordersUsed: 1234
    };

    const promotions: Promotion[] = [
        {
            promotionId: 1,
            name: 'Black Friday 2024',
            type: 'SEASONAL',
            discount: '50%',
            startDate: '2024-11-24',
            endDate: '2024-11-27',
            status: 'active',
            ordersCount: 1234,
            revenueImpact: 61700000,
            priority: 10
        },
        {
            promotionId: 2,
            name: 'Flash Sale Morning',
            type: 'FLASH_SALE',
            discount: '30%',
            startDate: '2024-12-01',
            endDate: '2024-12-03',
            status: 'scheduled',
            ordersCount: 0,
            revenueImpact: 0,
            priority: 8
        },
        {
            promotionId: 3,
            name: 'New Year 2025',
            type: 'SPECIAL_EVENT',
            discount: '40%',
            startDate: '2025-01-01',
            endDate: '2025-01-07',
            status: 'scheduled',
            ordersCount: 0,
            revenueImpact: 0,
            priority: 9
        },
        {
            promotionId: 4,
            name: 'React Category Sale',
            type: 'SEASONAL',
            discount: '20%',
            startDate: '2024-11-20',
            endDate: '2024-11-30',
            status: 'active',
            ordersCount: 234,
            revenueImpact: 11700000,
            priority: 5
        },
        {
            promotionId: 5,
            name: 'Cyber Monday',
            type: 'FLASH_SALE',
            discount: '60%',
            startDate: '2024-11-27',
            endDate: '2024-11-28',
            status: 'expired',
            ordersCount: 567,
            revenueImpact: 28350000,
            priority: 10
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(amount);
    };

    const getStatusConfig = (status: string) => {
        const configs = {
            active: {
                bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
                icon: CheckCircle2,
                text: 'Active'
            },
            scheduled: {
                bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
                icon: Clock,
                text: 'Scheduled'
            },
            expired: {
                bg: 'bg-gradient-to-r from-gray-400 to-gray-500',
                icon: XCircle,
                text: 'Expired'
            }
        };
        return configs[status as keyof typeof configs] || configs.active;
    };

    const getTypeConfig = (type: string) => {
        const configs = {
            SEASONAL: {
                color: 'from-blue-500 to-cyan-500',
                icon: Calendar
            },
            FLASH_SALE: {
                color: 'from-red-500 to-pink-500',
                icon: Zap
            },
            SPECIAL_EVENT: {
                color: 'from-purple-500 to-indigo-500',
                icon: Target
            }
        };
        return configs[type as keyof typeof configs] || configs.SEASONAL;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                Promotions Management
                            </h1>
                            <p className="text-gray-600 font-medium">Manage your marketing campaigns and special offers</p>
                        </div>
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative flex items-center gap-3">
                                <Plus className="w-5 h-5" />
                                <span className="font-bold">Create Promotion</span>
                            </div>
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 w-5 h-5 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search promotions by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-lg"
                            />
                        </div>
                        <button className="px-6 py-4 bg-white/80 backdrop-blur-lg border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 p-2 bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg">
                        {['active', 'upcoming', 'expired'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 px-6 py-3 font-bold capitalize rounded-xl transition-all duration-300 ${activeTab === tab
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-white/50'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Statistics Cards - Premium Design */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="group relative bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                        <div className="relative p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-7 h-7" />
                                </div>
                                <ActivitySquare className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1 font-medium">Total Promotions</p>
                            <p className="text-4xl font-black mb-1">{stats.totalPromotions}</p>
                            <p className="text-xs opacity-75">All campaigns</p>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                        <div className="relative p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <CheckCircle2 className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1 font-medium">Active Now</p>
                            <p className="text-4xl font-black mb-1">{stats.activeNow}</p>
                            <p className="text-xs opacity-75">Running campaigns</p>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                        <div className="relative p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                                    <TrendingDown className="w-7 h-7" />
                                </div>
                                <Target className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1 font-medium">Revenue Impact</p>
                            <p className="text-4xl font-black mb-1">{formatCurrency(stats.revenueImpact)}</p>
                            <p className="text-xs opacity-75">Total discounts given</p>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                        <div className="relative p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
                                    <Calendar className="w-7 h-7" />
                                </div>
                                <Zap className="w-5 h-5 opacity-50" />
                            </div>
                            <p className="text-sm opacity-90 mb-1 font-medium">Orders Used</p>
                            <p className="text-4xl font-black mb-1">{stats.ordersUsed.toLocaleString()}</p>
                            <p className="text-xs opacity-75">Successful orders</p>
                        </div>
                    </div>
                </div>

                {/* Table - Premium Design */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                    <th className="px-6 py-5 text-left">
                                        <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-gray-300 focus:ring-4 focus:ring-blue-500/20" />
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Promotion
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Discount
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
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
                                        <tr key={promo.promotionId} className="group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                                            <td className="px-6 py-5">
                                                <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-gray-300" />
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TypeConfig.color} flex items-center justify-center shadow-lg`}>
                                                        <TypeIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {promo.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">ID: #{promo.promotionId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r ${TypeConfig.color} text-white shadow-lg`}>
                                                    <TypeIcon className="w-4 h-4" />
                                                    {promo.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                    {promo.discount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="font-medium">{new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                                                    </div>
                                                    <div className="text-gray-400 text-xs">to {new Date(promo.endDate).toLocaleDateString('vi-VN')}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${StatusConfig.bg} text-white shadow-lg`}>
                                                    <StatusIcon className="w-4 h-4" />
                                                    {StatusConfig.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {promo.ordersCount > 0 ? promo.ordersCount.toLocaleString() : '-'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">orders</span>
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
                                                    <button className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-lg">
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all shadow-sm hover:shadow-lg">
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all shadow-sm hover:shadow-lg">
                                                        <Trash2 className="w-5 h-5" />
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
                    <div className="px-6 py-5 border-t-2 border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                        <p className="text-sm font-medium text-gray-600">
                            Showing <span className="font-bold text-gray-900">1-{promotions.length}</span> of <span className="font-bold">{stats.totalPromotions}</span> promotions
                        </p>
                        <div className="flex gap-2">
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all font-medium text-sm shadow-sm">
                                Previous
                            </button>
                            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all font-bold text-sm">
                                1
                            </button>
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all font-medium text-sm shadow-sm">
                                2
                            </button>
                            <button className="px-5 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all font-medium text-sm shadow-sm">
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
