import type { Nullable } from "./nullable";

export type NonNullable<T> = Exclude<T, Nullable>;