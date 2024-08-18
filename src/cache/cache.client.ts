import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";
import { CacheConfig } from "./cache.config";

@Injectable()
export class CacheClient extends Redis {
  private readonly logger = new Logger();

  constructor(
    readonly cacheConfig: CacheConfig,
  ) {
    super(cacheConfig);
    this.on('error', e => this.logger.error(e));
  }
}
