import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { inspect } from "node:util";

@Injectable()
export class AppErrorHandler implements OnApplicationBootstrap {
  private readonly logger = new Logger(AppErrorHandler.name);

  constructor() {}

  public onApplicationBootstrap() {
    process.on('unhandledRejection', (reason, promise) => this.handleError('unhandledRejection', reason, promise));
    process.on('uncaughtExceptionMonitor', this.handleError.bind(this, 'uncaughtExceptionMonitor'));
  }

  private handleError(type: 'unhandledRejection', reason: unknown, promise: Promise<unknown>): any
  private handleError(type: 'uncaughtExceptionMonitor', error: Error, origin: NodeJS.UncaughtExceptionOrigin): any
  private handleError(
    type: 'unhandledRejection' | 'uncaughtExceptionMonitor',
    reasonOrError: unknown | Error,
    promiseOrOrigin: Promise<unknown> | NodeJS.UncaughtExceptionOrigin,
  ): any {
    const stringifyUnknown = (unknown: any): string => {
      let str = inspect(unknown, { depth: null });
      if (str.length > 1800) str = str.slice(0, 1800 - 3) + '...';
      return str;
    };

    if (type == 'uncaughtExceptionMonitor') {
      const reason = stringifyUnknown(reasonOrError);
      this.logError(type, reason);
    } else {
      const error = reasonOrError as Error;
      const origin = promiseOrOrigin as NodeJS.UncaughtExceptionOrigin;
      this.logError(type, `${error.name}: ${error.message}`, origin);
    }
  }

  private logError(type: 'unhandledRejection' | 'uncaughtExceptionMonitor', errorMessage: string, stack?: string) {
    const consoleMessage = `${type.toUpperCase()}\n${errorMessage}${stack ? `at\n${stack}` : ''}`;
    this.logger.error(consoleMessage);
  }
}