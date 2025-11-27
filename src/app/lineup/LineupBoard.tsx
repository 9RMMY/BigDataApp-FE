"use client";

import { useState, useEffect } from "react";

export default function LineupBoard() {
  const [teamId, setTeamId] = useState("");
  const [formation, setFormation] = useState("");
  const [opponent, setOpponent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fitScore, setFitScore] = useState<number | null>(null);
  const [lineup, setLineup] = useState<
    { position: string; player: string; fit_score: number }[]
  >([]);

  const [teams, setTeams] = useState<{ team_id: string; team_name: string }[]>([]);
  const isReady = teamId && formation && opponent;

  const API = process.env.NEXT_PUBLIC_API_URL;

  // -----------------------------
  //  K리그 팀 + 선수 풀 (자동 생성)
  // -----------------------------
  const K_LEAGUE_TEAMS = [
    { team_id: "ulsan", team_name: "울산 HD" },
    { team_id: "jeonbuk", team_name: "전북 현대" },
    { team_id: "fcseoul", team_name: "FC 서울" },
    { team_id: "daegu", team_name: "대구 FC" },
  ];

  const K_LEAGUE_PLAYERS: any = {
    ulsan: {
      DF: ["김영권", "박용우", "서영재", "정승현"],
      MF: ["이청용", "바코", "원두재"],
      FW: ["주니오", "레오나르도", "고명진"],
    },
    jeonbuk: {
      DF: ["홍정호", "김문환", "박진섭"],
      MF: ["송민규", "백승호", "박규현", "문선민", "이수빈"],
      FW: ["구스타보", "티아고"],
    },
    fcseoul: {
      DF: ["이상민", "황현수", "김주성", "고요한"],
      MF: ["팔라시오스", "기성용", "나상호", "오스마르"],
      FW: ["황의조", "조영욱"],
    },
  };

  useEffect(() => {
    // 실제 API
    /*
    const fetchTeams = async () => {
      try {
        const res = await fetch(`${API}/meta/teams`);
        if (!res.ok) return;
        const data = await res.json();
        setTeams(data);
      } catch (e) {}
    };
    fetchTeams();
    */

    // 하드코딩된 팀 설정
    setTeams(K_LEAGUE_TEAMS);
  }, []);

  const formationNeeds: any = {
    "4-3-3": { DF: 4, MF: 3, FW: 3 },
    "3-5-2": { DF: 3, MF: 5, FW: 2 },
    "4-4-2": { DF: 4, MF: 4, FW: 2 },
  };

  const formationPositions: any = {
    "4-3-3": {
      DF: [
        { top: "20%", left: "25%" },
        { top: "40%", left: "25%" },
        { top: "60%", left: "25%" },
        { top: "80%", left: "25%" },
      ],
      MF: [
        { top: "35%", left: "55%" },
        { top: "50%", left: "55%" },
        { top: "65%", left: "55%" },
      ],
      FW: [
        { top: "35%", left: "75%" },
        { top: "50%", left: "75%" },
        { top: "65%", left: "75%" },
      ],
    },

    "3-5-2": {
      DF: [
        { top: "35%", left: "20%" },
        { top: "50%", left: "20%" },
        { top: "65%", left: "20%" },
      ],
      MF: [
        { top: "30%", left: "55%" },
        { top: "40%", left: "50%" },
        { top: "50%", left: "45%" },
        { top: "60%", left: "50%" },
        { top: "70%", left: "55%" },
      ],
      FW: [
        { top: "40%", left: "80%" },
        { top: "60%", left: "80%" },
      ],
    },

    "4-4-2": {
      DF: [
        { top: "20%", left: "20%" },
        { top: "40%", left: "20%" },
        { top: "60%", left: "20%" },
        { top: "80%", left: "20%" },
      ],
      MF: [
        { top: "20%", left: "40%" },
        { top: "40%", left: "40%" },
        { top: "60%", left: "40%" },
        { top: "80%", left: "40%" },
      ],
      FW: [
        { top: "40%", left: "60%" },
        { top: "60%", left: "60%" },
      ],
    },
  };

  const handleRecommend = async () => {
    if (!isReady) return;
    setLoading(true);
    setFitScore(null);
    setLineup([]);

    // 실제 API
    /*
    try {
      const res = await fetch(`${API}/lineup/recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: teamId,
          formation: formation,
          opponent_team_id: opponent,
        }),
      });
      if (!res.ok) throw new Error("API Error");
      const data = await res.json();
      setFitScore(data.formation_fit);
      setLineup(data.recommended_lineup);
    } catch {
      setFitScore(null);
    }
    */

    // -----------------------------
    //      하드코딩 라인업 생성
    // -----------------------------
    const needs = formationNeeds[formation];
    const squad = K_LEAGUE_PLAYERS[teamId];

    const picked: any[] = [];

    ["DF", "MF", "FW"].forEach((pos) => {
      const pool = squad[pos];
      const count = needs[pos];

      const selected = pool.slice(0, count).map((player: string) => ({
        position: pos,
        player,
        fit_score: Math.random() * 0.3 + 0.7, // 70~100%
      }));

      picked.push(...selected);
    });

    setFitScore(0.85);
    setLineup(picked);

    setLoading(false);
  };

  const getPositionStyle = (pos: string, index: number) => {
    const map = formationPositions[formation];
    if (!map) return { top: "50%", left: "50%" };
    const arr = map[pos];
    return arr[index] ?? { top: "50%", left: "50%" };
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white">
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          LINE-UP<br />BOARD
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-2">
          <select
            className="border p-1 rounded w-32"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="">팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          <select
            className="border p-1 rounded w-32"
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
          >
            <option value="">전술 선택</option>
            <option value="4-3-3">4-3-3</option>
            <option value="3-5-2">3-5-2</option>
            <option value="4-4-2">4-4-2</option>
          </select>

          <select
            className="border p-1 rounded w-32"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          >
            <option value="">상대팀 선택</option>
            {teams.map((t) => (
              <option key={t.team_id} value={t.team_id}>
                {t.team_name}
              </option>
            ))}
          </select>

          <button
            className={`px-3 py-1.5 rounded text-white ${isReady ? "bg-primary hover:bg-primary/80" : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleRecommend}
            disabled={!isReady}
          >
            라인업 추천
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 mt-4">
          <div className="relative bg-green-600 w-full h-[320px] rounded">
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>

            <div className="absolute top-1/2 left-1/2 w-20 h-20 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>

            <div className="absolute left-0 top-1/2 w-12 h-24 border-2 border-white -translate-y-1/2"></div>
            <div className="absolute right-0 top-1/2 w-12 h-24 border-2 border-white -translate-y-1/2"></div>

            {!loading &&
              lineup.map((p, idx) => {
                const index = lineup.filter((x) => x.position === p.position).indexOf(p);
                const style = getPositionStyle(p.position, index);

                return (
                  <div
                    key={idx}
                    className="absolute bg-white text-black text-xs font-bold px-2 py-1 border rounded-full"
                    style={{
                      top: style.top,
                      left: style.left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {p.player}
                  </div>
                );
              })}
          </div>

          <div className="w-60">
            <div className="font-semibold mb-3">추천 라인업</div>
            <div className="space-y-2">
              {lineup.map((p, idx) => (
                <div key={idx} className="p-2 bg-gray-50 border rounded text-sm flex justify-between">
                  <span>{p.position} - {p.player}</span>
                  <span className="font-bold text-green-600">{(p.fit_score * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
