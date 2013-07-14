var totalRecall = require('../lib/total_recall.js');

totalRecall.run({
   file: 'simpleRequests.txt',
   speed: 100,
   outputBufferCount: 100,
   host: 'localhost:1337'
});
