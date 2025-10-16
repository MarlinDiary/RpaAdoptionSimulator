const { Server } = require('socket.io');
const { rounds } = require('../data/rounds');

// Room storage: { roomId: { host: socketId, participants: [{socketId, nickname, score, skipNextRound}], lastActivity: timestamp, currentRound: number, votes: {}, isGameOver: boolean } }
const rooms = new Map();

// Cleanup interval: check every minute for rooms to remove
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
const ROOM_TIMEOUT = 5 * 60 * 1000; // 5 minutes

let io = null;

function initialize(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Host creates a room
    socket.on('create-room', ({ roomId, isHost }) => {
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      if (rooms.has(roomId)) {
        // Room already exists, join as participant or host
        const room = rooms.get(roomId);

        if (isHost && !room.host) {
          // Become the host if no host exists
          room.host = socket.id;
          socket.join(roomId);
          socket.emit('room-joined', { roomId, role: 'host', success: true });
          console.log(`Socket ${socket.id} became host of room ${roomId}`);
        } else if (isHost && room.host) {
          // Host already exists
          socket.emit('room-joined', { roomId, role: 'host', success: true });
          socket.join(roomId);
          console.log(`Socket ${socket.id} joined as secondary host in room ${roomId}`);
        } else {
          // Join as participant
          room.participants.push(socket.id);
          socket.join(roomId);
          socket.emit('room-joined', { roomId, role: 'participant', success: true });

          // Notify host and all participants
          io.to(roomId).emit('participant-joined', {
            participantId: socket.id,
            totalParticipants: room.participants.length
          });

          console.log(`Socket ${socket.id} joined room ${roomId} as participant`);
        }

        room.lastActivity = Date.now();
      } else {
        // Create new room
        const room = {
          host: isHost ? socket.id : null,
          participants: isHost ? [] : [socket.id],
          lastActivity: Date.now(),
          currentRound: 0,
          votes: {},
          isGameOver: false
        };

        rooms.set(roomId, room);
        socket.join(roomId);

        socket.emit('room-joined', {
          roomId,
          role: isHost ? 'host' : 'participant',
          success: true
        });

        console.log(`Room ${roomId} created by ${socket.id} as ${isHost ? 'host' : 'participant'}`);
      }
    });

    // Join existing room (via QR code)
    socket.on('join-room', ({ roomId, nickname }) => {
      if (!roomId) {
        socket.emit('error', { message: 'Room ID is required' });
        return;
      }

      if (!rooms.has(roomId)) {
        socket.emit('room-not-found', { roomId });
        console.log(`Socket ${socket.id} tried to join non-existent room ${roomId}`);
        return;
      }

      const room = rooms.get(roomId);
      const participant = {
        socketId: socket.id,
        nickname: nickname || 'Anonymous',
        score: 0,
        skipNextRound: false
      };

      room.participants.push(participant);
      room.lastActivity = Date.now();

      socket.join(roomId);
      socket.emit('room-joined', { roomId, role: 'participant', success: true });

      // Notify everyone in the room
      io.to(roomId).emit('participant-joined', {
        participantId: socket.id,
        nickname: participant.nickname,
        totalParticipants: room.participants.length
      });

      console.log(`Socket ${socket.id} (${nickname}) joined room ${roomId}`);
    });

    // Submit vote
    socket.on('submit-vote', ({ roomId, choiceId }) => {
      if (!rooms.has(roomId)) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const room = rooms.get(roomId);

      // Find the participant
      const participant = room.participants.find(p => p.socketId === socket.id);

      if (participant && room.currentRound > 0 && room.currentRound <= rounds.length) {
        // Get current round data
        const currentRoundData = rounds[room.currentRound - 1];
        const choice = currentRoundData.choices.find(c => c.id === choiceId);

        if (choice) {
          // Add points to participant score
          participant.score += choice.points;
          console.log(`${participant.nickname} earned ${choice.points} points (total: ${participant.score})`);

          // Mark if participant should skip next round
          if (choice.skipNextRound) {
            participant.skipNextRound = true;
            console.log(`${participant.nickname} will skip next round`);
          }
        }
      }

      room.votes[socket.id] = choiceId;
      room.lastActivity = Date.now();

      // Broadcast updated votes to everyone in the room
      io.to(roomId).emit('vote-update', { votes: room.votes });

      console.log(`Vote recorded: ${socket.id} voted ${choiceId} in room ${roomId}`);
    });

    // Next round (only host can trigger)
    socket.on('next-round', ({ roomId }) => {
      if (!rooms.has(roomId)) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const room = rooms.get(roomId);

      if (room.host !== socket.id) {
        socket.emit('error', { message: 'Only host can trigger next round' });
        return;
      }

      if (room.isGameOver) {
        socket.emit('error', { message: 'Game already finished' });
        return;
      }

      if (room.currentRound >= rounds.length) {
        room.isGameOver = true;
        room.votes = {};
        room.lastActivity = Date.now();

        const leaderboard = room.participants
          .map(participant => {
            if (typeof participant === 'object') {
              return {
                socketId: participant.socketId,
                nickname: participant.nickname,
                score: participant.score
              };
            }

            return {
              socketId: participant,
              nickname: 'Anonymous',
              score: 0
            };
          })
          .sort((a, b) => b.score - a.score);

        io.to(roomId).emit('game-finished', {
          roomId,
          leaderboard
        });

        console.log(`Game finished in room ${roomId}`);
        console.log('Final leaderboard:', leaderboard);
        return;
      }

      // Increment round and reset votes
      room.currentRound += 1;
      room.isGameOver = false;
      room.votes = {};
      room.lastActivity = Date.now();

      // Apply penalty to participants who need to skip this round
      const skippedParticipants = [];
      room.participants.forEach(participant => {
        if (participant.skipNextRound) {
          participant.score -= 1; // Apply -1 penalty
          skippedParticipants.push({
            socketId: participant.socketId,
            nickname: participant.nickname
          });
          console.log(`${participant.nickname} skips round ${room.currentRound}, -1 penalty (total: ${participant.score})`);

          // Reset skip flag for future rounds
          participant.skipNextRound = false;
        }
      });

      // Broadcast to all in the room with skip information
      io.to(roomId).emit('round-started', {
        roomId,
        roundNumber: room.currentRound,
        skippedParticipants
      });

      console.log(`Host ${socket.id} started round ${room.currentRound} in room ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);

      // Find and update rooms
      for (const [roomId, room] of rooms.entries()) {
        if (room.host === socket.id) {
          io.to(roomId).emit('room-closed', { roomId });
          console.log(`Host left room ${roomId}. Room destroyed.`);

          // Remove all sockets from the room
          io.in(roomId).socketsLeave(roomId);

          rooms.delete(roomId);
          continue;
        }

        const participantIndex = room.participants.findIndex(p => {
          return typeof p === 'object' ? p.socketId === socket.id : p === socket.id;
        });

        if (participantIndex > -1) {
          room.participants.splice(participantIndex, 1);
          console.log(`Participant left room ${roomId}`);

          // Notify others
          io.to(roomId).emit('participant-left', {
            participantId: socket.id,
            totalParticipants: room.participants.length
          });
        }

        room.lastActivity = Date.now();
      }
    });
  });

  // Start cleanup interval
  setInterval(() => {
    const now = Date.now();

    for (const [roomId, room] of rooms.entries()) {
      const totalUsers = (room.host ? 1 : 0) + room.participants.length;

      // Remove room if empty for more than 5 minutes
      if (totalUsers === 0 && (now - room.lastActivity) > ROOM_TIMEOUT) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} removed due to inactivity`);
      }
    }
  }, CLEANUP_INTERVAL);

  console.log('Socket.IO initialized');
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initialize,
  getIO
};
