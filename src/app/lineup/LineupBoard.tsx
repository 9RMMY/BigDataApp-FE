export default function LineupBoard() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <select className="border p-2 rounded w-32" />
          <select className="border p-2 rounded w-32" />
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          전술 적용
        </button>
      </div>

      {/* Soccer Field */}
      <div className="mx-auto bg-green-600 h-[400px] rounded-lg relative overflow-hidden">
        {/* Center Line */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white"></div>

        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-24 h-24 border-2 border-white rounded-full"></div>

        {/* Goal Boxes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white"></div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-40 border-2 border-white"></div>
      </div>
    </div>
  );
}

