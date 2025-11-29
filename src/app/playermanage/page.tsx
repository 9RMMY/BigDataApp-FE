"use client";

import { useEffect, useState } from "react";
import { JEONBUK_ID } from "../constants/team";

type Team = {
  team_id: string;
  team_name: string;
};

type Player = {
  player_id: string;
  player_name: string;
  position: string;
  team_id: string;
};

export default function PlayerManage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(String(JEONBUK_ID));
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("");
  const [myTeamId, setMyTeamId] = useState<string>(String(JEONBUK_ID));

  useEffect(() => {
    const fetchTeams = async () => {
      console.log("🏆 PlayerManage - 팀 목록 API 호출 시작");
      try {
        setLoadingTeams(true);
        const url = `${API}/api/meta/teams.php`;
        console.log("🔍 팀 목록 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 팀 목록 응답 status:", res.status);
        
        if (!res.ok) throw new Error("팀 정보를 불러오지 못했습니다.");
        
        const data: Team[] = await res.json();
        console.log("📋 팀 목록 응답 데이터:", data);
        console.log("📊 팀 수:", data.length);
        
        setTeams(data);
      } catch (err) {
        console.error("🔥 팀 목록 불러오기 실패:", err);
        setError((err as Error).message);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedTeamId) {
        console.log("⚠️ 선택된 팀이 없어 선수 목록을 비웁니다");
        setPlayers([]);
        return;
      }

      console.log("⚽ PlayerManage - 선수 목록 API 호출 시작");
      try {
        setLoadingPlayers(true);
        const url = `${API}/api/meta/players.php?team_id=${selectedTeamId}`;
        console.log("🔍 선수 목록 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 선수 목록 응답 status:", res.status);
        
        if (!res.ok) throw new Error("선수 정보를 불러오지 못했습니다.");
        
        const data: Player[] = await res.json();
        console.log("📋 선수 목록 응답 데이터:", data);
        console.log("📊 선수 수:", data.length);
        
        setPlayers(data);
      } catch (err) {
        console.error("🔥 선수 목록 불러오기 실패:", err);
        setError((err as Error).message);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [selectedTeamId]);

  const handleRelease = async (playerId: string) => {
    console.log("🚪 선수 방출 시작 - player_id:", playerId);
    try {
      const url = `${API}/api/player.php`;
      console.log("🔍 선수 방출 요청 URL:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ 
          action: "release",
          player_id: playerId 
        }),
      });

      console.log("📡 선수 방출 응답 status:", res.status);

      if (!res.ok) {
        throw new Error("선수 방출에 실패했습니다.");
      }

      const result = await res.json();
      console.log("📋 선수 방출 응답 데이터:", result);
      if (result.success) {
        setPlayers((prev) => prev.filter((p) => p.player_id !== playerId));
        alert(result.message || "선수 방출이 완료되었습니다.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "선수 방출 중 오류가 발생했습니다.");
    }
  };

  const handleRecruit = async () => {
    if (!searchName.trim()) {
      alert("선수 ID를 입력하세요.");
      return;
    }

    console.log("🤝 선수 영입 시작 - player_id:", searchName.trim());
    try {
      const url = `${API}/api/player.php`;
      console.log("🔍 선수 영입 요청 URL:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({ 
          action: "acquire",
          player_id: searchName.trim() 
        }),
      });

      console.log("📡 선수 영입 응답 status:", res.status);

      if (!res.ok) {
        throw new Error("선수 영입에 실패했습니다.");
      }

      const result = await res.json();
      console.log("📋 선수 영입 응답 데이터:", result);
      if (result.success) {
        alert(result.message || "선수 영입이 완료되었습니다.");
        setSearchName("");
        setSearchPosition("");
        
        // Refresh players list if my team is selected
        if (selectedTeamId === myTeamId) {
          console.log("🔄 선수 목록 새로고침 시작");
          const refreshUrl = `${API}/api/meta/players.php?team_id=${selectedTeamId}`;
          console.log("🔍 새로고침 요청 URL:", refreshUrl);
          
          const refreshRes = await fetch(refreshUrl, {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          });
          console.log("📡 새로고침 응답 status:", refreshRes.status);
          
          if (refreshRes.ok) {
            const data: Player[] = await refreshRes.json();
            console.log("📋 새로고침된 선수 목록:", data);
            setPlayers(data);
          } else {
            console.error("🔥 선수 목록 새로고침 실패");
          }
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "선수 영입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full px-8 pt-5 flex flex-col gap-4">

      {/* 페이지 헤더 */}
      <h1 className="text-2xl font-bold tracking-tight">Player Management</h1>

      {/* 팀 선택 */}
      <div className="flex items-center gap-3 border-b pb-3">
        <label className="text-sm font-medium">팀 선택</label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="border rounded px-2 py-0.5 text-xs bg-white shadow-sm"
        >
          <option value=""></option>
          {teams.map((team) => (
            <option key={team.team_id} value={team.team_id}>
              {team.team_name}
            </option>
          ))}
        </select>

        {loadingTeams && (
          <span className="text-xs text-gray-500">불러오는 중...</span>
        )}
      </div>

      {/* 메인 2단 구성 */}
      <div className="grid grid-cols-3 gap-8">

        {/* 왼쪽: 선수 리스트 (스크롤) */}
        <div className="col-span-2 bg-gray-50 rounded-xl p-5 shadow-inner h-[280px] overflow-y-auto">

          {loadingPlayers ? (
            <p className="text-sm text-gray-500">선수 로딩 중...</p>
          ) : !selectedTeamId ? (
            <p className="text-sm text-gray-500">팀을 선택하세요.</p>
          ) : players.length === 0 ? (
            <p className="text-sm text-gray-400">등록된 선수가 없습니다.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {players.map((player) => (
                <li
                  key={player.player_id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border hover:shadow-md transition"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{player.player_name}</span>
                    <span className="text-xs text-gray-500">
                      포지션: {player.position}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRelease(player.player_id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    방출
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 오른쪽: 영입 카드 */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-4 border">

          <h2 className="text-sm font-semibold">선수 영입</h2>

          <input
            type="text"
            placeholder="선수 ID"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-sm shadow-sm"
          />

          <input
            type="text"
            placeholder="포지션 (참고용)"
            value={searchPosition}
            onChange={(e) => setSearchPosition(e.target.value)}
            className="border rounded px-3 py-2 text-sm shadow-sm"
          />

          <button
            onClick={handleRecruit}
            disabled={!searchName.trim()}
            className="px-3 py-2 text-sm rounded bg-primary hover:bg-primary/80 text-white  disabled:bg-gray-300"
          >
            영입하기
          </button>

          <span className="text-xs text-gray-500">선수 ID를 입력하세요.</span>
        </div>

      </div>
    </div>
  );
}
