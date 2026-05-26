import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./routers/ProtectedRoute";
import WorkspaceLayout from "../layouts/workspaceLayout/WorkspaceLayout";
import FreeRoute from "./routers/FreeRoute";
import MainLayout from "../layouts/mainLayout/MainLayout";
import LoginPage from "../pages/login/LoginPage";
import RegistrationPage from "../pages/registration/RegistrationPage";
import OperationsPage from "../pages/operations/OperationsPage";
import SpendingsPage from "../pages/spendings/SpendingsPage";
import ProfileGate from "./routers/ProfileGate";
import UserSetupPage from "../pages/UserSetup/UserSetupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
            element: <LoginPage />,
          },
          {
            path: "registration",
            element: <RegistrationPage />,
          },
        ],
      },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProfileGate />,
            children: [
              {
                path: "user-setup",
                element: <UserSetupPage />,
              },
              {
                index: true,
                element: <Navigate to="/app/operations" replace />,
              },
              {
                element: <WorkspaceLayout />,
                children: [
                  {
                    path: "operations",
                    element: <OperationsPage />,
                  },
                  {
                    path: "operations/spendings",
                    element: <SpendingsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
