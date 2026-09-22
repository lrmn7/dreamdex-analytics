import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { OverviewPage } from "@/features/overview/OverviewPage";
import { MarketsPage } from "@/features/markets/MarketsPage";
import { MarketDetailPage } from "@/features/markets/MarketDetailPage";
import { VolumePage } from "@/features/volume/VolumePage";
import { LiquidityPage } from "@/features/liquidity/LiquidityPage";
import { TradesPage } from "@/features/trades/TradesPage";
import { ActivityPage } from "@/features/activity/ActivityPage";
import { EventsPage } from "@/features/events/EventsPage";
import { LendPage } from "@/features/lend/LendPage";
import { DevelopersPage } from "@/features/developers/DevelopersPage";
import { MethodologyPage } from "@/features/methodology/MethodologyPage";
import { StatusPage } from "@/features/status/StatusPage";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center space-y-6">
      <div className="w-12 h-12 border border-border mx-auto flex items-center justify-center bg-surface-1">
        <AlertCircle className="w-6 h-6 text-text-primary" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-sans font-bold tracking-tight text-text-primary">
          Page Not Found
        </h1>
        <p className="text-sm font-sans text-text-secondary max-w-md mx-auto">
          The requested path does not exist on the dreamDEX Analytics Hub.
        </p>
      </div>
      <div>
        <Link to="/">
          <Button variant="primary" size="md">
            Return to Overview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary selection:bg-surface-3 selection:text-text-primary">
      <ScrollToTop />
      <Navbar />

      <main key={location.pathname} className="flex-1 animate-page-enter">
        <Routes location={location}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/markets/:symbol" element={<MarketDetailPage />} />
          
          <Route path="/analytics" element={<Navigate to="/volume" replace />} />
          <Route path="/volume" element={<VolumePage />} />
          <Route path="/liquidity" element={<LiquidityPage />} />
          
          <Route path="/trades" element={<TradesPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          
          <Route path="/events" element={<EventsPage />} />
          <Route path="/lend" element={<LendPage />} />
          
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/status" element={<StatusPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
