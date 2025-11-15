export default function TradeSimulator() {
  return (
    <div className="flex bg-white shadow rounded-lg overflow-hidden min-h-[500px]">
      {/* Sidebar - 1/3 width */}
      <div className="w-1/3 bg-emerald-600 p-6 flex flex-col justify-center">
        <div className="text-white">
          <span className="text-2xl font-bold">TRADE</span>
          <br />
          <span className="text-2xl font-bold">SIMULATOR</span>
        </div>
      </div>

      {/* Main Content - 2/3 width */}
      <div className="flex-1 p-6">
        {/* Team Select row */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <select className="border p-2 rounded w-40" />
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            선수 추가
          </button>
          <select className="border p-2 rounded w-40" />
        </div>

        {/* Player lists */}
        <div className="grid grid-cols-3 gap-6">
          <div className="border rounded h-80 p-2" />
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-green-600 rounded-full" />
          </div>
          <div className="border rounded h-80 p-2" />
        </div>
      </div>
    </div>
  );
}

