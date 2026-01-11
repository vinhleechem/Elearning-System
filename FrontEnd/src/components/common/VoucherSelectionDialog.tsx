import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  TextField,
  List,
  ListItem,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Close,
  LocalOffer,
  CheckCircle,
  Redeem,
  CardGiftcard,
} from "@mui/icons-material";
import { voucherService } from "../../service/voucherService";
import type {
  Voucher,
  UserVoucher,
  VoucherApplicability,
} from "../../types/voucher";
import { useToast } from "../../hooks/useToast";
import { formatCurrency } from "../../libs/utils";
import { useAuthStore } from "../../store/authStore";

interface VoucherSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (voucherCode: string) => void;
  currentCode?: string;
  orderTotal?: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voucher-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const VoucherSelectionDialog = ({
  open,
  onClose,
  onSelect,
  currentCode,
  orderTotal = 0,
}: VoucherSelectionDialogProps) => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [inputCode, setInputCode] = useState("");
  const { enqueueSnackbar } = useToast();

  useEffect(() => {
    if (open) {
      loadVouchers();
    }
  }, [open]);

  const loadVouchers = async () => {
    setLoading(true);
    try {
      // Load public vouchers first to get full voucher details
      const publicData = await voucherService.getPublicVouchers();
      setPublicVouchers(publicData);

      // Load my vouchers
      if (user) {
        const myData = await voucherService.getMyVouchers(true);
        setMyVouchers(myData);
      }
    } catch (error) {
      console.error("Failed to load vouchers", error);
      enqueueSnackbar("Không thể tải danh sách voucher", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInput = () => {
    if (inputCode.trim()) {
      onSelect(inputCode.trim());
      onClose();
    }
  };

  const handleClaimVoucher = async (code: string, voucherId: number) => {
    if (!user) {
      enqueueSnackbar("Vui lòng đăng nhập để nhận voucher", {
        variant: "warning",
      });
      return;
    }

    setClaimingId(voucherId);
    try {
      await voucherService.claimVoucher(code);
      enqueueSnackbar(`Nhận voucher "${code}" thành công!`, {
        variant: "success",
      });
      // Reload vouchers
      await loadVouchers();
      // Switch to "My Vouchers" tab
      setTabValue(0);
    } catch (err: any) {
      enqueueSnackbar(
        err.response?.data?.message || "Không thể nhận voucher",
        { variant: "error" }
      );
    } finally {
      setClaimingId(null);
    }
  };

  const isVoucherEligible = (voucher: Voucher) => {
    if (!voucher.isActive) return false;
    const now = new Date();
    if (new Date(voucher.startDate) > now || new Date(voucher.endDate) < now)
      return false;
    if (voucher.minOrderValue > 0 && orderTotal < voucher.minOrderValue)
      return false;

    if (
      voucher.totalUsageLimit &&
      (voucher.currentUsageCount || 0) >= voucher.totalUsageLimit
    )
      return false;

    return true;
  };

  const handleSelectVoucher = (code: string, eligible: boolean) => {
    if (eligible) {
      onSelect(code);
      onClose();
    }
  };

  const isVoucherExpired = (voucher: Voucher) => {
    return new Date(voucher.endDate) < new Date();
  };

  const isVoucherOutOfStock = (voucher: Voucher) => {
    return (
      voucher.totalUsageLimit &&
      (voucher.currentUsageCount || 0) >= voucher.totalUsageLimit
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px", maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          fontWeight: "bold",
        }}
      >
        Chọn Voucher
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Input Code Section */}
        <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderBottom: "1px solid #e5e7eb" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập mã voucher"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleApplyInput();
              }}
              sx={{ bgcolor: "white" }}
            />
            <Button
              variant="contained"
              onClick={handleApplyInput}
              disabled={!inputCode.trim()}
              sx={{ textTransform: "none", minWidth: 100 }}
            >
              Áp dụng
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            sx={{
              px: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab
              icon={<Redeem fontSize="small" />}
              iconPosition="start"
              label={`Voucher của tôi (${myVouchers.length})`}
            />
            <Tab
              icon={<CardGiftcard fontSize="small" />}
              iconPosition="start"
              label={`Voucher công khai (${publicVouchers.length})`}
            />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ height: 400, overflowY: "auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* My Vouchers Tab */}
              <TabPanel value={tabValue} index={0}>
                {myVouchers.length === 0 ? (
                  <Box textAlign="center" p={4} color="text.secondary">
                    <LocalOffer sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography>Bạn chưa có voucher nào</Typography>
                    <Typography variant="caption">
                      Nhận voucher từ tab "Voucher công khai"
                    </Typography>
                  </Box>
                ) : (
                  <List disablePadding sx={{ p: 2 }}>
                    {myVouchers.map((userVoucher) => {
                      // Try to find matching voucher from public list to get full details
                      const matchedVoucher = publicVouchers.find(
                        (v) => v.voucherId === userVoucher.voucherId
                      );

                      // Use matched voucher if found, otherwise create from UserVoucher
                      const voucher: Voucher = matchedVoucher || {
                        voucherId: userVoucher.voucherId,
                        code: userVoucher.code,
                        name: userVoucher.name,
                        description: userVoucher.description,
                        voucherType: userVoucher.voucherType,
                        discountType: userVoucher.discountType,
                        discountValue: userVoucher.discountValue,
                        maxDiscountAmount: userVoucher.maxDiscountAmount,
                        minOrderValue: userVoucher.minOrderValue,
                        totalUsageLimit: undefined,
                        perUserLimit: 1,
                        usedCount: 0,
                        currentUsageCount: 0,
                        startDate: userVoucher.receivedAt,
                        endDate: userVoucher.expiryDate,
                        isActive: userVoucher.status === "AVAILABLE",
                        applicableTo: "ALL" as VoucherApplicability,
                        createdAt: userVoucher.receivedAt,
                        updatedAt: userVoucher.receivedAt,
                      };

                      const eligible = isVoucherEligible(voucher) && !userVoucher.isUsed;
                      const selected = currentCode === voucher.code;

                      return (
                        <VoucherListItem
                          key={userVoucher.userVoucherId}
                          voucher={voucher}
                          eligible={eligible}
                          selected={selected}
                          orderTotal={orderTotal}
                          onSelect={() =>
                            handleSelectVoucher(voucher.code, eligible)
                          }
                          showClaimButton={false}
                        />
                      );
                    })}
                  </List>
                )}
              </TabPanel>

              {/* Public Vouchers Tab */}
              <TabPanel value={tabValue} index={1}>
                {publicVouchers.length === 0 ? (
                  <Box textAlign="center" p={4} color="text.secondary">
                    <CardGiftcard sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography>Chưa có voucher công khai</Typography>
                  </Box>
                ) : (
                  <List disablePadding sx={{ p: 2 }}>
                    {publicVouchers.map((voucher) => {
                      const isExpired = isVoucherExpired(voucher);
                      const isOutOfStock = isVoucherOutOfStock(voucher);

                      // Check if user already claimed this voucher
                      const alreadyClaimed = myVouchers.some(
                        (uv) => uv.voucherId === voucher.voucherId
                      );

                      const canClaim = !isExpired && !isOutOfStock && !alreadyClaimed;

                      return (
                        <VoucherListItem
                          key={voucher.voucherId}
                          voucher={voucher}
                          eligible={canClaim}
                          selected={false}
                          orderTotal={orderTotal}
                          onSelect={() => { }}
                          showClaimButton={true}
                          onClaim={() =>
                            handleClaimVoucher(voucher.code, voucher.voucherId)
                          }
                          claiming={claimingId === voucher.voucherId}
                          isExpired={isExpired}
                          isOutOfStock={isOutOfStock}
                          alreadyClaimed={alreadyClaimed}
                        />
                      );
                    })}
                  </List>
                )}
              </TabPanel>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Voucher List Item Component
interface VoucherListItemProps {
  voucher: Voucher;
  eligible: boolean;
  selected: boolean;
  orderTotal: number;
  onSelect: () => void;
  showClaimButton: boolean;
  onClaim?: () => void;
  claiming?: boolean;
  isExpired?: boolean;
  isOutOfStock?: boolean;
  alreadyClaimed?: boolean;
}

const VoucherListItem = ({
  voucher,
  eligible,
  selected,
  orderTotal,
  onSelect,
  showClaimButton,
  onClaim,
  claiming = false,
  isExpired = false,
  isOutOfStock = false,
  alreadyClaimed = false,
}: VoucherListItemProps) => {
  return (
    <ListItem
      sx={{
        mb: 1.5,
        p: 1.5,
        bgcolor: eligible ? "white" : "#f9fafb",
        border: `2px solid ${selected ? "#2563eb" : eligible ? "#e5e7eb" : "#e5e7eb"}`,
        borderRadius: "12px",
        transition: "all 0.2s",
        opacity: eligible ? 1 : 0.6,
        position: "relative",
        overflow: "hidden",
        boxShadow: selected
          ? "0 4px 12px rgba(37, 99, 235, 0.15)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        cursor: showClaimButton ? "default" : eligible ? "pointer" : "not-allowed",
        "&:hover": !showClaimButton && eligible
          ? {
            borderColor: "#2563eb",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.1)",
          }
          : {},
      }}
      onClick={!showClaimButton ? onSelect : undefined}
    >
      {/* Left Border Decoration */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          bgcolor: !eligible
            ? "#9ca3af"
            : voucher.voucherType === "PUBLIC"
              ? "#10b981"
              : "#2563eb",
        }}
      />

      {/* Voucher Content */}
      <Box
        sx={{
          width: "100%",
          pl: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ fontSize: "0.875rem" }}
            >
              {voucher.code}
            </Typography>
            {voucher.voucherType === "PUBLIC" && (
              <Chip
                label="Public"
                size="small"
                color="success"
                sx={{
                  height: 18,
                  fontSize: "0.625rem",
                  fontWeight: 500,
                }}
              />
            )}
            {isExpired && (
              <Chip
                label="Hết hạn"
                size="small"
                color="error"
                sx={{ height: 18, fontSize: "0.625rem" }}
              />
            )}
            {isOutOfStock && (
              <Chip
                label="Hết lượt"
                size="small"
                color="error"
                sx={{ height: 18, fontSize: "0.625rem" }}
              />
            )}
            {alreadyClaimed && (
              <Chip
                label="Đã nhận"
                size="small"
                color="info"
                sx={{ height: 18, fontSize: "0.625rem" }}
              />
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.5,
              fontSize: "0.75rem",
            }}
          >
            {voucher.name}
          </Typography>

          <Typography
            variant="body2"
            color="primary.main"
            fontWeight="bold"
            sx={{ mb: 0.5, fontSize: "0.9rem" }}
          >
            {voucher.discountType === "PERCENTAGE"
              ? `Giảm ${voucher.discountValue}%`
              : `Giảm ${formatCurrency(voucher.discountValue)}`}
            {voucher.discountType === "PERCENTAGE" &&
              voucher.maxDiscountAmount && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    ml: 0.5,
                    fontSize: "0.7rem",
                    color: "text.secondary",
                  }}
                >
                  (Tối đa {formatCurrency(voucher.maxDiscountAmount)})
                </Typography>
              )}
          </Typography>

          <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            {voucher.minOrderValue > 0 && (
              <Typography
                variant="caption"
                color={
                  orderTotal < voucher.minOrderValue
                    ? "error"
                    : "text.secondary"
                }
                sx={{ fontSize: "0.7rem" }}
              >
                Đơn tối thiểu: {formatCurrency(voucher.minOrderValue)}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem" }}
            >
              HSD: {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
            </Typography>
          </Box>

          {!eligible && !showClaimButton && (
            <Typography
              variant="caption"
              display="block"
              color="error"
              sx={{ mt: 0.5, fontSize: "0.7rem" }}
            >
              {orderTotal < voucher.minOrderValue
                ? "Chưa đạt đơn tối thiểu"
                : "Không đủ điều kiện"}
            </Typography>
          )}
        </Box>

        {/* Action Button / Status */}
        <Box sx={{ ml: 1, flexShrink: 0 }}>
          {showClaimButton ? (
            <Button
              variant={alreadyClaimed ? "outlined" : "contained"}
              size="small"
              onClick={onClaim}
              disabled={!eligible || claiming}
              sx={{
                textTransform: "none",
                minWidth: 80,
                fontSize: "0.75rem",
                py: 0.5,
              }}
            >
              {claiming ? "Đang nhận..." : alreadyClaimed ? "Đã nhận" : "Nhận ngay"}
            </Button>
          ) : selected ? (
            <CheckCircle color="primary" sx={{ fontSize: 24 }} />
          ) : (
            <Typography
              variant="caption"
              sx={{
                color: eligible ? "primary.main" : "text.disabled",
                fontWeight: 600,
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
              }}
            >
              {eligible ? "Dùng ngay" : ""}
            </Typography>
          )}
        </Box>
      </Box>
    </ListItem>
  );
};

export default VoucherSelectionDialog;
