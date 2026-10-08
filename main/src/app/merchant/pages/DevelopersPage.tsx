import { Checkbox } from "@base-ui/react/checkbox";
import { Form } from "@base-ui/react/form";
import { Tabs } from "@base-ui/react/tabs";
import { Check, Key, Plus, Robot, Warning } from "phosphor-react";
import { useState } from "react";
import { Button } from "../../../components/shared/Button";
import { CopyButton, FormField, Segmented, Switch, TextInput } from "../../../components/shared/Controls";
import { Card, EmptyState, ErrorState, LoadingBlock, PageHeader, StatusBadge } from "../../../components/shared/Display";
import { ConfirmDialog, Modal } from "../../../components/shared/Modal";
import { useApiKeys, useCreateApiKey, useMerchantTenant, useRevokeApiKey, useUpdateMcp } from "../../../queries/merchant";
import { useSession } from "../../../queries/useSession";
import { hasMerchantRole } from "../../../services/session";
import type { ApiKey, ApiScope, McpTool } from "../../../types/domain";
import { fieldErrorsOf } from "../../../utils/errors";
import { fmtCompact, fmtDate, fmtRelative, toTitle } from "../../../utils/format";
import { notify } from "../../../utils/toast";

const SCOPES: { value: ApiScope; description: string }[] = [
  { value: "points:earn", description: "Mint points at checkout" },
  { value: "points:redeem", description: "Burn points for rewards" },
  { value: "balances:read", description: "Read member balances" },
  { value: "members:read", description: "List members & history" },
  { value: "campaigns:read", description: "Read campaigns" },
  { value: "campaigns:write", description: "Create / change campaigns" },
];

const MCP_TOOLS: { tool: McpTool; description: string; risky?: boolean }[] = [
  { tool: "get_balance", description: "Look up a member's point balance by phone" },
  { tool: "list_campaigns", description: "List active and scheduled campaigns" },
  { tool: "list_rewards", description: "List redeemable rewards" },
  { tool: "get_member_history", description: "Read a member's transaction history" },
  { tool: "create_campaign", description: "Draft new campaigns (saved as draft)", risky: true },
  { tool: "issue_points", description: "Mint points to members — subject to mint cap", risky: true },
];

const tabClass =
  "cursor-pointer border-b-2 border-transparent px-1 pb-2 text-sm font-medium whitespace-nowrap opacity-60 outline-none hover:opacity-100 data-active:border-primary data-active:opacity-100";

function Code({ children }: { children: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-box bg-secondary p-4 text-xs leading-relaxed text-secondary-content">{children}</pre>
      <div className="absolute top-2 right-2 text-secondary-content">
        <CopyButton value={children} />
      </div>
    </div>
  );
}

function CreateKeyModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [env, setEnv] = useState<ApiKey["env"]>("test");
  const [scopes, setScopes] = useState<ApiScope[]>(["points:earn", "balances:read"]);
  const create = useCreateApiKey();
  const errors = fieldErrorsOf(create.error);
  const secret = create.data?.secret;

  if (secret) {
    return (
      <Modal open onOpenChange={(o) => !o && onClose()} title="Save your secret key" description="This is the only time the full key is shown. Store it in your server's secret manager." footer={<Button className="btn-primary" onClick={onClose}>I've saved it</Button>}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 rounded-box bg-base-200 p-3 font-mono text-xs break-all">
            <span className="flex-1">{secret}</span>
            <CopyButton value={secret} label="Copy" />
          </div>
          <div className="alert alert-warning alert-soft text-xs">
            <Warning size={16} /> Never embed this key in a mobile app or browser. Use it from your POS backend or server only.
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="Create API key"
      footer={
        <Button type="submit" form="key-form" className="btn-primary" disabled={create.isPending}>
          {create.isPending && <span className="loading loading-spinner loading-sm" />}
          Create key
        </Button>
      }
    >
      <Form
        id="key-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ name, env, scopes }, { onError: (err) => !Object.keys(fieldErrorsOf(err)).length && notify.error(err) });
        }}
      >
        <FormField label="Key name" error={errors.name}>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} invalid={!!errors.name} placeholder="e.g. District 1 POS terminals" />
        </FormField>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Environment</span>
          <Segmented size="md" value={env} onValueChange={setEnv} options={[{ label: "Test (Sui testnet)", value: "test" }, { label: "Live (mainnet)", value: "live" }]} />
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium">Scopes</legend>
          {SCOPES.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-3 rounded-field px-2 py-1.5 hover:bg-base-200">
              <Checkbox.Root
                checked={scopes.includes(s.value)}
                onCheckedChange={(c) => setScopes((prev) => (c ? [...prev, s.value] : prev.filter((x) => x !== s.value)))}
                className="flex size-5 shrink-0 items-center justify-center rounded border border-base-300 data-checked:border-primary data-checked:bg-primary"
              >
                <Checkbox.Indicator className="text-primary-content">
                  <Check size={14} weight="bold" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="font-mono text-xs">{s.value}</span>
              <span className="text-xs opacity-60">{s.description}</span>
            </label>
          ))}
          {errors.scopes && <span className="text-xs text-error">{errors.scopes}</span>}
        </fieldset>
      </Form>
    </Modal>
  );
}

export default function DevelopersPage() {
  const tenant = useMerchantTenant().data;
  const isOwner = hasMerchantRole(useSession()?.user.merchantRole, "owner");
  const keys = useApiKeys();
  const revoke = useRevokeApiKey();
  const mcp = useUpdateMcp();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  const mcpBlocked = tenant?.plan === "starter";

  return (
    <>
      <PageHeader title="Developers" description="Integrate OctaP into your POS, e-commerce backend or AI agents. Keys are scoped to your tenant only." />
      {!isOwner && <div className="alert alert-info alert-soft text-sm">Only the workspace owner can create keys or change MCP permissions.</div>}

      <Tabs.Root defaultValue="keys" className="flex flex-col gap-4">
        <Tabs.List className="flex gap-6 overflow-x-auto border-b border-base-300">
          <Tabs.Tab value="keys" className={tabClass}>API keys</Tabs.Tab>
          <Tabs.Tab value="sdk" className={tabClass}>SDK quickstart</Tabs.Tab>
          <Tabs.Tab value="mcp" className={tabClass}>MCP server</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="keys" className="flex flex-col gap-4">
          {isOwner && (
            <Button className="btn-primary self-end" onClick={() => setCreating(true)}>
              <Plus /> Create key
            </Button>
          )}
          {keys.error && <ErrorState error={keys.error} onRetry={keys.refetch} />}
          {keys.isLoading && <LoadingBlock rows={2} />}
          {keys.data?.length === 0 && <EmptyState icon={Key} title="No API keys" description="Create a test key to start integrating." />}
          <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
            <table className="table">
              <thead>
                <tr><th>Name</th><th>Key</th><th>Scopes</th><th>Usage (30d)</th><th>Last used</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {keys.data?.map((k) => (
                  <tr key={k.id}>
                    <td>
                      <div className="font-medium">{k.name}</div>
                      <div className="text-xs opacity-60">Created {fmtDate(k.createdAt)}</div>
                    </td>
                    <td className="font-mono text-xs">
                      {k.prefix}_••••
                      <span className={`badge badge-xs ml-2 ${k.env === "live" ? "badge-primary" : "badge-ghost"}`}>{k.env}</span>
                    </td>
                    <td>
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {k.scopes.map((s) => <span key={s} className="badge badge-ghost badge-xs font-mono">{s}</span>)}
                      </div>
                    </td>
                    <td className="text-sm">{fmtCompact(k.requests30d)}</td>
                    <td className="text-xs">{k.lastUsedAt ? fmtRelative(k.lastUsedAt) : "Never"}</td>
                    <td><StatusBadge status={k.status} /></td>
                    <td>{isOwner && k.status === "active" && <Button className="btn-ghost btn-xs text-error" onClick={() => setRevoking(k)}>Revoke</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="sdk" className="grid gap-4 xl:grid-cols-2">
          <Card title="1. Install">
            <Code>{`npm install @octap/sdk`}</Code>
            <p className="mt-3 text-sm opacity-70">The SDK wraps Enoki sponsored transactions — your servers never hold SUI or sign blockchain transactions.</p>
          </Card>
          <Card title="2. Initialise">
            <Code>{`import { OctaP } from "@octap/sdk";

export const octap = new OctaP({
  apiKey: process.env.OCTAP_API_KEY!,   // ocp_live_… / ocp_test_…
  tenant: "${tenant?.slug ?? "your-tenant"}",
});`}</Code>
          </Card>
          <Card title="3. Earn at checkout">
            <Code>{`const receipt = await octap.points.earn({
  phone: "+84901234567",
  amount: 250_000,            // VND
  orderId: "POS-1042",        // idempotency key
});
// → { points: ${(tenant?.earnRate ?? 1) * 25}, balance, txDigest }`}</Code>
          </Card>
          <Card title="4. Redeem with zkLogin consent">
            <Code>{`// In the member-facing app (consumer SDK)
const session = await octap.wallet.signIn({ phone });
const { voucher } = await session.redeem({
  rewardId: "rwd_…",
});
// voucher.code → "ABCD-EFGH-JKLM"`}</Code>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="mcp" className="grid gap-4 xl:grid-cols-5">
          <Card title="Agent access" className="xl:col-span-3">
            {mcpBlocked && (
              <div className="alert alert-warning alert-soft mb-4 text-sm">
                <Warning size={18} /> The MCP server is available on Growth and Enterprise plans.
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div className="rounded-box bg-base-200 p-3">
                <Switch
                  checked={!!tenant?.mcp.enabled}
                  disabled={!isOwner || mcpBlocked || mcp.isPending}
                  onCheckedChange={(c) => mcp.mutate({ enabled: c }, { onSuccess: () => notify.success(c ? "MCP server enabled" : "MCP server disabled"), onError: (e) => notify.error(e) })}
                  label="Enable MCP server"
                  description="Let AI agents and chatbots call OctaP tools on behalf of your tenant."
                />
              </div>
              <div className="flex flex-col divide-y divide-base-300">
                {MCP_TOOLS.map((t) => (
                  <div key={t.tool} className="py-3">
                    <Switch
                      checked={!!tenant?.mcp.tools[t.tool]}
                      disabled={!isOwner || mcpBlocked || !tenant?.mcp.enabled || mcp.isPending}
                      onCheckedChange={(c) => mcp.mutate({ tool: t.tool, toolEnabled: c }, { onError: (e) => notify.error(e) })}
                      label={
                        <span className="flex items-center gap-2 font-mono">
                          {t.tool}
                          {t.risky && <span className="badge badge-warning badge-soft badge-xs font-sans">write</span>}
                        </span>
                      }
                      description={t.description}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card title="Connect an agent" className="xl:col-span-2">
            <div className="flex flex-col gap-3 text-sm">
              <p className="opacity-70">Add OctaP to any MCP-compatible client. Tool calls are authorised by RBAC and logged in your audit trail.</p>
              <Code>{`{
  "mcpServers": {
    "octap": {
      "url": "https://mcp.octap.io/${tenant?.slug ?? "tenant"}",
      "headers": {
        "Authorization": "Bearer <ocp_live_key>"
      }
    }
  }
}`}</Code>
              <div className="flex items-center gap-2 rounded-box bg-base-200 p-3 text-xs">
                <Robot size={18} />
                <span>
                  {tenant?.mcp.enabled ? `${Object.values(tenant.mcp.tools).filter(Boolean).length} of ${MCP_TOOLS.length} tools exposed` : "Server disabled"} · plan: {toTitle(tenant?.plan ?? "")}
                </span>
              </div>
            </div>
          </Card>
        </Tabs.Panel>
      </Tabs.Root>

      {creating && <CreateKeyModal onClose={() => setCreating(false)} />}
      <ConfirmDialog
        open={!!revoking}
        onOpenChange={(o) => !o && setRevoking(null)}
        title="Revoke API key?"
        description={`Requests using “${revoking?.name}” (${revoking?.prefix}_••••) will be rejected immediately. This cannot be undone.`}
        confirmLabel="Revoke key"
        tone="error"
        loading={revoke.isPending}
        onConfirm={() => revoking && revoke.mutate(revoking.id, { onSuccess: () => { notify.success("Key revoked"); setRevoking(null); }, onError: (e) => notify.error(e) })}
      />
    </>
  );
}
