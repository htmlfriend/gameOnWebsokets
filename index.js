const http = require('http');
const app = require('express')();
app.listen(9091, () => console.log('express server on 9091'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
const websocketServer = require('websocket').server;
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log('listen on 9090 ....'));

const wsServer = new websocketServer({
  httpServer: httpServer,
});

// hashmap => clients[...clientId]
const clients = {};
const games = {};

wsServer.on('request', (request) => {
  // any tcp connections
  const connection = request.accept(null, request.origin);
  connection.on('open', () => console.log('opened'));
  connection.on('close', () => console.log('closed'));
  connection.on('message', (message) => {
    const result = JSON.parse(message.utf8Data);
    // i have received am message from the client
    // a user want to create a new game
    if (result.method === 'create') {
      const clientId = result.clientId;
      // create new game
      const gameId = guid();
      // balls for a game state
      games[gameId] = {
        id: gameId,
        balls: 20,
      };
      const payLoad = {
        method: 'create',
        game: games[gameId],
      };
      // send info to the client
      const con = clients[clientId].connection;
      con.send(JSON.stringify(payLoad));
    }
  });
  // answer to clients
  // generate ID for client
  const clientId = guid();
  // clients[clientId] = connection;
  clients[clientId] = {
    connection: connection,
  };
  // answer to client
  const payLoad = {
    method: 'connect',
    clientId: clientId,
  };
  //send back the client connect
  connection.send(JSON.stringify(payLoad));
});

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// then to call it , plus stitch in '4' in the third group
// you can genarate by npmjs packege guid(4)
const guid = () =>
  (
    S4() +
    S4() +
    '-' +
    S4() +
    '-4' +
    S4().substr(0, 3) +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  ).toLowerCase();
