"use client";

import React, { useEffect, useState } from "react";
import { JEONBUK_ID, JEONBUK_NAME } from "../constants/team";
import { loadTeamSession } from "../../utils/teamSession";

export default function TransferCalculator() {
  const [team, setTeam] = useState(String(JEONBUK_ID));
  const [player, setPlayer] = useState("");

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);
  const [players, setPlayers] = useState<
    { player_id: string; player_name: string; position: string; team_id: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [transferLogs, setTransferLogs] = useState<{
    log_id: number;
    type: "acquire" | "release";
    team_id: number;
    player_in_id: number;
    expected_points_change: number;
    new_team_rating: number;
  }[]>([]);

  const isReady = team && player;

  const API = process.env.NEXT_PUBLIC_API_URL;

  const actionType = team === String(JEONBUK_ID) ? "release" : "acquire"; // ⭐ 자동 결정

  // 팀 목록 로드
  useEffect(() => {
    const loadTeams = async () => {
      // 먼저 localStorage에서 데이터 확인
      const sessionData = loadTeamSession();
      if (sessionData) {
        setTeams(sessionData.teams);
        return;
      }

      // 세션 데이터 없으면 API 호출
      console.log("🔵 [TEAM API] 호출 시작");
      console.log("🔧 API URL =", `${API}/api/meta/teams.php`);

      try {
        const res = await fetch(`${API}/api/meta/teams.php`,
          {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          });

        if (!res.ok) {
          console.log("❌ [TEAM API] res.ok = false");
          return;
        }

        const data = await res.json();

        setTeams(data);
      } catch (e) {
        console.log("🔥 [TEAM API] 오류 =", e);
      }
    };

    loadTeams();
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
        const res = await fetch(`${API}/api/meta/players.php?team_id=${team}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          });


        if (!res.ok) {
          console.log("❌ [PLAYER API] res.ok = false");
          return;
        }

        const data = await res.json();
        console.log("🟢 [PLAYER API] 응답 데이터 =", data);

        setPlayers(data);
        setPlayer("");
      } catch (e) {
        console.log("🔥 [PLAYER API] 오류 =", e);
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
      // 1) 시뮬레이션 영향 계산
      const resSim = await fetch(`${API}/api/simulations/transfer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          team_id: Number(team),
          player_in_id: Number(player),
          type: actionType,
        }),
      });

      if (!resSim.ok) throw new Error("Simulation API Error");
      const simResult = await resSim.json();

      // 2) 실제 선수 영입/방출 처리
      const resApply = await fetch(`${API}/api/player.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({
          action: actionType,
          player_id: Number(player),
        }),
      });

      if (!resApply.ok) throw new Error("Player API Error");
      const applyResult = await resApply.json();

      const playerName = players.find((p) => p.player_id === player)?.player_name || player;

      if (actionType === "acquire") {
        setResult(
          `✔ ${playerName} 선수를 ${JEONBUK_NAME}(TEAM ${JEONBUK_ID})에 영입했습니다! (+${simResult.expected_points_change} 승점 예상)`
        );
      } else {
        setResult(
          `✔ ${playerName} 선수를 방출했습니다. (전력 변화: ${simResult.expected_points_change})`
        );
      }
    } catch (e) {
      setResult("에러 발생!");
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      console.log("📘 [LOG API] GET 시작");

      try {
        const res = await fetch(`${API}/api/simulations/log.php`);
        console.log("📘 [LOG API] status =", res.status);

        if (!res.ok) return;

        const data = await res.json();

        const filtered = data.filter((log: any) =>
          log.type === "acquire" || log.type === "release"
        );

        console.log("📘 [LOG API] 필터링된 영입/방출 로그 =", filtered);

        setTransferLogs(filtered);
      } catch (e) {
        console.log("🔥 [LOG API] 오류 =", e);
      }
    };

    fetchLogs();
  }, []);


  const handleDeleteLog = async (log_id: number) => {
    console.log("🗑 [DELETE LOG] 요청 시작", log_id);

    try {
      const res = await fetch(`${API}/api/simulations/log.php?log_id=${log_id}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "69420"
        },
      });

      if (res.ok || res.status === 204) {
        setTransferLogs((prev) => prev.filter((l) => l.log_id !== log_id));
      }
    } catch (e) {
      console.log("🔥 [DELETE LOG] 오류 =", e);
    }
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
            className="border p-1 rounded w-44 "
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
            className="border p-1 rounded w-24"
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

          {/* 실행 버튼 (자동 영입/방출) */}
          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm w-auto
              ${isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"}`}
            onClick={handleTransfer}
            disabled={!isReady}
          >
            {actionType === "acquire" ? "영입" : "방출"}
          </button>
        </div>

        {/* 안내 */}
        {!loading && !result && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            팀 / 선수 선택 후 실행 버튼을 눌러주세요.
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


        {/* 시뮬레이션 로그 */}
        {transferLogs.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 text-gray-800">📜 영입/방출 시뮬레이션 로그</h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transferLogs.map((log) => {
                const teamName = teams.find((t) => Number(t.team_id) === log.team_id)?.team_name ?? log.team_id;
                const playerName = players.find((p) => Number(p.player_id) === log.player_in_id)?.player_name
                  ?? log.player_in_id;

                return (
                  <div key={log.log_id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          [{log.type === "acquire" ? "영입" : "방출"}] {teamName} - {playerName}
                        </div>

                        <div className="text-xs text-gray-600 mt-1">
                          승점 변화: {log.expected_points_change}
                          / 새로운 팀 평점: {log.new_team_rating}
                        </div>
                      </div>

                      <button
                        className="ml-3 px-2 py-1 rounded bg-red-100 text-[11px] font-semibold text-red-600 hover:bg-red-200 border border-red-200"
                        onClick={() => handleDeleteLog(log.log_id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
