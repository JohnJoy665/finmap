import { useLocation } from "react-router-dom";
import Preview from "../components/preview/Preview";
import Analytics from "../components/analytics/Analytics";

function RightPanel() {
  const { pathname } = useLocation();

  if (pathname.includes("login") || pathname.includes("registration")) {
    return <Preview />;
  }

  if (pathname.includes("operations")) {
    return <Analytics />;
  }

  return null;
}

export default RightPanel