import React from "react";
import { Outlet } from "react-router-dom";
const RootLayout: React.FC = () => {
  return (
    <div>
      <Outlet /> {/* cho dat non dung cua route con */}
    </div>
  );
};

export default RootLayout;
