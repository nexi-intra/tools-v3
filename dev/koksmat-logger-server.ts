"use server";

import { getKoksmat } from "./koksmat"; // Adjust the path as necessary

// Koksmat logger levels
type LogLevel = "verbose" | "info" | "warning" | "error" | "fatal";

function logLeveltoNumber(level: LogLevel): number {
  switch (level) {
    case "verbose":
      return 0;
    case "info":
      return 1;
    case "warning":
      return 2;
    case "error":
      return 3;
    case "fatal":
      return 4;
    default:
      return 1;
  }
}

interface LogInput {
  level: LogLevel;
  moduleType: string;
  args: string[];
  correlationId?: string;
}

export async function koksmatLogServer(input: LogInput): Promise<void> {
  const {
    level,
    args,
    moduleType,
    correlationId = `koksmat-log-${Date.now()}`,
  } = input;

  const loglevel = (process.env.KOKSMAT_LOG_LEVEL as LogLevel) || "info";

  if (logLeveltoNumber(level) < logLeveltoNumber(loglevel)) {
    return;
  }

  try {
    switch (level) {
      case "verbose":
        await getKoksmat().verbose(correlationId, moduleType, args.join(" "));
        break;
      case "info":
        await getKoksmat().info(correlationId, moduleType, args.join(" "));
        break;
      case "warning":
        await getKoksmat().warning(correlationId, moduleType, args.join(" "));
        break;
      case "error":
        await getKoksmat().error(correlationId, moduleType, args.join(" "), "");
        break;
      // case "fatal":
      //   await getKoksmat().fatal(correlationId, ...args);
      //   break;
      default:
        await getKoksmat().info(correlationId, moduleType, args.join(" "));
    }
  } catch (error) {
    console.error(`[ERROR] ${correlationId}: Failed to log message:`, error);
    throw new Error("Failed to log message");
  }
}
