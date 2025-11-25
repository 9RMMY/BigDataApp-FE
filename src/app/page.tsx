"use client";

import { useState, useEffect } from "react";
import Card from "./components/Card";
import GNB from "./components/GNB";
import LinkButton from "./components/buttons/LinkButton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useMemo } from "react";

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

type GoalRatioData = {
  category: string;
  value: number;
  fill: string;
};

type GoalStatsResponse = {
  league_total_goals: number;
  team_total_goals: number;
  midfielder_goals: number;
  forward_goals: number;
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
  
  // 월 범위 조절 관련 상태
  const [monthRangeIndex, setMonthRangeIndex] = useState(0);
  const [monthsPerView] = useState(4); // 한 번에 보여줄 월 수
  
  // 득점 비율 관련 상태
  const [goalStatsData, setGoalStatsData] = useState<GoalStatsResponse | null>(null);
  const [loadingGoalStats, setLoadingGoalStats] = useState(true);
  const [goalStatsError, setGoalStatsError] = useState<string | null>(null);
  
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
        
        const teams = ['ulsan', 'pohang', 'jeonbuk', 'seoul'];
        const promises = teams.map(async (teamId) => {
          const res = await fetch(`/api/team.php?season_id=2026&team_id="${teamId}"`);
          if (!res.ok) throw new Error(`${teamId} 팀 순위 데이터 조회 실패`);
          return res.json();
        });
        
        const data = await Promise.all(promises);
        setTeamRankingData(data);
      } catch (e) {
        setRankingError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingRanking(false);
      }
    };

    fetchTeamRankingData();
  }, []);

  // 득점 비율 데이터 API 호출
  useEffect(() => {
    const fetchGoalStatsData = async () => {
      try {
        setLoadingGoalStats(true);
        
        const res = await fetch('/api/analysis/olap.php?season_id=2026');
        if (!res.ok) throw new Error('득점 통계 데이터 조회 실패');
        const data = await res.json();
        
        // OLAP 데이터를 GoalStatsResponse 형식으로 변환
        const teamData = data.data.find((item: any) => item.position === 'SUBTOTAL' && item.team_name !== 'TOTAL');
        const totalData = data.data.find((item: any) => item.team_name === 'TOTAL');
        const fwData = data.data.find((item: any) => item.position === 'FW');
        const mfData = data.data.find((item: any) => item.position === 'MF');
        
        if (teamData && totalData && fwData && mfData) {
          const goalStats: GoalStatsResponse = {
            league_total_goals: totalData.total_goals,
            team_total_goals: teamData.total_goals,
            midfielder_goals: mfData.total_goals,
            forward_goals: fwData.total_goals
          };
          setGoalStatsData(goalStats);
        } else {
          throw new Error('필요한 득점 데이터를 찾을 수 없습니다');
        }
      } catch (e) {
        setGoalStatsError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingGoalStats(false);
      }
    };

    fetchGoalStatsData();
  }, []);

  // 차트 데이터 준비 함수
  const prepareChartData = () => {
    const allMonths = new Set<string>();
    teamRankingData.forEach(team => {
      team.monthly.forEach(month => {
        allMonths.add(month.data_period);
      });
    });
    
    const sortedMonths = Array.from(allMonths).sort();
    
    // 현재 보여줄 월 범위 계산
    const startIndex = monthRangeIndex * monthsPerView;
    const endIndex = Math.min(startIndex + monthsPerView, sortedMonths.length);
    const visibleMonths = sortedMonths.slice(startIndex, endIndex);
    
    return visibleMonths.map(month => {
      const monthData: any = { month: month.substring(5) }; // "2026-05" -> "05"
      teamRankingData.forEach(team => {
        const monthDataForTeam = team.monthly.find(m => m.data_period === month);
        monthData[team.team_id] = monthDataForTeam?.expected_rank || null;
      });
      return monthData;
    });
  };

  // 월 범위 조절 함수들
  const getAllMonths = () => {
    const allMonths = new Set<string>();
    teamRankingData.forEach(team => {
      team.monthly.forEach(month => {
        allMonths.add(month.data_period);
      });
    });
    return Array.from(allMonths).sort();
  };

  const getMaxRangeIndex = () => {
    const allMonths = getAllMonths();
    return Math.ceil(allMonths.length / monthsPerView) - 1;
  };

  const handleNextMonthRange = () => {
    const maxIndex = getMaxRangeIndex();
    if (monthRangeIndex < maxIndex) {
      setMonthRangeIndex(monthRangeIndex + 1);
    }
  };

  const handlePrevMonthRange = () => {
    if (monthRangeIndex > 0) {
      setMonthRangeIndex(monthRangeIndex - 1);
    }
  };

  const getCurrentRangeText = () => {
    const allMonths = getAllMonths();
    const startIndex = monthRangeIndex * monthsPerView;
    const endIndex = Math.min(startIndex + monthsPerView - 1, allMonths.length - 1);
    
    const startMonth = allMonths[startIndex]?.substring(5) || '';
    const endMonth = allMonths[endIndex]?.substring(5) || '';
    
    return `${startMonth}월 - ${endMonth}월`;
  };

  // 득점 비율 차트 데이터 준비 함수
  const prepareGoalRatioData = () => {
    if (!goalStatsData) return [];
    
    const { league_total_goals, team_total_goals, midfielder_goals, forward_goals } = goalStatsData;
    
    // 우리 팀 득점 외의 리그 득점
    const other_teams_goals = league_total_goals - team_total_goals;
    
    // 퍼센트로 변환
    const other_teams_percent = (other_teams_goals / league_total_goals) * 100;
    const forward_percent = (forward_goals / league_total_goals) * 100;
    const midfielder_percent = (midfielder_goals / league_total_goals) * 100;
    
    return [
      {
        name: '리그 득점',
        '리그 전체 득점': other_teams_percent,
        'FW 득점': forward_percent,
        'MF 득점': midfielder_percent,
      },
    ];
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">팀별 순위 추이</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">{getCurrentRangeText()}</span>
                <div className="flex gap-2">
                  <button
                    aria-label="이전 월 범위"
                    onClick={handlePrevMonthRange}
                    disabled={monthRangeIndex === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    aria-label="다음 월 범위"
                    onClick={handleNextMonthRange}
                    disabled={monthRangeIndex >= getMaxRangeIndex()}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-white text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
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

        {/* 득점 비율 분석 */}
        <section className="grid gap-4 lg:grid-cols-1">
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">득점 비율 분석</h2>
            {loadingGoalStats ? (
              <div className="flex h-64 items-center justify-center text-gray-500">
                데이터 로딩 중...
              </div>
            ) : goalStatsError ? (
              <div className="flex h-64 items-center justify-center text-red-500">
                {goalStatsError}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">리그 전체 득점</div>
                    <div className="text-xl font-bold text-gray-900">{goalStatsData?.league_total_goals || 0}</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-sm text-gray-600">우리 팀 득점</div>
                    <div className="text-xl font-bold text-emerald-600">{goalStatsData?.team_total_goals || 0}</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">미드필더 득점</div>
                    <div className="text-xl font-bold text-blue-600">{goalStatsData?.midfielder_goals || 0}</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-sm text-gray-600">공격수 득점</div>
                    <div className="text-xl font-bold text-amber-600">{goalStatsData?.forward_goals || 0}</div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareGoalRatioData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name"
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      label={{ value: '득점 비율 (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="리그 전체 득점" 
                      stackId="a"
                      fill="#e5e7eb"
                    />
                    <Bar 
                      dataKey="FW 득점" 
                      stackId="b"
                      fill="#f59e0b"
                    />
                    <Bar 
                      dataKey="MF 득점" 
                      stackId="b"
                      fill="#3b82f6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
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
