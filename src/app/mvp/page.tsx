"use client";

import { useState } from "react";
import Card from "../components/Card";

type MVPCandidate = {
  id: number;
  name: string;
};

type Best11Player = {
  id: number;
  name: string;
  position: string;
  probability: number;
  hasStar?: boolean;
};

export default function MVPPage() {
  const [mvpSearchQuery, setMvpSearchQuery] = useState("");
  const [mvpSelectedPosition, setMvpSelectedPosition] = useState("");
  const [mvpSelectedGrowth, setMvpSelectedGrowth] = useState("");

  const [best11SearchQuery, setBest11SearchQuery] = useState("");
  const [best11SelectedPosition, setBest11SelectedPosition] = useState("");
  const [best11SelectedGrowth, setBest11SelectedGrowth] = useState("");

  const mvpCandidates: MVPCandidate[] = [
    { id: 1, name: "김민재" },
    { id: 2, name: "손흥민" },
    { id: 3, name: "이강인" },
  ];

  const best11Players: Best11Player[] = [
    { id: 1, name: "김민재", position: "수비수", probability: 92 },
    { id: 2, name: "손흥민", position: "공격수", probability: 99 },
    { id: 3, name: "이강인", position: "미드필더", probability: 96 },
    { id: 4, name: "조현우", position: "골키퍼", probability: 88 },
    { id: 5, name: "정우영", position: "미드필더", probability: 87 },
    { id: 6, name: "황희찬", position: "공격수", probability: 94 },
    { id: 7, name: "김영권", position: "수비수", probability: 85 },
    { id: 8, name: "홍현석", position: "미드필더", probability: 78 },
    { id: 9, name: "백승호", position: "미드필더", probability: 81 },
    { id: 10, name: "박지수", position: "수비수", probability: 83 },
    { id: 11, name: "오현규", position: "공격수", probability: 74 },
    { id: 12, name: "송범근", position: "골키퍼", probability: 70 },
  ];

  {/* 베스트11 후보 필터링 */}
  const filteredBest11 = best11Players
    .filter((player) =>
      best11SelectedPosition ? player.position === best11SelectedPosition : true
    )
    .filter((player) =>
      best11SearchQuery
        ? player.name.toLowerCase().includes(best11SearchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => b.probability - a.probability);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* MVP 섹션 */}
        <div className="space-y-6">
          <Card className="bg-white p-8">
            <div
              className="grid gap-6 
                    grid-cols-1 
                    lg:grid-cols-[1fr_auto_3fr]
                    items-start"
            >
              {/* 제목 */}
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  2026 <br /> MVP 예측
                </h2>
                <p className="text-sm text-gray-500">
                  현재 진행 중인 시즌 데이터를 기반으로 예측합니다.
                </p>
              </div>

              {/* 세로선 */}
              <div className="hidden lg:block w-px bg-gray-300 h-full mx-auto"></div>

              {/* 작년 MVP 후보 */}
              <div>
                <Card className="bg-white border border-gray-300 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    작년 MVP 후보
                  </h3>

                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="font-medium text-gray-900">이름이름</div>
                      <div className="text-gray-600">경기력 지표</div>
                      <div className="text-gray-600">시즌 공헌도</div>
                      <div className="text-gray-600">팀 성적</div>
                      <div className="text-gray-600">보완점</div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-10 mt-6">
          
          {/* MVP 후보 */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {mvpCandidates.map((candidate) => (
                <Card key={candidate.id} className="bg-white p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    MVP 후보 {candidate.id}
                  </h3>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="font-medium text-gray-900">이름</div>
                      <div className="text-gray-600">경기력 지표</div>
                      <div className="text-gray-600">시즌 공헌도</div>
                      <div className="text-gray-600">팀 성적</div>
                      <div className="text-gray-600">보완점</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-px mt-10 bg-gray-300"></div>

        {/* 베스트11 섹션 */}
        <section className="mt-12 space-y-6">
          <div className="space-y-6">
            
            {/* 제목 */}
            <Card className="bg-white p-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                베스트 11 예측
              </h2>
              <p className="text-sm text-gray-500">
                시즌 진행에 따라 지속적으로 업데이트 됩니다.
              </p>

              {/* 베스트11 필터 */}
              <div className="p-4">
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <div className="flex gap-3">
                    <select
                      value={best11SelectedPosition}
                      onChange={(e) =>
                        setBest11SelectedPosition(e.target.value)
                      }
                      className="px-4 py-2 bg-white rounded-lg border border-gray-300 text-sm font-medium text-gray-700"
                    >
                      <option value="">포지션 필터</option>
                      <option value="공격수">공격수</option>
                      <option value="미드필더">미드필더</option>
                      <option value="수비수">수비수</option>
                      <option value="골키퍼">골키퍼</option>
                    </select>
                  </div>

                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        🔍
                      </div>
                      <input
                        type="text"
                        placeholder="선수 이름을 검색하세요"
                        value={best11SearchQuery}
                        onChange={(e) => setBest11SearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white rounded-lg border border-gray-300 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 베스트11 카드 */}
          <div className="grid grid-cols-3 gap-4">
            {filteredBest11.map((player) => (
              <Card key={player.id}>
                <div className="text-md font-medium text-gray-900">
                  {player.name}
                </div>
                <div className="text-gray-600 text-sm">{player.position}</div>
                <div className="text-gray-600 text-xl text-right">
                  확률: {player.probability}%
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
