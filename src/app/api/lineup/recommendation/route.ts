import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { team_id, formation, opponent_team_id } = body;

  return NextResponse.json({
    formation_fit: 0.89,
    recommended_lineup: [
      { position: "GK", player: "김승규", fit_score: 0.92 },
      { position: "FW", player: "조규성", fit_score: 0.87 },
    ],
  });
}
