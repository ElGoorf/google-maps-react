import React, { PropTypes as T } from 'react'

import { camelize } from '../lib/String'
const evtNames = ['click', 'mouseover', 'recenter'];

const wrappedPromise = function() {
    var wrappedPromise = {},
        promise = new Promise(function (resolve, reject) {
            wrappedPromise.resolve = resolve;
            wrappedPromise.reject = reject;
        });
    wrappedPromise.then = promise.then.bind(promise);
    wrappedPromise.catch = promise.catch.bind(promise);
    wrappedPromise.promise = promise;

    return wrappedPromise;
}

export class Polyline extends React.Component {

  componentDidMount() {
    this.polylinePromise = wrappedPromise();
    this.renderPolyline();
  }

  componentDidUpdate(prevProps) {
    if ((this.props.map !== prevProps.map) ||
      (this.props.position !== prevProps.path)) {
        this.polyline.setMap(null);
        this.renderPolyline();
    }
  }

  componentWillUnmount() {
    if (this.polyline) {
      this.polyline.setMap(null);
    }
  }

  renderPolyline() {
    let {
      map, google, path, mapCenter, opacity
    } = this.props;
    if (!google) {
      return null
    }
    if (!(path instanceof Array)) {
      path = [];
    }

    const pref = {
      map: map,
      path: path,
      opacity: opacity
    };
    this.polyline = new google.maps.Polyline(pref);

    evtNames.forEach(e => {
      this.polyline.addListener(e, this.handleEvent(e));
    });

    this.polylinePromise.resolve(this.polyline);
  }

  getPolyline() {
    return this.polylinePromise;
  }

  handleEvent(evt) {
    return (e) => {
      const evtName = `on${camelize(evt)}`
      if (this.props[evtName]) {
        this.props[evtName](this.props, this.polyline, e);
      }
    }
  }

  render() {
    return null;
  }
}

Polyline.propTypes = {
  path: T.object,
  map: T.object,
  opacity: T.string
}

evtNames.forEach(e => Polyline.propTypes[e] = T.func)

Polyline.defaultProps = {
  name: 'Polyline'
}

export default Polyline
