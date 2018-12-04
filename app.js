const robotjs = require('robotjs');
const screenshot = require('screenshot-desktop');
const fps = 5; //Frames per Second
const os = require('os');
const fs = require('fs');
const webserver = require('http').createServer();
const serverport = 2006; //Server Port
const io = require('socket.io')(webserver);

//Listen to Port
webserver.listen(serverport);

//Keys
const keys = fs.readFileSync('keys.txt').toString().split("\n");
console.log(keys);
function checkKey(key) {
  if (key === "") return false;
  return keys.indexOf(key) != -1;
}

//Socket.io
io.on('connection', function (socket) {
  socket.on('remotecmd', function (data) {
    if (!checkKey(data.key)) return;
    var params = data.params;
    switch (data.cmd) {
      case 'mouseclick':
        if (params.left && !params.double) return; //Mouse Toggle is used instead
        robotjs.mouseClick(params.left ? 'left' : 'right', params.double);
        break;
      case 'mousetoggle':
        robotjs.mouseToggle(params.down ? 'down' : 'up');
        break;
      case 'mousemove':
        var screenSize = robotjs.getScreenSize();
        var mousex = params.x * screenSize.width;
        var mousey = params.y * screenSize.height;
        robotjs.moveMouse(mousex, mousey);
        break;
      case 'keypress':
        console.log(params);
        var modifiers = [];
        if (params.ctrl) {
          modifiers.push(os.platform === 'darwin' ? 'command' : 'control');
        }
        if (params.key.length > 1) {
          robotjs.keyTap(params.key.toLowerCase(), modifiers);
        } else {
          robotjs.keyTap(params.key, modifiers);
        }
        break;
    }
  });
});

setInterval(function () {
  screenshot().then((img) => {
    io.emit("screenimg", {image: img.toString('base64')});
  });
}, 1000/fps);
