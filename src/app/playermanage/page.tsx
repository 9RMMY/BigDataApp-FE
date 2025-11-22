"use client";

import { useEffect, useState } from "react";

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
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchName, setSearchName] = useState("");
  const [searchPosition, setSearchPosition] = useState("");
  const [myTeamId, setMyTeamId] = useState<string>("10");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoadingTeams(true);
        const res = await fetch("/api/meta/teams");
        if (!res.ok) throw new Error("팀 정보를 불러오지 못했습니다.");
        const data: Team[] = await res.json();
        setTeams(data);
      } catch (err) {
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
        setPlayers([]);
        return;
      }

      try {
        setLoadingPlayers(true);
        const res = await fetch(`/api/meta/players?team_id=${selectedTeamId}`);
        if (!res.ok) throw new Error("선수 정보를 불러오지 못했습니다.");
        const data: Player[] = await res.json();
        setPlayers(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [selectedTeamId]);

  const handleRelease = async (playerId: string) => {
    try {
      const res = await fetch("/api/myteam/release/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_id: playerId }),
      });

      if (!res.ok) {
        throw new Error("선수 방출에 실패했습니다.");
      }

      const result = await res.json();
      if (result.success) {
        setPlayers((prev) => prev.filter((p) => p.player_id !== playerId));
        alert("선수 방출이 완료되었습니다.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "선수 방출 중 오류가 발생했습니다.");
    }
  };

  const handleRecruit = async () => {
    if (!searchName.trim()) {
      alert("선수 이름을 입력하세요.");
      return;
    }

    try {
      const res = await fetch("/api/myteam/acquire/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_id: searchName.trim() }),
      });

      if (!res.ok) {
        throw new Error("선수 영입에 실패했습니다.");
      }

      const result = await res.json();
      if (result.success) {
        alert("선수 영입이 완료되었습니다.");
        setSearchName("");
        setSearchPosition("");
        
        // Refresh players list if my team is selected
        if (selectedTeamId === myTeamId) {
          const refreshRes = await fetch(`/api/meta/players?team_id=${selectedTeamId}`);
          if (refreshRes.ok) {
            const data: Player[] = await refreshRes.json();
            setPlayers(data);
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
