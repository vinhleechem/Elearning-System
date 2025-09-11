import React from "react";
import { CircularProgress, Button as MUIButton } from "@mui/material";
import type { ButtonProps } from "../../types/common/button";

const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  icon,
  onClick,
  variant = "outlined",
  size,
  children,
  inputProps = {},
  sx,
}) => {
  return (
    <MUIButton
      onClick={onClick}
      variant={variant}
      disabled={isLoading}
      size={size}
      {...inputProps}
      sx={sx}
    >
      {isLoading ? (
        <CircularProgress className="mr-1 animate-spin" size="16px" />
      ) : (
        icon
      )}
      {children}
    </MUIButton>
  );
};

export default Button;
