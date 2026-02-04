import { Session, SerializedSession } from '../models/session.model';

export class SessionUtils {
  static serializeSession(session: Session): SerializedSession {
    return {
      ...session,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      pauseStartTime: session.pauseStartTime?.toISOString(),
      createdAt: session.createdAt.toISOString(),
      orders: session.orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
      })),
    };
  }

  static deserializeSession(serialized: SerializedSession): Session {
    return {
      ...serialized,
      startTime: new Date(serialized.startTime),
      endTime: serialized.endTime ? new Date(serialized.endTime) : undefined,
      pauseStartTime: serialized.pauseStartTime ? new Date(serialized.pauseStartTime) : undefined,
      createdAt: new Date(serialized.createdAt),
      orders: serialized.orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
      })),
    };
  }

  static ensureDate(date: Date | string): Date {
    return date instanceof Date ? date : new Date(date);
  }
}
