import type { ReactNode } from "react";

export interface MenuItemProps {
  id: number | string;
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
}
export interface MenuProps {
  hasArrow?: boolean;
  buttonLabel: ReactNode;
  items: MenuItemProps[];
}
