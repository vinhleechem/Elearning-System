// components/Menu/Menu.tsx
import React from "react";
import {
  Button,
  Menu as MUIMenu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import type { MenuProps } from "../../types/common/menu";

const Menu: React.FC<MenuProps> = ({
  hasArrow = false,
  buttonLabel,
  items,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {
        <Button
          sx={{ color: "#000000", fontWeight: 700, textTransform: "none" }}
          onClick={handleClick}
          endIcon={hasArrow && <ArrowDropDown />}
        >
          {buttonLabel}
        </Button>
      }

      <MUIMenu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            minWidth: anchorEl ? anchorEl.offsetWidth : undefined,
          },
        }}
      >
        {items.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.onClick?.();
              handleClose();
            }}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </MUIMenu>
    </>
  );
};

export default Menu;
