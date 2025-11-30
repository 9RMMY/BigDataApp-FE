"use client";

import React, { useEffect, useState } from "react";
import { JEONBUK_ID, JEONBUK_NAME } from "../constants/team";
import { loadTeamSession, setMyTeam, getMyTeam } from "../../utils/teamSession";

type TransferLog = {
  log_id: number;
  type: "acquire" | "release";
  team_id: number;
  player_in_id: number;
  expected_points_change: number;
  new_team_rating: number;
  notes?: string;
};

export default function TransferCalculator() {
  const [team, setTeam] = useState(String(JEONBUK_ID));
  const [player, setPlayer] = useState("");

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);
  const [players, setPlayers] = useState<
    { player_id: string; player_name: string; position: string; team_id: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [resultData, setResultData] = useState<{
    teamName: string;
    playerName: string;
    actionLabel: string;
    points: number;
    rating: number;
    notes?: string;
  } | null>(null);

  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([]);
  const [transferHistory, setTransferHistory] = useState<{
    id: number;
    team: string;
    player: string;
    type: "acquire" | "release";
    summary: React.ReactNode;
    timestamp: Date;
  }[]>([]);

  const isReady = team && player;

  const API = process.env.NEXT_PUBLIC_API_URL;

  const actionType: "acquire" | "release" =
    team === String(JEONBUK_ID) ? "release" : "acquire";

  const [allPlayers, setAllPlayers] = useState<
    { player_id: string; player_name: string }[]
  >([]);
  useEffect(() => {
    const loadTeams = async () => {
      try {
        // 먼저 localStorage에서 데이터 확인
        const sessionData = loadTeamSession();
        if (sessionData) {
          setTeams(sessionData.teams);
          return;
        }

        // localStorage에 없으면 새로운 API로 조회
        const teamData = await getMyTeam();
        const fullTeamData = await setMyTeam(teamData.my_team_id);
        
        setTeams(fullTeamData.teams);
      } catch (err) {
        console.error("🔥 팀 정보 불러오기 실패:", err);
        
        // fallback: 기존 API 호출
        console.log("🔵 [TEAM API] fallback 호출 시작");
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
      }
    };

    loadTeams();
  }, [API]);
  useEffect(() => {
    const fetchAllPlayers = async () => {
      try {
        const res = await fetch(`${API}/api/meta/players.php`, {
          headers: { "ngrok-skip-browser-warning": "69420" }
        });
        if (res.ok) {
          const data = await res.json();
          setAllPlayers(data);
        }
      } catch (e) {
        console.log("🔥 [ALL PLAYERS API ERROR]", e);
      }
    };

    fetchAllPlayers();
  }, [API]);
  const getPlayerName = (id: number) => {
    return (
      allPlayers.find((p) => Number(p.player_id) === id)?.player_name ??
      players.find((p) => Number(p.player_id) === id)?.player_name ??
      String(id)
    );
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!team) {
        setPlayers([]);
        setPlayer("");
        return;
      }

      try {
        const res = await fetch(`${API}/api/meta/players.php?team_id=${team}`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.ok) {
          console.log("❌ [PLAYER API] res.ok = false");
          return;
        }

        const data = await res.json();

        setPlayers(data);
        setPlayer("");
      } catch (e) {
        console.log("🔥 [PLAYER API] 오류 =", e);
        setPlayers([]);
        setPlayer("");
      }
    };

    fetchPlayers();
  }, [team, API]);

  const renderColoredNumber = (value: number) => {
    const prefix = value > 0 ? "+" : "";
    const color =
      value > 0 ? "text-red-600" : value < 0 ? "text-blue-600" : "text-gray-700";

    return <span className={color}>{prefix}{value}</span>;
  };


  const renderColoredNotes = (text?: string) => {
    if (!text) return null;

    return (
      <p className="leading-tight text-gray-700">
        평가:{" "}
        {text.split(/(상승|하락)/).map((word, i) => {
          if (word === "상승") return <span key={i} className="text-red-600">상승</span>;
          if (word === "하락") return <span key={i} className="text-blue-600">하락</span>;
          return word;
        })}
      </p>
    );
  };


  const handleTransfer = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    try {
      const resSim = await fetch(`${API}/api/simulations/transfer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          team_id: Number(team),
          player_in_id: Number(player),
          type: actionType,
        }),
      });

      if (!resSim.ok) throw new Error("Simulation API Error");
      const simResult: {
        expected_points_change: number;
        new_team_rating: number;
        notes?: string;
        log_id: number;
      } = await resSim.json();

      const resApply = await fetch(`${API}/api/player.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          action: actionType,
          player_id: Number(player),
        }),
      });

      if (!resApply.ok) throw new Error("Player API Error");
      await resApply.json();

      const teamName =
        teams.find((t) => Number(t.team_id) === Number(team))?.team_name ?? String(team);

      const playerNameKor =
        players.find((p) => p.player_id === player)?.player_name || player;

      const actionLabel = actionType === "acquire" ? "영입 완료" : "방출 완료";

      const prefix = simResult.expected_points_change > 0 ? "+" : "";
      const color = simResult.expected_points_change > 0 ? "text-red-600" : "text-blue-600";

      const noteColor =
        simResult.notes?.includes("상승") ? "text-red-600" :
          simResult.notes?.includes("하락") ? "text-blue-600" :
            "text-gray-700";

      setResultData({
        teamName,
        playerName: getPlayerName(Number(player)),
        actionLabel,
        points: simResult.expected_points_change,
        rating: simResult.new_team_rating,
        notes: simResult.notes
      });



      setTransferLogs((prev) => [
        {
          log_id: simResult.log_id,
          type: actionType,
          team_id: Number(team),
          player_in_id: Number(player),
          expected_points_change: simResult.expected_points_change,
          new_team_rating: simResult.new_team_rating,
          notes: simResult.notes,
        },
        ...prev,
      ]);
    } catch (e) {
      setResult("에러 발생!");
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API}/api/simulations/log.php`, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        if (!res.ok) return;

        const data = await res.json();

        const filtered: TransferLog[] = data
          .filter(
            (log: any) => log.type === "acquire" || log.type === "release"
          )
          .map((log: any) => ({
            log_id: log.log_id,
            type: log.type,
            team_id: log.team_id,
            player_in_id: log.player_in_id,
            expected_points_change: log.expected_points_change,
            new_team_rating: log.new_team_rating,
            notes: log.notes,
          }));

        setTransferLogs(filtered);
      } catch (e) {
        console.log("🔥 [LOG API] 오류 =", e);
      }
    };

    fetchLogs();
  }, [API]);

  useEffect(() => {
    if (teams.length === 0 || players.length === 0) return;

    const mapped = transferLogs.map((log) => {
      const teamName =
        teams.find((t) => Number(t.team_id) === log.team_id)?.team_name ??
        String(log.team_id);
      const playerName =
        players.find((p) => Number(p.player_id) === log.player_in_id)
          ?.player_name ?? String(log.player_in_id);

      return {
        id: log.log_id,
        team: teamName,
        player: playerName,
        type: log.type,
        summary: (
          <div className="leading-tight">
            <p>승점 변화: {renderColoredNumber(log.expected_points_change)}</p>
            <p>새로운 팀 평점: {log.new_team_rating}</p>
            {renderColoredNotes(log.notes)}
          </div>
        ),
        timestamp: new Date(),
      };
    });

    setTransferHistory(mapped);
  }, [transferLogs, teams, players]);

  const handleDeleteLog = async (log_id: number) => {
    try {
      const res = await fetch(`${API}/api/simulations/log.php?log_id=${log_id}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      });

      if (res.ok || res.status === 204) {
        setTransferLogs((prev) => prev.filter((l) => l.log_id !== log_id));
        setTransferHistory((prev) => prev.filter((t) => t.id !== log_id));
      }
    } catch (e) {
      console.log("🔥 [DELETE LOG] 오류 =", e);
    }
  };

  return (
    <div className="flex flex-1 bg-white flex-col md:flex-row">
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRANSFER
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
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

          <button
            className={`px-3 py-1.5 rounded text-white text-xs sm:text-sm w-auto
              ${isReady
                ? "bg-primary hover:bg-primary/80"
                : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleTransfer}
            disabled={!isReady}
          >
            {actionType === "acquire" ? "영입" : "방출"}
          </button>
        </div>

        {!loading && !result && (
          <div className="text-left text-gray-500 mb-3 text-xs sm:text-sm">
            팀 / 선수 선택 후 실행 버튼을 눌러주세요.
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-3">
            <div className="animate-spin h-7 w-7 border-4 border-gray-300 border-t-primary rounded-full"></div>
          </div>
        )}

        {resultData && (
          <div className="bg-white shadow-lg rounded-xl p-4 w-full text-left border">
            <p className="text-xl font-bold leading-tight">
              [{resultData.teamName}] - {resultData.playerName} {resultData.actionLabel}!
            </p>

            <p className="mt-2 leading-tight">
              승점 변화: {renderColoredNumber(resultData.points)}
            </p>

            <p className="leading-tight">
              새로운 팀 전력: {resultData.rating}
            </p>

            {renderColoredNotes(resultData.notes)}
          </div>
        )}


        {transferHistory.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-3 text-gray-800">
              📜 영입/방출 히스토리
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {transferHistory.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        [{log.type === "acquire" ? "영입" : "방출"}] {log.team} -{" "}
                        {log.player}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {log.summary}
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-xs text-gray-400 ml-2 space-y-1">
                      <div>{log.timestamp.toLocaleTimeString()}</div>
                      <button
                        className="px-2 py-1 rounded bg-red-100 text-[11px] font-semibold text-red-600 hover:bg-red-200 border border-red-200"
                        onClick={() => handleDeleteLog(log.id)}
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
