require('babel/register')({stage:0});

var CamDownload = require('./CamDownload'),
    config = require('./config.json');

var cams = [];
for (var i = 0; i < config.cams.length; i++){
  var camConfig = config.cams[i];
  var cam = new CamDownload(camConfig);
  cam.startDownload();
  console.log('Start cam download of: ' + cam.source);
  cams.push(cam);
}
