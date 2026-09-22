import React from "react";
import {
  MAINNET_CHAIN_ID,
  MAINNET_ROUTER_CONTRACTS,
  MAINNET_SPOT_MARKETS,
  SPOT_EVENT_TOPICS,
} from "@/data/dreamdex/contracts/registry";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { ExternalLink, Copy, Check } from "lucide-react";

export const DevelopersPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <SectionHeader
        tag="Developer Documentation"
        title="Smart Contracts & Protocol Integration"
        description="Verified contract addresses, event topic0 hashes, and developer API references for dreamDEX on Somnia."
      />

      <DataPanel
        title={`Somnia Mainnet (Chain ID ${MAINNET_CHAIN_ID})`}
        subtitle="Canonical SpotPool and SpotRouter contracts deployed on mainnet"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-mono uppercase text-text-muted font-semibold mb-3">
              Spot Router & Infrastructure
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(MAINNET_ROUTER_CONTRACTS).map(([name, addr]) => (
                <div key={name} className="p-3.5 rounded bg-surface-2 border border-border-subtle font-mono text-xs">
                  <div className="text-text-muted text-[10px] uppercase">{name}</div>
                  <div className="text-text-primary text-[11px] mt-1 break-all flex items-center justify-between">
                    <span>{addr}</span>
                    <button
                      onClick={() => copyToClipboard(addr, `mainnet-${name}`)}
                      className="text-text-muted hover:text-text-primary ml-2 shrink-0"
                      title="Copy Address"
                    >
                      {copiedKey === `mainnet-${name}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-mono uppercase text-text-muted font-semibold mb-3">
              Live Spot Pools
            </h4>
            <div className="border border-border-subtle bg-surface-2 rounded overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
                    <th className="py-2.5 px-4">Market</th>
                    <th className="py-2.5 px-4">SpotPool Address</th>
                    <th className="py-2.5 px-4">Stop Order Registry</th>
                    <th className="py-2.5 px-4 text-right">Explorer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/50">
                  {MAINNET_SPOT_MARKETS.map((m) => (
                    <tr key={m.symbol}>
                      <td className="py-2.5 px-4 font-sans font-medium text-text-primary">{m.symbol}</td>
                      <td className="py-2.5 px-4 text-text-secondary">{m.spotPoolAddress}</td>
                      <td className="py-2.5 px-4 text-text-faint">{m.stopRegistryAddress}</td>
                      <td className="py-2.5 px-4 text-right">
                        <a
                          href={`https://somniascan.com/address/${m.spotPoolAddress}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-text-secondary hover:text-text-primary inline-flex items-center gap-1"
                        >
                          <span>Scan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DataPanel>

      <DataPanel
        title="SpotPool Contract Events"
        subtitle="Event topic0 hashes for blockchain indexers and log listeners"
      >
        <div className="border border-border-subtle bg-surface-2 rounded overflow-hidden">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted text-[10px] uppercase">
                <th className="py-2.5 px-4">Event</th>
                <th className="py-2.5 px-4">Topic0 Signature Hash</th>
                <th className="py-2.5 px-4 text-right">Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {Object.entries(SPOT_EVENT_TOPICS).map(([name, hash]) => (
                <tr key={name}>
                  <td className="py-2.5 px-4 font-sans font-medium text-text-primary">{name}</td>
                  <td className="py-2.5 px-4 text-text-secondary break-all">{hash}</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => copyToClipboard(hash, `topic-${name}`)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      {copiedKey === `topic-${name}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>

      <DataPanel
        title="Public API Endpoints"
        subtitle="Direct access endpoints for external tools, CCXT, and algorithmic agents"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="p-3.5 rounded bg-surface-2 border border-border-subtle">
            <div className="flex items-center justify-between text-text-muted mb-1">
              <span>REST API Base (Production)</span>
              <span className="text-[10px] uppercase bg-surface-3 px-1.5 py-0.5 rounded">HTTP GET</span>
            </div>
            <div className="text-text-primary text-sm font-semibold">https://api.dreamdex.io/v0</div>
          </div>

          <div className="p-3.5 rounded bg-surface-2 border border-border-subtle">
            <div className="flex items-center justify-between text-text-muted mb-1">
              <span>WebSocket Public Stream</span>
              <span className="text-[10px] uppercase bg-surface-3 px-1.5 py-0.5 rounded">WSS Public</span>
            </div>
            <div className="text-text-primary text-sm font-semibold">wss://api.dreamdex.io/v0/ws/public</div>
          </div>

          <div className="p-3.5 rounded bg-surface-2 border border-border-subtle">
            <div className="flex items-center justify-between text-text-muted mb-1">
              <span>Somnia JSON-RPC Endpoint</span>
              <span className="text-[10px] uppercase bg-surface-3 px-1.5 py-0.5 rounded">EVM RPC</span>
            </div>
            <div className="text-text-primary text-sm font-semibold">https://dream-rpc.somnia.network</div>
          </div>
        </div>
      </DataPanel>
    </div>
  );
};
