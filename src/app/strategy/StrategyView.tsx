"use client";

import { useState } from "react";

export default function StrategyPage() {
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    expected_points: number;
    win_prob: number;
    draw_prob: number;
    loss_prob: number;
    strategy_impacts: { strategy: string; delta_expected_points: number; note: string }[];
  } | null>(null);

  const isReady = opponent && date;

  const handleExecute = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    // --- API 연동 예정 ---
    // const res = await fetch("/api/strategy", { method: "POST", body: JSON.stringify({ opponent, date }) });
    // const data = await res.json();
    // setResult(data);

    // 하드코딩 예제
    setTimeout(() => {
      setResult({
        expected_points: 1.8,
        win_prob: 0.6,
        draw_prob: 0.25,
        loss_prob: 0.15,
        strategy_impacts: [
          {
            strategy: "attack_focus",
            delta_expected_points: 0.4,
            note: "공격 강화 시 득점 기대치 +0.3",
          },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-white flex-col md:flex-row">

      {/* Left Sidebar: Trade 페이지와 동일 구조 */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          STRATEGY
        </h1>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-5 sm:p-8 md:p-10 bg-white flex flex-col">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-8 mb-12">
          <select
            className="border p-2 rounded w-40"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="">상대팀 선택</option>
            <option value="팀 A">팀 A</option>
            <option value="팀 B">팀 B</option>
          </select>

          <input
            type="date"
            className="border p-2 rounded w-40"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            className={`px-4 py-2 rounded text-white text-sm sm:text-base transition w-full sm:w-auto ${isReady ? "bg-primary hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleExecute}
            disabled={!isReady}
          >
            실행
          </button>
        </div>

        {/* 안내 문구 */}
        {!loading && !result && (
          <div className="text-left text-gray-500 mb-10 text-base sm:text-lg">
            상대팀과 일정을 선택한 뒤 실행 버튼을 눌러주세요.
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center my-10">
            <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="flex justify-center mt-6 w-full">
            <div className="bg-white rounded-xl p-6 w-full text-left border">
              <p className="text-lg font-bold mb-2">예상 경기 결과</p>
              <p>예상 득점: {result.expected_points}</p>
              <p>승리 확률: {(result.win_prob * 100).toFixed(0)}%</p>
              <p>무승부 확률: {(result.draw_prob * 100).toFixed(0)}%</p>
              <p>패배 확률: {(result.loss_prob * 100).toFixed(0)}%</p>

              <div className="mt-4">
                <p className="font-semibold">전략 영향:</p>
                {result.strategy_impacts.map((s, idx) => (
                  <div key={idx} className="ml-2">
                    <p>
                      {s.strategy}: Δ득점 {s.delta_expected_points} ({s.note})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
