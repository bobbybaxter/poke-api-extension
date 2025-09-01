import http from 'http';
import app from 'src/tests/setup/mock-app.js';

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

export async function mockCreateServer() {
  const server = http.createServer(app);
  const port = normalizePort(process.env.PORT || '0');

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
      case 'EACCES':
        console.info(`${bind} requires elevated privileges`);
        break;
      case 'EADDRINUSE':
        console.info(`${bind} is already in use`);
        break;
      default:
        throw error;
    }

    process.exit(1);
  }

  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
  }

  let connections = [];

  server.on('connection', (connection) => {
    connections.push(connection);
    connection.on('close', () => (connections = connections.filter((curr) => curr !== connection)));
  });

  process.on('SIGTERM', shutDown);
  process.on('SIGINT', shutDown);

  function shutDown() {
    console.info('Received kill signal, shutting down gracefully');
    server.close(() => {
      console.info('Closed out remaining connections');
      process.exit(0);
    });

    setTimeout(() => {
      console.info('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);

    connections.forEach((curr) => curr.end());
    setTimeout(() => connections.forEach((curr) => curr.destroy()), 5000);
  }

  app.set('port', port);

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);

  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  return { server, baseUrl };
}
