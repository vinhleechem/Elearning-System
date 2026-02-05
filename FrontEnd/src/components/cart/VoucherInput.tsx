import { useState, useEffect } from "react";
import {
  TextField,
  Box,
  CircularProgress,
  Typography,
  InputAdornment,
} from "@mui/material";
import { CheckCircle, Error, LocalOffer } from "@mui/icons-material";
import { voucherService } from "../../service/voucherService";
import { useDebounce } from "../../hooks/useDebounce";
import { getErrorMessage } from "../../libs/errorUtils";

interface VoucherInputProps {
  cartItems: { courseId: number; price: number }[];
  onValidVoucher?: (code: string, discount: number) => void;
  onInvalidVoucher?: () => void;
}

export const VoucherInput: React.FC<VoucherInputProps> = ({
  cartItems,
  onValidVoucher,
  onInvalidVoucher,
}) => {
  const [code, setCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    message: string;
    discountAmount?: number;
  } | null>(null);

  const debouncedCode = useDebounce(code, 500);

  useEffect(() => {
    if (!debouncedCode || debouncedCode.length < 3) {
      setValidation(null);
      return;
    }

    const validate = async () => {
      setValidating(true);
      try {
        const result = await voucherService.validateVoucher(
          debouncedCode,
          cartItems,
        );
        setValidation(result);
        result.valid
          ? onValidVoucher?.(debouncedCode, result.discountAmount || 0)
          : onInvalidVoucher?.();
      } catch (error) {
        setValidation({ valid: false, message: getErrorMessage(error) });
        onInvalidVoucher?.();
      } finally {
        setValidating(false);
      }
    };

    validate();
  }, [debouncedCode, cartItems]);

  const getEndAdornment = () => {
    if (validating)
      return (
        <InputAdornment position="end">
          <CircularProgress size={20} />
        </InputAdornment>
      );
    if (validation) {
      return (
        <InputAdornment position="end">
          {validation.valid ? (
            <CheckCircle color="success" />
          ) : (
            <Error color="error" />
          )}
        </InputAdornment>
      );
    }
    return (
      <InputAdornment position="end">
        <LocalOffer color="action" />
      </InputAdornment>
    );
  };

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Enter voucher code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        InputProps={{
          endAdornment: getEndAdornment(),
        }}
        error={validation !== null && !validation.valid}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
          },
        }}
      />

      {validation && (
        <Typography
          variant="caption"
          color={validation.valid ? "success.main" : "error.main"}
          sx={{ mt: 0.5, display: "block" }}
        >
          {validation.message}
          {validation.valid && validation.discountAmount && (
            <> - Save ${validation.discountAmount}</>
          )}
        </Typography>
      )}
    </Box>
  );
};
