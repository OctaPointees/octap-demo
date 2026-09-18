import type { ReactNode } from "react";
import { Outlet } from "react-router";
import MockApiConsole from "../dev/MockApiConsole";
import MainToolbar, { type SearchResult } from "./MainToolbar";
import SidePanel, { type NavOption } from "./SidePanel";

type Props = {
  subtitle: string;
  roleLabel: string;
  nav: NavOption[];
  useSearch: (q: string) => { data?: SearchResult[]; isFetching: boolean };
  searchPlaceholder?: string;
  sideFooter?: ReactNode;
};

export default function PortalLayout({ subtitle, roleLabel, nav, useSearch, searchPlaceholder, sideFooter }: Props) {
  return (
    <div className="app-wrapper flex gap-2 p-4">
      <SidePanel subtitle={subtitle} options={nav} roleLabel={roleLabel} footer={sideFooter} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MainToolbar nav={nav} useResults={useSearch} placeholder={searchPlaceholder} actions={<MockApiConsole />} />
        <main className="min-h-0 w-full flex-1 overflow-y-auto rounded-box bg-base-200 p-4 md:p-6">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
