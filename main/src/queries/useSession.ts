import { useSyncExternalStore } from "react";
import { sessionStore } from "../services/session";
import { walletSession } from "../services/wallet.service";

export function useSession() {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
}

export function useWalletSession() {
  return useSyncExternalStore(walletSession.subscribe, walletSession.get);
}
