import { Outlet } from "react-router";
import Backdrop from "./Backdrop";
import AppSidebar from "./SideBar";
import { SidebarProvider, useSidebar } from "../../../context/SidebarContext";
import Header from "./header/Header";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50/50 xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
          } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <Header />
        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout;
