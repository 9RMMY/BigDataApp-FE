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
          <div className="bg-white shadow-sm">
            <TradeSimulator />
          </div>
        </section>

    </div>
  );
}

