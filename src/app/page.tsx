"use client";

import { useState, useEffect } from "react";
import Card from "./components/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import Image from "next/image";
import anyangLogo from "./asset/team_logo/anyang.svg";
import daeguLogo from "./asset/team_logo/daegu.svg";
import daejeonLogo from "./asset/team_logo/daejeon.svg";
import gangwonLogo from "./asset/team_logo/gangwon.svg";
import gimcheonLogo from "./asset/team_logo/gimcheon.svg";
import gwangjuLogo from "./asset/team_logo/gwangju.svg";
import incheonLogo from "./asset/team_logo/incheon.svg";
import jejuLogo from "./asset/team_logo/jeju.svg";
import jeonbukLogo from "./asset/team_logo/jeonbuk.svg";
import pohangLogo from "./asset/team_logo/pohang.svg";
import seongnamLogo from "./asset/team_logo/seongnam.svg";
import seoulLogo from "./asset/team_logo/seoul.svg";
import suwonLogo from "./asset/team_logo/suwon.svg";
import suwonBlueLogo from "./asset/team_logo/suwon_blue.svg";
import ulsanLogo from "./asset/team_logo/ulsan.svg";
import { JEONBUK_ID, JEONBUK_NAME } from "./constants/team";
import { saveTeamSession } from "../utils/teamSession";

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

type Team = {
  team_id: string;
  team_name: string;
};

type MatchResult = {
  match_date: string;
  opponent: string;
  result: string;
  score_us: number;
  score_opponent: number;
  is_home: boolean;
};

export default function Home() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
  // 팀 목록 관련 상태
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  
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
  const [matchResultsData, setMatchResultsData] = useState<MatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchesError, setMatchesError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 선택된 팀 상태
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

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

  // 팀 목록 API 호출 및 세션 저장
  useEffect(() => {
    const fetchTeams = async () => {
      console.log("🏠 홈페이지 - 팀 목록 API 호출 시작");
      try {
        const url = `${API}/api/meta/teams.php`;
        console.log("🔍 팀 목록 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 팀 목록 응답 status:", res.status);
        
        if (!res.ok) throw new Error('팀 목록 조회 실패');
        
        const data = await res.json();
        console.log("📋 팀 목록 응답 데이터:", data);
        console.log("📊 팀 수:", data.length);
        
        setTeams(data);
        
        // localStorage에 팀 정보 저장
        saveTeamSession(data, String(JEONBUK_ID), JEONBUK_NAME, []);
      } catch (e) {
        console.error("🔥 팀 목록 불러오기 실패:", e);
        setTeamsError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // 팀 순위 예측 데이터 API 호출
  useEffect(() => {
    const fetchTeamRankingData = async () => {
      console.log("📈 홈페이지 - 팀 순위 예측 API 호출 시작");
      try {
        setLoadingRanking(true);
        
        // 팀 목록이 로드된 후에 순위 데이터 호출
        if (teams.length === 0) {
          console.log("⚠️ 팀 목록이 비어있어 순위 데이터 호출을 건너뜁니다");
          return;
        }
        
        console.log("📊 순위 데이터 요청할 팀 수:", teams.length);
        
        const promises = teams.map(async (team) => {
          const url = `${API}/api/team.php?season_id=2026&team_id="${team.team_id}"`;
          console.log(`🔍 팀 순위 요청 URL (${team.team_id}):`, url);
          
          const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
          console.log(`📡 팀 순위 응답 status (${team.team_id}):`, res.status);
          
          if (!res.ok) throw new Error(`${team.team_id} 팀 순위 데이터 조회 실패`);
          
          const data = await res.json();
          console.log(`📋 팀 순위 응답 데이터 (${team.team_id}):`, data);
          return data;
        });
        
        const data = await Promise.all(promises);
        console.log("📊 모든 팀 순위 데이터 로드 완료:", data.length);
        setTeamRankingData(data);
      } catch (e) {
        console.error("🔥 팀 순위 데이터 불러오기 실패:", e);
        setRankingError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingRanking(false);
      }
    };

    if (teams.length > 0) {
      fetchTeamRankingData();
    }
  }, [teams]);

  // 득점 비율 데이터 API 호출
  useEffect(() => {
    const fetchGoalStatsData = async () => {
      console.log("⚽ 홈페이지 - 득점 비율 데이터 API 호출 시작");
      try {
        setLoadingGoalStats(true);
        
        const url = `${API}/api/analysis/olap.php?season_id=2026`;
        console.log("🔍 득점 비율 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 득점 비율 응답 status:", res.status);
        
        if (!res.ok) throw new Error('득점 통계 데이터 조회 실패');
        
        const data = await res.json();
        console.log("📋 득점 비율 응답 데이터:", data);
        
        // OLAP 데이터를 GoalStatsResponse 형식으로 변환
        const teamData = data.data.find((item: any) => item.position === 'SUBTOTAL' && item.team_name !== 'TOTAL');
        const totalData = data.data.find((item: any) => item.team_name === 'TOTAL');
        const fwData = data.data.find((item: any) => item.position === 'FW');
        const mfData = data.data.find((item: any) => item.position === 'MF');
        
        console.log("📊 추출된 데이터:", { teamData, totalData, fwData, mfData });
        
        if (teamData && totalData && fwData && mfData) {
          const goalStats: GoalStatsResponse = {
            league_total_goals: totalData.total_goals,
            team_total_goals: teamData.total_goals,
            midfielder_goals: mfData.total_goals,
            forward_goals: fwData.total_goals
          };
          console.log("📈 변환된 득점 통계:", goalStats);
          setGoalStatsData(goalStats);
        } else {
          console.error("❌ 필요한 득점 데이터를 찾을 수 없습니다");
          throw new Error('필요한 득점 데이터를 찾을 수 없습니다');
        }
      } catch (e) {
        console.error("🔥 득점 비율 데이터 불러오기 실패:", e);
        setGoalStatsError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingGoalStats(false);
      }
    };

    fetchGoalStatsData();
  }, []);

  // 최근 경기 결과 API 호출
  useEffect(() => {
    const fetchMatchResults = async () => {
      console.log("🏆 홈페이지 - 최근 경기 결과 API 호출 시작");
      try {
        setLoadingMatches(true);
        
        const url = `${API}/api/match/recent.php?limit=12`;
        console.log("🔍 최근 경기 요청 URL:", url);
        
        const res = await fetch(url, {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        console.log("📡 최근 경기 응답 status:", res.status);
        
        if (!res.ok) throw new Error('최근 경기 결과 조회 실패');
        
        const data = await res.json();
        console.log("📋 최근 경기 응답 데이터:", data);
        console.log("📊 경기 수:", data.length);
        
        setMatchResultsData(data);
      } catch (e) {
        console.error("🔥 최근 경기 결과 불러오기 실패:", e);
        setMatchesError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatchResults();
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
    const team = teams.find(t => t.team_id.toString() === teamId);
    const teamName = team?.team_name || teamId;
    console.log(`🏷️ 팀 이름 변환: ${teamId} -> ${teamName}, teams.length: ${teams.length}`);
    return teamName;
  };

  const getHomeTeamName = (match: MatchResult) =>
    match.is_home ? "전북 현대 모터스" : match.opponent;

  const getAwayTeamName = (match: MatchResult) =>
    !match.is_home ? "전북 현대 모터스" : match.opponent;

  const getTeamLogoSrc = (teamName: string) => {
    const name = teamName.toLowerCase();

    if (name.includes("전북")) return jeonbukLogo;
    if (name.includes("서울")) return seoulLogo;
    if (name.includes("울산")) return ulsanLogo;
    if (name.includes("포항")) return pohangLogo;
    if (name.includes("강원")) return gangwonLogo;
    if (name.includes("광주")) return gwangjuLogo;
    if (name.includes("김천") || name.includes("상무")) return gimcheonLogo;
    if (name.includes("블루윙즈") || name.includes("삼성")) return suwonBlueLogo;
    if (name.includes("수원")) return suwonLogo;
    if (name.includes("제주")) return jejuLogo;
    if (name.includes("대구")) return daeguLogo;
    if (name.includes("대전")) return daejeonLogo;
    if (name.includes("인천")) return incheonLogo;
    if (name.includes("성남")) return seongnamLogo;
    if (name.includes("안양")) return anyangLogo;

    return null;
  };

  // 경기 결과 포맷팅 함수
  const formatMatchDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${month}월 ${day}일 ${weekday}요일`;
  };

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'W': return '승';
      case 'D': return '무';
      case 'L': return '패';
      default: return result;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'W': return 'bg-green-100 text-green-700';
      case 'D': return 'bg-gray-100 text-gray-700';
      case 'L': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const maxIndex = Math.max(
    0,
    Math.ceil(matchResultsData.length / itemsPerPage - 1) * itemsPerPage
  );

  const visibleMatches = matchResultsData.slice(
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

// UI

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10">
        

        {/* 메인 대시보드 */}
        <section className="space-y-6">
            <h1 className="text-4xl font-semibold leading-snug text-gray-900 sm:text-4xl">
              2026년 월별 예측 순위
            </h1>

          <Card className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">팀별 순위 추이</h2>
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
              <ResponsiveContainer width="100%" height={500}>
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
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-2 border border-gray-300 rounded shadow-lg">
                            {payload.map((entry, index) => (
                              <div key={index} className="text-xs" style={{ color: entry.color }}>
                                {entry.value}위 - {entry.name}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    content={({ payload }) => {
                      if (!payload) return null;
                      // 팀 ID 순서로 정렬 (숫자로 변환하여 비교)
                      const sortedPayload = [...payload].sort((a, b) => {
                        const aTeamId = parseInt(a.value || '0');
                        const bTeamId = parseInt(b.value || '0');
                        return aTeamId - bTeamId;
                      });
                      return (
                        <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-w-2xl mx-auto">
                          {sortedPayload.map((entry, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                console.log('Team clicked:', entry.value);
                                setSelectedTeam(entry.value === selectedTeam ? null : (entry.value || null));
                              }}
                              className="flex items-center gap-1 px-1 sm:px-2 py-1 text-xs border rounded hover:bg-gray-100 cursor-pointer transition-colors flex-shrink-0"
                              style={{ color: entry.color }}
                            >
                              <div 
                                className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="hidden xs:inline sm:inline">
                                {getTeamName(entry.value || '')}
                              </span>
                              <span className="inline xs:hidden sm:hidden">
                                {entry.value}
                              </span>
                            </button>
                          ))}
                        </div>
                      );
                    }}
                  />
                  {teamRankingData.map((team, index) => {
                    const isMyTeam = team.team_id === String(JEONBUK_ID);
                    const isSelectedTeam = team.team_id === selectedTeam;
                    return (
                      <Line
                        key={team.team_id}
                        type="monotone"
                        dataKey={team.team_id}
                        stroke={
                          isMyTeam ? getTeamColor(index) : 
                          isSelectedTeam ? '#000000' : '#d1d5db'
                        }
                        strokeWidth={isMyTeam || isSelectedTeam ? 2 : 1}
                        dot={{ r: isMyTeam || isSelectedTeam ? 4 : 3 }}
                        name={getTeamName(team.team_id)}
                        opacity={isMyTeam || isSelectedTeam ? 1 : 0.6}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </section>

        {/* 득점 비율 분석 */}
        <section className="grid gap-4 lg:grid-cols-1">
          <Card className="bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">득점 비율 분석</h2>
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
          {loadingMatches ? (
            <div className="flex h-64 items-center justify-center text-gray-500">
              데이터 로딩 중...
            </div>
          ) : matchesError ? (
            <div className="flex h-64 items-center justify-center text-red-500">
              {matchesError}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleMatches.map((match, index) => (
                <Card
                  key={`${match.match_date}-${index}`}
                  className="relative space-y-1 border-gray-200 bg-white"
                >
                  {/* 상단 배경 영역 */}
                  <div className="bg-emerald-600 px-4 py-2 flex justify-center rounded-tl-lg rounded-tr-lg">
                    <span className="text-md font-semibold text-white">
                      {formatMatchDate(match.match_date)}
                    </span>
                  </div>

                  {/* 경기결과 + 시간 */}
                  <div className="flex items-center justify-between pl-2 pr-2 py-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getResultColor(match.result)}`}>
                      {getResultText(match.result)}
                    </span>
                  </div>

                  {/* 홈 - 스코어 - 어웨이 */}
                  <div className="flex items-start justify-between pl-4 pr-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-14 w-14 rounded-xl flex items-center justify-center overflow-hidden">
                        {getTeamLogoSrc(getHomeTeamName(match)) && (
                          <Image
                            src={getTeamLogoSrc(getHomeTeamName(match))!}
                            alt={getHomeTeamName(match)}
                            width={56}
                            height={56}
                            className="object-contain"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {getHomeTeamName(match)}
                      </span>
                    </div>

                    <div className="flex h-8 w-14 items-center justify-center mt-4 rounded-full bg-gray-200 text-base font-semibold text-gray-700">
                      {match.score_us} - {match.score_opponent}
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <div className="h-14 w-14 rounded-xl flex items-center justify-center overflow-hidden">
                        {getTeamLogoSrc(getAwayTeamName(match)) && (
                          <Image
                            src={getTeamLogoSrc(getAwayTeamName(match))!}
                            alt={getAwayTeamName(match)}
                            width={56}
                            height={56}
                            className="object-contain"
                          />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {getAwayTeamName(match)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
