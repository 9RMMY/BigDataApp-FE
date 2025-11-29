"use client";

import Link from "next/link";
import { useState, useEffect} from "react";
import { JEONBUK_ID } from "../constants/team";

type Player = {
  player_id: string;
  player_name: string;
  growth_rate: number;
  position?: string;
  team?: string;
};

export default function PlayerPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [metric, setMetric] = useState("offense");

  // API 호출
  const fetchPlayers = async () => {
    console.log("🚀 fetchPlayers 시작");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.set("team_id", String(JEONBUK_ID));
      if (selectedPosition) {
        params.set("position", selectedPosition);
      }
      if (metric) {
        params.set("metric", metric);
      }
      params.set("sort", sortOrder);

      const query = params.toString();
      const fullUrl = `${API}/api/player.php?${query}`;
      console.log("🔍 요청 URL:", fullUrl);

      const res = await fetch(
        query ? `${API}/api/player.php?${query}` : `${API}/api/player.php`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );
      console.log("📡 응답 status:", res.status);
      
      const responseText = await res.text();
      console.log("📄 응답 텍스트 (앞 200자):", responseText.substring(0, 200));
      
      // HTML인지 확인
      if (responseText.trim().startsWith('<')) {
        console.error("❌ HTML 응답 받음 - API가 아닌 페이지를 받았습니다");
        console.log("🔗 전체 응답 URL:", fullUrl);
        return;
      }
      
      const data = JSON.parse(responseText);
      console.log("📋 응답 데이터:", data);
      console.log("📊 players 배열:", data.players);
      console.log("📊 players 길이:", data.players?.length);

      setPlayers(data.players || []);
    } catch (error) {
      console.error("🔥 API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 시 API 다시 호출
  useEffect(() => {
    fetchPlayers();
  }, [selectedPosition, metric, sortOrder]);


  // 검색 적용
  const filteredPlayers = players.filter((p) =>
    p.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UI
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto pt-8">
        {/* Filter Section */}
        <section className="mb-0">
          <div className="flex fxlex-wrap gap-4 justify-end">
            {/* 포지션 필터 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                포지션 필터
              </label>
              <select
                className="p-2 border rounded-md text-sm"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="ALL">전체 포지션</option>
                <option value="FW">공격수(FW)</option>
                <option value="MF">미드필더(MF)</option>
                <option value="DF">수비수(DF)</option>
                <option value="GK">골키퍼(GK)</option>
              </select>
            </div>

            {/* 성장률 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                성장률 지표
              </label>
              <select
                className="p-2 border rounded-md text-sm"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="offense">공격력</option>
                <option value="defense">수비력</option>
              </select>
            </div>

            {/* 검색 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                선수 검색
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="선수 이름을 검색하세요"
                  className="w-40 sm:w-72 md:w-72 p-2 pl-10 border rounded-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 로딩 */}
        {loading && <p className="mt-4 text-gray-500">불러오는 중...</p>}

        {/* 선수 목록 */}
        {!loading && (
          <section className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                      onClick={() =>
                        setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                      }
                    >
                      성장률 {sortOrder === "desc" ? "▼" : "▲"}
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPlayers.map((player, index) => (
                    <tr key={player.player_id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium">
                        {player.player_name}
                      </td>
                      <td className="px-6 py-3 text-sm text-red-600 font-bold">
                        +{player.growth_rate}%
                      </td>
                    </tr>
                  ))}

                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-sm text-center text-gray-500"
                      >
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
