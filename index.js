var http = require('http'),
  ioServer = require('socket.io'),
  ioRedis = require('redis'),
  express = require('express'),
  RedisStore = require('connect-redis')(express),
  passportSocketIo = require("passport.socketio");


exports.extendApp = function (core) {
  var server = http.createServer(core.app),
    io = ioServer.listen(server);

  io.enable('browser client cache');
  io.enable('browser client gzip');
  io.enable('browser client etag');
  io.enable('browser client minification');
  io.set('browser client expires', (24 * 60 * 60));
//*/
//for heroku or Pound reverse proxy
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 6);
//*/


  //make redis not so verbose
  core.app.configure('production', function () {
    io.set('log level', 1);
  });

//*/
  //set io for production - with 3 redis clients
  var ioRedisStore = require('socket.io/lib/stores/redis');

  io.set('store', new ioRedisStore({
    redis: ioRedis,
    redisPub: core.createRedisClient(), //it works in pub mode, it cannot access database
    redisSub: core.createRedisClient(), //it works in sub mode, it cannot access database
    redisClient: core.redisClient
  }));
//*/
  var sessionStorage = new RedisStore({prefix: 'mwc_sess_', client: core.redisClient});
  io.set("authorization", passportSocketIo.authorize({
      cookieParser: express.cookieParser,
      secret: core.config.secret,
      store: sessionStorage,
      fail: function (data, accept) {    //there is no passportJS user present for this session!
//        console.log('vvv fail');
//        console.log(data);
//        console.log('^^^ fail');
        data.user = null;
        accept(null, true);
      },
      success: function (data, accept) { //the passportJS user is present for this session!
//        console.log('vvv success');
//        console.log(data);
//        console.log('^^^ success');

        sessionStorage.get(data.sessionID, function (err, session) {
//          console.log('v session');
//          console.log(session);
//          console.log('^ session');
          core.model.Users.findOneByApiKey(session.passport.user, function (err, user) {
            if(user){
            console.log('user found '+user.username);
              data.user = user;
              accept(err, true);
            } else {
              accept(err, false); //we break the session, because someone tryes to tamper it)
            }
          });
        });
      }
    }
  ));

  io.sockets.on("connection", function (socket) {
    console.log("user connected: ");
    console.log(socket.handshake);
  });


  //emit event to all connected and authorized users
  core.on('broadcast', function (message) {
    io.sockets.emit('broadcast', message);
  });

//*/
  //catch event created by User.notify() to the user needed only
  core.on('notify:sio', function (message) {

//     message = {'user': MWC.MODEL.Users instance),
//     'type': "socketio",
//     'message':messageObj
//     }

      var activeUsers = io.sockets.manager.handshaken;
      for (var x in activeUsers) {
        if (activeUsers[x].user.username === message.user.username) {
//          console.log('We can send notify to active user of '+message.user.username);
//          console.log(io.sockets.manager.sockets.sockets[x]);
          if (io.sockets.manager.sockets.sockets[x]) {
            io.sockets.manager.sockets.sockets[x].emit('notify', {'user': message.user, 'message': message.message});
          }
        }
      }
  });
//*/
  core.listenWithSocketIo = function () {
    server.listen(core.app.get('port'));
  };
};


