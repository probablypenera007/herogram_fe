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
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:3001', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      this.socket.on('connect', () => {
        console.log('🟢 Socket.IO connected ✅', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 Socket.IO disconnected ❌');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinPoll(pollId: number) {
    if (this.socket) {
      this.socket.emit('joinPoll', pollId);
    }
  }

  onVoteUpdate(callback: (data: VoteUpdate) => void) {
    if (this.socket) {
      this.socket.on('voteUpdate', callback);
    }
  }

  offVoteUpdate(callback: (data: VoteUpdate) => void) {
    if (this.socket) {
      this.socket.off('voteUpdate', callback);
    }
  }

  // ✅ Add this:
  onPollFetched(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('pollFetched', callback);
    }
  }
}

export const socketService = new SocketService(); 