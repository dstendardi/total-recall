var http = require('http');

/**
 * Simply listens for requests and prints out the URL and time it was received.
 * Used for easy testing of traffic playback.
 */
http.createServer(function (req, res) {
   console.log(JSON.stringify({
      method: req.method,
      url: req.url,
      time: new Date()
   }));

   res.writeHead(204);
   res.end();
}).listen(1337);
