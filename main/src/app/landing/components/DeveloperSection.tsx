import { useState } from 'react';
import { TerminalWindow, Copy, Check, Play, FileCode, CheckCircle, Cpu } from 'phosphor-react';
import type { Language } from '../types';
import { DICTIONARY } from '../content';

interface DeveloperSectionProps {
  lang: Language;
}

const SNIPPETS = {
  earn: `import { OctaPClient } from '@octap/sdk';

// 1. Initialize client with merchant API credentials
const octap = new OctaPClient({
  apiKey: process.env.OCTAP_MERCHANT_KEY,
  tenantId: 'lotus-mart',
  network: 'mainnet',
  sponsorGas: true, // OctaP sponsors 100% of execution gas
});

// 2. Issue points automatically upon cashier POS checkout
const result = await octap.points.issue({
  customerPhone: '+84901234567',
  billAmountVnd: 350000,
  billReference: 'LTM-2026-8842',
  posTerminalId: 'POS-Q1-04',
});

console.log(\`Points issued: \${result.pointsAwarded} Petals\`);
console.log(\`Sui Consensus Digest: \${result.suiDigest}\`);`,

  redeem: `import { OctaPClient } from '@octap/sdk';

const octap = new OctaPClient({ apiKey: process.env.OCTAP_API_KEY });

// Customer authorizes redemption using zero-knowledge phone consent
const voucher = await octap.vouchers.redeem({
  customerPhone: '+84901234567',
  rewardId: 'rew_lotus_grocery_50k',
  requiredPoints: 500,
  zkSignature: userZkConsentProof,
});

// Minted unique one-time barcode ready for in-store scanning
console.log('Barcode for Cashier:', voucher.barcode);
console.log('Voucher Object ID on Sui:', voucher.suiObjectId);`,

  mcp: `// Model Context Protocol (MCP) tool call payload for AI Agents
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "octap_query_member_and_recommend",
    "arguments": {
      "tenantId": "lotus-mart",
      "customerPhone": "+84901234567",
      "currentCartValue": 420000,
      "context": "Customer is checking out with fresh organic vegetables"
    }
  }
}

// AI Agent receives semantic context with isolated RBAC bounds
// Response: { balance: 2480, tier: "Gold (1.5x)", eligibleVoucher: "VOUCHER_VEG_20K" }`,

  verify: `import { SuiClient } from '@mysten/sui/client';

const sui = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });

// Publicly verify that points were minted in the merchant's isolated treasury
const tx = await sui.getTransactionBlock({
  digest: '8FkQ7xAmW3zL9b2pC4yD1m8n6K5jH2vF9a4s7Q',
  options: { showEffects: true, showEvents: true, showObjectChanges: true },
});

// Verify zero balance tampering & mathematical consensus
const isTamperProof = tx.effects?.status.status === 'success';
console.log('Sui Checkpoint Verified:', tx.checkpoint);
console.log('Gas Paid by End-User:', 0); // 100% sponsored`,
};

export const DeveloperSection = ({ lang }: DeveloperSectionProps) => {
  const d = DICTIONARY[lang].developers;
  const [activeTab, setActiveTab] = useState<'earn' | 'redeem' | 'mcp' | 'verify'>('earn');
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRunSimulation = () => {
    setIsRunning(true);
    setRunOutput(null);

    setTimeout(() => {
      let outputData: Record<string, unknown>;
      if (activeTab === 'earn') {
        outputData = {
          status: 'SUCCESS',
          statusCode: 200,
          tenant: 'lotus-mart',
          customer: '+84901234567',
          billReference: 'LTM-2026-8842',
          billAmount: 350000,
          pointsAwarded: 35,
          activeBalance: 2515,
          tierMultiplier: '1.0x (Standard)',
          suiDigest: '8FkQ7xAmW3zL9b2pC4yD1m8n6K5jH2vF9a4s7Q',
          checkpoint: 14829320,
          gasSponsored: true,
          executionTimeMs: 382,
        };
      } else if (activeTab === 'redeem') {
        outputData = {
          status: 'VOUCHER_MINTED',
          voucherCode: 'LTM-50K-8921-9923',
          rewardTitle: 'Phiếu mua hàng 50.000 ₫',
          pointsDeducted: 500,
          remainingBalance: 2015,
          validUntil: '2026-12-31T23:59:59Z',
          suiObjectId: '0x8f2a...991c::voucher_object',
          qrPayload: 'octap://redeem/lotus-mart/LTM-50K-8921-9923',
          executionTimeMs: 395,
        };
      } else if (activeTab === 'mcp') {
        outputData = {
          jsonrpc: '2.0',
          id: 'call_mcp_8912',
          result: {
            content: [
              {
                type: 'text',
                text: 'Member Minh Anh is Gold Tier (1.5x Multiplier). Current balance: 2,480 Petals. Based on cart value 420.000 ₫, member will earn +63 Petals today. Recommended instant reward: 20.000 ₫ Fresh Veggies Voucher for 200 Petals.',
              },
            ],
            isError: false,
          },
        };
      } else {
        outputData = {
          checkpoint: 14829320,
          epoch: 382,
          consensusStatus: 'FINALIZED',
          bftSignaturesCount: 104,
          isolatedTreasury: '0x8f2a...ltm::treasury::Coin',
          gasSponsoredBy: '0xoctap_relayer_01',
          tamperEvidence: 'NONE · Mathematical proof intact',
        };
      }

      setRunOutput(JSON.stringify(outputData, null, 2));
      setIsRunning(false);
    }, 550);
  };

  return (
    <section id="developers" className="scroll-mt-20 border-b border-[var(--line)] bg-[var(--surface)] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-primary">{d.secNum}</span>
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--muted)]">
              {lang === 'en' ? 'Turnkey Tooling' : 'Công Cụ Tích Hợp'}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--ink)] tracking-tight">
            {d.title}
          </h2>
          <p className="mt-4 text-base text-[var(--ink-2)] leading-relaxed">
            {d.subtitle}
          </p>
        </div>

        {/* IDE & Code Playground Window */}
        <div className="mt-12 rounded-2xl border border-[var(--line)] bg-[var(--ground)] shadow-xl overflow-hidden">
          {/* Top Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5">
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => {
                  setActiveTab('earn');
                  setRunOutput(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                  activeTab === 'earn'
                    ? 'bg-[var(--surface)] text-primary shadow-xs border border-[var(--line)]'
                    : 'text-[var(--ink-2)] hover:text-primary'
                }`}
              >
                <FileCode size={14} />
                <span>{d.tabs.earn}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('redeem');
                  setRunOutput(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                  activeTab === 'redeem'
                    ? 'bg-[var(--surface)] text-primary shadow-xs border border-[var(--line)]'
                    : 'text-[var(--ink-2)] hover:text-primary'
                }`}
              >
                <FileCode size={14} />
                <span>{d.tabs.redeem}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('mcp');
                  setRunOutput(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                  activeTab === 'mcp'
                    ? 'bg-[var(--surface)] text-primary shadow-xs border border-[var(--line)]'
                    : 'text-[var(--ink-2)] hover:text-primary'
                }`}
              >
                <Cpu size={14} />
                <span>{d.tabs.mcp}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('verify');
                  setRunOutput(null);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                  activeTab === 'verify'
                    ? 'bg-[var(--surface)] text-primary shadow-xs border border-[var(--line)]'
                    : 'text-[var(--ink-2)] hover:text-primary'
                }`}
              >
                <CheckCircle size={14} />
                <span>{d.tabs.verify}</span>
              </button>
            </div>

            {/* Actions: Copy & Run */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-mono text-[var(--ink-2)] hover:border-primary hover:text-primary transition-colors shadow-xs"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copied ? (lang === 'en' ? 'Copied' : 'Đã sao chép') : (lang === 'en' ? 'Copy' : 'Chép mã')}</span>
              </button>

              <button
                onClick={handleRunSimulation}
                disabled={isRunning}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1 text-xs font-mono font-semibold text-white hover:bg-[#830250] transition-colors shadow-xs disabled:opacity-70 cursor-pointer"
              >
                {isRunning ? (
                  <span className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play size={12} weight="fill" />
                )}
                <span>{d.btnRun}</span>
              </button>
            </div>
          </div>

          {/* Code View & Live Output Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)]">
            {/* Left: Code Box */}
            <div className="lg:col-span-7 p-4 sm:p-5 bg-[var(--ground)] overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed text-[var(--ink)]">
                <code>{SNIPPETS[activeTab]}</code>
              </pre>
            </div>

            {/* Right: Simulated Terminal Response */}
            <div className="lg:col-span-5 p-4 sm:p-5 bg-[var(--surface-2)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-[var(--ink-2)]">
                    <TerminalWindow size={16} className="text-primary" />
                    <span>{d.outputTitle}</span>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                    Sui RPC 200 OK
                  </span>
                </div>

                {runOutput ? (
                  <pre className="font-mono text-[11px] leading-relaxed text-emerald-900 bg-white/80 p-3 rounded-lg border border-[var(--line)] overflow-x-auto animate-fadeIn">
                    <code>{runOutput}</code>
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--muted)]">
                    <Play size={28} className="opacity-40 mb-2" />
                    <span className="font-mono text-xs">
                      {lang === 'en'
                        ? 'Click "Execute SDK Simulation" to test response'
                        : 'Bấm "Mô phỏng Lời gọi SDK" để xem kết quả'}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
                <span>npm install @octap/sdk</span>
                <span>v1.2.0 · Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
