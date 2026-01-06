import {
  Box,
  Typography,
  Popper,
  Paper,
  Divider,
  Button as MuiButton,
  Fade,
} from "@mui/material";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../libs/utils";
import type { CartItemProps } from "../../types/cartItem";

interface CartDropdownProps {
  items: CartItemProps[];
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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
  onMouseEnter,
  onMouseLeave,
}) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const originalTotal = items.reduce(
    (sum, item) => sum + (item.oldPrice ?? item.price),
    0,
  );

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-end"
      transition
      sx={{ zIndex: 1300 }} // Ensure it's above other elements
      modifiers={[
        {
          name: "offset",
          options: {
            offset: [0, 12],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            sx={{
              width: 360,
              borderRadius: 3,
              overflow: "visible",
              boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
              border: "1px solid #e0e0e0",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Box sx={{ p: 2.5 }}>
              {items.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    py: 2,
                  }}
                >
                  <Box
                    component="img"
                    src="/images/cart/empty-cart.png"
                    alt="Empty Cart"
                    sx={{ width: 100, mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Chưa có sản phẩm nào trong giỏ hàng
                  </Typography>
                </Box>
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
                          sx={{
                            color: "text.secondary",
                            textDecoration: "line-through",
                          }}
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
                      bgcolor: "#3b82f6",
                      borderRadius: 999,
                      py: 1.2,
                      fontSize: 16,
                      "&:hover": {
                        bgcolor: "#2563eb",
                      },
                    }}
                  >
                    Vào giỏ hàng
                  </MuiButton>
                </>
              )}
            </Box>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default CartDropdown;
