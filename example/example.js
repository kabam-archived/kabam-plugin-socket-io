var kabamKernel = require('kabam-kernel');

var kabam = kabamKernel({
  "hostUrl":"http://vvv.msk0.ru/",
  "secret":"hammer on the keyboard",
  "mongoUrl":"mongodb://localhost/kabam_dev",
  "redis":{"host":"localhost","port":6379},
  "sessionStorage": "redis",
  "passport":{
    "GITHUB_CLIENT_ID":"--insert-github-client-id-here--",
    "GITHUB_CLIENT_SECRET": "--insert-github-client-secret-here--",
    "TWITTER_CONSUMER_KEY":"--insert-twitter-consumer-key-here--",
    "TWITTER_CONSUMER_SECRET": "--insert-twitter-consumer-secret-here--",
    "FACEBOOK_APP_ID":"--insert-facebook-app-id-here--",
    "FACEBOOK_APP_SECRET":"--insert-facebook-app-secret-here--"
  }
});

kabam.usePlugin(require('./../index.js'));

//broadcast for users who are online

setInterval(function () {
  kabam.emit('broadcast', {'currentTime': new Date().toLocaleTimeString()});
}, 500);


kabam.extendRoutes(function (core) {
  core.app.get('/', function (request, response) {
    if (request.user) {
      response.sendfile(__dirname + '/indexAuth.html');

      //create socket.io notification to this request.user - the one, who currently interacts with application
      setTimeout(function () {
        request.user.notify('sio',{'currentTime': (new Date().toLocaleTimeString())});
      }, 2000);
    } else {
      response.sendfile(__dirname + '/indexNotAuth.html');
    }
  });

  //show the profile of current user
  core.app.get('/my', function (request, response) {
    response.json(request.user);
  });
});


//we need this workaround,
//because we start http and socket.io by the same http server instance on the same port
kabam.start('app');//prepare application
kabam.socket.listenWithSocketIo(3000);
kabam.socket.io.sockets.on('connection', function (socket) {
  console.log('Client with socket.id = '+(socket.id) + ' connected! ');
});
