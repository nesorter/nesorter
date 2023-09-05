import express from 'express';
import { Streamer } from './lib/Streamer.js';
import { FileSystemScanner } from './lib/FileSystemScanner.js';
import { Queue } from './lib/Queue.js';
import { shuffle } from './utils.js';
import { ConsoleManager, PageBuilder } from 'console-gui-tools';
import { config } from 'dotenv';

config();

const streamer = new Streamer(express(), Number(process.env.LISTEN_PORT));
const scanner = new FileSystemScanner(process.env.LIBRARY_DIR);
const queue = new Queue(streamer);

scanner.scan()
  .then((items) => shuffle(items))
  .then((items) => items.map((item) => queue.add(item.fullPath)))
  .then(() => queue.startQueue());

let page = 'main';
let setPage = (nextpage: string) => {
  page = nextpage;
}

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
  const mainPage = new PageBuilder();

  mainPage.addRow({
    text: `port = ${process.env.LISTEN_PORT}; mountpoint = ${process.env.MOUNTPOINT_PATH}`,
    color: 'white'
  });

  mainPage.addSpacer();
  mainPage.addSpacer();

  mainPage.addRow({
    text: `Queue, current index: ${queue.currentFile} of ${queue.files.length}`,
    color: 'white'
  });
  mainPage.addRow({
    text: `Queue, current song: ${queue.files[queue.currentFile]}`,
    color: 'white'
  });

  mainPage.addSpacer();
  mainPage.addSpacer();

  mainPage.addRow({
    text: `Clients count: ${streamer.broadcast.sinks.length - 1}`,
    color: 'white'
  });
  mainPage.addRow({
    text: `Sended: ${streamer.sended / 1000}kb`,
    color: 'white'
  });

  mainPage.addSpacer();
  mainPage.addSpacer();

  mainPage.addRow({
    text: `Use h for help`,
    color: 'red'
  });

  const helpPage = new PageBuilder();
  helpPage.addRow({
    text: `Navigation:`,
    color: 'red'
  });
  helpPage.addRow({
    text: `  - key '1': main page`,
    color: 'white'
  });
  helpPage.addRow({
    text: `  - key 'h': help page`,
    color: 'white'
  });

  if (page === 'main') {
    GUI.setPage(mainPage, 0, 'main');
  }

  if (page === 'help') {
    GUI.setPage(helpPage, 0, 'help');
  }
}

GUI.on('keypressed', (key) => {
  switch (key.name) {
    case '1':
      setPage('main');
      break;

    case 'h':
      setPage('help');
      break;

    default:
      break;
  }
});

setInterval(() => updateConsole(), 500);
