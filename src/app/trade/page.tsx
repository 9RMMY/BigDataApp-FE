"use client";

import TradeSimulator from "./TradeSimulator";

export default function TradePage() {
  return (
    <div className="flex flex-col bg-gray-100" style={{ height: 'calc(100vh - 7rem)' }}>
      {/* TradeSimulator가 남은 공간 전부 차지 */}
      <TradeSimulator />
    </div>
  );
}