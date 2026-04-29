import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../components/login/Login";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import AppLayout from "../layouts/appLayout/AppLayout";
import Registration from "../components/registration/Registration";

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
        path: "registration",
        element: <Registration />,
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
