export default function StrategyView() {
  return (
    <div className="bg-white shadow rounded-lg p-6 min-h-[450px]">
      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select className="border p-2 rounded w-40" />
        <input type="date" className="border p-2 rounded w-40" />
      </div>

      {/* Result */}
      <div className="border rounded-lg p-4 bg-gray-50 text-sm text-gray-700 h-80">
        <p>전략 결과 출력 영역</p>
      </div>
    </div>
  );
}

