import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import RoomPasswordInput from './components/RoomPasswordInput'
import GameRoom from './components/GameRoom'
import JoinRoom from './components/JoinRoom'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/room" replace />
            ) : (
              <RoomPasswordInput onSuccess={handleAuthSuccess} />
            )
          }
        />
        <Route
          path="/room"
          element={
            isAuthenticated ? (
              <GameRoom isHost={true} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/join/:roomId"
          element={<JoinRoom />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
