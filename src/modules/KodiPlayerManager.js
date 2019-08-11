import { EventEmitter } from 'events';
import BasePlaylist from 'kaku-core/models/playlist/BasePlaylist';
import Tracker from './Tracker';
import LDB from './LocalDatabase';
import DB from "./Database";
var path = require('path');
import LocalVideoModel from "../Models/LocalVideoModel";
import LocalFolderModel from "../Models/LocalFolderModel";
// The options below are the defaults
var kodi = require('kodi-ws');



class KodiPlayerManager extends EventEmitter {
    constructor() {
        super();

    }




    getKodiSettings(){
        return new Promise((res,rej)=>{
            DB.get('kodisettings')
                .catch((error) => {
                    if (error.status === 404) {
                        return DB.put({
                            _id: "kodisettings",
                            settings: {}
                        });
                    }
                    else {
                        throw error;
                    }
                }).then((doc) => {
                console.log(doc);
                res(doc);
            }).catch(err=>{
                rej(err);
            });
        })
    }


    saveKodiSettings(settingsobj){
        DB.get('kodisettings')
            .catch((error) => {
                if (error.status === 404) {
                    return DB.put({
                        _id: "kodisettings",
                        settings: {
                            ip:settingsobj.ip,
                            port:settingsobj.port
                        }
                    });
                }
                else {
                    throw error;
                }
            }).then((doc) => {
            return DB.put({
                _id: "kodisettings",
                _rev:doc._rev,
                settings: {
                    ip:settingsobj.ip,
                    port:settingsobj.port
                }
            })
    })
    }



    connectToKodi(callback){
        if(!callback)throw "CallbackNotFound";
        this.getKodiSettings().then(
            data=>{

                kodi(data.settings.ip, data.settings.port).then(function(connection) {
                    /* Do something with the connection */
                    callback(connection)
                });

            }
        );
    }

}

module.exports = new KodiPlayerManager();
