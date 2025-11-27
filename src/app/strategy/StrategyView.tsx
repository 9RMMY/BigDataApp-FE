"use client";

import { useEffect, useState } from "react";

export default function StrategyPage() {
  const [teamId, setTeamId] = useState("");   
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<{
    expected_points: number;
    win_prob: number;
    draw_prob: number;
    loss_prob: number;
    strategy_impacts: {
      strategy: string;
      delta_expected_points: number;
      note: string;
    }[];
  } | null>(null);

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);

  // 우리팀 + 상대팀 + 날짜 모두 선택 시 가능
  const isReady = teamId && opponent && date;

  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/meta/teams");
        if (!res.ok) return;
        const data = await res.json();
        setTeams(data);
      } catch (_) {}
    };
    fetchTeams();
  }, []);

  const handleExecute = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_date: date,
          home_team_id: teamId,  
          away_team_id: opponent,
          strategy: "attack_focus",
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();
      setResult(data);
    } catch (_) {
      setResult(null);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-1 bg-white flex-col md:flex-row">
      
      {/* Left Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          STRATEGY
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-white flex flex-col">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">

          {/* 우리팀 선택 */}
          <select
            className="border p-1 rounded w-32 sm:w-36 text-xs sm:text-sm"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">우리팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 상대팀 선택 */}
          <select
            className="border p-1 rounded w-32 sm:w-36 text-xs sm:text-sm"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="">상대팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 날짜 선택 */}
          <input
            type="date"
            className="border p-1 rounded w-32 sm:w-36 text-xs sm:text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* 실행 버튼 */}
          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-full sm:w-auto 
              ${isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"}`}
            onClick={handleExecute}
            disabled={!isReady}
          >
            실행
          </button>
        </div>

        {/* 안내 */}
        {!loading && !result && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            우리팀/상대팀/날짜 선택 후 실행해 주세요.
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="flex justify-center mt-2 w-full">
            <div className="bg-white rounded-xl p-4 w-full text-left border">
              <p className="text-sm sm:text-base font-bold mb-2">예상 경기 결과</p>
              <p className="text-xs sm:text-sm">예상 득점: {result.expected_points}</p>
              <p className="text-xs sm:text-sm">승리 확률: {(result.win_prob * 100).toFixed(0)}%</p>
              <p className="text-xs sm:text-sm">무승부 확률: {(result.draw_prob * 100).toFixed(0)}%</p>
              <p className="text-xs sm:text-sm">패배 확률: {(result.loss_prob * 100).toFixed(0)}%</p>

              <div className="mt-3">
                <p className="font-semibold text-xs sm:text-sm">전략 영향:</p>
                {result.strategy_impacts.map((s, idx) => (
                  <div key={idx} className="ml-2">
                    <p className="text-xs sm:text-sm">
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
