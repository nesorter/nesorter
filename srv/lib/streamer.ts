import Shout from './nodeshout/src';
import CONFIG from '../config';
import { Readable, Writable } from 'stream';

export class Streamer {
  shout: ReturnType<typeof Shout.create>;

  constructor() {
    Shout.init();

    this.shout = Shout.create();

    this.shout.setHost(CONFIG.SHOUT_HOST);
    //this.shout.setProtocol(CONFIG.SHOUT_PROTOCOL);
    this.shout.setPort(CONFIG.SHOUT_PORT);
    this.shout.setPassword(CONFIG.SHOUT_PASSWORD);
    this.shout.setMount(CONFIG.SHOUT_MOUNT);
    //this.shout.setUser(CONFIG.SHOUT_USER);
    this.shout.setFormat(CONFIG.SHOUT_FORMAT);

    //this.shout.setHost('xx.xx.xxx.xx');
    //this.shout.setPort(8000);
    //this.shout.setUser('source');
    // this.shout.setPassword('hackme');
    // this.shout.setMount('mymount');
    // this.shout.setFormat(1); // 0=ogg, 1=mp3
    this.shout.setAudioInfo('bitrate', '160');
    this.shout.setAudioInfo('samplerate', '44100');
    this.shout.setAudioInfo('channels', '2');

    this.shout.open();
  }

  async testRun(path: string) {
    var metadata = Shout.createMetadata();
    metadata.add('song', 'Sublime - What I got');
    this.shout.setMetadata(metadata);

    var fileStream = new Shout.FileReadStream(path, 65536) as unknown as Readable,
      shoutStream = fileStream.pipe(new Shout.ShoutStream(this.shout) as unknown as Writable);

    fileStream.on('error', console.error);

    fileStream.on('data', function(chunk) {
      console.log('Read %d bytes of data', chunk.length);
    });

    shoutStream.on('error', console.error);

    shoutStream.on('finish', function() {
      console.log('Finished playing...');
    });
  }
}