type Team = {
  team_id: string;
  team_name: string;
};

type Match = {
  match_date: string;
  opponent: number;
  result?: string;
  score_us: number;
  score_opponent: number;
  is_home: boolean;
};

type SessionData = {
  teams: Team[];
  my_team_id: string;
  my_team_name: string;
  matches: Match[];
  timestamp: number;
};

const SESSION_KEY = 'bigdata_team_session';
const SESSION_EXPIRY = 30 * 60 * 1000;

// 세션 데이터 저장
export const saveTeamSession = (teamsData: Team[], teamId: string, teamName: string, matches: Match[]): void => {
  try {
    const sessionData: SessionData = {
      teams: teamsData,
      my_team_id: teamId,
      my_team_name: teamName,
      matches: matches,
      timestamp: Date.now()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log("📦 저장된 데이터:", sessionData);
    
    // 즉시 확인을 위해 바로 불러오기 테스트
    const verifyData = localStorage.getItem(SESSION_KEY);
    console.log("🔍 저장 확인:", verifyData ? JSON.parse(verifyData) : "없음");
  } catch (e) {
    console.error("🔥 팀 정보 localStorage 저장 실패:", e);
  }
};

// 세션 데이터 불러오기
export const loadTeamSession = (): SessionData | null => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      console.log("📭 세션 데이터 없음");
      return null;
    }

    const sessionData: SessionData = JSON.parse(stored);
    
    // 세션 만료 확인
    if (Date.now() - sessionData.timestamp > SESSION_EXPIRY) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return sessionData;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

// 세션 데이터 삭제
export const clearTeamSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error("🔥 세션 데이터 삭제 실패:", e);
  }
};

// 우리팀 설정 API 호출
export const setMyTeam = async (teamId: string = "10"): Promise<{ teams: Team[], matches: Match[] }> => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  try {
    const url = `${API}/api/session/set_team.php?team_id=${teamId}`;
    console.log("🔍 우리팀 설정 요청 URL:", url);
    
    const res = await fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    
    if (!res.ok) throw new Error("우리팀 설정 실패");
    
    const data = await res.json();
    console.log("📋 우리팀 설정 응답 데이터:", data);
    
    return data;
  } catch (err) {
    console.error("🔥 우리팀 설정 실패:", err);
    throw err;
  }
};

// 우리팀 조회 API 호출
export const getMyTeam = async (): Promise<{ my_team_id: string }> => {
  const API = process.env.NEXT_PUBLIC_API_URL;
  try {
    const url = `${API}/api/session/get_team.php`;
    console.log("🔍 우리팀 조회 요청 URL:", url);
    
    const res = await fetch(url, {
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
    });
    
    if (!res.ok) throw new Error("우리팀 조회 실패");
    
    const data = await res.json();
    console.log("📋 우리팀 조회 응답 데이터:", data);
    
    return data;
  } catch (err) {
    console.error("🔥 우리팀 조회 실패:", err);
    throw err;
  }
};

// 세션 데이터 유효성 확인
export const isSessionValid = (): boolean => {
  const session = loadTeamSession();
  return session !== null;
};
