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
  PersonOutline,
  PlayCircleOutline,
  ChatBubbleOutline,
  SettingsOutlined,
  LogoutOutlined,
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
import SchoolIcon from "@mui/icons-material/School";
import { leftPages } from "../../libs/constants";
import type { HeaderProps } from "../../types/header";
import { useState, useRef, useEffect } from "react";
import type { CartItemProps } from "../../types/cartItem";
import MegaMenu from "./MegaMenu";
import { useWishlistStore } from "../../store/wishlistStore";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import CartDropdown from "../cart/CartDropdown";
import { categoryService } from "../../service/categoryService";
import { conversationService } from "../../service/conversationService";
import type { CategoryTreeResponse } from "../../service/categoryService";
import NotificationBell from "../common/NotificationBell";
import LearningDropdown from "../learning/LearningDropdown";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: "9999px",
  backgroundColor: "#f1f5f9",
  border: "1px solid transparent",
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(3),
  width: "100%",
  maxWidth: "500px",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  "&:hover": {
    backgroundColor: "#e2e8f0",
  },
  "&:focus-within": {
    backgroundColor: "#ffffff",
    border: "1px solid #3b82f6",
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.15)",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2.5),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
  zIndex: 1,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#1e293b",
  width: "100%",
  fontWeight: 500,
  fontSize: "0.95rem",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.2, 2, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(5)})`,
    width: "100%",
    "&::placeholder": {
      color: "#94a3b8",
      opacity: 1,
    },
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

  const [learningAnchorEl, setLearningAnchorEl] = useState<HTMLElement | null>(null);
  const learningOpen = Boolean(learningAnchorEl);
  const learningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMegaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [categories, setCategories] = useState<CategoryTreeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      fetchCart();
      fetchWishlist();

      const fetchUnread = () => {
        if (!hasRole("INSTRUCTOR")) {
          conversationService
            .getUnreadCount()
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
          // Filter: only process if notification is for current user
          if (notif.userId && notif.userId !== user.userId) {
            return; // Ignore notifications for other users
          }
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

  const handleLearningMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
    }
    setLearningAnchorEl(event.currentTarget);
  };

  const handleLearningDropdownEnter = () => {
    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
    }
  };

  const handleLearningMouseLeave = () => {
    learningTimeoutRef.current = setTimeout(() => {
      setLearningAnchorEl(null);
    }, 200);
  };

  const handleLearningClose = () => {
    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
      learningTimeoutRef.current = null;
    }
    setLearningAnchorEl(null);
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
        const data = await categoryService.getCategoryTree();
        // Only keep active level-1 roots
        setCategories(data.filter((c) => c.isActive));
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

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
      color="inherit"
      elevation={0}
      sx={{
        px: { xs: 2, md: 5 },
        borderBottom: "1px solid",
        borderColor: isScrolled ? "transparent" : "#e2e8f0",
        transition: "all 0.3s ease",
        boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        backgroundColor: isScrolled ? "rgba(255,255,255,0.9)" : "white",
        zIndex: 1100,
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: "72px !important" }}>
        <Box
          component={Link}
          to="/"
          sx={{
            mr: 2,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            gap: 1,
            flexGrow: { xs: 1, md: 0 }
          }}
        >
          <SchoolIcon sx={{ color: "#2563eb", fontSize: { xs: 28, md: 32 } }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.2rem", md: "1.4rem" },
              display: "flex"
            }}
          >
            vidi
          </Typography>
        </Box>
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
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#334155",
                  px: 2,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.05)",
                    color: "#2563eb",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Khám phá
              </Button>
              {isMegaMenuOpen && (
                <MegaMenu
                  categories={categories}
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
                  fontSize: "15px",
                  color: "#334155",
                  px: 2,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.05)",
                    color: "#2563eb",
                    transform: "translateY(-1px)",
                  },
                }}
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
                placeholder="Tìm kiếm khóa học..."
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
                fontSize: "15px",
                color: "#334155",
                px: 2,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                mr: 1,
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
                  color: "#2563eb",
                  transform: "translateY(-1px)",
                },
              }}
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
                fontSize: "15px",
                color: "#334155",
                px: 2,
                borderRadius: "8px",
                transition: "all 0.2s ease",
                mr: 1,
                "&:hover": {
                  backgroundColor: "rgba(37, 99, 235, 0.05)",
                  color: "#2563eb",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Giảng viên
            </Button>
          </>
        )}

        {showAuth && !checkoutMode && user && (
          <>
            <Box sx={{ position: "relative" }}>
              <Button
                component={Link}
                to="/my-courses/learning"
                color="inherit"
                onMouseEnter={handleLearningMouseEnter}
                onMouseLeave={handleLearningMouseLeave}
                sx={{
                  my: 2,
                  display: { xs: "none", lg: "block" },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#334155",
                  px: 2,
                  borderRadius: "8px",
                  transition: "all 0.2s ease",
                  mr: 1,
                  "&:hover": {
                    backgroundColor: "rgba(37, 99, 235, 0.05)",
                    color: "#2563eb",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Học tập
              </Button>
              <LearningDropdown
                anchorEl={learningAnchorEl}
                open={learningOpen}
                onClose={handleLearningClose}
                onMouseEnter={handleLearningDropdownEnter}
                onMouseLeave={handleLearningMouseLeave}
              />
            </Box>

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
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.12))",
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: "16px",
                  p: 0.5,
                  "& .MuiMenuItem-root": {
                    px: 1.5,
                    py: 1,
                    borderRadius: "8px",
                    mx: 0.5,
                    my: 0.25,
                    typography: "body2",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "#475569",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      color: "#2563eb",
                      "& .MuiSvgIcon-root": {
                        color: "#2563eb",
                      },
                    },
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 18,
                    width: 12,
                    height: 12,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                    borderTop: "1px solid #f1f5f9",
                    borderLeft: "1px solid #f1f5f9",
                  },
                },
              }}
            >
              <MenuItem
                component={Link}
                to="/profile"
                onClick={handleUserMenuClose}
              >
                <PersonOutline fontSize="small" sx={{ color: "#94a3b8" }} />
                Hồ sơ cá nhân
              </MenuItem>
              <MenuItem
                component={Link}
                to="/my-courses"
                onClick={handleUserMenuClose}
              >
                <PlayCircleOutline fontSize="small" sx={{ color: "#94a3b8" }} />
                Khóa học của tôi
              </MenuItem>
              {!hasRole("INSTRUCTOR") && (
                <MenuItem
                  component={Link}
                  to="/my-courses/messages"
                  onClick={handleUserMenuClose}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
                    <ChatBubbleOutline fontSize="small" sx={{ color: "#94a3b8" }} />
                    Tin nhắn
                  </Box>
                  {unreadMessages > 0 && (
                    <Badge
                      badgeContent={unreadMessages}
                      color="error"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.7rem",
                          height: 20,
                          minWidth: 20,
                          borderRadius: "10px",
                        },
                      }}
                    />
                  )}
                </MenuItem>
              )}
              <MenuItem
                component={Link}
                to="/settings"
                onClick={handleUserMenuClose}
              >
                <SettingsOutlined fontSize="small" sx={{ color: "#94a3b8" }} />
                Cài đặt
              </MenuItem>
              <Divider sx={{ my: "8px !important", mx: 2 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: "#ef4444 !important",
                  "&:hover": { backgroundColor: "#fef2f2 !important" },
                }}
              >
                <LogoutOutlined fontSize="small" sx={{ color: "#ef4444 !important" }} />
                Đăng xuất
              </MenuItem>
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
                fontWeight: 600,
                fontSize: "15px",
                borderRadius: "9999px",
                px: 3,
                transition: "all 0.2s ease",
                borderColor: "#e2e8f0",
                color: "#1e293b",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  borderColor: "#cbd5e1",
                  backgroundColor: "#f8fafc",
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
                fontWeight: 600,
                fontSize: "15px",
                borderRadius: "9999px",
                px: 3,
                background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 6px 20px rgba(37, 99, 235, 0.3)",
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
            sx={{ ml: "auto", fontWeight: 600, color: "#475569", textTransform: "none" }}
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
