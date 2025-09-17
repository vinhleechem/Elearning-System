import { Lock } from "@mui/icons-material";
import { Button, Divider } from "@mui/material";

const OrderSummaryPanel = () => {
  return (
    <div className="mt-10 flex-[1] p-6">
      <h1 className="mb-4 text-2xl font-bold">Tóm tắt đơn hàng</h1>
      <div className="mb-7 space-y-4">
        <p>
          Giá gốc: <span className="float-right">8,834,000 đ</span>
        </p>
        <p>
          Chiết khấu (Giảm 76%):{" "}
          <span className="float-right">-6,720,000 đ</span>
        </p>
        <Divider className="!my-2" />
        <p>
          <span className="font-bold">Tổng tiền</span> (6 khóa học)
          <span className="float-right font-bold">2,114,000 đ</span>
        </p>
      </div>
      <p className="text-[14px]">
        Bằng việc hoàn tất giao dịch mua, bạn đồng ý với các
        <span className="text-primary-main"> Điều khoản dịch vụ</span> này.
      </p>
      <Button
        startIcon={<Lock />}
        variant="contained"
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          fontSize: "1rem",
          backgroundColor: "#6d28d9",
          "&:hover": { backgroundColor: "#5b21b6" },
        }}
        className="!my-4 w-full"
      >
        Thanh toán
        <span className="ml-1 font-bold">
          2.114.000
          <span className="ml-0.5 align-text-top text-xs">đ</span>
        </span>
      </Button>

      <p className="text-sm text-gray-500">Đã bảo hành tiền trong 30 ngày</p>
    </div>
  );
};

export default OrderSummaryPanel;
