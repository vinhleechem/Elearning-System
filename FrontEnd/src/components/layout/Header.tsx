import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import {
  ShoppingCartOutlined,
  FavoriteBorder,
  NotificationsOutlined,
} from "@mui/icons-material";
import {
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import { leftPages } from "../../libs/constants";
import type { HeaderProps } from "../../types/header";
import { useState, useRef } from "react";
import type { CartItemProps } from "../../types/cartItem";
import MegaMenu from "./MegaMenu";
import { megaMenuPrimaryTitle, megaMenuTopics } from "../../data/megaMenu";
import { useAuthStore } from "../../store/authStore";
import CartDropdown from "../cart/CartDropdown";

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showLeftPages = true,
  showAuth = true,
  checkoutMode = false,
}) => {
  const { user, logout } = useAuthStore();
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);
  const cartOpen = Boolean(cartAnchorEl);
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isCartPinned, setCartPinned] = useState(false);

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

  const handleCartDropdownEnter = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
    }
  };

  const handleCartMouseLeave = () => {
    cartTimeoutRef.current = setTimeout(() => {
      setCartAnchorEl(null);
    }, 200);
  };

  const handleCartClose = () => {
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }
    setCartAnchorEl(null);
  };

  const handleCartIconClick = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (cartTimeoutRef.current) {
      clearTimeout(cartTimeoutRef.current);
      cartTimeoutRef.current = null;
    }

    if (isCartPinned) {
      handleCartClose();
      return;
    }

    setCartPinned(true);
    setCartAnchorEl(event.currentTarget);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      handleUserMenuClose();
    } catch (error) {
      console.error("Logout failed:", error);
      // Vẫn đóng menu và clear state đã được xử lý trong store
      handleUserMenuClose();
    }
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
    <AppBar
      position="static"
      color="secondary"
      elevation={0}
      sx={{ px: { xs: 2, md: 5 }, mb: 2, borderBottom: "1px solid #e5e5e5" }}
    >
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
          <Box
            sx={{ display: { xs: "none", md: "flex" }, position: "relative" }}
          >
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
                placeholder="Tìm kiếm nội dung bất kỳ"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Box>
        )}

        {showAuth && !checkoutMode && (
          <>
            <Button
              component={Link}
              to="/business"
              color="inherit"
              sx={{
                my: 2,
                display: { xs: "none", lg: "block" },
                textTransform: "none",
                fontWeight: 600,
                mr: 1,
              }}
              className="!text-dark-100 hover:!text-primary-main"
            >
              Udemy Business
            </Button>

            <Button
              component={Link}
              to="/teaching"
              color="inherit"
              sx={{
                my: 2,
                display: { xs: "none", lg: "block" },
                textTransform: "none",
                fontWeight: 600,
                mr: 1,
              }}
              className="!text-dark-100 hover:!text-primary-main"
            >
              Giảng viên
            </Button>
          </>
        )}

        {showAuth && !checkoutMode && user && (
          <>
            <Button
              component={Link}
              to="/my-learning"
              color="inherit"
              sx={{
                my: 2,
                display: { xs: "none", lg: "block" },
                textTransform: "none",
                fontWeight: 600,
                mr: 1,
              }}
              className="!text-dark-100 hover:!text-primary-main"
            >
              Học tập
            </Button>

            <IconButton
              component={Link}
              to="/my-learning/wishlist"
              color="inherit"
              sx={{ mx: 0.5 }}
              aria-label="Wishlist"
            >
              <FavoriteBorder />
            </IconButton>

            <IconButton
              color="inherit"
              sx={{ mx: 0.5 }}
              aria-label="Giỏ hàng"
              onMouseEnter={handleCartMouseEnter}
              onClick={handleCartIconClick}
            >
              <Badge
                color="primary"
                overlap="circular"
                badgeContent={cartItems.length}
                showZero
              >
                <ShoppingCartOutlined />
              </Badge>
            </IconButton>
            <CartDropdown
              items={cartItems}
              anchorEl={cartAnchorEl}
              open={cartOpen}
              onClose={handleCartClose}
              onMouseEnter={handleCartDropdownEnter}
              onMouseLeave={handleCartMouseLeave}
            />

            <IconButton color="inherit" sx={{ mx: 0.5 }} aria-label="Thông báo">
              <Badge color="error" variant="dot">
                <NotificationsOutlined />
              </Badge>
            </IconButton>

            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ ml: 1 }}
              aria-label="User menu"
            >
              <Avatar
                src={user.avatarUrl}
                alt={user.fullName}
                sx={{ width: 32, height: 32 }}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleUserMenuClose}
              >
                Hồ sơ cá nhân
              </MenuItem>
              <MenuItem
                component={Link}
                to="/my-courses"
                onClick={handleUserMenuClose}
              >
                Khóa học của tôi
              </MenuItem>
              <MenuItem
                component={Link}
                to="/settings"
                onClick={handleUserMenuClose}
              >
                Cài đặt
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
            </Menu>
          </>
        )}

        {showAuth && !checkoutMode && !user && (
          <>
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
              Đăng ký
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
