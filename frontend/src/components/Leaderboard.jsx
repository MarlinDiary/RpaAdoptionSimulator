function Leaderboard({ leaderboard = [] }) {
  const hasEntries = leaderboard.length > 0

  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden p-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          Leaderboard
        </h1>

        {hasEntries ? (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.socketId || index}
                className="flex items-center justify-between border-2 border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-black w-10 text-center">
                    #{index + 1}
                  </span>
                  <p className="text-xl font-semibold text-black">
                    {entry.nickname || 'Anonymous'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black">
                    {entry.score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No participants yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
