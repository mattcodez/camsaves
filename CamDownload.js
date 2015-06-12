var http    = require('http'),
    fs      = require('fs'),
    fstream = require('fstream'),
    mkdirp  = require('mkdirp'),
    tar     = require('tar');

function CamDownload(properties){
  //Required config
  this.source      = properties.source;
  this.destination = properties.destination;
  this.interval    = properties.interval;
  this.subfolder   = properties.subfolder;
  //Optional config
  this.taring      = properties.taring;
  //Internal
  this.saveCount   = 0;

  //Init
  switch (this.subfolder){
    case 'daily':
      this.getFolderName = this.getDailyFolderName;
    break;

    case 'hourly':
      this.getFolderName = this.getHourlyFolderName;
    break;

    default:
      //No match, so no subfolder
      this.currentFolder = this.destination + '/';
  }
}

module.exports = CamDownload;

CamDownload.prototype = {};

CamDownload.prototype.startDownload = function(){
  this.download();
  this.intervalID = setInterval(
    this.download.bind(this), this.interval * 1000
  );
};

CamDownload.prototype.stopDownload = function(){
  clearInterval(this.intervalID);
};

CamDownload.prototype.setCurrentFolder = function(){
  if (!this.getFolderName) return;

  var newFolder = this.getFolderName();
  if (newFolder !== this.currentFolder){
    mkdirp.sync(newFolder);
    this.currentFolder = newFolder;
  }
};

CamDownload.prototype.getDailyFolderName = function(){
  //Format "Mon May 25 2015"
  var date = (new Date()).toDateString();
  return this.destination + '/' + date;
};

CamDownload.prototype.getHourlyFolderName = function(){
  //Format "YYYY-MM-DDThh"
  var dateHour = (new Date()).toISOString();
  dateHour = dateHour.substr(0, dateHour.indexOf(':'));
  return this.destination + '/' + dateHour;
};

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
};

CamDownload.prototype.tarFolder = function(folder){

};
