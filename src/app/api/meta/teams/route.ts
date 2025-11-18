import { NextResponse } from "next/server";

export async function GET() {
  const teams = [
    { team_id: "ulsan", team_name: "울산 현대" },
    { team_id: "pohang", team_name: "포항 스틸러스" },
    { team_id: "jeonbuk", team_name: "전북 현대" },
    { team_id: "seoul", team_name: "FC 서울" },
  ];

  return NextResponse.json(teams);
}
