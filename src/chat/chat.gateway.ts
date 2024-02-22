import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket, // Importe ConnectedSocket
} from '@nestjs/websockets';

import { Server, WebSocket } from 'ws';

@WebSocketGateway(8001, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  rooms = ['Nest.js', 'React', 'PHP'];

  users: { [key: string]: string } = {};

  handleConnection(client: any) {
    this.joinRoom(client, this.rooms[0]);
  }

  joinRoom(client: any, room: string) {
    client.join(room);
    this.users[client.id] = room;
    client.emit('joinedRoom', room);
  }

  leaveRoom(client: any) {
    const room = this.users[client.id];
    client.leave(room);
    delete this.users[client.id];
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: WebSocket,
  ): void {
    const room = this.users[client.id];
    this.server.to(room).emit('message', message);
  }

  @SubscribeMessage('changeRoom')
  handleChangeRoom(
    @MessageBody() newRoom: string,
    @ConnectedSocket() client: WebSocket,
  ): void {
    if (this.rooms.includes(newRoom)) {
      this.leaveRoom(client);
      this.joinRoom(client, newRoom);
      client.emit('roomChanged', newRoom);
    } else {
      client.emit('error', 'Sala inválida');
    }
  }
}
