import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import style from "./AppLayout.module.css"

function AppLayout() {
  return (
    <div className={style.wrapper}>
      <Header />
      <Outlet />
    </div>
  );
}

export default AppLayout;
