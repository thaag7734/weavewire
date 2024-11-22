import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import SplashPage from "./components/SplashPage/SplashPage";
import { csrfFetch } from "./util/csrfFetch";
import Feed from "./components/Feed/Feed";

if (import.meta.env.MODE !== "production") {
  (window as any).csrfFetch = csrfFetch;
}

function App() {
  function Layout() {
    return <Outlet />;
  }

  const router = createBrowserRouter([
    {
      element: <Layout />,
      path: "/",
      children: [
        {
          index: true,
          element: <SplashPage />,
        },
        {
          path: "/feed",
          element: <Feed />,
        }
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
