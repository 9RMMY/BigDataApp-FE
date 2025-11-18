import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const teamId = searchParams.get("team_id");
  const position = searchParams.get("position");

  // 예시 데이터 (실제 DB 연동 시 대체)
  const players = [
    { player_id: "p123", player_name: "조규성", position: "FW", team_id: "ulsan" },
    { player_id: "p456", player_name: "이동경", position: "MF", team_id: "ulsan" },
    { player_id: "p789", player_name: "문선민", position: "FW", team_id: "jeonbuk" },
    { player_id: "p101", player_name: "한교원", position: "MF", team_id: "jeonbuk" },
  ];

  /** 필터링 */
  let filtered = players;

  if (teamId) {
    filtered = filtered.filter((p) => p.team_id === teamId);
  }

  if (position) {
    filtered = filtered.filter((p) => p.position === position);
  }

  return NextResponse.json(filtered);
}
