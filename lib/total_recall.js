var lineReader = require('line-reader');
var request = require('request');
var domain = require('domain');

exports.run = function(options) {
   var recentResponseTimeTotal = 0;
   var requestsCount = 0;
   var totalFailures = 0;
   var previousFailures = 0;
   var startBufferTime = null;

   var outputBufferCount = options.outputBufferCount || 10;
   var absoluteStartTime = null;
   var firstRequestTime = null;
   var currentRequest = null;
   var speed = options.speed || 1;
   var requestParser = options.requestParser || defaultRequestParser;

   lineReader.open(options.file, function(reader) {
      fireRequest();

      function fireRequest() {
         if (!reader.hasNextLine()) {
            if (currentRequest) {
               handleRequest(currentRequest);
            }
            return;
         }

         reader.nextLine(function(line) {
            var nextRequest = requestParser(line);

            if (currentRequest) {
               var d = domain.create();

               d.on('error', function(error) {
                  console.error(error);
                  totalFailures++;
               });

               d.run(function() {
                  handleRequest(currentRequest);
               });
            } else {
               // Initialize times.
               firstRequestTime = nextRequest.time;
               absoluteStartTime = new Date();
               startBufferTime = new Date();
            }

            var currentRequestOffset = nextRequest.time - firstRequestTime;
            var timeElapsed = new Date() - absoluteStartTime;
            var timeElapsedAdjusted = timeElapsed * speed;

            var timeout = currentRequestOffset - timeElapsedAdjusted;
            var adjustedTimeout = timeout / speed;

            if (isNaN(adjustedTimeout)) {
               throw "Bad request timeout. Make sure 'time' is a Date.";
            }

            currentRequest = nextRequest;

            setTimeout(fireRequest, adjustedTimeout);
         });
      }

      function handleRequest(requestData) {
         var startTime = new Date();

         var finishFunction = function() {
            var endTime = new Date();
            addResponseTime(endTime - startTime);
         };

         if (requestData.performRequest) {
            // Perform the request by calling the provided function.
            // finishFunction should be called to keep track of stats.
            requestData.performRequest(finishFunction);
            return;
         }

         // Default options.
         var requestOptions = {
            method: 'GET',
            strictSSL: false,
            pool: {maxSockets: 1000},
            jar: false
         };

         // Merge properties together preferring the user supplied values.
         for (var key in requestData) {
            requestOptions[key] = requestData[key];
         }

         var url = "http://" + (requestData.host || options.host) +
          (requestData.path || requestData.path);

         request(url, requestOptions, function(error, response, body) {
            if (error || Math.floor(response.statusCode/100) != 2) {
               throw 'Bad response: ' + url + " | " + (error || response.statusCode);
            }

            finishFunction();
         });
      }

      function addResponseTime(time) {
         recentResponseTimeTotal += time;
         requestsCount++;

         if (requestsCount % outputBufferCount === 0) {
            var output = {};
            var endBufferTime = new Date();
            var reqsPerMs = outputBufferCount / (endBufferTime - startBufferTime);

            output.avgResponseTime = (recentResponseTimeTotal / outputBufferCount).toFixed(2);
            output.reqsPerSec = (reqsPerMs * 1000).toFixed(2);
            output.failures = totalFailures - previousFailures;
            output.totalFailures = totalFailures;

            recentResponseTimeTotal = 0;
            startBufferTime = endBufferTime;
            previousFailures = totalFailures;

            // Include totalFailures in the count so it matches the file's line number.
            console.log((requestsCount + totalFailures) + ": " + JSON.stringify(output));
         }
      }
   });

   function defaultRequestParser(line) {
      var parsedLine = JSON.parse(line);
      parsedLine.time = new Date(parsedLine.time);
      return parsedLine;
   }

   process.on('exit', function() {
      console.log("Total failures: " + totalFailures);
   });
   process.on('SIGINT', function() {
      // Exit like normal on SIGINT.
      process.exit();
   });
}
