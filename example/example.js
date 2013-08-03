var mwcCore = require('mwc_kernel');
var MWC = new mwcCore(require('./config.json').development);

MWC.usePlugin(require('./../index.js'));


//broadcast for users who are online

setInterval(function () {
  MWC.emit('broadcast', {'currentTime': new Date().toLocaleTimeString()});
}, 500);


MWC.extendRoutes(function (core) {
  core.app.get('/', function (request, response) {
    if (request.user) {
      response.sendfile(__dirname + '/indexAuth.html');

      //create socket.io notification to this request.user - the ine, who currently interacts with application
      setTimeout(function () {
        request.user.notify({'type': 'socketio','currentTime': (new Date().toLocaleTimeString())});
      }, 5000);
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
MWC.ready();//prepare application
MWC.listenWithSocketIo();

//sorry,
//MWC.listen()
//do not works for socket.io