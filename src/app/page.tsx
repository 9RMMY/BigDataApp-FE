"use client";

import { useState, useEffect } from "react";
import Card from "./components/Card";
import GNB from "./components/GNB";
import LinkButton from "./components/buttons/LinkButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type MonthlyRankData = {
  data_period: string;
  expected_rank: number;
  team_rating: number;
  expected_winrate: number;
  expected_goals: number;
  schedule_difficulty: number;
};

type TeamRankingResponse = {
  team_id: string;
  season_id: number;
  monthly: MonthlyRankData[];
};

const featureItems = [
  { label: "선수분석", path: "/player" },
  { label: "MVP & 베스트11", path: "/mvp" },
  { label: "트레이드", path: "/trade" },
  { label: "영입방출", path: "/transfer" },
  { label: "라인업", path: "/lineup" },
  { label: "전략제안", path: "/strategy" },
  { label: "설명", path: "/playermanage" },
];

// 경기결과 MOCK 데이터
const matchResults = [
  {
    id: 1,
    date: "11월 8일 토요일 1",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 2,
    date: "11월 8일 토요일 2",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 3,
    date: "11월 8일 토요일 3",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 4,
    date: "11월 8일 토요일 4",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 5,
    date: "11월 8일 토요일 5",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 6,
    date: "11월 8일 토요일 6",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 7,
    date: "11월 8일 토요일 7",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 8,
    date: "11월 8일 토요일 8",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 9,
    date: "11월 8일 토요일 9",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 10,
    date: "11월 8일 토요일 10",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 11,
    date: "11월 8일 토요일 11",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 12,
    date: "11월 8일 토요일 12",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
  {
    id: 13,
    date: "11월 8일 토요일 13",
    stadium: "제주 월드컵경기장 14:00",
    home: "제주",
    away: "안양",
    score: "1 - 2",
  },
];


export default function Home() {
  
  // 팀 순위 예측 관련 상태
  const [teamRankingData, setTeamRankingData] = useState<TeamRankingResponse[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [rankingError, setRankingError] = useState<string | null>(null);
  
  // 경기결과 관련
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 화면 크기 감지해서 itemsPerPage 조정
  useEffect(() => {
    const updateItems = () => {
      const w = window.innerWidth;
      if (w >= 1024) setItemsPerPage(6); // lg
      else if (w >= 768) setItemsPerPage(4); // md
      else setItemsPerPage(2); // sm
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  // itemsPerPage가 바뀌면 index 보정
  useEffect(() => {
    setCurrentIndex(0);
  }, [itemsPerPage]);

  // 팀 순위 예측 데이터 API 호출
  useEffect(() => {
    const fetchTeamRankingData = async () => {
      try {
        setLoadingRanking(true);
        
        // 테스트용 Mock 데이터 - 실제 API 호출 대신 사용
        const mockData: TeamRankingResponse[] = [
          {
            team_id: "ulsan",
            season_id: 2026,
            monthly: [
              { data_period: "2026-02", expected_rank: 3, team_rating: 78.2, expected_winrate: 0.58, expected_goals: 1.6, schedule_difficulty: 0.45 },
              { data_period: "2026-03", expected_rank: 2, team_rating: 79.5, expected_winrate: 0.62, expected_goals: 1.7, schedule_difficulty: 0.38 },
              { data_period: "2026-04", expected_rank: 1, team_rating: 81.3, expected_winrate: 0.65, expected_goals: 1.8, schedule_difficulty: 0.35 },
              { data_period: "2026-05", expected_rank: 2, team_rating: 80.9, expected_winrate: 0.61, expected_goals: 1.7, schedule_difficulty: 0.42 },
              { data_period: "2026-06", expected_rank: 3, team_rating: 79.8, expected_winrate: 0.59, expected_goals: 1.6, schedule_difficulty: 0.48 }
            ]
          },
          {
            team_id: "pohang",
            season_id: 2026,
            monthly: [
              { data_period: "2026-02", expected_rank: 5, team_rating: 75.1, expected_winrate: 0.52, expected_goals: 1.4, schedule_difficulty: 0.52 },
              { data_period: "2026-03", expected_rank: 4, team_rating: 76.8, expected_winrate: 0.55, expected_goals: 1.5, schedule_difficulty: 0.45 },
              { data_period: "2026-04", expected_rank: 3, team_rating: 78.2, expected_winrate: 0.58, expected_goals: 1.6, schedule_difficulty: 0.42 },
              { data_period: "2026-05", expected_rank: 4, team_rating: 77.5, expected_winrate: 0.56, expected_goals: 1.5, schedule_difficulty: 0.46 },
              { data_period: "2026-06", expected_rank: 5, team_rating: 76.3, expected_winrate: 0.53, expected_goals: 1.4, schedule_difficulty: 0.51 }
            ]
          },
          {
            team_id: "jeonbuk",
            season_id: 2026,
            monthly: [
              { data_period: "2026-02", expected_rank: 1, team_rating: 82.4, expected_winrate: 0.67, expected_goals: 1.9, schedule_difficulty: 0.32 },
              { data_period: "2026-03", expected_rank: 1, team_rating: 83.1, expected_winrate: 0.69, expected_goals: 2.0, schedule_difficulty: 0.30 },
              { data_period: "2026-04", expected_rank: 2, team_rating: 81.8, expected_winrate: 0.66, expected_goals: 1.9, schedule_difficulty: 0.33 },
              { data_period: "2026-05", expected_rank: 1, team_rating: 82.7, expected_winrate: 0.68, expected_goals: 1.9, schedule_difficulty: 0.31 },
              { data_period: "2026-06", expected_rank: 1, team_rating: 83.5, expected_winrate: 0.70, expected_goals: 2.1, schedule_difficulty: 0.28 }
            ]
          },
          {
            team_id: "seoul",
            season_id: 2026,
            monthly: [
              { data_period: "2026-02", expected_rank: 8, team_rating: 71.3, expected_winrate: 0.45, expected_goals: 1.2, schedule_difficulty: 0.58 },
              { data_period: "2026-03", expected_rank: 7, team_rating: 72.5, expected_winrate: 0.48, expected_goals: 1.3, schedule_difficulty: 0.55 },
              { data_period: "2026-04", expected_rank: 6, team_rating: 73.8, expected_winrate: 0.50, expected_goals: 1.4, schedule_difficulty: 0.52 },
              { data_period: "2026-05", expected_rank: 7, team_rating: 72.9, expected_winrate: 0.47, expected_goals: 1.3, schedule_difficulty: 0.54 },
              { data_period: "2026-06", expected_rank: 6, team_rating: 74.2, expected_winrate: 0.51, expected_goals: 1.4, schedule_difficulty: 0.50 }
            ]
          }
        ];
        
        // 실제 API 호출 (주석 처리)
        /*
        const teams = ['ulsan', 'pohang', 'jeonbuk', 'seoul'];
        const promises = teams.map(async (teamId) => {
          const res = await fetch(`/api/season/2026/teams/${teamId}/monthly-rank`);
          if (!res.ok) throw new Error(`${teamId} 팀 순위 데이터 조회 실패`);
          return res.json();
        });
        
        const data = await Promise.all(promises);
        */
        
        setTeamRankingData(mockData);
      } catch (e) {
        setRankingError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchTeamRankingData();
  }, []);

  // 차트 데이터 준비 함수
  const prepareChartData = () => {
    const allMonths = new Set<string>();
    teamRankingData.forEach(team => {
      team.monthly.forEach(month => {
        allMonths.add(month.data_period);
      });
    });
    
    return Array.from(allMonths).sort().map(month => {
      const monthData: any = { month: month.substring(5) }; // "2026-05" -> "05"
      teamRankingData.forEach(team => {
        const monthDataForTeam = team.monthly.find(m => m.data_period === month);
        monthData[team.team_id] = monthDataForTeam?.expected_rank || null;
      });
      return monthData;
    });
  };

  // 팀별 색상
  const getTeamColor = (index: number) => {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return colors[index % colors.length];
  };

  // 팀 이름 변환
  const getTeamName = (teamId: string) => {
    const teamNames: Record<string, string> = {
      'ulsan': '울산 현대',
      'pohang': '포항 스틸러스',
      'jeonbuk': '전북 현대',
      'seoul': 'FC 서울'
    };
    return teamNames[teamId] || teamId;
  };

  const maxIndex = Math.max(
    0,
    Math.ceil(matchResults.length / itemsPerPage - 1) * itemsPerPage
  );

  const visibleMatches = matchResults.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  const handleNext = () => {
  const nextIndex = currentIndex + itemsPerPage;
  if (nextIndex <= maxIndex) {
    setCurrentIndex(nextIndex);
  }
};

  const handlePrev = () => {
  const prevIndex = currentIndex - itemsPerPage;
  if (prevIndex >= 0) {
    setCurrentIndex(prevIndex);
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
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
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">팀별 순위 추이</h2>
            {loadingRanking ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                데이터 로딩 중...
              </div>
            ) : rankingError ? (
              <div className="flex h-64 items-center justify-center text-red-500">
                {rankingError}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={prepareChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[1, 12]}
                    reversed
                  />
                  <Tooltip />
                  <Legend />
                  {teamRankingData.map((team, index) => (
                    <Line
                      key={team.team_id}
                      type="monotone"
                      dataKey={team.team_id}
                      stroke={getTeamColor(index)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={getTeamName(team.team_id)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </section>

        {/* 메뉴 네비게이션 */}
        <section>
          <div className="flex justify-center items-center overflow-x-auto bg-white gap-10 py-2">
            {featureItems.map(({ label, path }) => (
              <LinkButton
                key={label}
                href={path}
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
        {/* Mock 데이터 */}
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
