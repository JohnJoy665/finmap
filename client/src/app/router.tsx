import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../components/login/Login";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import AppLayout from "../layouts/appLayout/AppLayout";
import Registration from "../components/registration/Registration";
import FreeRoute from "../components/freeRoute/FreeRoute";
import Purchase from "../components/purchasePanel/purchase/Purchase";

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
        element: <FreeRoute />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "registration",
            element: <Registration />,
          },
        ],
      },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/operations" replace />,
          },
          {
            element: <AppLayout />,
            children: [
              {
                path: "operations",
                element: <Operations />,
              },
              {
                path: "operations/purchase",
                element: <Purchase />
              }
            ],
          },
        ],
      },
    ],
  },
]);
