"use client";

import React, { useState } from "react";

export default function TransferCalculator() {
  const [team, setTeam] = useState("");
  const [player, setPlayer] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const isReady = team && player;

  const handleTransfer = async () => {
    if (!isReady) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await new Promise<string>((resolve) =>
        setTimeout(() => resolve(`${team}팀의 ${player} 영입/방출 완료!`), 2000)
      );
      setResult(res);
    } catch {
      setResult("에러 발생!");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white flex-col md:flex-row">

      {/* Sidebar */}
      <div className="w-full md:w-60 bg-white shadow-md p-6 flex md:flex-col items-center md:items-start mr-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-6 md:mb-10 text-center md:text-left">
          TRANSFER
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">

        {/* Dropdown + Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <select
            className="border p-2 rounded w-40"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="">팀 선택</option>
            <option value="A">팀 A</option>
            <option value="B">팀 B</option>
          </select>

          <select
            className="border p-2 rounded w-40"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
          >
            <option value="">선수 선택</option>
            <option value="홍길동">홍길동</option>
            <option value="김철수">김철수</option>
          </select>

          <button
            className={`px-4 py-2 rounded text-white ${isReady
              ? "bg-primary hover:bg-primary/80"
              : "bg-gray-400 cursor-not-allowed"
              }`}
            onClick={handleTransfer}
            disabled={!isReady}
          >
            영입 / 방출하기
          </button>
        </div>

        {/* 안내 문구 */}
        {!loading && !result && !isReady && (
          <div className="text-center text-gray-500 mb-6 text-sm sm:text-base">
            팀과 선수를 선택한 뒤 버튼을 눌러주세요.
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center my-6">
            <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-primary rounded-full"></div>
          </div>
        )}

        {/* 결과 박스 */}
        {result && (
          <div className="flex justify-center mt-4 w-full">
            <div className="bg-white shadow-lg rounded-xl p-6 w-full text-left border">
              <p className="text-gray-700 text-base sm:text-lg">{result}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
