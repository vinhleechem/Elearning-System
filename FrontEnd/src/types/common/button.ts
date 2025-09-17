import type { SxProps, Theme } from "@mui/material";
import type { ReactElement, ReactNode } from "react";
import type React from "react";

export interface ButtonProps {
  isLoading?: boolean;
  children?: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "outlined" | "contained" | "text";
  icon?: ReactElement;
  iconPosition?: "start" | "end";
  size?: "small" | "medium" | "large";
  inputProps?: Record<string, unknown>;
  sx?: SxProps<Theme>;
}
