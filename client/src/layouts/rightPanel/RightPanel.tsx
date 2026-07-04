import Preview from "../../components/layouts/preview/Preview";
// import Analytics from "../../components/layouts/analytics/Analytics";
import { useAuthStore } from "../../store/authStore";
import ContextAnalytics from "../contextAnalytics/ContextAnalytics";

function RightPanel() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Preview />;
  }

  return <ContextAnalytics />;
}

export default RightPanel;
