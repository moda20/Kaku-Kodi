import { EventEmitter } from 'events';
import BasePlaylist from 'kaku-core/models/playlist/BasePlaylist';
import Tracker from './Tracker';
import LDB from './LocalDatabase';
import DB from "./Database";
var path = require('path');
import LocalVideoModel from "../Models/LocalVideoModel";
import LocalFolderModel from "../Models/LocalFolderModel";
var fs = require('fs');


class LocalDatabaseManager extends EventEmitter {
  constructor() {
    super();
    this._playlists = [];

    this._isDisplaying = false;
    this._activePlaylist = null;

    // we have to initialize playlist from db
    //this._initializedPromise = this.init();

    Object.defineProperty(LocalDatabaseManager.prototype, 'playlists', {
      enumerable: true,
      configurable: false,
      get() {
        return this._playlists;
      }
    });

    Object.defineProperty(LocalDatabaseManager.prototype, 'activePlaylist', {
      enumerable: true,
      configurable: false,
      get() {
        return this._activePlaylist;
      }
    });

    Object.defineProperty(LocalDatabaseManager.prototype, 'isDisplaying', {
      enumerable: true,
      configurable: false,
      get() {
        return this._isDisplaying;
      }
    });
  }

  init() {

  }

  getVideosFromDirectory(dir){

     let tree =LDB.ReadVideoFilesFromDirectory(dir,undefined);
    return LocalFolderModel.FromJson(tree);
  }

  /**
   * This will fetch files from the stored directories in the database
   * @returns Promise<Array>
   */
  getFoldersStoredInDatabase(){
    return new Promise((res,rej)=>{
      let folderTrees = [];
      return this.getVideosFromDB().then(
          data=>{
            console.log(data);
            if(data.files){
              for(let i =0; i< data.files.length; i++){
                  if(this.verifyVideosBasedOnURI(data.files[i])){
                      folderTrees.push(this.getVideosFromDirectory(data.files[i]));
                  }else{
                      this.deleteFileFromFileStructure(data.files[i]);
                  }

              }
            }
            res(folderTrees);
          }
      ).catch(
          (err)=>{
            rej(err);
          }
      )
    })
  }

  AddNewDirectory(dir){

  }

  saveFileStructureToDB(dir){

    return DB.get('Localfiles')
        .catch((error) => {
          if (error.status === 404) {
            return DB.put({
              _id: "Localfiles",
              files: []
            });
          }
          else {
            throw error;
          }
        }).then((doc) => {
          console.log(doc);
          let files = doc.files;
          files.push(dir);
          return DB.put({
            _id: 'Localfiles',
            _rev: doc._rev,
            files:files
          });
        });
  }

  deleteFileFromFileStructure(dir){

      return DB.get('Localfiles')
          .catch((error) => {
              if (error.status === 404) {
                  return DB.put({
                      _id: "Localfiles",
                      files: []
                  });
              }
              else {
                  throw error;
              }
          }).then((doc) => {
              console.log(doc);
              let files = doc.files;
              files.splice(files.indexOf(dir),1);
              return DB.put({
                  _id: 'Localfiles',
                  _rev: doc._rev,
                  files:files
              });
          });
  }

  getVideosFromDB(){
    return DB.get("Localfiles")
        .catch((error) => {
          if (error.status === 404) {
            return DB.put({
              _id: "Localfiles",
              files: []
            });
          }
          else {
            throw error;
          }
        })
        .catch((error) => {
          console.log(error);
        });
  }

  verifyVideosBasedOnURI(path){
      if(fs.existsSync(path)){
          return true;
      }else{
          return false;
      }
  }

/*
  ready() {
    return this._initializedPromise;
  }
*/

  /*showPlaylistById(id) {
    const playlist = this.findPlaylistById(id);
    if (!playlist) {
      console.error('we can\'t find any playlist with id - ', id);
    }
    else {
      this._activePlaylist = playlist;
      this._isDisplaying = true;
      this.emit('shown', playlist);
    }
  }

  hidePlaylist() {
    this._activePlaylist = null;
    this._isDisplaying = false;
    this.emit('hidden');
  }

  addNormalPlaylist(name) {
    return this._addPlaylist({
      type: 'normal',
      name: name
    });
  }

  addYoutubePlaylist(name, youtubeId) {
    return this._addPlaylist({
      type: 'youtube',
      name: name,
      platformid: youtubeId
    });
  }

  _addPlaylist(options) {
    const promise = new Promise((resolve, reject) => {
      const name = options.name;
      const sameNamePlaylist = this.findPlaylistByName(name);
      if (sameNamePlaylist) {
        reject('You already had one playlist with the same name - ' + name +
          ', so please try another one !');
      }
      else {
        Tracker.event('LocalDatabaseManager', 'add playlist', name).send();

        // TODO
        // we may support different playlist in the future, for example,
        // we can import playlist from Youtube / Vimeo ... etc,
        // so we can create different one here
        const playlist = new BasePlaylist(options);
        this._playlists.push(playlist);

        this.emit('added', playlist);

        playlist.on('tracksUpdated', () => {
          this._storePlaylistsToDB();
        });

        this._storePlaylistsToDB().then(() => {
          resolve(playlist);
        });
      }
    });
    return promise;
  }

  _importPlaylist(options) {
    const name = options.name;
    const sameNamePlaylist = this.findPlaylistByName(name);
    if (sameNamePlaylist) {
      // This should not happen because we will cleanup db before importing,
      // so in order to make the other importing process work as usual,
      // the better way is to resolve it directly.
    }
    else {
      var playlist = BasePlaylist.fromJSON(options);
      this._playlists.push(playlist);

      playlist.on('tracksUpdated', () => {
        this._storePlaylistsToDB();
      });

      this.emit('added', playlist);
    }
  }

  _storePlaylistsToDB() {
    return DB.get('playlists').then((doc) => {
      return DB.put({
        _id: 'playlists',
        _rev: doc._rev,
        playlists: this._playlists.map((playlist) => {
         return playlist.toJSON();
        })
      });
    })
    .catch((error) => {
      console.log(error);
    });
  }

  removePlaylistById(id) {
    const promise = new Promise((resolve, reject) => {
      const index = this.findPlaylistIndexById(id);
      if (index === -1) {
        reject('Can\'t find the playlist');
      }
      else {
        const removedPlaylist = this._playlists.splice(index, 1)[0];
        this._storePlaylistsToDB().then(() => {
          // TODO
          // we can try to remove listeners from playlist here if needed
          this.emit('removed', removedPlaylist);
          resolve(removedPlaylist);
        });
      }
    });
    return promise;
  }

  findPlaylistIndexById(id) {
    const playlist = this.findPlaylistById(id);
    return this._playlists.indexOf(playlist);
  }

  findPlaylistById(id) {
    const playlists = this._playlists.filter((playlist) => {
      return playlist.id === id;
    });

    // id is unique
    return playlists[0];
  }

  findPlaylistIndexByName(name) {
    const playlist = this.findPlaylistByName(name);
    return this._playlists.indexOf(playlist);
  }

  findPlaylistByName(name) {
    const playlists = this._playlists.filter((playlist) => {
      return playlist.name === name;
    });

    // name is unique
    return playlists[0];
  }

  renamePlaylistById(id, newName) {
    const index = this.findPlaylistIndexById(id);
    if (index < 0) {
      return Promise.reject('can\'t find playlist id - ', id);
    }
    else {
      Tracker.event('LocalDatabaseManager', 'rename playlist', newName).send();

      let playlist = this._playlists[index];
      playlist.name = newName;
      this._playlists[index] = playlist;

      return this._storePlaylistsToDB().then(() => {
        this.emit('renamed', playlist);
      });
    }
  }

  export() {
    const result = this.playlists.map((playlist) => {
      return playlist.toJSON();
    });
    return result;
  }

  cleanup() {
    const promises = this.playlists.map((playlist) => {
      return this.removePlaylistById(playlist.id);
    });
    return Promise.all(promises).then(() => {
      this.emit('cleanup');
    });
  }

  import(playlistObjects) {
    playlistObjects.map((playlistObject) => {
      return this._importPlaylist(playlistObject);
    });
    return this._storePlaylistsToDB().then(() => {
      this.emit('imported');
    });
  }*/
}

module.exports = new LocalDatabaseManager();
