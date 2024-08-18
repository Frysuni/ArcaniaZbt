import { DynamicModule, Logger, Module } from '@nestjs/common';
import { config } from 'dotenv';
import { existsSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { ConfigService } from './config.service';
import { ALL_CONFIGS } from './constants/all-configs.constant';
import { CONFIG_WATERMARK } from './constants/config-watermark.constant';
import { INTERNAL_STORAGE } from './constants/internal-storage.constant';
import { ConfigType } from './interfaces/config-type.interface';
import { InternalStorage } from './types/internal-storage.type';
import { LoadEnvOptions } from './types/load-env-options.type';

@Module({})
export class ConfigModule {
  private static readonly logger = new Logger(ConfigModule.name);
  private static readonly internalStorage: Promise<InternalStorage> = new Promise(resolve => ConfigModule.loadedEnv = resolve);
  private static loadedEnv: (internalStorage: InternalStorage) => void;

  static forRoot(options?: {
    isGlobal?: boolean,
    loadEnvOptions: LoadEnvOptions,
  }): DynamicModule {

    this.loadedEnv(this.loadEnv(options?.loadEnvOptions));

    return {
      module: ConfigModule,
      global: options?.isGlobal,
    };
  }

  static forFeature(configs: ConfigType[]): DynamicModule {
    configs.forEach((config) => {
      this.checkConfigMetadata(config);
    });

    return {
      module: ConfigModule,
      providers: [
        ...configs,
        ConfigService,
        {
          provide: ALL_CONFIGS,
          useValue: configs,
        },
        {
          provide: INTERNAL_STORAGE,
          useFactory: async () => await this.internalStorage,
        },
      ],
      exports: [...configs, ConfigService],
    };
  }

  static getConfig<T extends ConfigType>(config: T, loadEnvOptions?: LoadEnvOptions): InstanceType<T> {
    const localStorage = this.loadEnv(loadEnvOptions);

    const configService = new ConfigService(config, [config], localStorage);

    return new config(configService);
  }

  private static loadEnv(loadEnvOptions?: LoadEnvOptions): InternalStorage {
    if (loadEnvOptions?.skipLoadingEnv) return {};

    const path = loadEnvOptions?.envFilePath ?? '.env';
    const envFilePath = isAbsolute(path) ? path : resolve(process.cwd(), path);

    let ignoreEnvFile = loadEnvOptions?.ignoreEnvFile ?? false;

    if (!ignoreEnvFile) {
      if (!existsSync(envFilePath)) {
        this.logger.warn(`Env file is not found in "${envFilePath}"`);
        ignoreEnvFile = true;
      } else
      if (!statSync(envFilePath).isFile()) {
        this.logger.error(`.env must be a file`);
        process.exit(1);
      }
    }


    let localStorage: InternalStorage = {};

    if (!loadEnvOptions?.ignoreUserEnv) localStorage = process.env;

    if (ignoreEnvFile) return localStorage;

    const configOutput = config({
      path: envFilePath,
      override: loadEnvOptions?.overrideUserEnv,
    });

    if (configOutput.error) {
      this.logger.error(`Error while parsing DOTENV:\n${configOutput.error}`);
      process.exit(0);
    }

    if (loadEnvOptions?.overrideUserEnv) {
      localStorage = {
        ...localStorage,
        ...configOutput.parsed,
      };
    };

    if (!loadEnvOptions?.overrideUserEnv) {
      localStorage = {
        ...configOutput.parsed,
        ...localStorage,
      };
    };

    return localStorage;
  }

  private static checkConfigMetadata(config: ConfigType): void {
    const hasConfigWatermarkMetadata = Reflect.hasMetadata(CONFIG_WATERMARK, config);

    if (hasConfigWatermarkMetadata) return;

    this.logger.error(`Class ${config.name} does not have a @Config() decorator.`);
    process.exit(1);
  }
}
