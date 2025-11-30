"use client";

import { useEffect, useState } from "react";
import { loadTeamSession, setMyTeam, getMyTeam } from "../../utils/teamSession";

/* -----------------------------------------------------
   🔵 타입 정규화 함수
------------------------------------------------------ */
const normalizeTeams = (raw: any[]): { team_id: number; team_name: string }[] => {
  if (!Array.isArray(raw)) return [];

  return raw.map((t: any) => ({
    team_id: Number(t.team_id ?? t.id),
    team_name: String(t.team_name ?? t.name ?? "이름없음"),
  }));
};

/* ----------------------------------------------------- */

const makeDeltaText = (delta: any, teams: any[]) => {
  return Object.entries(delta).map(([key, stats]: any) => {
    const team = teams.find(
      (t) => t.team_name.includes(key) || key.includes(String(t.team_id))
    );

    const teamName = team?.team_name ?? key;

    const colored = (val: number) => (
      <span className={val >= 0 ? "text-red-600" : "text-blue-600"}>
        {val >= 0 ? `+${val}` : val}
      </span>
    );

    return (
      <div key={key}>
        <b>{teamName}</b>: 공격력 {colored(stats.attack)}, 수비력{" "}
        {colored(stats.defense)}, 전력 {colored(stats.rating)}
      </div>
    );
  });
};

export default function TradeSimulator() {
  /* ---------------------------------------
     🔥 세션 기반 — 사용자 팀 선택 가능
  ----------------------------------------*/
  const [leftTeam, setLeftTeam] = useState<number | "">("");
  const [rightTeam, setRightTeam] = useState<number | "">("");

  const [leftPlayer, setLeftPlayer] = useState("");
  const [rightPlayer, setRightPlayer] = useState("");

  const [teams, setTeams] = useState<{ team_id: number; team_name: string }[]>([]);
  const [leftPlayers, setLeftPlayers] = useState<any[]>([]);
  const [rightPlayers, setRightPlayers] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  const [result, setResult] = useState<any>(null);
  const [tradeHistory, setTradeHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const isReady = leftTeam && leftPlayer && rightTeam && rightPlayer;

  /* -----------------------------------------------------------
     🔵 1) 세션 기반 팀 불러오기
  ------------------------------------------------------------ */
  useEffect(() => {
    const loadTeamsSession = async () => {
      try {
        const sessionData: any = loadTeamSession();

        if (sessionData?.teams?.length > 0) {
          const normalized = normalizeTeams(sessionData.teams);
          setTeams(normalized);

          const myTeamId = Number(sessionData.my_team_id ?? normalized[0].team_id);

          setLeftTeam(myTeamId);

          if (!sessionData.my_team_id) {
            await setMyTeam(String(myTeamId)); // 🔧 string으로 전달
          }

          return;
        }

        const my = await getMyTeam();
        const full = await setMyTeam(my.my_team_id);

        const normalized = normalizeTeams(full.teams);
        setTeams(normalized);

        setLeftTeam(Number((full as any).my_team_id));

      } catch (err) {
        console.error("세션 로드 실패:", err);
      }
    };

    loadTeamsSession();
  }, []);

  /* -----------------------------------------------------------
     🔵 우리팀 변경 시 세션 업데이트
  ------------------------------------------------------------ */
  const handleLeftTeamChange = async (teamId: number) => {
    setLeftTeam(teamId);
    await setMyTeam(String(teamId)); // 🔧 string으로 전달
  };

  /* -----------------------------------------------------------
     🔵 전체 선수 목록 로드
  ------------------------------------------------------------ */
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${API}/api/meta/players.php`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      setAllPlayers(await res.json());
    };
    load();
  }, [API]);

  /* 왼쪽 팀 선수 */
  useEffect(() => {
    if (!leftTeam) return;

    (async () => {
      const res = await fetch(`${API}/api/meta/players.php?team_id=${leftTeam}`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      setLeftPlayers(await res.json());
      setLeftPlayer("");
    })();
  }, [leftTeam, API]);

  /* 오른쪽 팀 선수 */
  useEffect(() => {
    if (!rightTeam) return;

    (async () => {
      const res = await fetch(`${API}/api/meta/players.php?team_id=${rightTeam}`, {
        headers: { "ngrok-skip-browser-warning": "69420" },
      });
      setRightPlayers(await res.json());
      setRightPlayer("");
    })();
  }, [rightTeam, API]);

  /* -----------------------------------------------------------
     🔥 트레이드 실행
  ------------------------------------------------------------ */
  const handleTrade = async () => {
    if (!isReady) return;

    setLoading(true);

    const res = await fetch(`${API}/api/simulations/trade.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({
        team_a_id: leftTeam,
        team_b_id: rightTeam,
        players_a: [Number(leftPlayer)],
        players_b: [Number(rightPlayer)],
      }),
    });

    const data = await res.json();

    setResult({
      ok: true,
      content: makeDeltaText(data.delta, teams),
    });

    setTradeHistory((prev) => [
      {
        id: data.log_id,
        leftTeam: teams.find((t) => t.team_id === leftTeam)?.team_name,
        rightTeam: teams.find((t) => t.team_id === rightTeam)?.team_name,
        leftPlayer: leftPlayers.find((p) => p.player_id === Number(leftPlayer))
          ?.player_name,
        rightPlayer: rightPlayers.find((p) => p.player_id === Number(rightPlayer))
          ?.player_name,
        summary: makeDeltaText(data.delta, teams),
        timestamp: new Date(),
      },
      ...prev,
    ]);

    setLoading(false);
  };

  /* -----------------------------------------------------------
     🔽 UI
  ------------------------------------------------------------ */
  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6">
        <h1 className="text-2xl font-bold">
          TRADE
          <br />
          SIMULATOR
        </h1>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* 우리팀 */}
          <select
            className="border p-1 rounded w-44"
            value={leftTeam}
            onChange={(e) => handleLeftTeamChange(Number(e.target.value))}
          >
            <option value="">우리팀</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 우리팀 선수 */}
          <select
            className="border p-1 rounded w-28"
            value={leftPlayer}
            onChange={(e) => setLeftPlayer(e.target.value)}
            disabled={!leftPlayers.length}
          >
            <option value="">선수 선택</option>
            {leftPlayers.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                {p.player_name}
              </option>
            ))}
          </select>

          {/* 버튼 */}
          <button
            className={`px-3 py-1.5 rounded text-white ${
              isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400"
            }`}
            onClick={handleTrade}
          >
            Trade
          </button>

          {/* 상대팀 */}
          <select
            className="border p-1 rounded w-44"
            value={rightTeam}
            onChange={(e) => setRightTeam(Number(e.target.value))}
          >
            <option value="">상대팀</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 상대 선수 */}
          <select
            className="border p-1 rounded w-28"
            value={rightPlayer}
            onChange={(e) => setRightPlayer(e.target.value)}
            disabled={!rightPlayers.length}
          >
            <option value="">선수 선택</option>
            {rightPlayers.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                {p.player_name}
              </option>
            ))}
          </select>
        </div>

        {/* 결과 */}
        {result && (
          <div className="mt-4 bg-white border rounded-xl p-4">
            <h2 className="font-bold text-lg mb-2">
              {result.ok ? "🎉 성공!" : "❌ 실패"}
            </h2>
            <div>{result.content}</div>
          </div>
        )}

        {/* 히스토리 */}
        {tradeHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3">📜 트레이드 히스토리</h3>
            <div className="space-y-2">
              {tradeHistory.map((h) => (
                <div key={h.id} className="bg-gray-50 border p-3 rounded-lg">
                  <div className="text-sm font-semibold">
                    {h.leftTeam} ({h.leftPlayer}) ↔ {h.rightTeam} ({h.rightPlayer})
                  </div>
                  <div className="text-xs mt-1">{h.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-emerald-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
