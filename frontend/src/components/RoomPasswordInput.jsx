import { useState, useRef } from 'react'
import PinInput from './PinInput'

function RoomPasswordInput() {
  const [error, setError] = useState(false)
  const pinInputRef = useRef(null)

  const handleComplete = (pin) => {
    // 从环境变量读取密码
    const correctPassword = import.meta.env.VITE_ROOM_PASSWORD

    if (pin === correctPassword) {
      // 密码正确，后续实现创建房间逻辑
      console.log('密码正确，准备创建房间')
      // TODO: 创建房间
    } else {
      // 密码错误，清空输入框并显示错误状态
      setError(true)
      setTimeout(() => setError(false), 500)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white overflow-hidden">
      <PinInput ref={pinInputRef} length={4} onComplete={handleComplete} error={error} />
    </div>
  )
}

export default RoomPasswordInput
