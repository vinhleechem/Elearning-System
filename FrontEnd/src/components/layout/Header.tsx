import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import { ShoppingCartOutlined, FavoriteBorder } from "@mui/icons-material";
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
import { conversationService } from "../../service/conversationService";
import type { CategoryTreeResponse } from "../../service/categoryService";
import NotificationBell from "../common/NotificationBell";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "24px",
  backgroundColor: "#f8f9fa",
  border: "2px solid transparent",
  marginLeft: 0,
  marginRight: theme.spacing(2),
  width: "100%",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#fff",
    border: "2px solid #e0e0e0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  "&:focus-within": {
    backgroundColor: "#fff",
    border: "2px solid #2563eb",
    boxShadow: "0 4px 16px rgba(37,99,235,0.15)",
  },
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

import { webSocketService } from "../../service/webSocketService";

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showLeftPages = true,
  showAuth = true,
  checkoutMode = false,
}) => {
  const { user, logout, hasRole } = useAuthStore();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      fetchCart();
      fetchWishlist();

      const fetchUnread = () => {
        if (!hasRole("INSTRUCTOR")) {
          conversationService.getUnreadCount()
            .then(setUnreadMessages)
            .catch(console.error);
        }
      };

      fetchUnread();

      // Connect WS
      if (!webSocketService.isConnected()) {
        webSocketService.connect(user.userId.toString());
      }

      const handleNotification = (notif: any) => {
        if (notif.type === "INFO" && !hasRole("INSTRUCTOR")) {
          // If we receive a message notification, update count
          fetchUnread();
        }
      };

      webSocketService.addNotificationListener(handleNotification);

      return () => {
        webSocketService.removeNotificationListener(handleNotification);
      };
    }
  }, [user?.userId]); // Only re-fetch when userId changes (login/logout)

  const cartItems: CartItemProps[] = cartItemsResponse.map((item) => ({
    id: item.courseId,
    title: item.courseTitle,
    author: "Giảng viên",
    reviews: 0,
    rating: 0,
    price: item.discountPrice ?? item.price,
    oldPrice: item.discountPrice ? item.price : null,
    image: item.courseImage,
    duration: 0,
    lesson: 0,
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
    categories: CategoryTreeResponse[],
  ): MegaMenuTopic[] => {
    return categories
      .filter((cat) => cat.level === 1 && cat.isActive)
      .map((level1) => {
        // Level 2 categories become columns
        const level2Cats = level1.children?.filter((cat) => cat.isActive) || [];

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

        return {
          label: level1.name,
          columns: columns,
        };
      });
  };
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AppBar
      position="sticky"
      color="secondary"
      elevation={0}
      sx={{
        px: { xs: 2, md: 5 },
        borderBottom: "1px solid #e5e5e5",
        transition: "all 0.3s ease",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        backdropFilter: isScrolled ? "blur(10px)" : "none",
        backgroundColor: isScrolled ? "rgba(255,255,255,0.95)" : "white",
      }}
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
            src="/images/logo/logo.png"
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
                  px: 2,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    transform: "translateY(-1px)",
                  },
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
                  fontWeight: 600,
                  px: 2,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    transform: "translateY(-1px)",
                  },
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    navigate(
                      `/courses?search=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }
                }}
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
              Vidi Business
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
              sx={{
                mx: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                  transform: "scale(1.1)",
                  color: "#ef4444",
                },
              }}
              aria-label="Wishlist"
            >
              <FavoriteBorder />
            </IconButton>

            <IconButton
              color="inherit"
              sx={{
                mx: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.08)",
                  transform: "scale(1.1)",
                  color: "#2563eb",
                },
              }}
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
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#2563eb",
                    color: "white",
                    fontWeight: 600,
                  },
                }}
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

            {user && <NotificationBell />}

            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                ml: 1,
                p: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
              aria-label="User menu"
            >
              <Avatar
                src={user.avatarUrl}
                alt={user.fullName}
                sx={{
                  width: 36,
                  height: 36,
                  border: "2px solid",
                  borderColor: "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#2563eb",
                    boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)",
                  },
                }}
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
              {!hasRole("INSTRUCTOR") && (
                <MenuItem
                  component={Link}
                  to="/my-courses/messages"
                  onClick={handleUserMenuClose}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Tin nhắn
                  {unreadMessages > 0 && (
                    <Badge
                      badgeContent={unreadMessages}
                      color="error"
                      sx={{ mr: 1, '& .MuiBadge-badge': { fontSize: '0.7rem', height: 18, minWidth: 18 } }}
                    />
                  )}
                </MenuItem>
              )}
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
                borderRadius: "12px",
                px: 3,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
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
                borderRadius: "12px",
                px: 3,
                background: "linear-gradient(45deg, #2563eb 30%, #3b82f6 90%)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)",
                },
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
