import { NestFactory } from "@nestjs/core";
import { resolve } from "node:path";
import { AppLogger } from "./app.logger";
import { AppModule } from "./app.module";

void async function(): Promise<void> {
  if (resolve(process.cwd()) !== resolve(__dirname, '../')) return void process.stderr.write('Working directory of Node.JS process is not matches to the directory of this project');

  const app = await NestFactory.createApplicationContext(
    AppModule,
    {
      bufferLogs: false,
    },
  );

  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.flushLogs();

  app.enableShutdownHooks();
}();
