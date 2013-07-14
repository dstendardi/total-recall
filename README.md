Total Recall
===========

Web traffic replay tool.

Install
-------

`npm install total-recall`

Usage
-----

The `run` function starts replaying traffic using requests in the specified
file.

    var totalRecall = require('total-recall');

    totalRecall.run({
       file: 'simpleRequests.txt',
       speed: 100,
       host: 'localhost:1337'
    });

This works for files where each line is a JSON object containing `path` and
`time` that specify the URL and the time the request was originally made.

    {"path":"/test/0","time":"2013-07-07T09:03:13.170Z"}
    {"path":"/test/1","time":"2013-07-07T09:03:18.141Z"}
    {"path":"/test/2","time":"2013-07-07T09:03:19.197Z"}
    {"path":"/test/3","time":"2013-07-07T09:03:23.330Z"}
    {"path":"/test/4","time":"2013-07-07T09:03:25.468Z"}
    {"path":"/test/5","time":"2013-07-07T09:03:29.986Z"}
    {"path":"/test/6","time":"2013-07-07T09:03:30.408Z"}
    {"path":"/test/7","time":"2013-07-07T09:03:33.694Z"}

For more control, a `requestParser` can be provided that parses every line in
the specified file and returns options that are merged into the default
options passed to perform the [request](https://github.com/mikeal/request).

A file such as

    {"type":"view","postid":0,"time":"2013-07-07T09:03:13.170Z"}
    {"type":"create","title":"Title 1","body":"Body 1","time":"2013-07-07T09:03:18.141Z"}
    {"type":"edit","postid":1,"title":"Title 1 (Edit)","body":"Body 1 (edit)","time":"2013-07-07T09:03:19.9450"}
    {"type":"view","postid":1,"time":"2013-07-07T09:03:21.330Z"}

can be used like so:

    var totalRecall = require('total-recall');

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

This determines the type of request by looking at the `type` and returns an
appropriate objects specifying how to make the request.

Samples
-------

The above examples are provided in the `samples` directory as runnable samples.

    cd samples
    node server.js
    # New terminal
    node simple.js
    node complicated.js

`node simple.js` results in this output on the client:

    100: {"avgResponseTime":"1.59","reqsPerSec":"35.74","failures":0,"totalFailures":0}
    200: {"avgResponseTime":"1.52","reqsPerSec":"39.03","failures":0,"totalFailures":0}
    300: {"avgResponseTime":"1.49","reqsPerSec":"37.89","failures":0,"totalFailures":0}
    400: {"avgResponseTime":"1.45","reqsPerSec":"40.18","failures":0,"totalFailures":0}
    500: {"avgResponseTime":"1.37","reqsPerSec":"41.32","failures":0,"totalFailures":0}
    600: {"avgResponseTime":"1.38","reqsPerSec":"45.56","failures":0,"totalFailures":0}
    700: {"avgResponseTime":"1.36","reqsPerSec":"44.52","failures":0,"totalFailures":0}
    800: {"avgResponseTime":"1.41","reqsPerSec":"42.57","failures":0,"totalFailures":0}
    900: {"avgResponseTime":"1.31","reqsPerSec":"42.18","failures":0,"totalFailures":0}
    1000: {"avgResponseTime":"1.20","reqsPerSec":"37.81","failures":0,"totalFailures":0}
    Total failures: 0

`node complicated.js` results in this output on the server:

    {"method":"GET","url":"/posts/0","time":"2013-07-14T19:03:16.370Z"}
    {"method":"POST","url":"/posts","time":"2013-07-14T19:03:21.334Z"}
    {"method":"PATCH","url":"/posts/1","time":"2013-07-14T19:03:23.136Z"}
    {"method":"GET","url":"/posts/1","time":"2013-07-14T19:03:24.521Z"}


Contributors
------------

* Marc Zych

Copyright 2013 Marc Zych.
