// /app/api/match/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { match_date, home_team_id, away_team_id, strategy } = body;

  return NextResponse.json({
    expected_points: 1.8,
    win_prob: 0.6,
    draw_prob: 0.25,
    loss_prob: 0.15,
    strategy_impacts: [
      {
        strategy,
        delta_expected_points: 0.4,
        note: "공격 강화 시 득점 기대치 +0.3",
      },
    ],
  });
}
