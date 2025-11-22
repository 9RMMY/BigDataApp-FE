"use client";

import { useState, useEffect } from "react";
import Card from "../components/Card";

type MVPCandidate = {
  player: string;
  probability: number;
};

type MVPResponse = {
  team_id: string;
  season: number;
  candidates: MVPCandidate[];
};

type Best11Item = {
  position: string; // "GK", "DF", "MF", "FW"
  player: string;
  probability: number; // 0~1
};

type Best11Response = {
  season: number;
  best11: Best11Item[];
};

export default function MVPPage() {
  // MVP 상태
  const [mvpCandidates, setMvpCandidates] = useState<MVPCandidate[]>([]);
  const [loadingMvp, setLoadingMvp] = useState(true);

  // Best11 상태
  const [best11, setBest11] = useState<Best11Item[]>([]);
  const [loadingBest11, setLoadingBest11] = useState(true);

  const [best11SearchQuery, setBest11SearchQuery] = useState("");
  const [best11SelectedPosition, setBest11SelectedPosition] = useState("");

  // MVP API 호출
  useEffect(() => {
    async function fetchMvpCandidates() {
      try {
        const res = await fetch("/api/season/2026/mvp-candidates");
        const data: MVPResponse = await res.json();

        setMvpCandidates(data.candidates);
      } catch (err) {
        console.error("MVP 후보 불러오기 실패:", err);
      } finally {
        setLoadingMvp(false);
      }
    }
    fetchMvpCandidates();
  }, []);

  // Best11 API 호출
  useEffect(() => {
    async function fetchBest11() {
      try {
        const res = await fetch("/api/season/2026/best11");
        const data: Best11Response = await res.json();
        setBest11(data.best11);
      } catch (err) {
        console.error("Best11 불러오기 실패:", err);
      } finally {
        setLoadingBest11(false);
      }
    }
    fetchBest11();
  }, []);

  {
    /* 베스트11 후보 필터링 */
  }
  const filteredBest11 = best11
    .filter((item) =>
      best11SelectedPosition ? item.position === best11SelectedPosition : true
    )
    .filter((item) =>
      best11SearchQuery
        ? item.player.toLowerCase().includes(best11SearchQuery.toLowerCase())
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
            </div>
          </Card>
        </div>

        <div className="space-y-10 mt-6">
          {/* MVP 후보 */}
          <div className="space-y-4">
            {loadingMvp ? (
              <div className="text-center text-gray-500 py-10">
                {" "}
                불러오는 중...{" "}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {mvpCandidates.map((candidate, index) => (
                  <Card key={index} className="bg-white p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      MVP 후보 {index + 1}
                    </h3>

                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="font-medium text-gray-900">
                          {candidate.player}
                        </div>
                        <div className="text-gray-600">
                          예측 확률: {(candidate.probability * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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
                      className="px-4 py-2 bg-white rounded-lg border border-gray-300 text-sm"
                    >
                      <option value="">포지션 필터</option>
                      <option value="공격수">공격수(FW)</option>
                      <option value="미드필더">미드필더(MF)</option>
                      <option value="수비수">수비수(DF)</option>
                      <option value="골키퍼">골키퍼(GK)</option>
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
            {loadingBest11 ? (
              <div className="col-span-3 text-center text-gray-500 py-10">
                불러오는 중...
              </div>
            ) : (
              filteredBest11.map((item, index) => (
                <Card key={index}>
                  <div className="text-md font-medium text-gray-900">
                    {item.player}
                  </div>
                  <div className="text-gray-600 text-sm">{item.position}</div>
                  <div className="text-gray-600 text-xl text-right">
                    확률: {(item.probability * 100).toFixed(1)}%
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
