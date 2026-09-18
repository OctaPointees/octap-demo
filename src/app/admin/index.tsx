import { Gauge, HardDrive, Layout, Ticket, Users } from "phosphor-react";
import PortalLayout from "../../components/layout/PortalLayout";
import type { NavOption } from "../../components/layout/SidePanel";
import { useAdminRewards, useAdminSearch } from "../../queries/admin";

export default function AdminAppEntryPoint() {
  const pending = useAdminRewards("pending_review").data?.length;

  const nav: NavOption[] = [
    { label: "Dashboard", path: "/admin", icon: Layout, end: true },
    { label: "Metrics", path: "/admin/metrics", icon: Gauge },
    { label: "Partners", path: "/admin/partners", icon: Users },
    { label: "Vouchers", path: "/admin/vouchers", icon: Ticket, badge: pending },
    { label: "System Audit", path: "/admin/audit", icon: HardDrive },
  ];

  return (
    <PortalLayout
      subtitle="System Dashboard"
      roleLabel="Administrator"
      nav={nav}
      useSearch={useAdminSearch}
      searchPlaceholder="Search partners, rewards, tx digests…"
    />
  );
}
