// /app/api/simulations/log/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const logs = [
    {
      log_id: 101,
      type: "acquire",
      team_id: "ulsan",
      player_in_id: "365",
      expected_points_change: +3.2,
      new_team_rating: 81.4,
    },
    {
      log_id: 102,
      type: "release",
      team_id: "ulsan",
      player_in_id: "364",
      expected_points_change: -1.5,
      new_team_rating: 79.2,
    },
    {
      log_id: 100,
      type: "trade",
      team_a_id: "ulsan",
      team_b_id: "pohang",
      players_a: ["365"],
      players_b: ["23"],
      delta: {
        ulsan: { attack: +3.1, defense: +2.8, rating: +0.4 },
        pohang: { attack: -1.2, defense: +0.9, rating: -0.1 }
      }
    }
  ];

  return NextResponse.json(logs);
}
