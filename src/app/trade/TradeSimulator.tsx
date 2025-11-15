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
      const res = await new Promise<{ ok: boolean; message: string }>((resolve) =>
        setTimeout(() => resolve({ ok: true, message: "트레이드 성공!" }), 2000)
      );

      setResult(res);
    } catch (err) {
      setResult({ ok: false, message: "에러 발생!" });
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col md:flex-row">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-60 bg-white border-r shadow-sm p-6 flex md:flex-col items-center md:items-start">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRADE<br />SIMULATOR
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 sm:p-8 md:p-10 mt-2">

        {/* Dropdown + Trade Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">

          {/* Left 2 dropdowns */}
          <div className="flex gap-3 w-full sm:w-auto justify-center">
            <select
              className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
              value={leftTeam1}
              onChange={(e) => setLeftTeam1(e.target.value)}
            >
              <option value="">Select</option>
              <option value="A">팀 A</option>
              <option value="B">팀 B</option>
            </select>

            <select
              className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
              value={leftTeam2}
              onChange={(e) => setLeftTeam2(e.target.value)}
            >
              <option value="">Select</option>
              <option value="C">팀 C</option>
              <option value="D">팀 D</option>
            </select>
          </div>

          {/* Trade Button */}
          <button
            className={`px-4 py-2 rounded text-white text-sm sm:text-base transition w-full sm:w-auto ${
              isReadyToTrade
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleTrade}
            disabled={!isReadyToTrade}
          >
            Trade
          </button>

          {/* Right 2 dropdowns */}
          <div className="flex gap-3 w-full sm:w-auto justify-center">
            <select
              className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
              value={rightTeam1}
              onChange={(e) => setRightTeam1(e.target.value)}
            >
              <option value="">Select</option>
              <option value="E">팀 E</option>
              <option value="F">팀 F</option>
            </select>

            <select
              className="border p-2 rounded w-32 sm:w-36 md:w-40 text-sm sm:text-base"
              value={rightTeam2}
              onChange={(e) => setRightTeam2(e.target.value)}
            >
              <option value="">Select</option>
              <option value="G">팀 G</option>
              <option value="H">팀 H</option>
            </select>
          </div>
        </div>

        {/* 안내 문구 */}
        {!loading && !result && (
          <div className="text-center text-gray-500 mb-10 text-base sm:text-lg">
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
          <div className="flex justify-center mt-10">
            <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-lg text-center border">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
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
