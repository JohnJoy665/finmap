import Preview from "../components/preview/Preview";
import Analytics from "../components/analytics/Analytics";
import { useAuthStore } from "../store/authStore";

function RightPanel() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Preview />;
  }

  return <Analytics />;
}

export default RightPanel;
