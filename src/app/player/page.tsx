"use client";

import Link from "next/link";
import { useState, useEffect} from "react";

type Player = {
  player_id: string;
  player_name: string;
  growth_rate: number;
  position?: string;
  team?: string;
};

export default function PlayerPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [metric, setMetric] = useState("rating_growth");

  // API 호출
  const fetchPlayers = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        position: selectedPosition,
        metric,
        sort: sortOrder,
      });

      const res = await fetch(`/api/players/growth?${params.toString()}`);
      const data = await res.json();

      setPlayers(data.players || []);
    } catch (error) {
      console.error("API Error:", error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-4">
        {/* Filter Section */}
        <section className="mb-0">
          <div className="flex flex-wrap gap-4 justify-end">
            {/* 포지션 필터 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                포지션 필터
              </label>
              <select
                className="p-2 border rounded-md"
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
              >
                <option value="">전체 포지션</option>
                <option value="공격수">공격수(FW)</option>
                <option value="미드필더">미드필더(MF)</option>
                <option value="수비수">수비수(DF)</option>
                <option value="골키퍼">골키퍼(GK)</option>
              </select>
            </div>

            {/* 성장률 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성장률 지표
              </label>
              <select
                className="p-2 border rounded-md"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                <option value="rating_growth">전체 성장률</option>
                <option value="goal_contribution_growth">공격포인트 성장</option>
                <option value="pass_accuracy_growth">패스 성장률</option>
              </select>
            </div>

            {/* 검색 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                선수 검색
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="선수 이름을 검색하세요"
                  className="w-40 sm:w-48 md:w-56 p-2 pl-10 border rounded-md"
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
          <section className="bg-white rounded-lg shadow-sm overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      순위
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th
                      className="px-6 py-3 cursor-pointer hover:bg-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                        className="px-6 py-4 text-center text-gray-500"
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
