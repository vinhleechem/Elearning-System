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
          backgroundColor: "#3b82f6",
          "&:hover": { backgroundColor: "#2563eb" },
        }}
        className="!my-4 w-full"
      >
        Hoàn tất thanh toán
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
