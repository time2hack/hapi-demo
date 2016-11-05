var fs = require('fs');
const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: Number(process.argv[2]) || 8080
});

// Add the route
server.route([
  {
    method: 'GET',
    path:'/',
    handler: function (request, reply) {

      return reply('HapiJS Server running!');
    }
  },{
    method: 'GET',
    path:'/form',
    handler: function (request, reply) {

      return reply(`
          <form method="POST" action='/submit' enctype="multipart/form-data">
            <p><input type="text" name="textField" /></p>
            <p><input type="file" name="fileField" /></p>
            <p><input type="submit" /></p>
          </form>
        `).header('content-type', 'text/html');
    }
  },{
    method: 'POST',
    path: '/submit',
    config: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data'
      },
      handler: function (request, reply) {
        var data = request.payload;
        if (data.fileField) {
          var name = data.fileField.hapi.filename;
          var path = __dirname + "/uploads/" + name;
          var file = fs.createWriteStream(path);

          file.on('error', function (err) {
            console.error(err)
          });

          data.fileField.pipe(file);

          data.fileField.on('end', function (err) {
            var ret = {
              filename: data.fileField.hapi.filename,
              headers: data.fileField.hapi.headers
            }
            reply(JSON.stringify(ret));
          })
        }

      }
    }
  }
]);

//Check and Create Uploads directory
checkDirectory('./uploads', function(e){
  if(e){
    console.error(e)
    process.exit();
  } else {
    console.log('directory check successful')
  }
})

// Start the server
server.start((err) => {

  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});

//function will check if a directory exists, and create it if it doesn't
function checkDirectory(directory, callback) {
  fs.stat(directory, function(err, stats) {
    //Check if error defined and the error code is "not exists"
    if (err && err.code === 'ENOENT') {
      //Create the directory, call the callback.
      fs.mkdir(directory, callback);
    } else {
      //just in case there was a different error:
      callback(err)
    }
  });
}
