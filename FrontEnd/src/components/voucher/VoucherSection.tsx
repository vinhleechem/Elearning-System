import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Grid } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VoucherInput from "./VoucherInput";
import MyVouchersDialog from "./MyVouchersDialog";
import PublicVouchersDialog from "./PublicVouchersDialog";

interface VoucherSectionProps {
  appliedVoucherCode?: string;
  onVoucherApply: (code: string) => void;
  onVoucherRemove: () => void;
}

export const VoucherSection: React.FC<VoucherSectionProps> = ({
  appliedVoucherCode,
  onVoucherApply,
  onVoucherRemove,
}) => {
  const [myVouchersOpen, setMyVouchersOpen] = useState(false);
  const [publicVouchersOpen, setPublicVouchersOpen] = useState(false);

  return (
    <Box>
      {/* Voucher Input */}
      <VoucherInput
        appliedVoucherCode={appliedVoucherCode}
        onVoucherApply={onVoucherApply}
        onVoucherRemove={onVoucherRemove}
      />

      {/* Quick Actions */}
      <Grid container spacing={2} mt={2}>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LocalOfferIcon />}
            onClick={() => setMyVouchersOpen(true)}
          >
            Voucher của tôi
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<CardGiftcardIcon />}
            onClick={() => setPublicVouchersOpen(true)}
          >
            Nhận voucher
          </Button>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <MyVouchersDialog
        open={myVouchersOpen}
        onClose={() => setMyVouchersOpen(false)}
        onSelectVoucher={onVoucherApply}
        selectedVoucherCode={appliedVoucherCode}
      />

      <PublicVouchersDialog
        open={publicVouchersOpen}
        onClose={() => setPublicVouchersOpen(false)}
      />
    </Box>
  );
};

export default VoucherSection;
