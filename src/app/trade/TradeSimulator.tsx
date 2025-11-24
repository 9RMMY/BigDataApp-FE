"use client";

import { useEffect, useState } from "react";

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

  const isReadyToTrade = leftTeam1 && leftTeam2 && rightTeam1 && rightTeam2;


useEffect(() => {
  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/meta/teams");
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
        const res = await fetch(`/api/meta/players?team_id=${leftTeam1}`);
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
        const res = await fetch(`/api/meta/players?team_id=${rightTeam1}`);
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
      const res = await fetch("/api/trades/simulate", {
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
    } catch (err) {
      setResult({ ok: false, message: "에러 발생!" });
    }

    setLoading(false);
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
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-[110px] sm:w-auto ${
              isReadyToTrade ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
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
      </div>
    </div>
  );
}
