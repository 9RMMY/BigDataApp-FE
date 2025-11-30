"use client";

import { useState, useEffect } from "react";
import { loadTeamSession, getMyTeam, setMyTeam } from "../../utils/teamSession";

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
  useEffect(() => {
    const loadTeamsWithSession = async () => {
      try {
        const sessionData: any = loadTeamSession();

        // ---------------------------
        // 1) 세션이 있는 경우
        // ---------------------------
        if (sessionData) {
          setTeams(sessionData.teams);

          // ⭐ 여기! my_team_id가 없으면 fallback 값 세팅
          const myTeam = sessionData.my_team_id
            ? String(sessionData.my_team_id)
            : sessionData.teams?.[0]?.team_id  // 첫 번째 팀으로 fallback
              ? String(sessionData.teams[0].team_id)
              : "9";

          setTeamId(myTeam);
          return;
        }

        // ---------------------------
        // 2) 세션 없는 경우 서버에서 받아오기
        // ---------------------------
        const myTeamData: any = await getMyTeam(); // 반드시 { my_team_id } 포함해야 함

        const fullTeamData: any = await setMyTeam(myTeamData.my_team_id);

        setTeams(fullTeamData.teams);
        setTeamId(String(fullTeamData.my_team_id));

      } catch (err) {
        console.log("🔥 세션/팀 로딩 오류", err);

        // fallback: 기본 팀 목록만 가져오기
        try {
          const res = await fetch(`${API}/api/meta/teams.php`, {
            headers: { "ngrok-skip-browser-warning": "69420" },
          });
          if (res.ok) {
            const data = await res.json();
            setTeams(data);

            // fallback teamId 자동 설정
            setTeamId(String(data[0]?.team_id ?? "9"));
          }
        } catch (e) {
          console.log("🔥 fallback 실패", e);
        }
      }
    };

    loadTeamsWithSession();
  }, [API]);


  // -----------------------------
  // 팀명 매핑
  // -----------------------------
  const teamName =
    teams.find((t) => String(t.team_id) === String(teamId))?.team_name ?? teamId;

  const opponentName =
    teams.find((t) => String(t.team_id) === String(opponent))?.team_name ?? opponent;

  // -----------------------------
  // 포지션 매핑
  // -----------------------------
  const GK_POS = { top: "50%", left: "5%" };

  const formationPositions: any = {
    "4-3-3": {
      DF: [
        { top: "20%", left: "25%" },
        { top: "40%", left: "25%" },
        { top: "60%", left: "25%" },
        { top: "80%", left: "25%" },
      ],
      MF: [
        { top: "35%", left: "55%" },
        { top: "50%", left: "55%" },
        { top: "65%", left: "55%" },
      ],
      FW: [
        { top: "35%", left: "75%" },
        { top: "50%", left: "75%" },
        { top: "65%", left: "75%" },
      ],
    },
    "3-5-2": {
      DF: [
        { top: "35%", left: "25%" },
        { top: "50%", left: "25%" },
        { top: "65%", left: "25%" },
      ],
      MF: [
        { top: "30%", left: "55%" },
        { top: "40%", left: "50%" },
        { top: "50%", left: "45%" },
        { top: "60%", left: "50%" },
        { top: "70%", left: "55%" },
      ],
      FW: [
        { top: "40%", left: "80%" },
        { top: "60%", left: "80%" },
      ],
    },
    "4-4-2": {
      DF: [
        { top: "20%", left: "25%" },
        { top: "40%", left: "25%" },
        { top: "60%", left: "25%" },
        { top: "80%", left: "25%" },
      ],
      MF: [
        { top: "20%", left: "50%" },
        { top: "40%", left: "50%" },
        { top: "60%", left: "50%" },
        { top: "80%", left: "50%" },
      ],
      FW: [
        { top: "40%", left: "75%" },
        { top: "60%", left: "75%" },
      ],
    },
  };

  const getPositionStyle = (pos: string, index: number) => {
    if (pos === "GK") return GK_POS;
    const map = formationPositions[formation];
    if (!map) return { top: "50%", left: "50%" };
    return map[pos]?.[index] ?? { top: "50%", left: "50%" };
  };

  // -----------------------------
  // 라인업 추천 API
  // -----------------------------
  const handleRecommend = async () => {
    if (!isReady) return;

    setLoading(true);
    setFitScore(null);
    setLineup([]);

    try {
      const res = await fetch(`${API}/api/lineup/recommendation.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          team_id: teamId,
          formation: formation,
          opponent_team_id: opponent,
        }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      setFitScore(data.formation_fit);
      setLineup(data.recommended_lineup);
    } catch (e) {
      console.log("🔥 라인업 추천 오류:", e);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white overflow-x-hidden">

      {/* 왼쪽 사이드바 */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10">
          LINE-UP<br />BOARD
        </h1>
      </div>

      {/* 메인 */}
      <div className="flex-1 p-6 flex flex-col">

        {/* 선택 UI */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">

          <select
            className="border p-1 rounded w-44"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
            ))}
          </select>

          <select
            className="border p-1 rounded w-28"
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
          >
            <option value="">전술</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="4-4-2">4-4-2</option>
          </select>

          <select
            className="border p-1 rounded w-44"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="">상대팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>{t.team_name}</option>
            ))}
          </select>

          <button
            className={`px-3 py-1.5 rounded text-white ${isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleRecommend}
            disabled={!isReady}
          >
            라인업 추천
          </button>

        </div>

        {/* 축구장 */}
        <div className="w-[800px]">
          <div className="relative bg-green-600 w-full h-[360px] rounded shadow-md">
            {/* 하프라인 */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>
            {/* 센터서클 */}
            <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>

            {/* 페널티 박스 */}
            <div className="absolute left-0 top-1/2 w-12 h-24 border-2 border-white -translate-y-1/2"></div>
            <div className="absolute right-0 top-1/2 w-12 h-24 border-2 border-white -translate-y-1/2"></div>

            {/* 선수 표시 */}
            {!loading &&
              lineup.map((p, idx) => {
                const index = lineup.filter((x) => x.position === p.position).indexOf(p);
                const style = getPositionStyle(p.position, index);

                return (
                  <div
                    key={idx}
                    className="absolute bg-white text-black text-xs font-bold px-2 py-1 border rounded-full"
                    style={{
                      top: style.top,
                      left: style.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {p.position} {p.player}
                  </div>
                );
              })}
          </div>
        </div>

        {/* 라인업 리스트 */}
        <div className="mt-6 w-full  mx-auto">
          <h2 className="font-semibold text-lg">
            {teamName} (홈) vs {opponentName} (어웨이) 라인업 목록
          </h2>

          {fitScore !== null && (
            <p className="text-md mt-1 mb-3">
              전술 적합도:{" "}
              <span className={fitScore >= 0.5 ? "text-red-600" : "text-blue-600"}>
                {(fitScore * 100).toFixed(0)}%
              </span>
            </p>
          )}

          <div className="w-full overflow-x-auto pb-2">
            <div className="flex flex-nowrap gap-4 min-w-max">
              {lineup.map((p, idx) => (
                <div
                  key={idx}
                  className="min-w-[150px] bg-gray-50 border rounded-lg p-3 shadow-sm"
                >
                  <div className="font-bold mb-1">
                    {p.position} - {p.player}
                  </div>
                  <div className="text-green-600 font-semibold">
                    {(p.fit_score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
