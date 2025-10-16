import { useState, useEffect } from 'react'
import { getSocket } from '../services/socket'

function VotingInterface({ round, roomId }) {
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Reset voting state when round changes
  useEffect(() => {
    setSelectedChoice(null)
    setHasVoted(false)
  }, [round.id])

  const handleVote = (choiceId) => {
    if (hasVoted) return

    setSelectedChoice(choiceId)
    setHasVoted(true)

    // Send vote to server
    const socket = getSocket()
    socket.emit('submit-vote', { roomId, choiceId })
  }

  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden p-8">
      <div className="max-w-2xl w-full">
        {/* Round Title */}
        <h1 className="text-2xl font-bold text-black mb-6 text-center">
          {round.title}
        </h1>

        {/* Question */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-lg text-black leading-relaxed">
            {round.question}
          </p>
        </div>

        {/* Choices - before voting */}
        {!hasVoted && (
          <div className="space-y-4">
            {round.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleVote(choice.id)}
                className="w-full border-2 border-gray-300 hover:border-black rounded-lg p-6 text-left transition-all cursor-pointer"
              >
                <h3 className="text-2xl font-bold">{choice.label}</h3>
              </button>
            ))}
          </div>
        )}

        {/* After voting - show selected choice details */}
        {hasVoted && (
          <div className="space-y-6">
            <div className="border-2 border-black bg-black text-white rounded-lg p-6">
              <h3 className="text-2xl font-bold mb-4">
                {round.choices.find(c => c.id === selectedChoice)?.label}
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Points:</span> +{round.choices.find(c => c.id === selectedChoice)?.points}
                </p>
                <p>
                  <span className="font-semibold">Delay:</span> {round.choices.find(c => c.id === selectedChoice)?.delay}
                </p>
                <p>
                  <span className="font-semibold">Explanation:</span> {round.choices.find(c => c.id === selectedChoice)?.explanation}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-600">
                Vote submitted! Waiting for others...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VotingInterface
