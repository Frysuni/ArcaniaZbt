import { AppConfig } from '@app/app.config';
import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { CacheClient } from './cache.client';
import { CacheConfig } from './cache.config';
import { CacheService } from './cache.service';

@Module({
  imports: [
    ConfigModule.forFeature([CacheConfig, AppConfig]),
  ],
  providers: [
    CacheService,
    CacheClient,
  ],
  exports: [
    CacheService,
  ],
})
export class CacheModule {}
