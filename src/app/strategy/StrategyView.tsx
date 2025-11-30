"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { loadTeamSession } from "../../utils/teamSession";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StrategyPage() {
  const [teamId, setTeamId] = useState("");
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [strategy, setStrategy] = useState("attack_focus");
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

  const API = process.env.NEXT_PUBLIC_API_URL;

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);

  const isReady = teamId && opponent && date;

  const strategyToKorean = (s: string) => {
    switch (s) {
      case "attack_focus": return "공격 강화 시";
      case "defense_focus": return "수비 강화 시";
      case "balanced": return "균형 유지 시";
      default: return s;
    }
  };

  const coloredDelta = (value: number) => (
    <span className={value >= 0 ? "text-red-600" : "text-blue-600"}>
      {value >= 0 ? `+${value}` : value}
    </span>
  );

  // ---------------------------------------------
  // ⭐ Transfer 페이지와 동일한 세션 방식 적용
  // ---------------------------------------------
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const sessionData = loadTeamSession();

        if (sessionData) {
          setTeams(sessionData.teams);

          // ⭐ Transfer처럼 바로 my_team_id 대입
          setTeamId(sessionData.my_team_id);

          return;
        }

        // fallback: API에서 팀 목록 불러오기
        const res = await fetch(`${API}/api/meta/teams.php`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });

        if (!res.ok) return;

        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error("🔥 팀 로드 실패:", err);
      }
    };

    loadTeams();
  }, [API]);

  const homeTeamName =
    teams.find(t => String(t.team_id) === String(teamId))?.team_name ?? teamId;

  const awayTeamName =
    teams.find(t => String(t.team_id) === String(opponent))?.team_name ?? opponent;

  // ---------------------------------------------
  // 전략 POST
  // ---------------------------------------------
  const handleExecute = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/api/match.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          match_date: date,
          home_team_id: teamId,
          away_team_id: opponent,
          strategy,
        }),
      });

      if (!res.ok) throw new Error("API ERROR");

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.log("🔥 전략 분석 실패:", err);
    }

    setLoading(false);
  };

  const pieData = result
    ? {
        labels: ["승리 확률", "무승부 확률", "패배 확률"],
        datasets: [
          {
            data: [
              result.win_prob * 100,
              result.draw_prob * 100,
              result.loss_prob * 100,
            ],
            backgroundColor: ["#86efac", "#e5e7eb", "#fca5a5"],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div className="flex flex-1 bg-white flex-col md:flex-row">
      <div className="w-full md:w-60 bg-white shadow-md pt-6 pl-6 pr-3 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold">STRATEGY</h1>
      </div>

      <div className="flex-1 pt-6 pl-3 bg-white flex flex-col">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">

          {/* 우리팀 */}
          <select
            className="border p-1 rounded w-44"
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

          {/* 상대팀 */}
          <select
            className="border p-1 rounded w-44"
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

          {/* 날짜 */}
          <input
            type="date"
            className="border p-1 rounded w-32 sm:w-36"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* 전략 선택 */}
          <select
            className="border p-1 rounded w-32"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
          >
            <option value="attack_focus">공격 강화</option>
            <option value="defense_focus">수비 강화</option>
            <option value="balanced">균형 유지</option>
          </select>

          {/* 실행 */}
          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm 
              ${isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"}`}
            onClick={handleExecute}
            disabled={!isReady}
          >
            실행
          </button>

        </div>

        {!result && !loading && (
          <p className="text-gray-500 text-xs">
            우리팀 / 상대팀 / 날짜 / 전략 선택 후 실행하세요.
          </p>
        )}

        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
          </div>
        )}

        {result && (
          <div className="flex flex-col md:flex-row gap-6 mt-6">

            {/* PIE CHART */}
            <div className="w-full md:w-1/3 flex justify-center items-center p-4">
              <Pie data={pieData!} options={{ plugins: { legend: { position: "bottom" }}}} />
            </div>

            {/* 결과 텍스트 */}
            <div className="w-full md:w-2/3 p-6 bg-white border rounded-xl">
              <h2 className="text-lg font-bold mb-6">
                {homeTeamName} (홈) vs {awayTeamName} (어웨이)
              </h2>

              <p className="font-bold">예상 경기 결과</p>

              <p className="text-sm mt-2">예상 득점: {result.expected_points}</p>

              <div className="mt-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">승리</span>
                  <span>{(result.win_prob * 100).toFixed(0)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">무승부</span>
                  <span>{(result.draw_prob * 100).toFixed(0)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">패배</span>
                  <span>{(result.loss_prob * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-10">
                <p className="font-semibold text-sm">전략 영향</p>

                {result.strategy_impacts.map((s, idx) => (
                  <div key={idx} className="mt-2 text-sm">
                    {strategyToKorean(s.strategy)} — 득점 변화:
                    {coloredDelta(s.delta_expected_points)}
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
