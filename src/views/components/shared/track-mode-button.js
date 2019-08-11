import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import PreferenceManager from '../../../modules/PreferenceManager';

const PREFERENCE_KEY = 'default.track.mode';

class TrackModeButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'square'
    };

    this._onClick = this._onClick.bind(this);
  }

  componentDidMount() {
    let mode = PreferenceManager.getPreference(PREFERENCE_KEY);
    if (mode) {
      this.setState({
        mode: mode
      });

      this.props.onTrackModeChange(mode);
    }

    PreferenceManager.on('preference-updated', (key, newMode) => {
      if (key === PREFERENCE_KEY) {
        this.setState({
          mode: newMode
        });
        this.props.onTrackModeChange(newMode);
      }
    });
  }

  _onClick(event) {
    let target = event.target;
    let newMode = target.dataset.mode;
    if (newMode !== this.state.mode) {
      PreferenceManager.setPreference(PREFERENCE_KEY, newMode);
    }
  }

  render() {
    let mode = this.state.mode;

    let listButtonClass = ClassNames({
      'btn': true,
      'btn-default': true,
      'track-list-mode': true,
      'active': (mode === 'list')
    });

    let squareButtonClass = ClassNames({
      'btn': true,
      'btn-default': true,
      'track-square-mode': true,
      'active': (mode === 'square')
    });

    return (
      <div className="btn-group" role="group">
        <button
          type="button"
          className={listButtonClass}
          data-mode="list"
          onClick={this._onClick}>
            <i className="fa fa-fw fa-list"></i>
        </button>
        <button
          type="button"
          className={squareButtonClass}
          data-mode="square"
          onClick={this._onClick}>
            <i className="glyphicon glyphicon-th"></i>
        </button>
      </div>
    );
  }
}

TrackModeButton.propTypes = {
  onTrackModeChange: PropTypes.func
};

TrackModeButton.defaultProps = {
  onTrackModeChange: function() {}
};

export default TrackModeButton;
