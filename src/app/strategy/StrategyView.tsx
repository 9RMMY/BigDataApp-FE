"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);


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

  const strategyToKorean = (s: string) => {
    switch (s) {
      case "attack_focus": return "공격 강화 시";
      case "defense_focus": return "수비 강화 시";
      case "balanced": return "균형 있게 경기할 시";
      default: return s;
    }
  };
  const coloredDelta = (value: number) => (
    <span className={value >= 0 ? "text-red-600" : "text-blue-600"}>
      {value >= 0 ? `+${value}` : value}
    </span>
  );



  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);

  // 우리팀 + 상대팀 + 날짜 모두 선택 시 가능
  const isReady = teamId && opponent && date;

  const API = process.env.NEXT_PUBLIC_API_URL;
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

  const homeTeamName = teams.find(t => String(t.team_id) === String(teamId))?.team_name ?? teamId;
  const awayTeamName = teams.find(t => String(t.team_id) === String(opponent))?.team_name ?? opponent;

  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {

        const res = await fetch(`${API}/api/meta/teams.php`,
          {
            headers: {
              "ngrok-skip-browser-warning": "69420"
            },
          });

        if (!res.ok) {
          console.log("❌ res.ok == false");
          return;
        }

        const data = await res.json();

        setTeams(data);
      } catch (e) {

      }
    };

    fetchTeams();
  }, []);


  const handleExecute = async () => {
    if (!isReady) {

      return;
    }

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
          strategy: "attack_focus",
        }),
      });

      console.log("📥 응답 상태:", res.status);

      if (!res.ok) {
        console.log("❌ res.ok === false → 응답 에러");
        throw new Error("API Error");
      }

      const data = await res.json();

      console.log("🟢 응답 데이터:", data);

      setResult(data);
    } catch (err) {
      console.log("🔥 API 호출 오류:", err);
      setResult(null);
    }

    console.log("🏁 실행 완료");
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
            className="border p-1 rounded w-40 text-xs sm:text-sm"
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
            className="border p-1 rounded w-40 text-xs sm:text-sm"
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
          <div className="flex flex-col md:flex-row mt-4 gap-6 w-full">

            {/* 🎯 원형 그래프 */}
            <div className="w-full md:w-1/3 flex justify-center items-center p-4">
              {pieData && (
                <Pie
                  data={pieData}
                  options={{
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                  }}
                />
              )}
            </div>

            {/* 🎯 오른쪽 결과 텍스트 */}
            {/* 🎯 오른쪽 결과 텍스트 */}
            <div className="w-full md:w-2/3 p-6 bg-white border rounded-xl">

              {/* 팀 정보 */}
              <h2 className="text-lg font-bold mb-8">
                {homeTeamName} (홈) vs {awayTeamName} (어웨이)
              </h2>

              <p className="text-sm sm:text-base font-bold mb-2">예상 경기 결과</p>

              <p className="text-xs sm:text-sm mb-1">예상 득점: {result.expected_points}</p>

              {/* 승/무/패 확률 + 색상 */}
              <div className="space-y-1 mt-2">

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs sm:text-sm bg-green-100 text-green-700">
                    승리
                  </span>
                  <span className="text-xs sm:text-sm">
                    {(result.win_prob * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs sm:text-sm bg-gray-100 text-gray-700">
                    무승부
                  </span>
                  <span className="text-xs sm:text-sm">
                    {(result.draw_prob * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs sm:text-sm bg-red-100 text-red-700">
                    패배
                  </span>
                  <span className="text-xs sm:text-sm">
                    {(result.loss_prob * 100).toFixed(0)}%
                  </span>
                </div>

              </div>

              {/* 전략 영향 */}
              {/* 전략 영향 */}
              <div className="mt-10">
                <p className="font-semibold sm:text-base text-sm">전략 영향:</p>

                {result.strategy_impacts.map((s, idx) => (
                  <div key={idx} className="mt-2 text-xs sm:text-sm">
                    <p>
                      <span className="font-medium">{strategyToKorean(s.strategy)}</span>,
                      {" "}
                      득점 변화: {coloredDelta(s.delta_expected_points)}
                      {" "}
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
