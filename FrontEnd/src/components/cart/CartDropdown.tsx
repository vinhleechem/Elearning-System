import {
  Box,
  Typography,
  Popover,
  Divider,
  Button as MuiButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../libs/utils";
import type { CartItemProps } from "../../types/cartItem";

interface CartDropdownProps {
  items: CartItemProps[];
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const CartDropdownItem: React.FC<CartItemProps> = ({
  title,
  author,
  price,
  oldPrice,
  image,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.2,
        py: 1.2,
        px: 0.8,
        borderRadius: 1.5,
        transition: "background-color 0.2s ease",
        "&:hover": {
          backgroundColor: "#f7f9fa",
        },
      }}
    >
      <Box
        component="img"
        src={image}
        alt={title}
        sx={{
          width: 52,
          height: 52,
          objectFit: "cover",
          flexShrink: 0,
          borderRadius: 1,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: 12 }}
        >
          {author}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right", minWidth: 80 }}>
        <Typography variant="body2" fontWeight={700}>
          {formatCurrency(price)} 
        </Typography>
        {oldPrice && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", textDecoration: "line-through" }}
          >
            {formatCurrency(oldPrice)} 
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const CartDropdown: React.FC<CartDropdownProps> = ({
  items,
  anchorEl,
  open,
  onClose,
}) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.oldPrice ?? item.price),
    0,
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            mt: 1.5,
            borderRadius: 3,
            overflow: "visible",
            boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
            border: "1px solid #e0e0e0",
          },
          onMouseEnter: () => {},
          onMouseLeave: onClose,
        },
      }}
      disableRestoreFocus
    >
      <Box sx={{ p: 2.5 }}>
        {items.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: "center", py: 2 }}>
            Giỏ hàng trống
          </Typography>
        ) : (
          <>
            <Box
              sx={{
                maxHeight: 320,
                overflow: "auto",
              }}
            >
              {items.map((item, index) => (
                <Box key={item.id}>
                  {index > 0 && <Divider sx={{ my: 1 }} />}
                  <CartDropdownItem {...item} />
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                mb: 2,
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Tổng cộng
              </Typography>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h6" fontWeight={700}>
                  {formatCurrency(total)} 
                </Typography>
                {originalTotal > total && (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", textDecoration: "line-through" }}
                  >
                    {formatCurrency(originalTotal)} 
                  </Typography>
                )}
              </Box>
            </Box>
            <MuiButton
              component={Link}
              to="/cart"
              variant="contained"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#5624d0",
                borderRadius: 999,
                py: 1.2,
                fontSize: 16,
                "&:hover": {
                  bgcolor: "#401b9c",
                },
              }}
            >
              Vào giỏ hàng
            </MuiButton>
          </>
        )}
      </Box>
    </Popover>
  );
};

export default CartDropdown;

