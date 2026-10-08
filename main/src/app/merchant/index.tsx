import { Code, Gear, Layout, Megaphone, Receipt, Storefront, Ticket, UsersThree } from "phosphor-react";
import PortalLayout from "../../components/layout/PortalLayout";
import type { SearchResult } from "../../components/layout/MainToolbar";
import type { NavOption } from "../../components/layout/SidePanel";
import { useMembers, useMerchantTenant } from "../../queries/merchant";
import { useSession } from "../../queries/useSession";
import { hasMerchantRole } from "../../services/session";
import { toTitle } from "../../utils/format";

function useMerchantSearch(q: string) {
  const active = q.trim().length >= 2;
  const members = useMembers(q, active);
  const data: SearchResult[] | undefined = active
    ? members.data?.slice(0, 8).map((m) => ({
        id: m.id,
        type: "member",
        title: m.displayName,
        subtitle: `${m.phone} · ${toTitle(m.tier)} · ${m.balance.toLocaleString()} pts`,
        to: `/merchant/members?member=${m.id}`,
      }))
    : [];
  return { data, isFetching: active && members.isFetching };
}

export default function MerchantLayout() {
  const role = useSession()?.user.merchantRole;
  const tenant = useMerchantTenant().data;

  const nav: NavOption[] = [
    { label: "Dashboard", path: "/merchant", icon: Layout, end: true },
    { label: "Issue points", path: "/merchant/pos", icon: Storefront },
    { label: "Campaigns", path: "/merchant/campaigns", icon: Megaphone },
    { label: "Rewards", path: "/merchant/rewards", icon: Ticket },
    { label: "Members", path: "/merchant/members", icon: UsersThree },
    { label: "Transactions", path: "/merchant/transactions", icon: Receipt },
    ...(hasMerchantRole(role, "manager") ? [{ label: "Developers", path: "/merchant/developers", icon: Code }] : []),
    { label: "Settings", path: "/merchant/settings", icon: Gear },
  ];

  return (
    <PortalLayout
      subtitle={tenant?.name ?? "Merchant"}
      roleLabel="Merchant"
      nav={nav}
      useSearch={useMerchantSearch}
      searchPlaceholder="Search members by name, phone or address…"
      sideFooter={
        tenant && (
          <div className="mb-1 flex items-center gap-3 rounded-box border border-base-300 p-3">
            <div className="grid size-9 place-items-center rounded-box text-xs font-bold text-white" style={{ background: tenant.brandColor }}>
              {tenant.pointSymbol.slice(0, 2)}
            </div>
            <div className="min-w-0 text-xs">
              <div className="truncate font-semibold">{tenant.pointName}</div>
              <div className="opacity-60">
                {tenant.pointSymbol} · {toTitle(tenant.plan)} plan
              </div>
            </div>
          </div>
        )
      }
    />
  );
}
