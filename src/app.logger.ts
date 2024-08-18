import { ConsoleLogger, Injectable, LogLevel } from "@nestjs/common";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

@Injectable()
export class AppLogger extends ConsoleLogger {
  private readonly logsPath: string[] = [process.cwd(), 'logs'];

  constructor() {
    super();

    const logsPath = resolve(...this.logsPath);
    if (!existsSync(logsPath)) mkdirSync(logsPath);
  }

  protected override printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType: 'stdout' | 'stderr' = 'stdout',
  ) {
    super.printMessages(messages, context, logLevel, writeStreamType);
    messages.forEach(message => {
      const logTimestamp = this.getLogTimestamp();

      const messageString = this.stringifyMessage(message, logLevel) as string;

      const data = this.removeAsciiColors(`${logTimestamp} - ${logLevel.toUpperCase()} [${context}] ${messageString}`);

      this.writeDataToFile(data);
    });
  }

  private writeDataToFile(data: string) {
    const logFilePath = this.getLogFilePath();
    if (!existsSync(logFilePath)) writeFileSync(logFilePath, '');

    appendFileSync(logFilePath, data + '\n');
  }

  private getLogFilePath() {
    const dateString = new Date()
      .toLocaleDateString(
        'en-US',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        },
      )
      .replace(',', '')
      .replace(/ /g, '-');

    const [month, day, year] = dateString.split('-');

    const logFilePath = resolve(...this.logsPath, `${day}-${month}-${year}.log`);

    return logFilePath;
  }

  private getLogTimestamp() {
    return new Date()
      .toLocaleDateString(
        'en-US',
        {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        },
      )
      .split(', ')[1]
      .replace(/\//g, ':')
      + '.'
      + Date.now()
        .toString()
        .slice(-3);
  }

  private removeAsciiColors(str: string) {
    const asciiColorRegex = /\x1b\[[0-9;]*m/g;
    return str.replace(asciiColorRegex, '');
  }
}