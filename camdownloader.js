import CamDownload from './CamDownload';
import config from './config.json';

var cams = [];
for (var i = 0; i < config.cams.length; i++){
  var camConfig = config.cams[i];
  var cam = new CamDownload(camConfig);
  cam.startDownload();
  console.log('Start cam download of: ' + cam.source);
  cams.push(cam);
}
