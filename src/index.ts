import express from 'express';
import { Streamer } from './lib/Streamer';
import { FileSystemScanner } from './lib/FileSystemScanner';
import { Queue } from './lib/Queue';
import { shuffle } from './utils';

require('dotenv').config();

const streamer = new Streamer(express());
const scanner = new FileSystemScanner(process.env.LIBRARY_DIR);
const queue = new Queue(streamer);

scanner.scan()
  .then((items) => shuffle(items))
  .then((items) => items.map((item) => queue.add(item.fullPath)))
  .then(() => queue.startQueue());
