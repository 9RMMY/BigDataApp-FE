// /app/api/meta/teams/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const teams = [
    { team_id: "1", team_name: "강원 FC" },
    { team_id: "2", team_name: "광주 FC" },
    { team_id: "3", team_name: "김천 상무" },
    { team_id: "4", team_name: "대구 FC" },
    { team_id: "5", team_name: "대전 하나 시티즌" },
    { team_id: "6", team_name: "FC 서울" },
    { team_id: "7", team_name: "수원 FC" },
    { team_id: "8", team_name: "FC 안양" },
    { team_id: "9", team_name: "울산 현대 FC" },
    { team_id: "10", team_name: "전북 현대 모터스" },
    { team_id: "11", team_name: "제주SK FC" },
    { team_id: "12", team_name: "포항 스틸러스" },
    { team_id: "13", team_name: "성남 FC" },
    { team_id: "14", team_name: "수원 삼성 블루윙즈" },
    { team_id: "15", team_name: "인천 유나이티드 FC" },
  ];

  return NextResponse.json(teams);
}
