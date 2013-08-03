mwc_plugin_socket_io
====================

Socket.io integration for mwcKernel


Example
====================



Usage for broadcast
====================

Serverside code of

```javascript
    MWC.emit('broadcast', messageObj);
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

Usage for users' notifications
====================

First, we need to get one instance of [MWC.MODEL.Users](https://github.com/mywebclass/mwc_kernel#the-model-of-user)
Than we need to notify this user with this command

```javascript
    var notifyObj={
         'type': 'socketio', //mandatory field! have to BE EQUAL 'socketio'
         'text': 'Hello!',
         'foo':["one","two","three"],
         'bar':{'lalala':'3ryblya'}
       };
    userFound.notify(notifyObj);
```

And this code on `client side` catches this notification for this particular user!

```javascript

    <script src="/socket.io/socket.io.js" type="text/javascript"></script>
    <script>
        var socket = io.connect();
        socket.on('notify',function(data){
            //data is the EXACT notifyObj from serverside
        });
    </script>


```

Emiting of events on clientside is not supported for now. Because i need to research this technology.

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

    [nap@rhel mwc_plugin_socket_io]$ node -v
    v0.10.13
    [nap@rhel mwc_plugin_socket_io]$ npm -v
    1.3.2
    [nap@rhel mwc_plugin_socket_io]$ pound -V
    starting...
    Version 2.6
      Configuration switches:
        --enable-cert1l
    Exiting...

```

Shortly, nodeJS is runned on 3000 port, and [Pound](http://www.apsis.ch/pound) proxied requests from 80 port to 3000 port

