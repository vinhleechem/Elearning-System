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

const Header: React.FC<HeaderProps> = ({
  showSearch = true,
  showLeftPages = true,
  showRightPages = true,
  showAuth = true,
  checkoutMode = false,
}) => {
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
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Box
            component="img"
            src="https://frontends.udemycdn.com/frontends-homepage/staticx/udemy/images/v7/logo-udemy.svg"
            alt="Logo"
            sx={{ height: 34, width: 91 }}
          />
        </Typography>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="#app-bar-with-responsive-menu"
          sx={{
            mr: 2,
            display: { xs: "flex", md: "none" },
            flexGrow: 1,
            fontFamily: "monospace",
            fontWeight: 700,
            letterSpacing: ".3rem",
            color: "inherit",
            textDecoration: "none",
          }}
        ></Typography>
        {showLeftPages && !checkoutMode && (
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {leftPages.map((page) => (
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
            <Box>
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
                  badgeContent={3}
                  showZero
                >
                  <ShoppingCartOutlined fontSize="medium" />
                </Badge>
              </Button>
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
