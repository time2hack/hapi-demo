const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: Number(process.argv[2]) || 8080
});

// Add the route
server.route({
  method: 'GET',
  path:'/',
  handler: function (request, reply) {

    return reply('HapiJS Server running!');
  }
});
server.route({
  method: 'GET',
  path:'/api/{username}',
  handler: function (request, reply) {

    return reply({q:request.query, p: request.params});
  }
});

server.route({
  method: ['PUT', 'GET'],
  path: '/api/{username}/friends',
  handler: function(request, reply) {
    const username = encodeURIComponent(request.params.username);
    return reply(username)
  }
});
// Start the server
server.start((err) => {

  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
