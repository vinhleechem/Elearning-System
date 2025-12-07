import { useEffect } from "react";
import type { ReactNode } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type SidebarState = {
  isExpanded: boolean;
  isMobile: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  setIsHovered: (isHovered: boolean) => void;
  setActiveItem: (item: string | null) => void;
  toggleSubmenu: (item: string) => void;
  closeMobileSidebar: () => void;
  setResponsiveState: (isMobile: boolean) => void;
};

const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  isMobile: false,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  toggleSidebar: () =>
    set((state) => ({
      isExpanded: !state.isExpanded,
    })),
  toggleMobileSidebar: () =>
    set((state) => ({
      isMobileOpen: !state.isMobileOpen,
    })),
  setIsHovered: (isHovered) =>
    set(() => ({
      isHovered,
    })),
  setActiveItem: (activeItem) =>
    set(() => ({
      activeItem,
    })),
  toggleSubmenu: (item) =>
    set((state) => ({
      openSubmenu: state.openSubmenu === item ? null : item,
    })),
  closeMobileSidebar: () =>
    set(() => ({
      isMobileOpen: false,
    })),
  setResponsiveState: (isMobile) =>
    set((state) => ({
      isMobile,
      isMobileOpen: isMobile ? state.isMobileOpen : false,
    })),
}));

export const useSidebar = () =>
  useSidebarStore(
    useShallow((state) => ({
      isExpanded: state.isMobile ? false : state.isExpanded,
      isMobileOpen: state.isMobileOpen,
      isHovered: state.isHovered,
      activeItem: state.activeItem,
      openSubmenu: state.openSubmenu,
      toggleSidebar: state.toggleSidebar,
      toggleMobileSidebar: state.toggleMobileSidebar,
      setIsHovered: state.setIsHovered,
      setActiveItem: state.setActiveItem,
      toggleSubmenu: state.toggleSubmenu,
    })),
  );

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const setResponsiveState = useSidebarStore(
    (state) => state.setResponsiveState,
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setResponsiveState(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setResponsiveState]);

  return <>{children}</>;
};
