import { io, Socket } from 'socket.io-client';

interface VoteUpdate {
  votes: {
    option_index: number;
    count: string;
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
}

export const socketService = new SocketService(); 