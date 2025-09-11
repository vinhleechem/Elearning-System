import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./pages/RootLayout";
import HomePage from "./pages/HomePage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        // element: <ProtectedLayout />,
        // children: [
        //   {
        path: "/",
        element: <HomePage />,
        //   },
        // ],
      },
    ],
  },
]);
