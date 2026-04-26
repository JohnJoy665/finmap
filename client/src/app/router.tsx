import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../components/login/Login";
import Register from "../components/register/Register";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import AppLayout from "../layouts/appLayout/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: "operations",
                element: <Operations />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
