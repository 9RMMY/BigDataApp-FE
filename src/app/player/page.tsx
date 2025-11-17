"use client";

import Link from "next/link";
import { useState } from "react";

type Player = {
  id: number;
  name: string;
  image: string;
  team: string;
  position: string;
  stats: {
    growth: string;
    rank: number;
    goals: number;
    assists: number;
    passAccuracy: number;
    defense: number;
    speed: number;
  };
};

export default function PlayerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPosition, setSelectedPosition] = useState<string>("");

  // Mock data for player cards
  const positions = ["공격수", "미드필더", "수비수", "골키퍼"];
  const teams = [
    "서울 FC",
    "수원 삼성",
    "전북 현대",
    "울산 현대",
    "포항 스틸러스",
  ];

  const playersData: Player[] = Array(20)
    .fill(0)
    .map((_, index) => {
      const position = positions[Math.floor(Math.random() * positions.length)];
      return {
        id: index + 1,
        name: `선수 ${index + 1}`,
        team: teams[Math.floor(Math.random() * teams.length)],
        position: position,
        image: "/player-placeholder.jpg",
        stats: {
          growth: (Math.random() * 20 + 5).toFixed(1) + "%",
          rank: index + 1,
          goals: Math.floor(Math.random() * 15),
          assists: Math.floor(Math.random() * 10),
          passAccuracy: Math.floor(Math.random() * 30 + 70),
          defense: Math.floor(Math.random() * 50 + 50),
          speed: Math.floor(Math.random() * 20 + 70),
        },
      };
    });

  const [sortField, setSortField] = useState<keyof Player["stats"]>("growth");

  // 포지션 필터링
  const filteredPlayers = selectedPosition
    ? playersData.filter((player) => player.position === selectedPosition)
    : [...playersData];

  // 정렬된 플레이어 목록
  const sortedPlayers: Player[] = filteredPlayers.sort(
    (a: Player, b: Player) => {
      let valueA: number;
      let valueB: number;

      // 숫자로 변환하여 비교
      if (sortField === "growth") {
        valueA = parseFloat(a.stats[sortField]);
        valueB = parseFloat(b.stats[sortField]);
      } else {
        valueA = a.stats[sortField];
        valueB = b.stats[sortField];
      }

      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    }
  );

  const handleSort = (field: keyof Player["stats"]): void => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

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
                <option value="공격수">공격수</option>
                <option value="미드필더">미드필더</option>
                <option value="수비수">수비수</option>
                <option value="골키퍼">골키퍼</option>
              </select>
            </div>

            {/* 성장률 */}
            <div className="w-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                성장률 지표
              </label>
              <select className="p-2 border rounded-md">
                <option>전체 기간</option>
                <option>최근 6개월</option>
                <option>최근 1년</option>
                <option>최근 2년</option>
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

        {/* 선수 목록 */}
        <section className="mb-0">
          <h2 className="text-xl font-bold mb-4">선수 목록</h2>
          <div className="relative">
            <div className="flex space-x-4 pb-4 overflow-x-auto">
              {sortedPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-24 bg-white p-2 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="bg-gray-200 h-16 w-16 mx-auto mb-2 rounded-full flex items-center justify-center text-gray-400 text-xs">
                    {player.name[0]}
                  </div>
                  <p className="text-sm font-medium truncate">{player.name}</p>
                  <p className="text-xs text-gray-500">{player.team}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 표 */}
        <section className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("goals")}
                  >
                    득점{" "}
                    {sortField === "goals"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("assists")}
                  >
                    도움{" "}
                    {sortField === "assists"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("passAccuracy")}
                  >
                    패스 정확도{" "}
                    {sortField === "passAccuracy"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("defense")}
                  >
                    수비력{" "}
                    {sortField === "defense"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("speed")}
                  >
                    스피드{" "}
                    {sortField === "speed"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("growth")}
                  >
                    성장률{" "}
                    {sortField === "growth"
                      ? sortOrder === "desc"
                        ? "▼"
                        : "▲"
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player, index) => (
                  <tr key={index} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xs font-medium">
                          {player.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {player.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {player.position}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        sortField === "goals"
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {player.stats.goals}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        sortField === "assists"
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {player.stats.assists}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        sortField === "passAccuracy"
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {player.stats.passAccuracy}%
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        sortField === "defense"
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {player.stats.defense}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        sortField === "speed"
                          ? "text-red-600 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {player.stats.speed}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm`}>
                      <span
                        className={`${
                          sortField === "growth"
                            ? "text-red-600 font-bold"
                            : "text-green-600"
                        } font-medium`}
                      >
                        +{player.stats.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
