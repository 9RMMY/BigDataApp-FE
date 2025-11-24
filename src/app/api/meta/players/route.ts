// /app/api/meta/players/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const teamId = searchParams.get("team_id");
  const position = searchParams.get("position");

  // 실제 DB 연동 전 임시 데이터
  const players = [
    { player_id: "365", player_name: "조규성", position: "FW", team_id: "9" },  // 울산
    { player_id: "366", player_name: "이동경", position: "MF", team_id: "9" },  // 울산
    { player_id: "367", player_name: "문선민", position: "FW", team_id: "10" }, // 전북
    { player_id: "368", player_name: "한교원", position: "MF", team_id: "10" }, // 전북
  ];

  let filtered = players;

  if (teamId) {
    filtered = filtered.filter((p) => p.team_id === teamId);
  }

  if (position) {
    filtered = filtered.filter((p) => p.position === position);
  }

  return NextResponse.json(filtered);
}
