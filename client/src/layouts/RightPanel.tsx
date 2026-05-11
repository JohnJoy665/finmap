import Preview from "../components/preview/Preview";
import Analytics from "../components/analytics/Analytics";
import { useUserStore } from "../store/userStore";

function RightPanel() {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Preview />;
  }

  return <Analytics />;
}

export default RightPanel;
