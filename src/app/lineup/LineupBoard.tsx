"use client";

import { useState, useEffect } from "react";

export default function LineupBoard() {
  const [teamId, setTeamId] = useState("");
  const [formation, setFormation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [lineup, setLineup] = useState<
    { position: string; player: string; fit_score: number }[]
  >([]);

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);

  const isReady = teamId && formation && opponent;

  const API = process.env.NEXT_PUBLIC_API_URL;
  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API}/meta/teams`);
        if (!res.ok) return;
        const data = await res.json();
        setTeams(data);
      } catch (e) {
        // ignore
      }
    };
    fetchTeams();
  }, []);

  const handleRecommend = async () => {
    if (!isReady) return;

    setLoading(true);
    setFitScore(null);
    setLineup([]);

    try {
      const res = await fetch(`${API}/lineup/recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          formation: formation,
          opponent_team_id: opponent
        }),
      });




      if (!res.ok) {
        throw new Error("API Error");
      }

      const data = await res.json();
      setFitScore(data.formation_fit);
      setLineup(data.recommended_lineup);
    } catch (e) {
      setFitScore(null);
    }

    setLoading(false);
  };

  const positions: { [key: string]: { top: string; left: string } } = {
    GK: { top: "85%", left: "50%" },
    DF: { top: "65%", left: "50%" },
    MF: { top: "45%", left: "50%" },
    FW: { top: "20%", left: "50%" },
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white">

      {/* Left Sidebar - Lineup Options */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          LINE-UP<br />BOARD
        </h1>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-6 flex flex-col">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
          <select
            className="border p-1 rounded w-28 sm:w-32 md:w-40 text-xs sm:text-sm"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          <select
            className="border p-1 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
          >
            <option value="">전술 선택</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="4-4-2">4-4-2</option>
          </select>

          <select
            className="border p-1.5 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
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

          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-[110px] sm:w-auto ${isReady
              ? "bg-primary hover:bg-primary/80"
              : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleRecommend}
            disabled={!isReady}
          >
            라인업 추천
          </button>
        </div>

        {/* 결과 / 안내 문구 */}
        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-emerald-600 rounded-full"></div>
          </div>
        )}

        {!loading && !fitScore && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            전술과 상대팀을 선택한 뒤 라인업 추천 버튼을 눌러보세요!
          </div>
        )}

        {fitScore !== null && !loading && (
          <div className="text-left text-sm sm:text-base ml-64 font-semibold">
            전술 적합도: {(fitScore * 100).toFixed(0)}%
          </div>
        )}

        {/* 축구장과 라인업 목록 */}
        <div className="flex flex-col lg:flex-row gap-6 flex-1">

          {/* 축구장 */}
          <div className="flex items-center justify-center lg:flex-1 mb-4 lg:mb-0">
            <div className="relative bg-green-600 w-full h-[300px] overflow-hidden">

              {/* 센터라인 */}
              <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>

              {/* 센터 서클 */}
              <div
                className="absolute top-1/2 left-1/2 w-16 h-16 sm:w-20 sm:h-20 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"
              ></div>

              {/* 골대 */}
              <div className="absolute left-0 top-1/2 w-12 h-24 sm:w-16 sm:h-32 border-2 border-white -translate-y-1/2"></div>
              <div className="absolute right-0 top-1/2 w-12 h-24 sm:w-16 sm:h-32 border-2 border-white -translate-y-1/2"></div>

              {/* 선수 표시 */}
              {!loading &&
                lineup.map((p, idx) => {
                  const pos = positions[p.position] || { top: "50%", left: "50%" };
                  return (
                    <div
                      key={idx}
                      className="absolute bg-white text-black text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 border rounded-full"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="text-center">
                        <div>{p.player}</div>
                        <div className="text-xs text-gray-600">{(p.fit_score * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 추천 라인업 목록 (항상 오른쪽 공간 유지) */}
          <div className="w-60">
            <div className="text-base font-semibold text-sm text-gray-700 mb-3">추천 라인업</div>
            <div className="max-h-[280px] overflow-y-auto pr-2">
              {loading && (
                <div className="text-xs text-gray-400">라인업 계산 중...</div>
              )}

              {!loading && lineup.length === 0 && (
                <div className="text-xs text-gray-400">아직 추천 라인업이 없습니다.</div>
              )}

              {!loading && lineup.length > 0 && (
                <div className="space-y-2">
                  {lineup.map((player, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded text-sm border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-base text-xs">{player.position}</div>
                          <div className="text-gray-700 text-xs">{player.player}</div>
                        </div>
                        <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                          {(player.fit_score * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}