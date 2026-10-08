import { SignOut, type Icon } from "phosphor-react";
import { NavLink, useNavigate } from "react-router";
import { useSession } from "../../queries/useSession";
import { authService } from "../../services/auth.service";
import { cn } from "../../utils/cn";
import { toTitle } from "../../utils/format";
import { Button } from "../shared/Button";

export type NavOption = {
  label: string;
  path: string;
  icon: Icon;
  /** Count badge, e.g. items awaiting review. */
  badge?: number;
  end?: boolean;
};

type Props = {
  subtitle: string;
  options: NavOption[];
  roleLabel: string;
  footer?: React.ReactNode;
};

export default function SidePanel({
  subtitle,
  options,
  roleLabel,
  footer,
}: Props) {
  const session = useSession();
  const navigate = useNavigate();
  const user = session?.user;

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-1 max-lg:hidden">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-box bg-primary p-2">
          <img src="/icons/logo_dark.png" className="w-full" alt="" />
        </div>
        <div className="font-bold">OctaP</div>
        <div className="opacity-40">|</div>
        <div className="truncate">{subtitle}</div>
      </div>

      <div className="flex h-4 items-center justify-center">
        <div className="w-6/10 border-b border-primary"></div>
      </div>

      <nav className="space-y-1">
        {options.map((opt) => (
          <NavLink key={opt.path} to={opt.path} end={opt.end}>
            {({ isActive }) => (
              <span
                className={cn(
                  "btn btn-block justify-between p-4",
                  isActive ? "btn-primary" : "btn-ghost btn-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  {opt.label}
                  {!!opt.badge && (
                    <span
                      className={cn(
                        "badge badge-sm",
                        isActive ? "badge-neutral" : "badge-primary",
                      )}
                    >
                      {opt.badge}
                    </span>
                  )}
                </span>
                <opt.icon size="1.8em" weight={isActive ? "fill" : "regular"} />
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1"></div>

      {footer}

      <div className="flex items-center gap-4 rounded-box bg-base-200 p-2">
        <img
          src={user?.avatarUrl}
          className="size-16 rounded-box object-cover"
          alt=""
        />
        <div className="min-w-0">
          <div className="text-sm">
            {user?.merchantRole
              ? `${roleLabel} · ${toTitle(user.merchantRole)}`
              : roleLabel}
          </div>
          <div className="truncate font-bold">{user?.displayName}</div>
          <div className="truncate text-xs italic opacity-67">
            {user?.email}
          </div>
        </div>
      </div>

      <Button
        className="btn-block btn-soft btn-error justify-between"
        onClick={() =>
          authService.logout().then(() => navigate("/login", { replace: true }))
        }
      >
        Log-out
        <SignOut size="1.8em" />
      </Button>
    </aside>
  );
}
