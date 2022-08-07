// @ts-ignore
import process from 'process';

// @ts-ignore
const isbin = require('isbin');
let code = 0;

if (!isbin('mpv')) {
  console.log('System-wide deps check failed: mpv is not installed! Installation process will be aborted');
  code = 1;
}

if (!isbin('ffmpeg')) {
  console.log('System-wide deps check failed: ffmpeg is not installed! Installation process will be aborted');
  code = 1;
}

if (!isbin('mkfifo')) {
  console.log('System-wide deps check failed: mkfifo is not installed! Are you dumd asshole??? Installation process will be aborted');
  code = 1;
}

process.exitCode = code;
