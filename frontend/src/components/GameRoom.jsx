import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

function GameRoom({ isHost }) {
  const [roomUrl, setRoomUrl] = useState('')

  useEffect(() => {
    // 生成房间 URL（当前页面的 URL + 房间 ID）
    // TODO: 后续从后端获取实际的房间 ID
    const roomId = Math.random().toString(36).substring(2, 15)
    const url = `${window.location.origin}/join/${roomId}`
    setRoomUrl(url)
  }, [])

  return (
    <div className="min-h-screen w-screen bg-white flex items-center justify-center overflow-hidden">
      <div className="flex flex-col items-center">
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
          <button className="mt-8 py-3 px-12 bg-black text-white rounded-full font-semibold hover:bg-[#404040] active:bg-black transition-all text-lg cursor-pointer">
            Next Round
          </button>
        )}
      </div>
    </div>
  )
}

export default GameRoom
