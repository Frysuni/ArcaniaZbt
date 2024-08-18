import { Inject, Injectable, Scope } from '@nestjs/common';
import { from } from 'env-var';
import { INQUIRER } from '@nestjs/core';
import { INTERNAL_STORAGE } from './constants/internal-storage.constant';
import { InternalStorage } from './types/internal-storage.type';
import { CONFIG_PREFIX } from './constants/config-prefix.constant';
import { ConfigType } from './interfaces/config-type.interface';
import { ALL_CONFIGS } from './constants/all-configs.constant';

@Injectable({ scope: Scope.TRANSIENT })
export class ConfigService {
  private readonly env: ReturnType<typeof from<InternalStorage, any>>;
  private readonly prefix: string = Reflect.getMetadata(CONFIG_PREFIX, this.allConfigs.find(config => this.configClass instanceof config) ?? this.configClass);

  constructor(
    @Inject(INQUIRER) private readonly configClass: ConfigType<any>,
    @Inject(ALL_CONFIGS) private readonly allConfigs: ConfigType<any>[],
    @Inject(INTERNAL_STORAGE) internalStorage: InternalStorage,
  ) {
    if (!this.prefix && this.prefix !== '') throw new Error(`No config prefix found in ${this.configClass.name ?? '{NO_NAME}'}`);
    this.env = from(internalStorage);
  }

  public get(varName: Uppercase<string>, noPrefix?: boolean) {
    const searchString = noPrefix ? varName : `${this.prefix}_${varName}`;
    return this.env.get(searchString);
  }
}
