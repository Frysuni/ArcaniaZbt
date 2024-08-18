type MS = 'ms' | 'millis' | 'milliseconds' | 'millisecond';
type Second = 's' | 'second' | 'seconds';
type Minute = 'min' | 'minute' | 'minutes';
type Hour = 'h' | 'hour' | 'hours';
type Day = 'd' | 'day' | 'days';
type Week = 'w' | 'week' | 'weeks';
type Month = 'mon' | 'month' | 'months';
type Year = 'y' | 'year' | 'years';

export type TimeUnit = MS | Second | Minute | Hour | Day | Week | Month | Year;
type Combined<T extends string> = T | Uppercase<T> | Capitalize<T>;


export type StringifiedTime = `${number}${Combined<TimeUnit>}` | Combined<'infinity'>;
