export function abort(message: string): never & never {
  process.stderr.write(`[ABORT]: ${message}\n`);

  process.exit(1) as any;

  process.removeAllListeners();
  process.exit(1) as any;
  process.kill(process.pid);
  process.abort();
}
