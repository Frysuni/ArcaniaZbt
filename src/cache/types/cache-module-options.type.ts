import { RedisOptions } from "ioredis";

export type CacheModuleOptions =  RedisOptions & { keyPrefix?: `${Uppercase<string>}_`};
