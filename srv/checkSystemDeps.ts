import process from 'process';

const isbin = require('isbin');
let code = 0;

if (!isbin('mpv')) {
  console.log('!!! mpv is not installed! Installation process will be aborted');
  code = 1;
}

if (!isbin('ffmpeg')) {
  console.log('!!! ffmpeg is not installed! Installation process will be aborted');
  code = 1;
}

if (!isbin('mkfifo')) {
  console.log('!!! mkfifo is not installed! You dumd asshole??? Installation process will be aborted');
  code = 1;
}

process.exitCode = code;
