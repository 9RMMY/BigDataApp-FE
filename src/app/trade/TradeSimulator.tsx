"use client";

import { useEffect, useState } from "react";

const JEONBUK_ID = 10;
const JEONBUK_NAME = "전북 현대 모터스";


type SimulationLog = {
  log_id: number;
  type: "acquire" | "release" | "trade";
  team_id?: number;
  player_in_id?: number;
  expected_points_change?: number;
  new_team_rating?: number;
  team_a_id?: number;
  team_b_id?: number;
  players_a?: number[];
  players_b?: number[];
  delta?: {
    [teamId: string]: {
      attack: number;
      defense: number;
      rating: number;
    };
  };
};

const makeDeltaText = (delta: any, teams: any[]) => {
  return Object.entries(delta).map(([key, stats]: any) => {
    const team = teams.find(t =>
      t.team_name.includes(key) || key.includes(String(t.team_id))
    );

    const teamName = team?.team_name ?? key;

    const colored = (value: number) => (
      <span className={value >= 0 ? "text-red-600" : "text-blue-600"}>
        {value >= 0 ? `+${value}` : value}
      </span>
    );

    return (
      <div key={key}>
        <span className="font-semibold">{teamName}</span>:{" "}
        공격력 {colored(stats.attack)},{" "}
        수비력 {colored(stats.defense)},{" "}
        평균 전력 지수 {colored(stats.rating)}
      </div>
    );
  });
};



const getTeamName = (id: number, teams: any[]) =>
  teams.find(t => t.team_id === id)?.team_name ?? `팀 ${id}`;

const getPlayerName = (id: number, list: any[]) =>
  list.find(p => p.player_id === id)?.player_name ?? `선수 ${id}`;

export default function TradeSimulator() {
  const [leftTeam1, setLeftTeam1] = useState(JEONBUK_ID); // 우리팀 고정
  const [leftTeam2, setLeftTeam2] = useState("");
  const [rightTeam1, setRightTeam1] = useState<number | "">("");
  const [rightTeam2, setRightTeam2] = useState("");

  const [teams, setTeams] = useState<{ team_id: number; team_name: string }[]>([]);
  const [leftPlayers, setLeftPlayers] = useState<
    { player_id: number; player_name: string; position: string; team_id: number }[]
  >([]);
  const [rightPlayers, setRightPlayers] = useState<
    { player_id: number; player_name: string; position: string; team_id: number }[]
  >([]);

  const [allPlayers, setAllPlayers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: React.ReactNode } | null>(null);

  const [tradeHistory, setTradeHistory] = useState<{
    id: number;
    leftTeam: string;
    leftPlayer: string;
    rightTeam: string;
    rightPlayer: string;
    summary: React.ReactNode;
    timestamp: Date;
  }[]>([]);

  const isReadyToTrade = leftTeam1 && leftTeam2 && rightTeam1 && rightTeam2;

  const API = process.env.NEXT_PUBLIC_API_URL;
  console.log("🔥 API_BASE =", API);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        console.log("🔵 GET TEAMS URL =", `${API}/api/meta/teams.php`);
        const res = await fetch(`${API}/api/meta/teams.php`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        if (!res.ok) return;

        const data = await res.json() as { team_id: number; team_name: string }[];

        const uniqueTeams = Array.from(new Map(data.map(t => [t.team_id, t])).values());

        setTeams(uniqueTeams);
      } catch (e) {
        console.error("팀 목록 로드 실패", e);
      }
    };

    fetchTeams();
  }, []);
  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const res = await fetch(`${API}/api/meta/players.php`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });

        if (!res.ok) return;

        const data = await res.json();
        setAllPlayers(data);
      } catch (e) {
        console.error("전체 선수 목록 로드 실패", e);
      }
    };

    fetchAllPlayers();
  }, []);

  // ===============================
  // 🔵 왼쪽 팀 선수 로드
  // ===============================
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!leftTeam1) {
        setLeftPlayers([]);
        setLeftTeam2("");
        return;
      }

      try {
        const res = await fetch(`${API}/api/meta/players.php?team_id=${leftTeam1}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        setLeftPlayers(data);
        setLeftTeam2("");
      } catch (e) {
        setLeftPlayers([]);
        setLeftTeam2("");
      }
    };

    fetchPlayers();
  }, [leftTeam1]);

  // ===============================
  // 🔴 오른쪽 팀 선수 로드
  // ===============================
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!rightTeam1) {
        setRightPlayers([]);
        setRightTeam2("");
        return;
      }

      try {
        const res = await fetch(`${API}/api/meta/players.php?team_id=${rightTeam1}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        })

        if (!res.ok) return;

        const data = await res.json();
        setRightPlayers(data);
        setRightTeam2("");
      } catch (e) {
        setRightPlayers([]);
        setRightTeam2("");
      }
    };

    fetchPlayers();
  }, [rightTeam1]);

  // ===============================
  // 🔥 트레이드 실행
  // ===============================
  const handleTrade = async () => {

    if (teams.length === 0) {
      console.error("팀 정보가 로드되지 않았습니다.");
      return;
    }
    if (!isReadyToTrade) return;

    setLoading(true);


    try {
      const res = await fetch(`${API}/api/simulations/trade.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",

        },
        body: JSON.stringify({
          team_a_id: leftTeam1,
          team_b_id: rightTeam1,
          players_a: [Number(leftTeam2)],
          players_b: [Number(rightTeam2)],

        }),
      });


      if (!res.ok) throw new Error("API response not OK");

      const data = await res.json();
      const deltaText = makeDeltaText(data.delta, teams);

      setResult({
        ok: true,
        message: deltaText
      });
      // 트레이드 히스토리에 기록
      const leftTeamName = JEONBUK_NAME;
      const rightTeamName = String(
        teams.find(t => t.team_id === Number(rightTeam1))?.team_name ?? rightTeam1
      );

      const leftPlayerName = String(
        leftPlayers.find(p => p.player_id === Number(leftTeam2))?.player_name ?? leftTeam2
      );

      const rightPlayerName = String(
        rightPlayers.find(p => p.player_id === Number(rightTeam2))?.player_name ?? rightTeam2
      );

      setTradeHistory(prev => [{
        id: data.log_id,
        leftTeam: getTeamName(leftTeam1, teams),
        leftPlayer: getPlayerName(Number(leftTeam2), leftPlayers),
        rightTeam: getTeamName(Number(rightTeam1), teams),
        rightPlayer: getPlayerName(Number(rightTeam2), rightPlayers),
        summary: makeDeltaText(data.delta, teams),
        timestamp: new Date()
      }, ...prev]);

    } catch (err) {
      setResult({ ok: false, message: "에러 발생!" });
    }

    setLoading(false);
  };

  const handleDeleteTradeLog = async (logId: number) => {
    try {
      const res = await fetch(`${API}/api/simulations/log.php?log_id=${logId}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      });

      if (res.status === 204 || res.ok) {
        setTradeHistory((prev) => prev.filter((t) => t.id !== logId));
      }
    } catch (e) {
      console.error("시뮬레이션 로그 삭제 실패", e);
    }
  };


  useEffect(() => {
    // teams 또는 allPlayers가 아직 없으면 실행하지 않음
    if (teams.length === 0 || allPlayers.length === 0) return;

    const fetchSimulationLogs = async () => {
      try {
        const res = await fetch(`${API}/api/simulations/log.php`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.ok) return;

        const data = (await res.json()) as SimulationLog[];

        const tradeLogs = data.filter(
          (log) =>
            log.type === "trade" &&
            !!log.team_a_id &&
            !!log.team_b_id
        );

        const mapped = tradeLogs.map((log) => ({
          id: log.log_id,
          leftTeam: getTeamName(log.team_a_id!, teams),
          rightTeam: getTeamName(log.team_b_id!, teams),
          leftPlayer: getPlayerName(Number(log.players_a?.[0]), allPlayers),
          rightPlayer: getPlayerName(Number(log.players_b?.[0]), allPlayers),
          summary: makeDeltaText(log.delta!, teams),
          timestamp: new Date()
        }));

        setTradeHistory(mapped);
      } catch (e) {
        console.error("시뮬레이션 로그 로드 실패", e);
      }
    };

    fetchSimulationLogs();
  }, [teams, allPlayers]); // ⬅ 여기 중요

  // ===============================
  // 🔽 UI
  // ===============================
  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRADE<br />SIMULATOR
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">

          {/* 왼쪽 팀 */}
          <select
            className="border p-1 rounded w-44 "
            value={leftTeam1}
            disabled
          >
            <option value={JEONBUK_ID}>{JEONBUK_NAME}</option>
          </select>


          {/* 왼쪽 선수 */}
          <select
            className="border p-1 rounded w-24 "
            value={leftTeam2}
            onChange={(e) => setLeftTeam2(e.target.value)}
            disabled={!leftTeam1 || leftPlayers.length === 0}
          >
            <option value="">선수 선택</option>
            {leftPlayers.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                {p.player_name}
              </option>
            ))}
          </select>

          {/* Trade 버튼 */}
          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-[80px] ${isReadyToTrade ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleTrade}
            disabled={!isReadyToTrade}
          >
            Trade
          </button>

          {/* 오른쪽 팀 */}
          <select
            className="border p-1 rounded w-44 "
            value={rightTeam1}
            onChange={(e) => setRightTeam1(Number(e.target.value))}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 오른쪽 선수 */}
          <select
            className="border p-1 rounded w-24 "
            value={rightTeam2}
            onChange={(e) => setRightTeam2(e.target.value)}
            disabled={!rightTeam1 || rightPlayers.length === 0}
          >
            <option value="">선수 선택</option>
            {rightPlayers.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                {p.player_name}
              </option>
            ))}
          </select>
        </div>

        {!loading && !result && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            트레이드 조건을 모두 선택한 뒤 Trade 버튼을 눌러보세요!
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-emerald-600 rounded-full"></div>
          </div>
        )}

        {result && (
          <div className="flex justify-center mt-2 w-full overflow-hidden">
            <div className="bg-white shadow-lg rounded-xl p-4 w-full text-left border">
              <h2 className="text-lg sm:text-xl font-bold mb-2">
                {result.ok ? "🎉 트레이드 성공!" : "❌ 트레이드 실패"}
              </h2>
              <p className="text-md">{result.message}</p>
            </div>
          </div>
        )}

        {/* 트레이드 히스토리 */}
        {tradeHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 text-gray-800">📜 트레이드 히스토리</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {tradeHistory.map((trade) => (
                <div key={trade.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {trade.leftTeam} ({trade.leftPlayer}) ↔ {trade.rightTeam} ({trade.rightPlayer})

                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {trade.summary}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-400 ml-2 space-y-1">
                      <div>{trade.timestamp.toLocaleTimeString()}</div>
                      <button
                        className="px-2 py-1 rounded bg-red-100 text-[11px] font-semibold text-red-600 hover:bg-red-200 hover:text-red-700 border border-red-200"
                        onClick={() => handleDeleteTradeLog(trade.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
