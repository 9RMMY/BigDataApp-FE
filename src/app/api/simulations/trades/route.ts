// /app/api/trades/simulate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { team_a_id, team_b_id, players_a, players_b } = body;

  return NextResponse.json({
    delta: {
      [team_a_id]: { attack: +3.1, defense: +2.8, rating: +0.4 },
      [team_b_id]: { attack: -1.2, defense: +0.9, rating: +0.1 },
    },
    summary: `${team_a_id} 전력 상승 / ${team_b_id} 전력 변화 발생`,
    log_id: 101,
  });
}
