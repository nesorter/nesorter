import express from 'express';
import { Streamer } from './lib/Streamer.js';
import { FileSystemScanner } from './lib/FileSystemScanner.js';
import { Queue } from './lib/Queue.js';
import { shuffle } from './utils.js';
import { ConsoleManager, PageBuilder } from 'console-gui-tools';
import { config } from 'dotenv';

config();

const streamer = new Streamer(express());
const scanner = new FileSystemScanner(process.env.LIBRARY_DIR);
const queue = new Queue(streamer);

scanner.scan()
  .then((items) => shuffle(items))
  .then((items) => items.map((item) => queue.add(item.fullPath)))
  .then(() => queue.startQueue());

const GUI = new ConsoleManager({
  title: 'nesorter',
  logPageSize: 8,
  layoutOptions: {
    type: 'double',
    changeFocusKey: 'm',
    boxed: true,
    boxStyle: 'bold',
    boxColor: 'cyan',
    showTitle: true,
  }
});

GUI.on("exit", () => {
  process.exit();
});

const updateConsole = async () => {
  const pb = new PageBuilder();

  pb.addSpacer();
  pb.addSpacer();

  pb.addRow({
    text: `Server listens port ${process.env.LISTEN_PORT}`,
    color: 'white'
  });
  pb.addRow({
    text: `Mountpoint: ${process.env.MOUNTPOINT_PATH}`,
    color: 'white'
  });

  pb.addSpacer();
  pb.addSpacer();

  pb.addRow({
    text: `Queue, current index: ${queue.currentFile} of ${queue.files.length}`,
    color: 'white'
  });
  pb.addRow({
    text: `Queue, current song: ${queue.files[queue.currentFile]}`,
    color: 'white'
  });

  pb.addSpacer();
  pb.addSpacer();

  pb.addRow({
    text: `Clients count: ${streamer.broadcast.sinks.length - 1}`,
    color: 'white'
  });
  pb.addRow({
    text: `Sended: ${streamer.sended / 1000}kb`,
    color: 'white'
  });

  pb.addSpacer();
  pb.addSpacer();

  GUI.setPage(pb);
}

setInterval(() => updateConsole(), 500);
