"use client";

import { useEffect, useState } from "react";
type SimulationLog = {
  log_id: number;
  type: "acquire" | "release" | "trade";
  team_id?: string;
  player_in_id?: string;
  expected_points_change?: number;
  new_team_rating?: number;
  team_a_id?: string;
  team_b_id?: string;
  players_a?: string[];
  players_b?: string[];
  delta?: {
    [teamId: string]: {
      attack: number;
      defense: number;
      rating: number;
    };
  };
};

export default function TradeSimulator() {
  const [leftTeam1, setLeftTeam1] = useState("");
  const [leftTeam2, setLeftTeam2] = useState("");
  const [rightTeam1, setRightTeam1] = useState("");
  const [rightTeam2, setRightTeam2] = useState("");

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);
  const [leftPlayers, setLeftPlayers] = useState<
    { player_id: string; player_name: string; position: string; team_id: string }[]
  >([]);
  const [rightPlayers, setRightPlayers] = useState<
    { player_id: string; player_name: string; position: string; team_id: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [tradeHistory, setTradeHistory] = useState<{
    id: number;
    leftTeam: string;
    leftPlayer: string;
    rightTeam: string;
    rightPlayer: string;
    summary: string;
    timestamp: Date;
  }[]>([]);

  const isReadyToTrade = leftTeam1 && leftTeam2 && rightTeam1 && rightTeam2;

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API}/meta/teams`);
        if (!res.ok) return;

        const data = await res.json() as { team_id: string; team_name: string }[];

        const uniqueTeams = Array.from(new Map(data.map(t => [t.team_id, t])).values());

        setTeams(uniqueTeams);
      } catch (e) {
        console.error("팀 목록 로드 실패", e);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchSimulationLogs = async () => {
      try {
        const res = await fetch("/api/simulations/log.php");
        if (!res.ok) return;

        const data = (await res.json()) as SimulationLog[];

        const tradeLogs = data.filter(
          (log) =>
            log.type === "trade" &&
            !!log.team_a_id &&
            !!log.team_b_id
        );

        const mapped = tradeLogs.map((log) => {
          let summary = "트레이드 시뮬레이션 기록";
          if (log.delta) {
            const parts: string[] = [];
            for (const [teamId, stats] of Object.entries(log.delta)) {
              const attack = stats.attack >= 0 ? `+${stats.attack}` : `${stats.attack}`;
              const defense = stats.defense >= 0 ? `+${stats.defense}` : `${stats.defense}`;
              const rating = stats.rating >= 0 ? `+${stats.rating}` : `${stats.rating}`;
              parts.push(
                `${teamId} 공격 ${attack}, 수비 ${defense}, 평점 ${rating}`
              );
            }
            if (parts.length > 0) {
              summary = `트레이드 시뮬레이션 결과: ${parts.join(" / ")}`;
            }
          }

          return {
            id: log.log_id,
            leftTeam: log.team_a_id as string,
            leftPlayer: (log.players_a ?? []).join(", "),
            rightTeam: log.team_b_id as string,
            rightPlayer: (log.players_b ?? []).join(", "),
            summary,
            timestamp: new Date(),
          };
        });

        setTradeHistory((prev) => [...mapped, ...prev]);
      } catch (e) {
        console.error("시뮬레이션 로그 로드 실패", e);
      }
    };

    fetchSimulationLogs();
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
        const res = await fetch(`${API}/meta/players?team_id=${leftTeam1}`);
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
        const res = await fetch(`${API}/meta/players?team_id=${rightTeam1}`);
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
    if (!isReadyToTrade) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API}/simulations/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_a_id: leftTeam1,
          team_b_id: rightTeam1,
          players_a: [leftTeam2],
          players_b: [rightTeam2],
        }),
      });


      if (!res.ok) throw new Error("API response not OK");

      const data = await res.json();

      setResult({
        ok: true,
        message: `${data.summary} (log_id: ${data.log_id})`,
      });
      
      // 트레이드 히스토리에 기록
      const leftTeamName = teams.find(t => t.team_id === leftTeam1)?.team_name || leftTeam1;
      const rightTeamName = teams.find(t => t.team_id === rightTeam1)?.team_name || rightTeam1;
      const leftPlayerName = leftPlayers.find(p => p.player_id === leftTeam2)?.player_name || leftTeam2;
      const rightPlayerName = rightPlayers.find(p => p.player_id === rightTeam2)?.player_name || rightTeam2;
      
      setTradeHistory(prev => [{
        id: data.log_id,
        leftTeam: leftTeamName,
        leftPlayer: leftPlayerName,
        rightTeam: rightTeamName,
        rightPlayer: rightPlayerName,
        summary: data.summary,
        timestamp: new Date()
      }, ...prev]);
    } catch (err) {
      setResult({ ok: false, message: "에러 발생!" });
    }

    setLoading(false);
  };

  const handleDeleteTradeLog = async (logId: number) => {
    try {
      const res = await fetch(`/api/simulations/log.php?log_id=${logId}`, {
        method: "DELETE",
      });

      if (res.status === 204 || res.ok) {
        setTradeHistory((prev) => prev.filter((t) => t.id !== logId));
      }
    } catch (e) {
      console.error("시뮬레이션 로그 삭제 실패", e);
    }
  };

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
            className="border p-1 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
            value={leftTeam1}
            onChange={(e) => setLeftTeam1(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 왼쪽 선수 */}
          <select
            className="border p-1 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
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
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-[110px] sm:w-auto ${isReadyToTrade ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleTrade}
            disabled={!isReadyToTrade}
          >
            Trade
          </button>

          {/* 오른쪽 팀 */}
          <select
            className="border p-1 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
            value={rightTeam1}
            onChange={(e) => setRightTeam1(e.target.value)}
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
            className="border p-1 rounded w-28 sm:w-32 md:w-36 text-xs sm:text-sm"
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
              <p className="text-gray-600 text-xs sm:text-sm">{result.message}</p>
            </div>
          </div>
        )}
        
        {/* 트레이드 히스토리 */}
        {tradeHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 text-gray-800">📜 트레이드 히스토리</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
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
