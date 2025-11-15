export default function TransferCalculator() {
  return (
    <div className="flex bg-white shadow rounded-lg overflow-hidden min-h-[450px]">
      {/* Sidebar */}
      <div className="w-40 bg-gray-100 p-4 text-sm font-bold border-r">
        영입 / 방출
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        {/* Input row */}
        <div className="flex items-center gap-4 mb-8">
          <select className="border p-2 rounded w-40" />
          <select className="border p-2 rounded w-40" />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            계산하기
          </button>
        </div>

        {/* Result box */}
        <div className="border rounded-lg h-80 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500 text-lg">계산 결과</p>
        </div>
      </div>
    </div>
  );
}

