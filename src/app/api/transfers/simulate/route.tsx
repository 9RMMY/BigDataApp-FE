// /app/api/transfers/simulate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { team_id, player_in_id, type } = body;

  return NextResponse.json({
    expected_points_change: +3.2,
    new_team_rating: 81.4,
    notes: "공격 전력 강화로 시즌 중반 승점 기대치 상승",
    log_id: 101, 
  });
}
