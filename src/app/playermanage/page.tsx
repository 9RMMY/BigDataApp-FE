"use client";

import { useEffect, useState } from "react";
import { JEONBUK_ID } from "../constants/team";
import { loadTeamSession } from "../../utils/teamSession";

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
  const [myTeamPlayers, setMyTeamPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      // 먼저 localStorage에서 데이터 확인
      const sessionData = loadTeamSession();
      if (sessionData) {
        setTeams(sessionData.teams);
        setMyTeamId(sessionData.my_team_id);
        return;
      }

      // 세션 데이터 없으면 API 호출
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

    loadTeams();
  }, []);

  // 우리 팀 선수 목록 별도 API 호출
  useEffect(() => {
    const fetchMyTeamPlayers = async () => {
      console.log("💚 우리 팀 선수 목록 API 호출 시작");
      try {
        const url = `${API}/api/meta/players.php?team_id=${myTeamId}`;
        console.log("🔍 우리 팀 선수 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 우리 팀 선수 응답 status:", res.status);
        
        if (!res.ok) throw new Error("우리 팀 선수 정보를 불러오지 못했습니다.");
        
        const data: Player[] = await res.json();
        console.log("📋 우리 팀 선수 응답 데이터:", data);
        console.log("📊 우리 팀 선수 수:", data.length);
        
        setMyTeamPlayers(data);
      } catch (err) {
        console.error("🔥 우리 팀 선수 불러오기 실패:", err);
      }
    };

    fetchMyTeamPlayers();
  }, [myTeamId]);

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
        // 우리 팀 선수 목록에서도 제거
        setMyTeamPlayers((prev) => prev.filter((p) => p.player_id !== playerId));
        alert(result.message || "선수 방출이 완료되었습니다.");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "선수 방출 중 오류가 발생했습니다.");
    }
  };

  const handleRecruitPlayer = async (playerId: string) => {
    console.log("🤝 특정 선수 영입 시작 - player_id:", playerId);
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
          player_id: playerId 
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
        
        // 우리 팀 선수 목록 새로고침
        const myTeamRefreshUrl = `${API}/api/meta/players.php?team_id=${myTeamId}`;
        const myTeamRefreshRes = await fetch(myTeamRefreshUrl, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        
        if (myTeamRefreshRes.ok) {
          const myTeamData: Player[] = await myTeamRefreshRes.json();
          setMyTeamPlayers(myTeamData);
          
          // 선택된 팀이 우리 팀이면 현재 목록도 새로고침
          if (selectedTeamId === myTeamId) {
            setPlayers(myTeamData);
          }
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "선수 영입 중 오류가 발생했습니다.");
    }
  };

  const handleRecruit = async () => {
    if (!searchName.trim()) {
      alert("선수 이름을 입력하세요.");
      return;
    }

    console.log("🤝 선수 영입 시작 - player_name:", searchName.trim());
    
    // 선수 이름으로 선수 찾기
    const allPlayers = [...players, ...myTeamPlayers];
    const foundPlayer = allPlayers.find(p => 
      p.player_name.toLowerCase().includes(searchName.trim().toLowerCase())
    );
    
    if (!foundPlayer) {
      alert("해당 이름의 선수를 찾을 수 없습니다.");
      return;
    }
    
    console.log("🔍 찾은 선수:", foundPlayer);
    
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
          player_id: Number(foundPlayer.player_id) 
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
            // 우리 팀 선수 목록도 새로고침
            setMyTeamPlayers(data);
          } else {
            console.error("🔥 선수 목록 새로고침 실패");
          }
        } else {
          // 우리 팀이 선택되지 않았더라도 우리 팀 선수 목록은 새로고침
          const myTeamRefreshUrl = `${API}/api/meta/players.php?team_id=${myTeamId}`;
          const myTeamRefreshRes = await fetch(myTeamRefreshUrl, {
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          });
          
          if (myTeamRefreshRes.ok) {
            const myTeamData: Player[] = await myTeamRefreshRes.json();
            setMyTeamPlayers(myTeamData);
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
                    onClick={() => selectedTeamId !== myTeamId && handleRecruitPlayer(player.player_id)}
                    disabled={selectedTeamId === myTeamId}
                    className={`px-2 py-1 text-xs rounded ${
                      selectedTeamId === myTeamId
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {selectedTeamId === myTeamId ? "우리 팀" : "영입"}
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
            placeholder="선수 이름"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border rounded px-3 py-2 text-sm shadow-sm"
          />

          <input
            type="text"
            placeholder="포지션"
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
        </div>

      </div>

      {/* 우리 팀 선수 목록 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <h2 className="text-base font-semibold text-emerald-800">우리 팀 선수 ({myTeamPlayers.length}명)</h2>
        </div>
        
        {myTeamPlayers.length === 0 ? (
          <div className="text-center py-3 text-emerald-600 text-sm">
            우리 팀에 선수가 없습니다. 선수를 영입해보세요!
          </div>
        ) : (
          // 포지션별 그룹화
          Object.entries(
            myTeamPlayers.reduce((groups, player) => {
              const position = player.position || '기타';
              if (!groups[position]) {
                groups[position] = [];
              }
              groups[position].push(player);
              return groups;
            }, {} as Record<string, Player[]>)
          )
          .sort(([posA], [posB]) => {
            // 포지션 정렬: GK, DF, MF, FW, 기타
            const order = { 'GK': 0, 'DF': 1, 'MF': 2, 'FW': 3 };
            const orderA = order[posA as keyof typeof order] ?? 99;
            const orderB = order[posB as keyof typeof order] ?? 99;
            return orderA - orderB;
          })
          .map(([position, players]) => (
            <div key={position} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-emerald-700">{position}</span>
                </div>
                <h3 className="text-sm font-medium text-emerald-700">
                  {position === 'GK' ? '골키퍼' : 
                   position === 'DF' ? '수비수' : 
                   position === 'MF' ? '미드필더' : 
                   position === 'FW' ? '공격수' : '기타'} ({players.length}명)
                </h3>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {players.map((player) => (
                  <div
                    key={player.player_id}
                    onClick={() => {
                      if (window.confirm(`${player.player_name} 선수를 방출하시겠습니까?`)) {
                        handleRelease(player.player_id);
                      }
                    }}
                    className="bg-white rounded-lg p-2 border border-emerald-200 hover:shadow-sm hover:border-red-300 transition cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-xs">
                          {player.position.charAt(0)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-gray-900 truncate">
                        {player.player_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {player.position}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
