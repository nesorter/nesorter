import { spawn } from 'child_process';

export function asyncSpawn(cmd: string, args: string[]): Promise<void> {
  return new Promise((res) => {
    spawn(cmd, args, { shell: true }).on('exit', res);
  });
}
