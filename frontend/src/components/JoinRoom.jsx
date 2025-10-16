import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { connectSocket } from '../services/socket'
import VotingInterface from './VotingInterface'
import { rounds } from '../data/rounds'

function JoinRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentRound, setCurrentRound] = useState(0)
  const [isSkipped, setIsSkipped] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    // Auto-focus input on mount
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isSubmitted) return

    const socket = connectSocket()

    socket.on('room-joined', ({ roomId: joinedRoomId, role, success }) => {
      console.log('Joined room:', joinedRoomId, 'as', role)
    })

    socket.on('room-not-found', () => {
      console.log('Room not found, redirecting to home')
      navigate('/', { replace: true })
    })

    socket.on('participant-joined', ({ participantId, totalParticipants }) => {
      console.log('Participant joined:', participantId)
    })

    socket.on('participant-left', ({ participantId, totalParticipants }) => {
      console.log('Participant left:', participantId)
    })

    socket.on('round-started', ({ roomId: startedRoomId, roundNumber, skippedParticipants }) => {
      console.log('Host started round', roundNumber)
      console.log('Skipped participants:', skippedParticipants)
      console.log('My socket ID:', socket.id)

      setCurrentRound(roundNumber)

      // Check if this participant should skip
      const isThisUserSkipped = skippedParticipants?.some(p => p.socketId === socket.id)
      console.log('Am I skipped?', isThisUserSkipped)
      setIsSkipped(isThisUserSkipped || false)
    })

    // Join room when connected
    const handleConnect = () => {
      socket.emit('join-room', { roomId, nickname })
    }

    if (socket.connected) {
      handleConnect()
    } else {
      socket.once('connect', handleConnect)
    }

    return () => {
      socket.off('room-joined')
      socket.off('room-not-found')
      socket.off('participant-joined')
      socket.off('participant-left')
      socket.off('round-started')
    }
  }, [isSubmitted, roomId, nickname, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (nickname.trim()) {
      setIsSubmitted(true)
    }
  }

  // Show skipped round message if participant is skipped
  if (isSubmitted && currentRound > 0 && isSkipped) {
    console.log('Rendering skipped round UI')
    return (
      <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-black mb-6">Round Skipped</h1>
          <div className="bg-gray-100 rounded-lg p-8 mb-6">
            <p className="text-xl text-gray-700 mb-4">
              You cannot participate in this round due to integration delay from your previous choice.
            </p>
            <p className="text-lg text-red-600 font-semibold">
              Penalty: -1 point
            </p>
          </div>
          <p className="text-gray-600">
            Waiting for the next round...
          </p>
        </div>
      </div>
    )
  }

  // Show voting interface if round is active and not skipped
  if (isSubmitted && currentRound > 0 && currentRound <= rounds.length && !isSkipped) {
    console.log('Rendering voting interface, isSkipped:', isSkipped, 'currentRound:', currentRound)
    const round = rounds[currentRound - 1]
    return <VotingInterface round={round} roomId={roomId} />
  }

  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <input
              ref={inputRef}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="w-80 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!nickname.trim()}
              className="mt-6 py-3 px-12 bg-black text-white rounded-full font-semibold hover:bg-[#404040] active:bg-black transition-all text-lg cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Join
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 text-lg">Waiting for host to start...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JoinRoom
