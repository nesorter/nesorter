// @ts-nocheck

import libshout from './libshout';
import shoutT from './shoutT';
import metadataT from './metadataT';

export default {
  libshout_: libshout,
  ErrorTypes: {
    SUCCESS: 0,
    INSANE: -1,
    NOCONNECT: -2,
    NOLOGIN: -3,
    SOCKET: -4,
    MALLOC: -5,
    METADATA: -6,
    CONNECTED: -7,
    UNCONNECTED: -8,
    UNSUPPORTED: -9,
    BUSY: -10
  },
  /**
   * Initializes the shout library. This function must always be called before
   * any other libshout function.
   */
  init: function() {
    libshout.shout_init();
  },
  /**
   * Releases any resources which may have been allocated by a call to shout_init.
   * An application should call this function after it has finished using libshout.
   */
  shutdown: function() {
    libshout.shout_shutdown();
  },
  getVersion: function() {
    const b1 = new Buffer('');
    const b2 = new Buffer('');
    const b3 = new Buffer('');

    return libshout.shout_version(b1, b2, b3);
  },
  create: function() {
    return new shoutT();
  },
  createMetadata: function() {
    return new metadataT();
  },
  FileReadStream: require('./helper-streams/FileReadStream'),
  ShoutStream: require('./helper-streams/ShoutStream')
};
