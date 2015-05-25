var http = require('http'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

function CamDownload(properties){
  this.source = properties.source;
  this.destination = properties.destination;
  this.interval = properties.interval;
  this.subfolder = properties.subfolder;

  this.saveCount = 0;
}

module.exports = CamDownload;

CamDownload.prototype = {};

CamDownload.prototype.startDownload = function(){
  this.download();
  this.intervalID = setInterval(
    this.download.bind(this), this.interval * 1000
  );
}

CamDownload.prototype.stopDownload = function(){
  clearInterval(this.intervalID);
}

CamDownload.prototype.setCurrentFolder = function(){
  switch (this.subfolder){
    case 'daily':
      //Format "Mon May 25 2015"
      var date = (new Date()).toDateString();
      var newFolder = this.destination + '/' + date;
    break;

    case 'hourly':
      var dateHour = (new Date()).toISOString();
      //gives format of "YYYY-MM-DDThh"
      dateHour = dateHour.substr(0, dateHour.indexOf(':'));
      var newFolder = this.destination + '/' + dateHour;
    break;

    default:
      //No match, so no subfolder
      newFolder = this.destination + '/';
  }

  if (newFolder !== this.currentFolder){
    mkdirp.sync(newFolder);
    this.currentFolder = newFolder;
  }
}

CamDownload.prototype.download = function(){
  this.setCurrentFolder();

  //Windows doesn't like colons in filenames
  var filename = (new Date()).toISOString().replace(/:/g, '-') + '.jpg';
  var filepath = this.currentFolder + '/' + filename;
  var file = fs.createWriteStream(filepath);
  var request = http.get(this.source, function(response) {
    response.pipe(file);
    this.saveCount++;
    console.log(filepath);
  }.bind(this));
}
