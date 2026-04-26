import { createBrowserRouter } from "react-router-dom";
import Login from "../components/login/Login";
import Register from "../components/register/Register";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";

export const router = createBrowserRouter([
    {
      path: "/",
      element: <Main />,
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "operations", element: <Operations /> },
      ],
    },
  ]);
