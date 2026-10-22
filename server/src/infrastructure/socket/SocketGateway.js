import { RealtimePublisher } from '../../ports/RealtimePublisher.js';

/**
 * SocketGateway
 * Infrastructure adapter implementing RealtimePublisher using Socket.IO.
 * 
 * CLEAN ARCHITECTURE BOUNDARY:
 * Domain and Application layers depend exclusively on the RealtimePublisher port.
 * Socket.IO is strictly encapsulated here in infrastructure.
 */
export class SocketGateway extends RealtimePublisher {
  constructor(io = null, tokenSigner = null) {
    super();
    this.io = io;
    this.tokenSigner = tokenSigner;

    if (this.io && this.tokenSigner) {
      this._setupAuthAndHandlers();
    }
  }

  _setupAuthAndHandlers() {
    // Authenticate handshake via JWT
    this.io.use(async (socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

        if (!token) {
          return next(new Error('Authentication required for socket connection.'));
        }

        const payload = await this.tokenSigner.verifyAccessToken(token);
        if (!payload || !payload.sub) {
          return next(new Error('Invalid socket authentication token.'));
        }

        socket.user = { id: String(payload.sub) };
        next();
      } catch {
        next(new Error('Socket authentication failed.'));
      }
    });

    // On connection, join personal room
    this.io.on('connection', (socket) => {
      const studentId = socket.user?.id;
      if (studentId) {
        socket.join(`student:${studentId}`);
      }

      socket.on('disconnect', () => {
        // Handled automatically by socket.io room cleanup
      });
    });
  }

  emitToStudent(studentId, event, data) {
    if (!this.io) return;
    this.io.to(`student:${studentId}`).emit(event, data);
  }

  broadcast(event, data) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}
