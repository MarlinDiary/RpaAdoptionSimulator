import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { connectSocket, getSocket } from '../services/socket'
import RoundDisplay from './RoundDisplay'
import { rounds } from '../data/rounds'

function GameRoom({ isHost }) {
  const [roomUrl, setRoomUrl] = useState('')
  const [roomId, setRoomId] = useState('')
  const [participantCount, setParticipantCount] = useState(0)
  const [currentRound, setCurrentRound] = useState(0)

  useEffect(() => {
    // Generate room ID
    const newRoomId = Math.random().toString(36).substring(2, 15)
    setRoomId(newRoomId)
    const url = `${window.location.origin}/join/${newRoomId}`
    setRoomUrl(url)

    // Connect to socket and create/join room
    const socket = connectSocket()

    socket.on('room-joined', ({ roomId: joinedRoomId, role, success }) => {
      console.log('Joined room:', joinedRoomId, 'as', role)
      if (success) {
        console.log('Successfully joined room')
      }
    })

    socket.on('participant-joined', ({ participantId, totalParticipants }) => {
      console.log('Participant joined:', participantId)
      setParticipantCount(totalParticipants)
    })

    socket.on('participant-left', ({ participantId, totalParticipants }) => {
      console.log('Participant left:', participantId)
      setParticipantCount(totalParticipants)
    })

    socket.on('round-started', ({ roomId: startedRoomId, roundNumber, skippedParticipants }) => {
      console.log('Round started:', roundNumber)
      if (skippedParticipants && skippedParticipants.length > 0) {
        console.log('Skipped participants:', skippedParticipants)
      }
      setCurrentRound(roundNumber)
    })

    // Create room when connected
    const handleConnect = () => {
      socket.emit('create-room', { roomId: newRoomId, isHost })
    }

    if (socket.connected) {
      handleConnect()
    } else {
      socket.once('connect', handleConnect)
    }

    return () => {
      socket.off('room-joined')
      socket.off('participant-joined')
      socket.off('participant-left')
      socket.off('round-started')
    }
  }, [isHost])

  const handleNextRound = () => {
    const socket = getSocket()
    socket.emit('next-round', { roomId })
  }

  // If round is active, show round display
  if (currentRound > 0 && currentRound <= rounds.length) {
    const round = rounds[currentRound - 1]
    return (
      <RoundDisplay
        round={round}
        roomId={roomId}
        onNextRound={handleNextRound}
      />
    )
  }

  // Otherwise show waiting room with QR code
  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center">
        {/* 在线人数 */}
        <div className="mb-6 text-center">
          <p className="text-2xl font-semibold text-black">
            {participantCount} {participantCount === 1 ? 'participant' : 'participants'} online
          </p>
        </div>

        {/* 二维码 */}
        {roomUrl && (
          <QRCodeSVG
            value={roomUrl}
            size={300}
            level="H"
          />
        )}

        {/* Next Round 按钮 - 仅房主可见 */}
        {isHost && (
          <button
            onClick={handleNextRound}
            className="mt-8 py-3 px-12 bg-black text-white rounded-full font-semibold hover:bg-[#404040] active:bg-black transition-all text-lg cursor-pointer"
          >
            Next Round
          </button>
        )}
      </div>
    </div>
  )
}

export default GameRoom
