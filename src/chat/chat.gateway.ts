import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';

import { Server } from 'ws';

@WebSocketGateway(8001, { cors: '*' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // Salas disponíveis
  rooms = ['Nest.js', 'React', 'PHP'];

  // Usuários e suas salas atuais
  users: { [key: string]: string } = {};

  // Evento de conexão de um novo cliente
  handleConnection(client: any) {
    // Ao conectar, adicionamos o cliente à sala padrão (Nest.js)
    this.joinRoom(client, this.rooms[0]);
  }

  // Entrar em uma sala
  joinRoom(client: any, room: string) {
    client.join(room);
    this.users[client.id] = room;
    client.emit('joinedRoom', room);
  }

  // Sair de uma sala
  leaveRoom(client: any) {
    const room = this.users[client.id];
    client.leave(room);
    delete this.users[client.id];
  }

  // Manipulador de mensagem
  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: any, client: any): void {
    const room = this.users[client.id];
    this.server.to(room).emit('message', message);
  }

  // Alterar de sala
  @SubscribeMessage('changeRoom')
  handleChangeRoom(@MessageBody() newRoom: string, client: any): void {
    if (this.rooms.includes(newRoom)) {
      this.leaveRoom(client);
      this.joinRoom(client, newRoom);
      client.emit('roomChanged', newRoom);
    } else {
      client.emit('error', 'Sala inválida');
    }
  }
}
