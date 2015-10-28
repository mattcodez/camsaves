import http from 'http';
import fs from 'fs';
import fstream from 'fstream';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import tar from 'tar';

export default class CamDownload {
  constructor ({source, destination, interval, folderRate, taring}){
    //Required config
    this.source      = source;     //URL to download from
    this.destination = destination;//where to save on local disk
    this.interval    = interval;   //how often to save a new file from source
    this.folderRate  = folderRate; //how often to create a new container folder
    this.subFolder   = null; //TODO
    //Optional config
    this.taring      = taring;
    //Internal
    this.saveCount   = 0;
  
    //Init
    switch (this.folderRate){
      case 'daily':
        this.getFolderName = this.getDailyFolderName;
      break;
  
      case 'hourly':
        this.getFolderName = this.getHourlyFolderName;
      break;
  
      default:
        //No match, so no folders
        this.currentFolder = this.destination + '/';
    }
  }

  startDownload() {
    this.download();
    this.intervalID = setInterval(
      this.download.bind(this), this.interval * 1000
    );
  }

  stopDownload() {
    clearInterval(this.intervalID);
  }

  setCurrentFolder() {
    if (!this.getFolderName) return;
  
    var newFolder = this.getFolderName();
    if (newFolder !== this.currentFolder){
      //if we're switching folder names and this isn't the first of the script
      if (this.currentFolder){
        this.tarFolder(this.currentFolder);
      }
  
      mkdirp.sync(newFolder);
      this.currentFolder = newFolder;
    }
  }

  getDailyFolderName() {
    //Format "Mon May 25 2015"
    var date = (new Date()).toDateString();
    return this.destination + '/' + date;
  }

  getHourlyFolderName() {
    //Format "YYYY-MM-DDThh"
    var dateHour = (new Date()).toISOString();
    dateHour = dateHour.substr(0, dateHour.indexOf(':'));
    return this.destination + '/' + dateHour;
  }

  download() {
    this.setCurrentFolder();
  
    //Windows doesn't like colons in filenames
    var filename = (new Date()).toISOString().replace(/:/g, '-') + '.jpg';
    var filepath = this.currentFolder + '/' + filename;
    var file = fs.createWriteStream(filepath);
    var request = http.get(this.source, function(response) {
      response.pipe(file);
      this.saveCount++;
      console.log(filepath);
    }.bind(this))
    .on('error', function(err){
      console.log('HTTP error: ' + err.message);
      this.stopDownload();
      //TODO: Trigger an error event
    }.bind(this));
  }

  tarFolder(folder) {
    var onError = console.log.bind(console, 'Error writing tar file');
    var onEnd = rimraf.bind(rimraf, folder, function(err){
      if (err){
        console.log('Error deleting: ' + folder);
        console.dir(err);
      }
      else {
        console.log('Deleted: ' + folder);
      }
    });
  
    var dirDest = fs.createWriteStream(folder + '.tar');
    tar.Pack({ noProprietary: true })
      .on('error', onError)
      .on('end', onEnd);
  
    fstream.Reader({ path: folder, type: 'Directory' })
      .on('error', onError)
      .pipe(packer)
      .pipe(dirDest);
  }
};