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
  iconPosition,
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
      <span className="mr-1">
        {iconPosition === "start" && !isLoading && icon}
      </span>
      {children}
      {isLoading && (
        <CircularProgress className="mr-1 animate-spin" size="16px" />
      )}
      <span className="ml-1">
        {iconPosition === "end" && !isLoading && icon}
      </span>
    </MUIButton>
  );
};

export default Button;
