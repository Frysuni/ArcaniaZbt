import { Inject, Injectable, Scope, Type } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { CacheClient } from './cache.client';
import { CacheConfig } from './cache.config';
import { StringifiedTime, TimeUnit } from './types/stringified-time.type';

@Injectable({
  scope: Scope.TRANSIENT,
})
export class CacheService {
  constructor(
    private readonly cacheClient: CacheClient,
    private readonly cacheConfig: CacheConfig,
    @Inject(INQUIRER) private readonly parentClass: Type,
  ) { }

  public set(key: string, value: string | object, ttl: StringifiedTime, withoutKeyPrefix = false) {
    if (!withoutKeyPrefix) key = `${this.parentClass.constructor.name}_${key}` as Uppercase<string>;
    if (typeof value === 'object') value = 'JSON_' + JSON.stringify(value);
    const time = this.parseTimeToMS(ttl);
    if (isFinite(time)) return this.cacheClient.set(key.toUpperCase(), value, 'PX', time);
    return this.cacheClient.set(key.toUpperCase(), value);
  }

  public async get<ReturnType extends string | object>(key: string, options?: { withoutKeyPrefix?: boolean, delete?: boolean }): Promise<ReturnType | undefined> {
    if (!options?.withoutKeyPrefix) key = `${this.parentClass.constructor.name}_${key}` as Uppercase<string>;
    key = key.toUpperCase();

    const returnData = await this.cacheClient.get(key);
    if (options?.delete) await this.cacheClient.del(key);
    if (!returnData) return;

    if (returnData.startsWith('JSON_')) return JSON.parse(returnData.slice(5));
    return returnData as ReturnType;
  }

  public async reset() {
    const globalPrefix = this.cacheConfig.keyPrefix ?? '';
    const keyPattern = `${globalPrefix}${this.parentClass.constructor.name.toUpperCase()}*`;
    const keys = await this.cacheClient.keys(keyPattern);
    await this.cacheClient.del(keys);
    return keys;
  }

  private parseTimeToMS(stringifiedTime: StringifiedTime): number {
    if (stringifiedTime.toLowerCase() == 'infinity') return Infinity;

    const num = parseInt(stringifiedTime);
    const unit = stringifiedTime.slice(num.toString().length).toLowerCase() as TimeUnit;

    const ms = 1;
    const second = ms * 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 31;
    const year = month * 12;

    switch (unit) {
      case 'ms':
      case 'millis':
      case 'millisecond':
      case 'milliseconds':
        return num * ms;
      case 's':
      case 'second':
      case 'seconds':
        return num * second;
      case 'min':
      case 'minute':
      case 'minutes':
        return num * minute;
      case 'h':
      case 'hour':
      case 'hours':
        return num * hour;
      case 'd':
      case 'day':
      case 'days':
        return num * day;
      case 'w':
      case 'week':
      case 'weeks':
        return num * week;
      case 'mon':
      case 'month':
      case 'months':
        return num * month;
      case 'y':
      case 'year':
      case 'years':
        return num * year;
    }
  }
}
