import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
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

      {/* Select Voucher Button */}
      <Box mt={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LocalOfferIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            justifyContent: "space-between",
            py: 1.5,
            borderStyle: "dashed",
            textTransform: "none",
            borderColor: "primary.main",
            bgcolor: "rgba(37, 99, 235, 0.04)",
            "&:hover": {
              bgcolor: "rgba(37, 99, 235, 0.08)",
              borderStyle: "dashed",
            }
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Chọn Voucher khả dụng
          </Typography>
          <Typography variant="caption" color="primary" fontWeight="bold">
            Xem thêm &gt;
          </Typography>
        </Button>
      </Box>

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
