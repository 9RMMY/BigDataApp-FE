// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Card from "./components/Card";
import GNB from "./components/GNB";
import LinkButton from "./components/buttons/LinkButton";

const featureItems = [
  "선수분석",
  "MVP & 베스트11",
  "트레이드",
  "영입방출",
  "라인업",
  "전략제안",
  "설명",
];

const matchResults = [
  { id: 1, date: "11월 8일 토요일 1", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 2, date: "11월 8일 토요일 2", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 3, date: "11월 8일 토요일 3", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 4, date: "11월 8일 토요일 4", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 5, date: "11월 8일 토요일 5", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 6, date: "11월 8일 토요일 6", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 7, date: "11월 8일 토요일 7", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 8, date: "11월 8일 토요일 8", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 9, date: "11월 8일 토요일 9", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 10, date: "11월 8일 토요일 10", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 11, date: "11월 8일 토요일 11", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 12, date: "11월 8일 토요일 12", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
  { id: 13, date: "11월 8일 토요일 13", stadium: "제주 월드컵경기장 14:00", home: "제주", away: "안양", score: "1 - 2" },
];


export default function Home() {
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 화면 크기 감지해서 itemsPerPage 조정
  useEffect(() => {
    const updateItems = () => {
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerPage(6);      // lg
      else if (w >= 768) setItemsPerPage(4);  // md
      else setItemsPerPage(2);               // sm
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  // itemsPerPage가 바뀌면 index 보정
  useEffect(() => {
    setCurrentIndex(0);
  }, [itemsPerPage]);

  const maxIndex = Math.max(0, matchResults.length - itemsPerPage);
  
  const visibleMatches = matchResults.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  const handleNext = () => {
    if (currentIndex + itemsPerPage < matchResults.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <GNB />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        {/* 메인 대시보드 */}
        {/* TODO: 그래프 연결 */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <Card className="bg-white shadow-sm">
            <span className="text-lg font-medium text-emerald-600">K리그</span>
            <h1 className="mt-3 text-4xl font-bold leading-snug text-gray-900 sm:text-5xl">
              2026년
              <br />
              월별 예측 순위
            </h1>
          </Card>
          <Card className="flex h-80 items-center justify-center bg-gray-300 text-3xl font-bold text-gray-700 sm:h-96">
            그래프
          </Card>
        </section>

        {/* 메뉴 네비게이션 */}
        {/* TODO: 일부 페이지 연결 */}
        <section>
          <div className="flex justify-center items-center overflow-x-auto bg-white gap-10 py-2">
            {featureItems.map((label) => (
              <LinkButton
                key={label}
                href={`/menu/${encodeURIComponent(label)}`}
                variant="ghost"
                className="p-0"
              >
                <Card
                  noPadding
                  className="flex min-w-[50px] flex-col items-center gap-1 py-1 hover:bg-gray-100 transition"
                >
                  <div className="h-14 w-14 rounded-2xl bg-gray-200" />
                  <span className="text-xs font-medium text-gray-700">
                    {label}
                  </span>
                </Card>
              </LinkButton>
            ))}
          </div>
        </section>

        {/* 경기 결과 */}
        {/* TODO: Mock 데이터 - 실제 데이터로 바꾸기 */}
        <section className="space-y-6">
          {/* 경기 결과 header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">최근 경기 결과</h2>
            
            <div className="flex gap-4">
              <button
                aria-label="이전 경기"
                onClick={handlePrev}
                disabled={currentIndex === 0} // 첫 페이지에서 비활성
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                ‹
              </button>
              <button
                aria-label="다음 경기"
                onClick={handleNext}
                disabled={currentIndex === maxIndex} // 마지막 페이지에서 비활성
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
              >
                ›
              </button>
            </div>
          </div>

          {/* 경기 결과 detail */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleMatches.map((match) => (
              <Card
                key={match.id}
                className="relative space-y-1 border-gray-200 bg-white"
              >
                {/* 상단 배경 영역 */}
                <div className="bg-emerald-600 px-4 py-2 flex justify-center rounded-tl-lg rounded-tr-lg">
                  <span className="text-md font-semibold text-white">
                    {match.date}
                  </span>
                </div>

                {/* 경기요약 + 경기장 */}
                <div className="flex items-center justify-between pl-2 pr-2 py-2">
                  <span className="rounded-full bg-rose-200 px-3 py-1 text-xs font-semibold text-rose-600">
                    경기요약
                  </span>

                  <div className="pl-2 text-sm font-medium text-gray-500">
                    {match.stadium}
                  </div>
                </div>

                {/* 홈 - 스코어 - 어웨이 */}
                <div className="flex items-start justify-between pl-4 pr-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-xl bg-gray-200" />
                    <span className="text-sm font-medium text-gray-700">
                      {match.home}
                    </span>
                  </div>

                  <div className="flex h-8 w-14 items-center justify-center mt-4 rounded-full bg-gray-200 text-base font-semibold text-gray-700">
                    {match.score}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="h-14 w-14 rounded-xl bg-gray-200" />
                    <span className="text-sm font-medium text-gray-700">
                      {match.away}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
