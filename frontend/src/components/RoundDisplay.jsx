import { useState, useEffect } from 'react'
import { getSocket } from '../services/socket'

function RoundDisplay({ round, roomId, onNextRound }) {
  const [votes, setVotes] = useState({})

  useEffect(() => {
    const socket = getSocket()

    // Listen for vote updates
    socket.on('vote-update', ({ votes: newVotes }) => {
      setVotes(newVotes)
    })

    return () => {
      socket.off('vote-update')
    }
  }, [])

  // Calculate vote counts for each choice
  const getVoteCount = (choiceId) => {
    return Object.values(votes).filter(vote => vote === choiceId).length
  }

  const totalVotes = Object.keys(votes).length

  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden p-8">
      <div className="max-w-4xl w-full">
        {/* Round Title */}
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          {round.title}
        </h1>

        {/* Question */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-xl text-black leading-relaxed">
            {round.question}
          </p>
        </div>

        {/* Choices with vote counts */}
        <div className="space-y-4 mb-8">
          {round.choices.map((choice) => {
            const voteCount = getVoteCount(choice.id)
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0

            return (
              <div key={choice.id} className="border-2 border-gray-300 rounded-lg p-6 relative overflow-hidden">
                {/* Vote percentage background */}
                <div
                  className="absolute top-0 left-0 h-full bg-gray-200 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-black">{choice.label}</h3>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-black">{voteCount}</span>
                      <span className="text-gray-600 ml-2">
                        ({totalVotes > 0 ? percentage.toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Next Round Button */}
        <div className="flex justify-center">
          <button
            onClick={onNextRound}
            className="py-3 px-12 bg-black text-white rounded-full font-semibold hover:bg-[#404040] active:bg-black transition-all text-lg cursor-pointer"
          >
            Next Round
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoundDisplay
