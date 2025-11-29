type Team = {
  team_id: string;
  team_name: string;
};

type SessionData = {
  teams: Team[];
  my_team_id: string;
  my_team_name: string;
  timestamp: number;
};

const SESSION_KEY = 'bigdata_team_session';
const SESSION_EXPIRY = 30 * 60 * 1000; // 30분

// 세션 데이터 저장
export const saveTeamSession = (teamsData: Team[], teamId: string, teamName: string): void => {
  try {
    const sessionData: SessionData = {
      teams: teamsData,
      my_team_id: teamId,
      my_team_name: teamName,
      timestamp: Date.now()
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log("✅ 팀 정보 localStorage 저장 성공");
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
      console.log("⏰ 세션 만료 - 데이터 삭제");
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    console.log("✅ 세션 데이터 불러오기 성공:", sessionData);
    return sessionData;
  } catch (e) {
    console.error("🔥 세션 데이터 불러오기 실패:", e);
    localStorage.removeItem(SESSION_KEY); // 손상된 데이터 삭제
    return null;
  }
};

// 세션 데이터 삭제
export const clearTeamSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log("🗑️ 세션 데이터 삭제 성공");
  } catch (e) {
    console.error("🔥 세션 데이터 삭제 실패:", e);
  }
};

// 세션 데이터 유효성 확인
export const isSessionValid = (): boolean => {
  const session = loadTeamSession();
  return session !== null;
};
