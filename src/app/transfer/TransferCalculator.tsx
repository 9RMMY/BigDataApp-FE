"use client";

import React, { useEffect, useState } from "react";

export default function TransferCalculator() {
  const [team, setTeam] = useState("");
  const [player, setPlayer] = useState("");
  const [actionType, setActionType] = useState<"acquire" | "release">("acquire");

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);
  const [players, setPlayers] = useState<
    { player_id: string; player_name: string; position: string; team_id: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isReady = team && player && actionType;

  // 팀 목록 로드
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/meta/teams");
        if (!res.ok) return;
        const data = await res.json();
        setTeams(data);
      } catch (e) {}
    };
    fetchTeams();
  }, []);

  // 팀 선택 시 해당 팀 선수 목록 로드
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!team) {
        setPlayers([]);
        setPlayer("");
        return;
      }
      try {
        const res = await fetch(`/api/meta/players?team_id=${team}`);
        if (!res.ok) return;
        const data = await res.json();
        setPlayers(data);
        setPlayer("");
      } catch (e) {
        setPlayers([]);
        setPlayer("");
      }
    };
    fetchPlayers();
  }, [team]);

  const handleTransfer = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/simulations/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: team,
          player_in_id: player,
          type: actionType, 
        }),
      });

      if (!res.ok) throw new Error("API Error");

      const data = await res.json();

      const actionKor = actionType === "acquire" ? "영입" : "방출";

      setResult(
        `${team} 팀의 선수 ${player} ${actionKor} 완료! (예상 승점 변화: ${data.expected_points_change}, 팀 평점: ${data.new_team_rating})`
      );
    } catch (e) {
      setResult("에러 발생!");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-1 bg-white flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRANSFER
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">

          {/* 팀 선택 */}
          <select
            className="border p-1 rounded w-32 sm:w-36 text-xs sm:text-sm"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          {/* 선수 선택 */}
          <select
            className="border p-1 rounded w-32 sm:w-36 text-xs sm:text-sm"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            disabled={!team || players.length === 0}
          >
            <option value="">선수 선택</option>
            {players.map((p) => (
              <option key={p.player_id} value={p.player_id}>
                {p.player_name}
              </option>
            ))}
          </select>

          {/* 영입 / 방출 선택 UI */}
          <div className="flex gap-3 items-center text-xs sm:text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="acquire"
                checked={actionType === "acquire"}
                onChange={() => setActionType("acquire")}
              />
              영입
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="release"
                checked={actionType === "release"}
                onChange={() => setActionType("release")}
              />
              방출
            </label>
          </div>

          {/* 실행 버튼 */}
          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm transition w-[130px] sm:w-auto ${
              isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleTransfer}
            disabled={!isReady}
          >
            실행
          </button>
        </div>

        {/* 안내 */}
        {!loading && !result && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            팀 / 선수 / 영입·방출을 선택한 뒤 실행 버튼을 눌러주세요.
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-primary rounded-full"></div>
          </div>
        )}

        {/* 결과 */}
        {result && (
          <div className="flex justify-center w-full mt-2">
            <div className="bg-white shadow-lg rounded-xl p-4 w-full text-left border">
              <p className="text-gray-700 text-sm sm:text-base">{result}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


