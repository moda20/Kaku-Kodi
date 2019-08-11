import Player from './Player';
import BaseTrack from 'kaku-core/models/track/BaseTrack';
import Firebase from '../../modules/wrapper/Firebase';

class RemotePlayer {
  constructor() {
    this._initialized = false;

    this._onPlayerPlay = this._onPlayerPlay.bind(this);
    this._onPlayerPause = this._onPlayerPause.bind(this);
    this._onPlayerStop = this._onPlayerStop.bind(this);
  }

  init() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;

    Firebase.on('setup', (userInfo) => {
      // keep this in internal variable
      this.userInfo = userInfo;
      if (userInfo.role !== 'dj') {
        // disable non-dj users' players
        Player.disable(true);
      }

      this._playedTracksRef = Firebase.joinPlayedTracksRoom();
      this._commandRef = Firebase.joinCommandRoom();

      // TODO
      // there is something wrong with the playingTime, so need to fix it later
      if (userInfo.role === 'guest') {
        this._commandRef.on('value', (snapshot) => {
          let action = snapshot.val();
          // for the first time, there is no action at all,
          // so we will wait until everything is there
          if (action) {
            let command = action.command;
            let data = action.data;
            if (command === 'play') {
              let track = BaseTrack.fromJSON(data.track);
              let time = data.time;
              Player.play(track, time, true);
            }
            else if (command === 'stop') {
              Player.stop(true);
            }
            else if (command === 'pause') {
              Player.pause(true);
            }
          }
        });
      }
      else if (userInfo.role === 'dj') {
        Player.on('play', this._onPlayerPlay);
        Player.on('pause', this._onPlayerPause);
        Player.on('stop', this._onPlayerStop);
      }
    });

    Firebase.on('room-left', (roomName) => {
      if ('command' === roomName) {
        if (this.userInfo.role === 'dj') {
          Player.off('play', this._onPlayerPlay);
          Player.off('pause', this._onPlayerPause);
          Player.off('stop', this._onPlayerStop);
        }
        this._playedTracksRef = null;
        this._commandRef = null;
        Player.disable(false);
      }
    });
  }

  _onPlayerPlay() {
    let playingTrack = Player.playingTrack.toJSON();
    let time = Player.playingTrackTime;

    this._playedTracksRef.push(playingTrack);
    this._commandRef.set({
      command: 'play',
      data: {
        track: playingTrack,
        time: time
      }
    });
  }

  _onPlayerPause() {
    this._commandRef.set({
      command: 'pause'
    });
  }

  _onPlayerStop() {
    this._commandRef.set({
      commnad: 'stop'
    });
  }
}

module.exports = new RemotePlayer();
