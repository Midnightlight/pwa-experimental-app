import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({
  port: 3081,
});

const connections: AppConnection[] = [];

class AppConnection {
  constructor(
    public ws: WebSocket,
    public userId?: string,
  ) {
    this.registerListeners();
  }

  private registerListeners() {
    this.ws.on("message", (message) => {
      const { type, data } = JSON.parse(message.toString());

      switch (type) {
        case "login":
          this.handleLogin(data);
          break;
      }
    });

    this.ws.on("close", () => {
      connections.splice(connections.indexOf(this), 1);
    });
  }

  private handleLogin(data: string) {
    console.log("logged in", data);
    this.userId = data;
  }

  send(type: string, data: any) {
    if (this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({ type, data }));
  }
}

wss.on("connection", (connection) => {
  connections.push(new AppConnection(connection));
});

export const sendWSMessageToUser = (userId: string, type: string, data: any) =>
  connections
    .filter((conn) => conn.userId === userId)
    .forEach((conn) => conn.send(type, data));
