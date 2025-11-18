"use client";

import LineupBoard from "./LineupBoard";

export default function LineupPage() {
  return (
    <div className="flex flex-col bg-gray-100" style={{ height: 'calc(100vh - 7rem)' }}>
      <LineupBoard />
    </div>
  );
}
