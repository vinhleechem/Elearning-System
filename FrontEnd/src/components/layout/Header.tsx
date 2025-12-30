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
import { Link, useNavigate } from "react-router-dom";
import { leftPages } from "../../libs/constants";
import type { HeaderProps } from "../../types/header";
import { useState, useRef, useEffect } from "react";
import type { CartItemProps } from "../../types/cartItem";
import MegaMenu from "./MegaMenu";
import { megaMenuPrimaryTitle } from "../../data/megaMenu";
import type { MegaMenuTopic } from "../../data/megaMenu";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import CartDropdown from "../cart/CartDropdown";
import { categoryService } from "../../service/categoryService";
import type { CategoryTreeResponse } from "../../service/categoryService";

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showLeftPages = true,
  showAuth = true,
  checkoutMode = false,
}) => {
  const { user, logout } = useAuthStore();
  const { items: cartItemsResponse, fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const [cartAnchorEl, setCartAnchorEl] = useState<HTMLElement | null>(null);
  const cartOpen = Boolean(cartAnchorEl);
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [megaMenuTopics, setMegaMenuTopics] = useState<MegaMenuTopic[]>([]);

  useEffect(() => {
    if (user) {
      fetchCart();
      fetchWishlist();
    }
  }, [user]);

  const cartItems: CartItemProps[] = cartItemsResponse.map((item) => ({
    id: item.courseId,
    title: item.courseTitle,
    author: "Giảng viên", // Placeholder
    reviews: 0, // Placeholder
    rating: 0, // Placeholder
    price: item.discountPrice ?? item.price,
    oldPrice: item.discountPrice ? item.price : null,
    image: item.courseImage,
    duration: 0, // Placeholder
    lesson: 0, // Placeholder
  }));

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
    handleCartClose();
    navigate("/cart");
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

  // Load categories and transform to MegaMenu format
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await categoryService.getCategoryTree();
        const topics = transformCategoriesToMegaMenu(categories);
        setMegaMenuTopics(topics);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const transformCategoriesToMegaMenu = (
    categories: CategoryTreeResponse[]
  ): MegaMenuTopic[] => {
    // Helper: chunk an array into smaller arrays of size n
    const chunk = <T,>(arr: T[], size: number): T[][] => {
      const res: T[][] = [];
      for (let i = 0; i < arr.length; i += size) {
        res.push(arr.slice(i, i + size));
      }
      return res;
    };

    return categories
      .filter((cat) => cat.level === 1 && cat.isActive)
      .map((level1) => {
        // Level 2 categories become columns
        const level2Cats =
          level1.children?.filter((cat) => cat.isActive) || [];

        // Build columns: each level2 is a column, items are level3 (or itself if no level3)
        const columns = level2Cats.map((level2) => {
          const level3Items =
            level2.children
              ?.filter((cat) => cat.isActive)
              .map((level3) => level3.name) || [];

          const items = level3Items.length > 0 ? level3Items : [level2.name];

          return {
            title: level2.name,
            items,
          };
        });

        // If no level2 exists, fallback
        if (columns.length === 0) {
          return {
            label: level1.name,
            columns: [
              {
                title: "Khóa học",
                items: ["Đang cập nhật..."],
              },
            ],
          };
        }

        // Udemy style: split too-long columns into multiple columns of ~8 items
        const normalizedColumns: typeof columns = [];
        columns.forEach((col) => {
          const chunks = chunk(col.items, 8);
          chunks.forEach((items, idx) => {
            normalizedColumns.push({
              title: idx === 0 ? col.title : `${col.title} (${idx + 1})`,
              items,
            });
          });
        });

        return {
          label: level1.name,
          columns: normalizedColumns,
        };
      });
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
      sx={{ px: { xs: 2, md: 5 }, borderBottom: "1px solid #e5e5e5" }}
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
              to="/instructor/dashboard"
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
              to="/my-courses/learning"
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
              to="/my-courses/wishlist"
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
              onMouseLeave={handleCartMouseLeave}
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
