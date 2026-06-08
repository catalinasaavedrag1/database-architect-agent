type LogPayload = unknown[];

function write(level: 'info' | 'warn' | 'error', args: LogPayload) {
  const prefix = `[database-architect-agent] ${level.toUpperCase()}`;
  console[level](prefix, ...args);
}

export const logger = {
  info: (...args: LogPayload) => write('info', args),
  warn: (...args: LogPayload) => write('warn', args),
  error: (...args: LogPayload) => write('error', args),
};

