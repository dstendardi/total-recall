var totalRecall = require('../lib/total_recall.js');

totalRecall.run({
   file: 'complicatedRequests.txt',
   speed: 1,
   host: 'localhost:1337',
   requestParser: requestParser
});

function requestParser(line) {
   var parsedLine = JSON.parse(line);

   switch (parsedLine.type) {
   case 'view':
      return {
         path: "/posts/" + parsedLine.postid,
         time: new Date(parsedLine.time)
      };

   case 'create':
      return {
         method: "POST",
         path: "/posts",
         body: JSON.stringify({
            title: parsedLine.title,
            body: parsedLine.body
         }),
         headers: {
            Authorization: "1234"
         },
         time: new Date(parsedLine.time)
      };

   case 'edit':
      return {
         method: "PATCH",
         path: "/posts/" + parsedLine.postid,
         body: JSON.stringify({
            title: parsedLine.title,
            body: parsedLine.body
         }),
         headers: {
            Authorization: "1234"
         },
         time: new Date(parsedLine.time)
      };
   }
}
