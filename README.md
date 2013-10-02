kabam-plugin-socket-io
======================

Socket.io integration for Kabam.

Example
====================

[https://github.com/mykabam/kabam-plugin-socket-io/tree/master/example](https://github.com/mykabam/kabam-plugin-socket-io/tree/master/example)

```javascript

var kabamKernel = require('kabam-kernel');
var kabam = kabamKernel(require('./config.json').development);

kabam.usePlugin(require('./../index.js'));


//broadcast for users who are online

setInterval(function () {
  kabam.emit('broadcast', {'currentTime': new Date().toLocaleTimeString()});
}, 500);


kabam.extendRoutes(function (core) {
  kabam.app.get('/', function (request, response) {
    if (request.user) {
      response.sendfile(__dirname + '/indexAuth.html');

      //create socket.io notification to this request.user - the one, who currently interacts with application
      setTimeout(function () {
        request.user.notify({'type': 'socketio','currentTime': (new Date().toLocaleTimeString())});
      }, 5000);
    } else {
      response.sendfile(__dirname + '/indexNotAuth.html');
    }
  });

  //show the profile of current user
  kabam.app.get('/my', function (request, response) {
    response.json(request.user);
  });
});


//we need this workaround,
//because we start http and socket.io by the same http server instance on the same port
kabam.ready();//prepare application
kabam.listenWithSocketIo();

//sorry,
//kabam.listen()
//do not works for socket.io

```


Usage for broadcast for authorized users online
====================

Serverside code of

```javascript
    kabam.emit('broadcast', messageObj);
```

will emit event to all authorized users, that are currently online.
This event can be captured by this code on `client side`

```html

    <script src="/socket.io/socket.io.js" type="text/javascript"></script>
    <script>
      var socket = io.connect();
      socket.on('broadcast', function (data) {
        //data is the EXACT messageObj from serverside
      });
    </script>

```

Usage for particular users' notifications
====================

First, we need to get one instance of [kabam.MODEL.Users](https://github.com/mykabam/kabam-kernel#the-model-of-user)
Than we need to notify this user with this command

```javascript
var notifyObj = {
  'type': 'socketio', //mandatory field! have to BE EQUAL 'socketio'
  'text': 'Hello!',
  'foo': ["one", "two", "three"],
  'bar': {
    'lalala': '3ryblya'
  }
};
userFound.notify(notifyObj);
```

And this code on `client side` catches this notification for this particular user!

```html
<script src="/socket.io/socket.io.js" type="text/javascript"></script>
<script>
var socket = io.connect();
socket.on('notify', function(data) {
  //data is the EXACT notifyObj from serverside
});
</script>

```

Usage for broadcast for all non authorized users online
====================
Will be created. Maybe...

Other todos
====================

Emiting of events on clientside is not supported for now. Because i need to research this technology.
They are emited, but not processed for now.

Compatibility
====================
Currently this module was tested and working with browsers of

 - Google Chrome Version 28.0.1500.95
 - Midori 0.4.7
 - Firefox v22.0

runned on 64 bit Fedora release 18 (Spherical Cow)

And

 - Google Chrome Version 28.0.1500.95

runned from some version of Windows XP (i don't know how to see the version in it( )

The nodeJS setup was
```shell

    [nap@rhel kabam-plugin-socket-io]$ node -v
    v0.10.13
    [nap@rhel kabam-plugin-socket-io]$ npm -v
    1.3.2
    [nap@rhel kabam-plugin-socket-io]$ pound -V
    starting...
    Version 2.6
      Configuration switches:
        --enable-cert1l
    Exiting...

```

Shortly, nodeJS is runned on 3000 port, and [Pound](http://www.apsis.ch/pound) proxied requests from 80 port to 3000 port

