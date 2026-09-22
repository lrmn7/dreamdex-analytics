import React from "react";
import { useEventContracts } from "@/data/hooks";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DataPanel } from "@/components/ui/DataPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AlertCircle } from "lucide-react";

export const EventsPage: React.FC = () => {
  const { events } = useEventContracts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <SectionHeader
        tag="Outcome Markets"
        title="Event Contracts on Somnia"
        description="Binary outcome prediction contracts settled on-chain. Track real-world probabilities and contract liquidity."
        action={<StatusBadge source="on-chain" />}
      />

      <div className="p-4 rounded-lg border border-border-subtle bg-surface-1 flex items-start gap-3 text-xs font-sans text-text-secondary">
        <AlertCircle className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-text-primary">Implementation Scope:</span> Event Contracts use dedicated outcome pools
          queried through the Somnia Markets SDK and on-chain registries. They do not share order books or liquidity pools with dreamDEX spot CLOB pairs.
        </div>
      </div>

      {events.length === 0 ? (
        <div className="border border-border bg-surface-1 p-12 text-center space-y-3 rounded">
          <div className="text-sm font-sans font-medium text-text-primary">
            No Active Event Contracts
          </div>
          <p className="text-xs text-text-muted font-sans max-w-md mx-auto">
            There are currently no active binary prediction outcome contracts deployed on the on-chain registry.
            Telemetry will stream automatically when new event markets are deployed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((evt) => {
          const upPercent = Math.round(evt.upPrice * 100);
          const downPercent = 100 - upPercent;
          const daysLeft = Math.ceil(evt.timeToCloseMs / 86400000);

          return (
            <DataPanel
              key={evt.id}
              title={evt.symbol}
              subtitle={evt.category}
              meta={{
                source: "on-chain",
                updatedAt: new Date().toISOString(),
                sourceEndpoint: "Somnia Event Contract Registry",
              }}
            >
              <div className="space-y-5">
                <h3 className="font-sans font-semibold text-text-primary text-base leading-snug">
                  {evt.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-primary font-semibold">UP: {upPercent}%</span>
                    <span className="text-text-muted">DOWN: {downPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-surface-3 rounded-full overflow-hidden flex border border-border-subtle">
                    <div className="bg-text-primary h-full" style={{ width: `${upPercent}%` }} />
                    <div className="bg-surface-3 h-full" style={{ width: `${downPercent}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border-subtle text-xs font-mono">
                  <div>
                    <span className="text-text-faint uppercase text-[10px] block">Volume</span>
                    <span className="text-text-secondary font-medium">
                      {formatCurrency(evt.volumeUsd, { compact: true })}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-faint uppercase text-[10px] block">Trades</span>
                    <span className="text-text-secondary font-medium">{formatNumber(evt.tradeCount, 0)}</span>
                  </div>
                  <div>
                    <span className="text-text-faint uppercase text-[10px] block">Status</span>
                    <span className="text-text-primary font-medium capitalize">{evt.status}</span>
                  </div>
                  <div>
                    <span className="text-text-faint uppercase text-[10px] block">Time Remaining</span>
                    <span className="text-text-secondary font-medium">{daysLeft} days</span>
                  </div>
                </div>
              </div>
            </DataPanel>
          );
        })}
      </div>
      )}
    </div>
  );
};
