import { createBrowserRouter } from "react-router-dom";
import Login from "../components/login/Login";
import Register from "../components/register/Register";
import Main from "../pages/main/Main";
import Operations from "../components/operations/Operations";
import ProtectedRoute from "../components/protectedRoute/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [{ 
        element: <Main />, 
        children: [{
            path: "operations",
            element: <Operations/>
        }] }],
  }, 
  {
    path: '/login',
    element: <Login/>,
  },
  {
    path: '/register',
    element: <Register/>
  }
]);
