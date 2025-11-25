import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { ShoppingCartOutlined } from "@mui/icons-material";
import { Badge } from "@mui/material";
import { Link } from "react-router-dom";
import { leftPages, rightPages } from "../../libs/constants";
import type { HeaderProps } from "../../types/header";
import { useState, useRef } from "react";
import CartDropdown from "../cart/CartDropdown";
import type { CartItemProps } from "../../types/cartItem";
import MegaMenu from "./MegaMenu";
import { megaMenuPrimaryTitle, megaMenuTopics } from "../../data/megaMenu";

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showLeftPages = true,
  showRightPages = true,
  showAuth = true,
  checkoutMode = false,
}) => {
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);
  const cartOpen = Boolean(cartAnchorEl);
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock data cho cart items - sau này có thể lấy từ Redux/Context
  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartItems: CartItemProps[] = [
    {
      id: 1,
      title: "Thành Thạo Docker Từ Cơ Bản Đến Nâng Cao",
      author: "Nguyễn Văn A",
      reviews: 150,
      rating: 4.5,
      price: 779000,
      oldPrice: 1000000,
      image: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg",
      tag: "AI",
      duration: 10,
      lesson: 50,
    },
    {
      id: 2,
      title: "React Advanced Patterns",
      author: "John Doe",
      reviews: 200,
      rating: 4.8,
      price: 899000,
      image: "https://img-c.udemycdn.com/course/240x135/1565838_e54e_16.jpg",
      duration: 12,
      lesson: 60,
    },
  ];

  const handleCartMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }
    setCartAnchorEl(event.currentTarget);
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setCartAnchorEl(null);
    }, 200);
  };

  const handleCartClose = () => {
    setCartAnchorEl(null);
  };
  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: "20px",
    border: `1px solid #555454`,
    marginLeft: 0,
    marginRight: theme.spacing(2),
    width: "100%",
  }));
  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    width: "100%",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create("width"),
      width: "100%",
    },
  }));
  return (
    <AppBar position="static" color="secondary" sx={{ px: 5, mb: 2 }}>
      <Toolbar disableGutters>
        <Typography
          variant="h6"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Vidi"
            sx={{ height: 36 }}
          />
        </Typography>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
            flexGrow: 1,
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="/images/logo.png"
            alt="Vidi"
            sx={{ height: 32 }}
          />
        </Typography>
        {showLeftPages && !checkoutMode && (
          <Box sx={{ display: { xs: "none", md: "flex" }, position: "relative" }}>
            <Box
              onMouseEnter={() => {
                if (megaMenuTimeoutRef.current) {
                  clearTimeout(megaMenuTimeoutRef.current);
                }
                setMegaMenuOpen(true);
              }}
              onMouseLeave={() => {
                megaMenuTimeoutRef.current = setTimeout(() => {
                  setMegaMenuOpen(false);
                }, 150);
              }}
              sx={{ position: "relative" }}
            >
              <Button
                color="inherit"
                sx={{
                  my: 2,
                  display: "block",
                  textTransform: "none",
                  fontWeight: 700,
                }}
                className="!text-dark-100 hover:!text-primary-main"
              >
                Khám phá
              </Button>
              {isMegaMenuOpen && (
                <MegaMenu
                  title={megaMenuPrimaryTitle}
                  topics={megaMenuTopics}
                  onHover={() => {
                    if (megaMenuTimeoutRef.current) {
                      clearTimeout(megaMenuTimeoutRef.current);
                    }
                    setMegaMenuOpen(true);
                  }}
                  onLeave={() => {
                    megaMenuTimeoutRef.current = setTimeout(() => {
                      setMegaMenuOpen(false);
                    }, 150);
                  }}
                />
              )}
            </Box>

            {leftPages.slice(1).map((page) => (
              <Button
                key={page}
                color="inherit"
                sx={{
                  my: 2,
                  display: "block",
                  textTransform: "none",
                }}
                className="!text-dark-100 hover:!text-primary-main"
              >
                {page}
              </Button>
            ))}
          </Box>
        )}
        {showSearch && !checkoutMode && (
          <Box sx={{ flexGrow: 1, mx: 2 }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Tìm nội dung bất kì"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Box>
        )}

        {!checkoutMode && (
          <Button
            component={Link}
            to="/my-learning"
            color="inherit"
            sx={{
              my: 2,
              display: "block",
              textTransform: "none",
              fontWeight: 600,
              mr: 1,
            }}
            className="!text-dark-100 hover:!text-primary-main"
          >
            Học tập
          </Button>
        )}

        {showRightPages && !checkoutMode && (
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {rightPages.map((page) => (
              <Button
                key={page}
                color="inherit"
                sx={{
                  my: 2,
                  display: "block",
                  textTransform: "none",
                }}
                className="!text-dark-100 hover:!text-primary-main"
              >
                {page}
              </Button>
            ))}
          </Box>
        )}
        {}

        {/* <Box sx={{ flexGrow: 0 }}>
          <Menu
            buttonLabel={
              <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
            }
            items={settingsFilter}
          />
        </Box> */}
        {showAuth && !checkoutMode && (
          <>
            <Box
              onMouseEnter={handleCartMouseEnter}
              onMouseLeave={handleCartMouseLeave}
            >
              <Button
                component={Link}
                to="/cart"
                color="inherit"
                sx={{ minWidth: 0, p: 1 }}
                aria-label="Giỏ hàng"
              >
                <Badge
                  color="primary"
                  overlap="circular"
                  badgeContent={cartItems.length}
                  showZero
                >
                  <ShoppingCartOutlined fontSize="medium" />
                </Badge>
              </Button>
              <CartDropdown
                items={cartItems}
                anchorEl={cartAnchorEl}
                open={cartOpen}
                onClose={handleCartClose}
              />
            </Box>
            <Button
              component={Link}
              to="/login"
              sx={{
                my: 2,
                display: "block",
                textTransform: "none",
                fontWeight: 700,
              }}
              variant="outlined"
              className="!ml-2"
            >
              Đăng nhập
            </Button>
            <Button
              component={Link}
              to="/register"
              sx={{
                my: 2,
                display: "block",
                textTransform: "none",
                fontWeight: 700,
              }}
              variant="contained"
              className="!ml-2"
            >
              Đăng kí
            </Button>
          </>
        )}
        {checkoutMode && (
          <Button
            component={Link}
            to="/cart"
            sx={{ ml: "auto", fontWeight: 700, textTransform: "none" }}
            color="inherit"
          >
            Hủy
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};
export default Header;
