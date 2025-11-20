import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { team_a_id, team_b_id, players_a, players_b } = body;

  return NextResponse.json({
    delta: {
      [team_a_id]: { attack: +3.1, defense: +2.8, rating: +0.4 },
      [team_b_id]: { attack: -1.2, defense: +0.9 },
    },
    summary: "울산 수비력 향상, 포항 공격력 소폭 감소",
  });
}
