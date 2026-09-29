/**
 * Structured one-line JSON logs for operators. Callers pass only non-sensitive fields:
 * no request bodies, headers, client addresses, env values, or workspace paths.
 */
export type HostedLogger = (event: string, fields?: Readonly<Record<string, unknown>>) => void;

export function createStdoutLogger(write: (line: string) => void = (l) => process.stdout.write(l)): HostedLogger {
  return (event, fields = {}) => {
    write(`${JSON.stringify({ time: new Date().toISOString(), event, ...fields })}\n`);
  };
}

export const silentLogger: HostedLogger = () => {};

/** Error class + message only; stack traces stay out of logs shipped to shared log drains. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}
