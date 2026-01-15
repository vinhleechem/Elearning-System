import React, { useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import VoucherInput from "./VoucherInput";
import VoucherSelectionDialog from "../common/VoucherSelectionDialog";

interface VoucherSectionProps {
  appliedVoucherCode?: string;
  onVoucherApply: (code: string) => void;
  onVoucherRemove: () => void;
  orderTotal?: number;
}

export const VoucherSection: React.FC<VoucherSectionProps> = ({
  appliedVoucherCode,
  onVoucherApply,
  onVoucherRemove,
  orderTotal,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      {/* Voucher Input */}
      <VoucherInput
        appliedVoucherCode={appliedVoucherCode}
        onVoucherApply={onVoucherApply}
        onVoucherRemove={onVoucherRemove}
      />

      {/* Divider */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.secondary">
          hoặc
        </Typography>
      </Divider>

      {/* Select Voucher Button */}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<LocalOfferIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{
          py: 1.5,
          borderStyle: "dashed",
          textTransform: "none",
          borderColor: "primary.main",
          borderWidth: 2,
          bgcolor: "rgba(37, 99, 235, 0.04)",
          fontWeight: 600,
          "&:hover": {
            bgcolor: "rgba(37, 99, 235, 0.08)",
            borderStyle: "dashed",
            borderWidth: 2,
          }
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <Typography variant="body2" fontWeight={600}>
            Chọn Voucher khả dụng
          </Typography>
          <Typography variant="caption" color="primary" fontWeight="bold">
            Xem thêm &gt;
          </Typography>
        </Box>
      </Button>

      {/* Dialog */}
      <VoucherSelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={onVoucherApply}
        currentCode={appliedVoucherCode}
        orderTotal={orderTotal}
      />
    </Box>
  );
};

export default VoucherSection;
