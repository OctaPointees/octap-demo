import { createBrowserRouter } from "react-router";
import AdminLayout from "./admin";
import AdminAuditPage from "./admin/pages/AuditPage";
import AdminDashboardPage from "./admin/pages/DashboardPage";
import AdminMetricsPage from "./admin/pages/MetricsPage";
import PartnerDetailPage from "./admin/pages/PartnerDetailPage";
import PartnersPage from "./admin/pages/PartnersPage";
import AdminVouchersPage from "./admin/pages/VouchersPage";
import AuthenticationEntryPoint from "./auth";
import { RequireRole, RootRedirect } from "./guards";
import MerchantLayout from "./merchant";
import CampaignsPage from "./merchant/pages/CampaignsPage";
import MerchantDashboardPage from "./merchant/pages/DashboardPage";
import DevelopersPage from "./merchant/pages/DevelopersPage";
import MembersPage from "./merchant/pages/MembersPage";
import PosPage from "./merchant/pages/PosPage";
import RewardsPage from "./merchant/pages/RewardsPage";
import SettingsPage from "./merchant/pages/SettingsPage";
import TransactionsPage from "./merchant/pages/TransactionsPage";
import NotFoundPage from "./NotFoundPage";
import WalletApp from "./wallet";

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/login", element: <AuthenticationEntryPoint /> },
  { path: "/wallet", element: <WalletApp /> },
  {
    element: <RequireRole role="admin" />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "metrics", element: <AdminMetricsPage /> },
          { path: "partners", element: <PartnersPage /> },
          { path: "partners/:id", element: <PartnerDetailPage /> },
          { path: "vouchers", element: <AdminVouchersPage /> },
          { path: "audit", element: <AdminAuditPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireRole role="merchant" />,
    children: [
      {
        path: "/merchant",
        element: <MerchantLayout />,
        children: [
          { index: true, element: <MerchantDashboardPage /> },
          { path: "pos", element: <PosPage /> },
          { path: "campaigns", element: <CampaignsPage /> },
          { path: "rewards", element: <RewardsPage /> },
          { path: "members", element: <MembersPage /> },
          { path: "transactions", element: <TransactionsPage /> },
          { path: "developers", element: <DevelopersPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
