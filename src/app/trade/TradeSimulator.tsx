"use client";

import { useState } from "react";

export default function TradeSimulator() {
  const [leftTeam1, setLeftTeam1] = useState("");
  const [leftTeam2, setLeftTeam2] = useState("");
  const [rightTeam1, setRightTeam1] = useState("");
  const [rightTeam2, setRightTeam2] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const isReadyToTrade = leftTeam1 && leftTeam2 && rightTeam1 && rightTeam2;

  const handleTrade = async () => {
    if (!isReadyToTrade) return;

    setLoading(true);
    setResult(null);

    try {
      // 실제 API 요청 예시 (주석)
      /*
      const res = await fetch('/api/trades/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_a_id: leftTeam1,
          team_b_id: rightTeam1,
          players_a: [leftTeam2],
          players_b: [rightTeam2]
        })
      });
      const data = await res.json();
      setResult({ ok: true, message: data.summary });
      */

      // 하드코딩 결과
      setTimeout(() => {
        setResult({
          ok: true,
          message: "울산 수비력 향상, 포항 공격력 소폭 감소"
        });
        setLoading(false);
      }, 1000);

    } catch (err) {
      setResult({ ok: false, message: "에러 발생!" });
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white">

      {/* Left Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRADE<br />SIMULATOR
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col">

        {/* Dropdown + Trade Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <select
            className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
            value={leftTeam1}
            onChange={(e) => setLeftTeam1(e.target.value)}
          >
            <option value="">Select</option>
            <option value="ulsan">울산</option>
            <option value="pohang">포항</option>
          </select>

          <select
            className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
            value={leftTeam2}
            onChange={(e) => setLeftTeam2(e.target.value)}
          >
            <option value="">Select</option>
            <option value="p1">선수1</option>
            <option value="p2">선수2</option>
          </select>

          <button
            className={`px-4 py-2 rounded text-white text-sm sm:text-base transition w-[130px] sm:w-auto ${
              isReadyToTrade
                ? "bg-primary hover:bg-primary/80"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleTrade}
            disabled={!isReadyToTrade}
          >
            Trade
          </button>

          <select
            className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
            value={rightTeam1}
            onChange={(e) => setRightTeam1(e.target.value)}
          >
            <option value="">Select</option>
            <option value="ulsan">울산</option>
            <option value="pohang">포항</option>
          </select>

          <select
            className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
            value={rightTeam2}
            onChange={(e) => setRightTeam2(e.target.value)}
          >
            <option value="">Select</option>
            <option value="p1">선수1</option>
            <option value="p2">선수2</option>
          </select>
        </div>

        {/* 안내 문구 */}
        {!loading && !result && (
          <div className="text-left text-gray-500 mb-10 text-base sm:text-lg">
            트레이드 조건을 모두 선택한 뒤 Trade 버튼을 눌러보세요!
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-emerald-600 rounded-full"></div>
          </div>
        )}

        {/* 결과 박스 */}
        {result && (
          <div className="flex justify-center mt-0 w-full overflow-hidden">
            <div className="bg-white shadow-lg rounded-xl p-6 w-full text-left border">
              <h2 className="text-xl sm:text-xl font-bold mb-2">
                {result.ok ? "🎉 트레이드 성공!" : "❌ 트레이드 실패"}
              </h2>
              <p className="text-gray-600 text-sm sm:text-lg">{result.message}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
