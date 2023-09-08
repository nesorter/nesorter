import { rm, readFile } from 'fs/promises';
import { exec, spawn } from 'child_process';
import { Lame } from 'node-lame';

export type FFProbeFrame = {
  media_type?: 'video' | 'audio';
  stream_index?: number;
  key_frame?: number;
  pts?: number | string;
  pts_time?: number | string;
  pkt_dts?: number | string;
  pkt_dts_time?: number | string;
  best_effort_timestamp?: number | string;
  best_effort_timestamp_time?: number | string;
  pkt_duration?: number | string;
  pkt_duration_time?: number | string;
  duration?: number | string;
  duration_time?: number | string;
  pkt_pos?: number | string;
  pkt_size?: number;
  width?: number;
  height?: number;
  pix_fmt?: string;
  sample_aspect_ratio?: string;
  pict_type?: string;
  coded_picture_number?: number;
  display_picture_number?: number;
  interlaced_frame?: number;
  top_field_first?: number;
  repeat_pict?: number;
  color_range?: string;
  color_space?: string;
  color_primaries?: string;
  color_transfer?: string;
  chroma_location?: string;
  sample_fmt?: string;
  nb_samples?: number;
  channels?: number;
  channel_layout?: string;
};

export type InFilePosition = {
  second: number;
  startByte: number;
  endByte: number;
}

export const sanitizeFsPath = (path: string) => {
  const escapeTargets = [
    ` `, `'`, `>`, `<`, `"`
  ]

  return escapeTargets.reduce((acc, cur) => acc.replaceAll(cur, `\\${cur}`), path);
}

export const shuffle = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const execAsync = (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) reject(err);
      resolve(stdout);
    });
  });
};

export const spawnAsync = (command: string): Promise<string> => {
  return new Promise((res, req) => {
    let result = '';
    let child = spawn(command, { shell: true });
    child.stdout.on('data', (data) => {
      result += data;
    });
    child.stdout.on('close', () => res(result));
    child.on('error', req);
  });
};

export const getFramesPositions = async (filePath: string) => {
  const rawFrames = await spawnAsync(`ffprobe ${sanitizeFsPath(filePath)} -show_frames`);
  const chunks = rawFrames
    .replaceAll('\n', ' _ ')
    .replaceAll('[/FRAME]', '')
    .split('[FRAME]')
    .filter(_ => _.length)
    .map(_ => Object.fromEntries(_.split(' _ ')
      .filter(_ => _.length)
      .map(_ => {
        // @ts-ignore
        const [_origin, key, value] = /(.*)=(.*)/.exec(_);
        const valueIsNumber = !Number.isNaN(Number(value));
        return [key, valueIsNumber ? Number(value) : value];
      })) as FFProbeFrame
    )
    .filter(_ => _.media_type === 'audio');

  const positions: InFilePosition[] = [];

  let second = 0;
  let timeAccumulator = 0;
  let startByte = 0;
  for (let frame of chunks) {
    if (timeAccumulator === 0) {
      startByte = Number(frame.pkt_pos);
    }

    timeAccumulator += Number(frame.pkt_duration_time);

    if (timeAccumulator > 1) {
      positions.push({ second, startByte, endByte: Number(frame.pkt_pos) + Number(frame.pkt_size) });
      second += 1;
      timeAccumulator = 0;
    }
  }

  return positions;
};

export const convertToPCM = async (inputFile: string) => {
  try {
    await rm(`/tmp/nesorter_output.pcm`);
  } catch { }
  await execAsync(`ffmpeg -i ${inputFile} -f s16le -acodec pcm_s16le /tmp/nesorter_output.pcm`);
  const pcm = await readFile(`/tmp/nesorter_output.pcm`);
  try {
    await rm(`/tmp/nesorter_output.pcm`);
  } catch { }
  return pcm;
}

export async function splitMp3File(inputFile: string, duration: number) {
  const pcmData = await convertToPCM(inputFile);
  const pcmSamples = pcmData.length / 2;
  const sampleRate = 44100;
  const samplesPerDuration = (duration * 2) * sampleRate;
  const totalDurations = Math.ceil(pcmSamples / samplesPerDuration);
  const buffers: Buffer[] = [];

  for (let i = 0; i < totalDurations; i++) {
    const startSample = i * samplesPerDuration;
    const endSample = Math.min((i + 1) * samplesPerDuration, pcmSamples);
    const durationData = pcmData.subarray(startSample * 2, endSample * 2);

    const encoder = new Lame({
      output: "buffer",
      bitrate: 32,
      raw: true,
      cbr: true,
      bitwidth: 16,
      scale: 1,
      emp: 5,
      nores: true
    });

    encoder.setBuffer(durationData);
    await encoder.encode();
    const buffer = encoder.getBuffer();
    buffers.push(buffer);
  }

  return buffers;
};
