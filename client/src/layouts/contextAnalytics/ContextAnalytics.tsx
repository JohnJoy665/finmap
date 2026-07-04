import { useLocation } from "react-router-dom";
import OperationsAnalytics from "../../features/dashboards/components/operationsAnalytics/OperationsAnalytics";
import UserSetupAnalytics from "../../features/dashboards/components/userSetupAnalytics/UserSetupAnalytics";
import SpendingsAnalytics from "../../features/dashboards/components/spendingsAnalytics/SpendingsAnalytics";
import AccountCreateAnalytics from "../../features/dashboards/components/accountCreateAnalytics/AccountCreateAnalytics";
import AccountSettingAnalytics from "../../features/dashboards/components/accountSettingAnalytics/AccountSettingAnalytics";

function ContextAnalytics() {
  const { pathname } = useLocation();

  if (pathname === "/app/user-setup") {
    return <UserSetupAnalytics />;
  }

  if (pathname === "/app/operations") {
    return <OperationsAnalytics />;
  }

  if (pathname === "/app/operations/spendings") {
    return <SpendingsAnalytics />;
  }

  if (pathname === "/app/accounts/create") {
    return <AccountCreateAnalytics />;
  }

  if (pathname === "/app/accounts/setting") {
    return <AccountSettingAnalytics />;
  }
}

export default ContextAnalytics;
