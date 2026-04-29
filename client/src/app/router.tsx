import { createBrowserRouter, Navigate } from "react-router-dom";

import Login from "../components/login/Login";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";
import AppLayout from "../layouts/appLayout/AppLayout";
import Registeration from "../components/registeration/Registeration";

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
        path: "registeration",
        element: <Registeration />,
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
