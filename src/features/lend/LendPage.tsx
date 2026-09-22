import React from "react";
import { useLendReserves } from "@/data/hooks";
import { formatCurrency } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Info } from "lucide-react";

export const LendPage: React.FC = () => {
  const { reserves, totalSupplied, totalBorrowed } = useLendReserves();

  const netLiquidity = parseFloat(totalSupplied) - parseFloat(totalBorrowed);
  const aggregateUtilization =
    parseFloat(totalSupplied) > 0
      ? (parseFloat(totalBorrowed) / parseFloat(totalSupplied)) * 100
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SectionHeader
        tag="Lending Protocol"
        title="SomniaLend Reserves & Markets"
        description="Transparent tracking of assets supplied, borrowed, and earning yield on SomniaLend via dreamDEX."
        action={<StatusBadge source="on-chain" />}
      />

      <div className="p-5 rounded-lg border border-border bg-surface-1 space-y-2">
        <div className="flex items-center gap-2 text-text-primary text-sm font-semibold">
          <Info className="w-4 h-4" />
          <span>Architectural Scope & TVL Boundary Notice</span>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed font-sans">
          dreamDEX Lend is a frontend interface over SomniaLend's shared on-chain lending pools.
          The supplied collateral and borrowed amounts tracked on this page represent money-market reserves.
          They are distinct from dreamDEX spot trading order book depth and are never aggregated into spot CLOB TVL.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg border border-border bg-surface-1 font-mono">
          <div className="text-[11px] uppercase text-text-muted">Total Supplied</div>
          <div className="text-2xl font-semibold text-text-primary mt-1">
            {formatCurrency(totalSupplied, { compact: false })}
          </div>
          <div className="text-[10px] text-text-faint mt-1">Earning supply interest</div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface-1 font-mono">
          <div className="text-[11px] uppercase text-text-muted">Total Borrowed</div>
          <div className="text-2xl font-semibold text-text-primary mt-1">
            {formatCurrency(totalBorrowed, { compact: false })}
          </div>
          <div className="text-[10px] text-text-faint mt-1">Active debt obligations</div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface-1 font-mono">
          <div className="text-[11px] uppercase text-text-muted">Available Liquidity</div>
          <div className="text-2xl font-semibold text-text-primary mt-1">
            {formatCurrency(netLiquidity, { compact: false })}
          </div>
          <div className="text-[10px] text-text-faint mt-1">Unborrowed reserve buffer</div>
        </div>
        <div className="p-5 rounded-lg border border-border bg-surface-1 font-mono">
          <div className="text-[11px] uppercase text-text-muted">Aggregate Utilization</div>
          <div className="text-2xl font-semibold text-text-primary mt-1">
            {aggregateUtilization.toFixed(1)}%
          </div>
          <div className="text-[10px] text-text-faint mt-1">Capital efficiency ratio</div>
        </div>
      </div>

      <DataPanel
        title="Asset Reserve Breakdown"
        subtitle="Individual lending pool health and current interest rates"
        meta={{
          source: "on-chain",
          updatedAt: new Date().toISOString(),
          sourceEndpoint: "SomniaLend Pool Contracts",
        }}
        noPadding
      >
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-border-subtle bg-surface-2 text-text-muted font-mono uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-medium">Asset</th>
              <th className="py-3 px-4 font-medium text-right">Total Supplied</th>
              <th className="py-3 px-4 font-medium text-right">Total Borrowed</th>
              <th className="py-3 px-4 font-medium text-right">Utilization</th>
              <th className="py-3 px-4 font-medium text-right">Supply APY</th>
              <th className="py-3 px-4 font-medium text-right">Borrow APY</th>
              <th className="py-3 px-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle font-mono">
            {reserves.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted">
                  Reserve balances for SomniaLend require on-chain contract indexing. Telemetry is currently awaiting data.
                </td>
              </tr>
            ) : (
              reserves.map((r) => (
                <tr key={r.asset} className="hover:bg-surface-2/60 transition-colors">
                <td className="py-3.5 px-4 font-sans font-medium text-text-primary">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-surface-3 border border-border flex items-center justify-center font-mono text-xs">
                      {r.asset.slice(0, 1)}
                    </span>
                    <div>
                      <div>{r.symbol}</div>
                      <div className="text-[10px] text-text-faint font-normal">{r.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right text-text-primary font-medium">
                  {formatCurrency(r.suppliedUsd, { compact: true })}
                </td>
                <td className="py-3.5 px-4 text-right text-text-secondary">
                  {formatCurrency(r.borrowedUsd, { compact: true })}
                </td>
                <td className="py-3.5 px-4 text-right text-text-secondary">
                  {(r.utilizationRate * 100).toFixed(1)}%
                </td>
                <td className="py-3.5 px-4 text-right font-medium text-text-primary">
                  {r.supplyApy.toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right text-text-muted">
                  {r.borrowApy.toFixed(2)}%
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-surface-2 text-text-secondary uppercase">
                    {r.reserveStatus}
                  </span>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </DataPanel>
    </div>
  );
};
