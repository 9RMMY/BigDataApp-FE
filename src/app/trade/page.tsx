"use client";

import TradeSimulator from "./TradeSimulator";
import GNB from "../components/GNB";
import Card from "../components/Card";

export default function TradePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <GNB />

        {/* 트레이드 시뮬레이터 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">트레이드 시뮬레이터</h2>
          </div>
          <Card className="bg-white shadow-sm">
            <TradeSimulator />
          </Card>
        </section>

    </div>
  );
}

