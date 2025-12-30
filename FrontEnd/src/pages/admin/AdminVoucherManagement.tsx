import React, { useState } from 'react';
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
    Clock
} from 'lucide-react';

interface Voucher {
    voucherId: number;
    code: string;
    name: string;
    type: 'PUBLIC' | 'PERSONAL' | 'INSTRUCTOR' | 'REFERRAL';
    status: 'active' | 'inactive' | 'expired';
    discountValue: number;
    discountType: 'FIXED' | 'PERCENTAGE';
    used: number;
    total: number;
    validFrom: string;
    validTo: string;
    instructorName?: string;
}

const AdminVoucherManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');

    // Mock data
    const stats = {
        totalVouchers: 156,
        claimed: 89,
        used: 45,
        remaining: 44
    };

    const vouchers: Voucher[] = [
        {
            voucherId: 1,
            code: 'WELCOME2024',
            name: 'Welcome Gift',
            type: 'PUBLIC',
            status: 'active',
            discountValue: 50000,
            discountType: 'FIXED',
            used: 124,
            total: 1000,
            validFrom: '2024-01-01',
            validTo: '2024-12-31'
        },
        {
            voucherId: 2,
            code: 'BF2024',
            name: 'Black Friday Special',
            type: 'PERSONAL',
            status: 'active',
            discountValue: 30,
            discountType: 'PERCENTAGE',
            used: 45,
            total: 500,
            validFrom: '2024-11-24',
            validTo: '2024-11-27'
        },
        {
            voucherId: 3,
            code: 'INSTRUCTOR50',
            name: 'Instructor Promo',
            type: 'INSTRUCTOR',
            status: 'active',
            discountValue: 50,
            discountType: 'PERCENTAGE',
            used: 23,
            total: 100,
            validFrom: '2024-11-01',
            validTo: '2024-12-31',
            instructorName: 'Trần Văn B'
        },
        {
            voucherId: 4,
            code: 'REFER100K',
            name: 'Referral Bonus',
            type: 'REFERRAL',
            status: 'active',
            discountValue: 100000,
            discountType: 'FIXED',
            used: 67,
            total: 200,
            validFrom: '2024-01-01',
            validTo: '2024-12-31'
        },
        {
            voucherId: 5,
            code: 'SUMMER2024',
            name: 'Summer Sale',
            type: 'PUBLIC',
            status: 'expired',
            discountValue: 25,
            discountType: 'PERCENTAGE',
            used: 156,
            total: 300,
            validFrom: '2024-06-01',
            validTo: '2024-08-31'
        },
        {
            voucherId: 6,
            code: 'NEWUSER',
            name: 'First Purchase',
            type: 'PERSONAL',
            status: 'active',
            discountValue: 75000,
            discountType: 'FIXED',
            used: 12,
            total: 50,
            validFrom: '2024-11-01',
            validTo: '2024-12-31'
        }
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact'
        }).format(amount);
    };

    const getTypeBadge = (type: string) => {
        const badges = {
            PUBLIC: 'bg-blue-100 text-blue-800',
            PERSONAL: 'bg-purple-100 text-purple-800',
            INSTRUCTOR: 'bg-green-100 text-green-800',
            REFERRAL: 'bg-orange-100 text-orange-800'
        };
        return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            expired: 'bg-red-100 text-red-800'
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
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Vouchers Management</h1>
                    <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg">
                        <Plus className="w-5 h-5" />
                        Create Voucher
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Types</option>
                        <option value="PUBLIC">Public</option>
                        <option value="PERSONAL">Personal</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="REFERRAL">Referral</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <Filter className="w-5 h-5" />
                        More Filters
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Total Vouchers</p>
                    <p className="text-3xl font-bold">{stats.totalVouchers}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Claimed</p>
                    <p className="text-3xl font-bold">{stats.claimed}</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Used</p>
                    <p className="text-3xl font-bold">{stats.used}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-sm opacity-90 mb-1">Remaining</p>
                    <p className="text-3xl font-bold">{stats.remaining}</p>
                </div>
            </div>

            {/* Voucher Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => {
                    const percentage = usagePercentage(voucher.used, voucher.total);
                    const isActive = voucher.status === 'active';

                    return (
                        <div
                            key={voucher.voucherId}
                            className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden ${isActive ? 'border-2 border-green-200' : 'border border-gray-200'
                                }`}
                        >
                            {/* Card Header */}
                            <div className={`p-4 ${isActive ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gray-50'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(voucher.type)}`}>
                                                {voucher.type}
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(voucher.status)}`}>
                                                {voucher.status}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{voucher.name}</h3>
                                    </div>
                                    <button className="p-2 hover:bg-white rounded-lg transition">
                                        <MoreVertical className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                {/* Voucher Code */}
                                <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-300">
                                    <div className="flex items-center justify-between">
                                        <code className="text-2xl font-bold text-gray-900 font-mono">{voucher.code}</code>
                                        <button
                                            onClick={() => copyToClipboard(voucher.code)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                {/* Discount Value */}
                                <div className="mb-4">
                                    <p className="text-sm text-gray-600 mb-1">Discount Value</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {voucher.discountType === 'FIXED'
                                            ? formatCurrency(voucher.discountValue)
                                            : `${voucher.discountValue}%`
                                        }
                                    </p>
                                </div>

                                {/* Usage Stats */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600">Usage</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {voucher.used}/{voucher.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${percentage >= 80 ? 'bg-red-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Valid Period */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Valid Period</p>
                                    <p className="text-sm text-gray-700">
                                        {new Date(voucher.validFrom).toLocaleDateString('vi-VN')} - {new Date(voucher.validTo).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>

                                {/* Instructor Info */}
                                {voucher.instructorName && (
                                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                                        <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                                            <Users className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Created by</p>
                                            <p className="text-sm font-medium text-gray-900">{voucher.instructorName}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                    <button className="flex-1 py-2 px-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                        <Edit2 className="w-4 h-4 inline mr-1" />
                                        Edit
                                    </button>
                                    <button className="flex-1 py-2 px-4 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                        <Trash2 className="w-4 h-4 inline mr-1" />
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
                <button className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    Load More Vouchers
                </button>
            </div>
        </div>
    );
};

export default AdminVoucherManagement;
