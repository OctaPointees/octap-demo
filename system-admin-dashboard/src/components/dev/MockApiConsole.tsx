import { Dialog } from "@base-ui/react/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowCounterClockwise, Broadcast, Trash, X } from "phosphor-react";
import { useState, useSyncExternalStore } from "react";
import { resetDb } from "../../services/mock/db";
import { networkLog, settings, type NetworkEntry } from "../../services/mock/http";
import { cn } from "../../utils/cn";
import { notify } from "../../utils/toast";
import { ConfirmDialog } from "../shared/Modal";

const METHOD_TONE: Record<string, string> = {
  GET: "text-info",
  POST: "text-success",
  PUT: "text-warning",
  PATCH: "text-warning",
  DELETE: "text-error",
};

function EntryRow({ e }: { e: NetworkEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="border-b border-base-300 last:border-0">
      <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-xs hover:bg-base-200" onClick={() => setOpen(!open)}>
        <span className={cn("w-12 font-bold", METHOD_TONE[e.method])}>{e.method}</span>
        <span className="min-w-0 flex-1 truncate">{e.path}</span>
        <span className={cn("font-bold", e.status >= 400 ? "text-error" : "text-success")}>{e.status}</span>
        <span className="w-12 text-right opacity-50">{e.durationMs}ms</span>
      </button>
      {open && (
        <pre className="max-h-64 overflow-auto bg-base-200 px-3 py-2 text-[11px] leading-snug">
          {e.body !== undefined && `// request\n${JSON.stringify(e.body, null, 2)}\n\n`}
          {e.error ? `// error\n${e.error}` : `// response\n${JSON.stringify(e.response, null, 2)?.slice(0, 4000)}`}
        </pre>
      )}
    </li>
  );
}

/**
 * Developer drawer for the design draft: shows the pseudo-API traffic and
 * lets you tune latency / failure injection to preview loading & error states.
 */
export default function MockApiConsole() {
  const log = useSyncExternalStore(networkLog.subscribe, networkLog.snapshot);
  const qc = useQueryClient();
  const [latency, setLatency] = useState(settings.latency[1]);
  const [failure, setFailure] = useState(settings.failureRate);
  const [confirmReset, setConfirmReset] = useState(false);
  const errors = log.filter((e) => e.status >= 400).length;

  return (
    <Dialog.Root>
      <Dialog.Trigger className="btn btn-ghost gap-2" aria-label="Open mock API console">
        <Broadcast size={20} />
        <span className="hidden xl:inline">Mock API</span>
        {errors > 0 && <span className="badge badge-error badge-xs">{errors}</span>}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup className="fixed top-0 right-0 z-50 flex h-dvh w-full max-w-lg flex-col bg-base-100 shadow-2xl transition-transform duration-200 data-starting-style:translate-x-full data-ending-style:translate-x-full">
          <div className="flex items-center justify-between border-b border-base-300 p-4">
            <div>
              <Dialog.Title className="font-bold">Mock API console</Dialog.Title>
              <Dialog.Description className="text-xs opacity-60">
                No real server is contacted. Requests are served by in-browser pseudo services and persisted to localStorage.
              </Dialog.Description>
            </div>
            <Dialog.Close className="btn btn-ghost btn-sm btn-square" aria-label="Close">
              <X />
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-base-300 p-4 text-sm">
            <label className="flex flex-col gap-1">
              <span>Max latency: {latency}ms</span>
              <input
                type="range"
                className="range range-xs range-primary"
                min={50}
                max={3000}
                step={50}
                value={latency}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLatency(v);
                  settings.latency = [Math.min(v, Math.round(v * 0.35)), v];
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span>Failure injection: {Math.round(failure * 100)}%</span>
              <input
                type="range"
                className="range range-xs range-error"
                min={0}
                max={0.5}
                step={0.05}
                value={failure}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setFailure(v);
                  settings.failureRate = v;
                }}
              />
            </label>
            <div className="col-span-2 flex gap-2">
              <button className="btn btn-sm" onClick={() => networkLog.clear()}>
                <Trash /> Clear log
              </button>
              <button className="btn btn-sm btn-soft btn-warning" onClick={() => setConfirmReset(true)}>
                <ArrowCounterClockwise /> Reset demo data
              </button>
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {log.length === 0 && <li className="p-6 text-center text-sm opacity-60">No requests yet.</li>}
            {log.map((e) => (
              <EntryRow key={e.id} e={e} />
            ))}
          </ul>
        </Dialog.Popup>
      </Dialog.Portal>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset demo data?"
        description="All tenants, campaigns, transactions and audit events will be regenerated from the seed. Your session stays signed in."
        confirmLabel="Reset"
        tone="warning"
        onConfirm={() => {
          resetDb();
          qc.invalidateQueries();
          setConfirmReset(false);
          notify.success("Demo data reset");
        }}
      />
    </Dialog.Root>
  );
}
