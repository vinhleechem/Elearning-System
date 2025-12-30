import { Lock } from "@mui/icons-material";
import { Button, Divider, Box, Typography } from "@mui/material";
import type { DiscountDetail } from "../../types/voucher";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CampaignIcon from "@mui/icons-material/Campaign";

interface OrderSummaryPanelProps {
  onCheckout: () => void;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  loading?: boolean;
  discounts?: DiscountDetail[];
}

const OrderSummaryPanel = ({
  onCheckout,
  totalAmount,
  discountAmount = 0,
  finalAmount,
  loading = false,
  discounts = [],
}: OrderSummaryPanelProps) => {
  const discountPercent =
    totalAmount > 0 ? Math.round((discountAmount / totalAmount) * 100) : 0;

  const getDiscountIcon = (type: string) => {
    return type === "PROMOTION" ? (
      <CampaignIcon fontSize="small" color="primary" />
    ) : (
      <LocalOfferIcon fontSize="small" color="success" />
    );
  };

  return (
    <div className="mt-10 flex-[1] p-6">
      <h1 className="mb-4 text-2xl font-bold">Tóm tắt đơn hàng</h1>
      <div className="mb-7 space-y-4">
        <p>
          Giá gốc:{" "}
          <span className="float-right">{totalAmount.toLocaleString()} đ</span>
        </p>

        {discounts.length > 0 ? (
          <Box sx={{ my: 1 }}>
            {discounts.map((discount, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getDiscountIcon(discount.type)}
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {discount.name}
                  </Typography>
                </Box>
                <span className="float-right font-medium text-green-600">
                  -{discount.amount.toLocaleString()} đ
                </span>
              </Box>
            ))}
          </Box>
        ) : (
          discountAmount > 0 && (
            <p>
              Chiết khấu (Giảm {discountPercent}%):{" "}
              <span className="float-right">
                -{discountAmount.toLocaleString()} đ
              </span>
            </p>
          )
        )}

        <Divider className="!my-2" />
        <p>
          <span className="font-bold">Tổng tiền</span>
          <span className="float-right font-bold">
            {finalAmount.toLocaleString()} đ
          </span>
        </p>
      </div>
      <p className="text-[14px]">
        Bằng việc hoàn tất giao dịch mua, bạn đồng ý với các
        <span className="text-primary-main"> Điều khoản dịch vụ</span> này.
      </p>
      <Button
        startIcon={<Lock />}
        variant="contained"
        onClick={onCheckout}
        disabled={loading}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          fontSize: "1rem",
          backgroundColor: "#3b82f6",
          "&:hover": { backgroundColor: "#2563eb" },
        }}
        className="!my-4 w-full"
      >
        {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        <p className="font-bold">Đảm bảo hoàn tiền trong 30 ngày</p>
        <p>
          Bạn không hài lòng? Nhận lại toàn bộ tiền hoàn lại trong vòng 30 ngày.
          Đơn giản và dễ hiểu!
        </p>
      </div>
    </div>
  );
};

export default OrderSummaryPanel;
