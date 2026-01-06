import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Chip,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    ShoppingCart as ShoppingCartIcon,
    LocalOffer as LocalOfferIcon,
    Payment as PaymentIcon,
    TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../libs/utils';
import type { OrderResponse } from '../../service/orderService';

interface OrderDetailModalProps {
    open: boolean;
    onClose: () => void;
    order: OrderResponse | null;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ open, onClose, order }) => {
    if (!order) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'PAID':
                return 'success';
            case 'PENDING':
                return 'warning';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            {/* Header */}
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', pr: 6 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight="bold">
                        Order Details #{order.orderId}
                    </Typography>
                    <IconButton
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <PersonIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Customer Information
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Typography variant="body1" fontWeight="bold" mb={0.5}>
                            {order.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            User ID: #{order.userId}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Order Items */}
                <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <ShoppingCartIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Order Items ({order.items.length})
                        </Typography>
                    </Box>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.100' }}>
                                <TableCell><strong>Course</strong></TableCell>
                                <TableCell align="right"><strong>Price</strong></TableCell>
                                <TableCell align="right"><strong>Discount</strong></TableCell>
                                <TableCell align="right"><strong>Final</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>Course #{item.courseId}</TableCell>
                                    <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                    <TableCell align="right" sx={{ color: 'error.main' }}>
                                        -{formatCurrency(item.discountPrice || 0)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                        {formatCurrency(item.finalPrice || item.price)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Discounts Applied */}
                {order.discountsApplied && order.discountsApplied.length > 0 && (
                    <>
                        <Box mb={3}>
                            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                <LocalOfferIcon color="error" fontSize="small" />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Discounts Applied ({order.discountsApplied?.length})
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {order.discountsApplied?.map((discount, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            border: '2px solid',
                                            borderColor: discount.type === 'PROMOTION' ? 'warning.main' : 'secondary.main',
                                            bgcolor: discount.type === 'PROMOTION' ? 'warning.light' : 'secondary.light',
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                                            <Box>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {discount.name}
                                                    </Typography>
                                                    <Chip
                                                        label={discount.type}
                                                        size="small"
                                                        color={discount.type === 'PROMOTION' ? 'warning' : 'secondary'}
                                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                                    />
                                                </Box>
                                                {discount.code && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontFamily: 'monospace',
                                                            bgcolor: 'white',
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 0.5,
                                                            display: 'inline-block',
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        {discount.code}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box textAlign="right">
                                                <Typography variant="h6" color="error.main" fontWeight="bold">
                                                    -{formatCurrency(discount.amount)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {discount.description}
                                        </Typography>

                                        {/* Discount Details */}
                                        <Box display="flex" gap={1} mt={1.5} flexWrap="wrap">
                                            {discount.discountType && (
                                                <Chip
                                                    label={
                                                        discount.discountType === 'PERCENTAGE'
                                                            ? `${discount.discountValue ?? 0}% OFF`
                                                            : formatCurrency(discount.discountValue ?? 0)
                                                    }
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            )}
                                            {discount.applicableTo && (
                                                <Chip
                                                    label={discount.applicableTo.replace(/_/g, ' ')}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            )}
                                            {discount.minOrderValue && (
                                                <Chip
                                                    label={`Min: ${formatCurrency(discount.minOrderValue)}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            )}
                                            {discount.usageCount && (
                                                <Chip
                                                    label={`Usage: ${discount.usageCount}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </>
                )}

                {/* Payment Summary */}
                <Box>
                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                        <PaymentIcon color="success" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Payment Summary
                        </Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Subtotal</Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(order.totalAmount)}
                            </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="error.main" display="flex" alignItems="center" gap={0.5}>
                                <TrendingDownIcon fontSize="small" />
                                Discounts
                            </Typography>
                            <Typography variant="body2" fontWeight="medium" color="error.main">
                                -{formatCurrency(order.discountAmount)}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" fontWeight="bold">
                                Final Amount
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatCurrency(order.finalAmount)}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailModal;
