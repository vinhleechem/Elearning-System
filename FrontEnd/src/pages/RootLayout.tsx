import React from "react";
import { Outlet } from "react-router-dom";
import "@fontsource-variable/public-sans";

const RootLayout: React.FC = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default RootLayout;
