import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../../../context/SidebarContext";
import {
  AccountCircle,
  CalendarViewMonthRounded,
  ChevronRight,
  GridView,
  MoreHoriz,
  Group,
  School,
  Notifications,
  Category,
} from "@mui/icons-material";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridView />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: <Group />,
    name: "Quản lý người dùng",
    path: "/admin/users",
  },
  {
    icon: <School />,
    name: "Quản lý khóa học",
    path: "/admin/courses",
  },
  {
    icon: <Category />,
    name: "Quản lý danh mục",
    path: "/admin/categories",
  },
  {
    icon: <Notifications />,
    name: "Quản lý thông báo",
    path: "/admin/notifications",
  },
  {
    icon: <AccountCircle />,
    name: "Hồ sơ cá nhân",
    path: "/admin/profile",
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {},
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu(index);
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null && subMenuRefs.current[openSubmenu]) {
      setSubMenuHeight((prevHeights) => ({
        ...prevHeights,
        [openSubmenu]: subMenuRefs.current[openSubmenu]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) =>
      prevOpenSubmenu === index ? null : index,
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`flex w-full items-center gap-3 rounded-lg p-2.5 transition-all duration-200 lg:justify-center ${
                openSubmenu === index
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              } cursor-pointer`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center ${
                  openSubmenu === index
                    ? "text-white"
                    : "text-gray-500 group-hover:text-gray-900"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="text-sm font-medium">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronRight
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu === index
                      ? "rotate-90 text-white"
                      : "text-gray-400"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`group flex w-full items-center gap-3 rounded-lg p-2.5 transition-all duration-200 ${
                  isActive(nav.path)
                    ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center ${
                    isActive(nav.path)
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-900"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="text-sm font-medium">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[index] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu === index ? `${subMenuHeight[index]}px` : "0px",
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center rounded-lg px-2 py-1.5 text-sm transition-colors duration-200 ${
                        isActive(subItem.path)
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {subItem.name}
                      <span className="ml-auto flex items-center gap-1">
                        {subItem.new && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                              isActive(subItem.path)
                                ? "bg-primary-100 text-primary-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                              isActive(subItem.path)
                                ? "bg-primary-100 text-primary-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className=""
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={28}
              />
              <img
                className="hidden"
                src="/images/logo.png"
                alt="Logo"
                width={100}
                height={28}
              />
            </>
          ) : (
            <img src="/images/logo.png" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex justify-start p-2 text-xs uppercase leading-[20px] text-gray-400`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHoriz className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
