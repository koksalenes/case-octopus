import { isDevelopment, LOG_LEVEL_ORDER, LOG_LEVELS } from '@/constants';
import type { LogLevel } from '@/types/app.types';

const minLevel: LogLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

function isEnabled(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[minLevel];
}

const consoleMethods: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

function log(level: LogLevel, ...args: unknown[]): void {
  if (isEnabled(level)) {
    consoleMethods[level](...args);
  }
}

interface GroupOptions {
  collapsed?: boolean;
}

function group(
  label: string,
  level: LogLevel,
  fn: () => void,
  options: GroupOptions = {},
): void {
  if (!isEnabled(level)) return;

  if (options.collapsed) {
    console.groupCollapsed(label);
  } else {
    console.group(label);
  }

  fn();
  console.groupEnd();
}

const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
  group,
};

export default logger;
