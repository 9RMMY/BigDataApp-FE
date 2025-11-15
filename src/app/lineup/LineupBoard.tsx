"use client";

import { useState } from "react";

export default function LineupBoard() {
  const [formation, setFormation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [lineup, setLineup] = useState<
    { position: string; player: string; fit_score: number }[]
  >([]);

  const isReady = formation && opponent;

  const handleRecommend = async () => {
    if (!isReady) return;

    setLoading(true);
    setFitScore(null);
    setLineup([]);

    // --- API 연동 예정 ---
    // const res = await fetch("/api/recommend_lineup", { method: "POST", body: JSON.stringify({formation, opponent}) });
    // const data = await res.json();
    // setFitScore(data.formation_fit);
    // setLineup(data.recommended_lineup);

    // 하드코딩 예제
    setTimeout(() => {
      setFitScore(0.89);
      setLineup([
        { position: "GK", player: "김승규", fit_score: 0.92 },
        { position: "FW", player: "조규성", fit_score: 0.87 },
        { position: "MF", player: "손흥민", fit_score: 0.85 },
        { position: "DF", player: "김민재", fit_score: 0.9 },
      ]);
      setLoading(false);
    }, 1500);
  };

  const positions: { [key: string]: { top: string; left: string } } = {
    GK: { top: "85%", left: "50%" },
    DF: { top: "65%", left: "50%" },
    MF: { top: "45%", left: "50%" },
    FW: { top: "20%", left: "50%" },
  };

  return (
    <div>
      {/* Header */}
      <h1 className="text-center font-bold text-2xl mb-6">LINE-UP</h1>

      {/* Controls: 중앙 정렬, 적당한 간격 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
        <select
          className="border p-2 rounded w-36"
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
        >
          <option value="">전술 선택</option>
          <option value="4-3-3">4-3-3</option>
          <option value="3-5-2">3-5-2</option>
          <option value="4-4-2">4-4-2</option>
        </select>

        <select
          className="border p-2 rounded w-36"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
        >
          <option value="">상대팀 선택</option>
          <option value="팀 A">팀 A</option>
          <option value="팀 B">팀 B</option>
        </select>

        <button
          className={`px-4 py-2 rounded text-white ${
            isReady
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleRecommend}
          disabled={!isReady}
        >
          라인업 추천
        </button>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex justify-center my-6">
          <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-green-600 rounded-full"></div>
        </div>
      )}

      {/* 적합도 */}
      {fitScore !== null && !loading && (
        <div className="text-center text-lg mb-4">
          전술 적합도: {(fitScore * 100).toFixed(0)}%
        </div>
      )}

      {/* 축구장 */}
      <div className="relative mx-auto bg-green-600 h-[400px] w-full max-w-4xl overflow-hidden">
        {/* 센터라인 */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>

        {/* 센터 서클 */}
        <div
          className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"
        ></div>

        {/* 골대 */}
        <div className="absolute left-0 top-1/2 w-20 h-40 border-2 border-white -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 w-20 h-40 border-2 border-white -translate-y-1/2"></div>

        {/* 선수 표시 */}
        {!loading &&
          lineup.map((p, idx) => {
            const pos = positions[p.position] || { top: "50%", left: "50%" };
            return (
              <div
                key={idx}
                className="absolute bg-white text-black text-xs font-bold px-2 py-1 border rounded-full"
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {p.player} ({(p.fit_score * 100).toFixed(0)}%)
              </div>
            );
          })}
      </div>
    </div>
  );
}