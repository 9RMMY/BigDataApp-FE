"use client";

import TransferCalculator from "./TransferCalculator";

export default function TransferPage() {
  return (
    <div className="flex flex-col bg-gray-100" style={{ height: 'calc(100vh - 7rem)' }}>
      <TransferCalculator />
    </div>
  );
}

