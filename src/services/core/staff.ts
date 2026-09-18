import type { StaffAccount } from "../../types/domain";

export type PublicStaff = Omit<StaffAccount, "password">;

/** Never let the (mock) password leave the "server". */
export function toPublicStaff(account: StaffAccount): PublicStaff {
  const copy: Partial<StaffAccount> = { ...account };
  delete copy.password;
  return copy as PublicStaff;
}
