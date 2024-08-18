import { GLOBAL_MODULE_METADATA, INJECTABLE_WATERMARK, SCOPE_OPTIONS_METADATA } from "@nestjs/common/constants";
import { ScopeOptions } from "@nestjs/common";
import { CONFIG_WATERMARK } from "../constants/config-watermark.constant";
import { CONFIG_PREFIX } from "../constants/config-prefix.constant";

export function Config(prefix: Uppercase<string>, options?: {
  scopeOptions?: ScopeOptions,
  isGlobal?: boolean
}): ClassDecorator {
  return function(target) {
    Reflect.defineMetadata(CONFIG_WATERMARK, true, target);
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(CONFIG_PREFIX, prefix, target);
    if (options?.scopeOptions) Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options.scopeOptions, target);
    if (options?.isGlobal) Reflect.defineMetadata(GLOBAL_MODULE_METADATA, true, target);
  };
}
