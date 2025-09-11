import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Menu from "./common/Menu";
import { settingsFilter } from "../libs/constants";

const pages = ["Khám phá", "Udemy Business", "Giảng dạy trên Udemy"];

function Header() {
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
    <AppBar position="static" color="secondary">
      <Container maxWidth="xl">
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
              src="/vite.svg"
              alt="Logo"
              sx={{ height: 32, width: 32 }}
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
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
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
          <Box sx={{ flexGrow: 0 }}>
            <Menu
              buttonLabel={
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
              }
              items={settingsFilter}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Header;
