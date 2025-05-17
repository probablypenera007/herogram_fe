import { io, Socket } from 'socket.io-client';

interface VoteUpdate {
  pollId: number;
  userId: number;
  votes: {
    optionIndex: number;
    count: number;
    userId: number;
  }[];
}

class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      transports: ['websocket'], 
    });

    this.socket.on('connect', () => {
      console.log('🟢 Socket.IO connected ✅', this.socket?.id);
      console.log("💥 Socket connected status:", this.socket.connected);
    });
    this.socket.on('disconnect', (reason) => {
      console.warn(`🔴 Socket.IO disconnected ❌: ${reason}`);
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.info(`♻️ Reconnection attempt #${attempt}`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.info(`🔁 Reconnected successfully after ${attempt} tries`);
    });
  }

  joinPoll(pollId: number) {
    this.socket.emit('joinPoll', pollId);
  }

  onVoteUpdate(callback: (data: VoteUpdate) => void) {
    this.socket.on('voteUpdate', callback);
  }

  offVoteUpdate(callback: (data: VoteUpdate) => void) {
    this.socket.off('voteUpdate', callback);
  }

  onPollFetched(callback: (data: any) => void) {
    this.socket.on('pollFetched', callback);
  }

  offPollFetched(callback: (data: any) => void) {
    this.socket.off('pollFetched', callback);
  }
}

export const socketService = new SocketService();