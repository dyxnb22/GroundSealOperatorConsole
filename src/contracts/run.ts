import { z } from "zod";
import { GsocError } from "./errors.js";

export const TraceEventSchema = z.object({
  eventId: z.string().min(1),
  timestamp: z.string().datetime(),
  kind: z.string().min(1),
  summary: z.string(),
  payloadRef: z.string().nullable().optional(),
});

export type TraceEvent = z.infer<typeof TraceEventSchema>;

export const RunTimelineSchema = z.object({
  runId: z.string().min(1),
  tenantId: z.string().min(1),
  events: z.array(TraceEventSchema),
});

export type RunTimeline = z.infer<typeof RunTimelineSchema>;

export function assertTimelineOrdered(events: TraceEvent[]): void {
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1]!;
    const curr = events[i]!;
    if (curr.timestamp < prev.timestamp) {
      throw new GsocError(
        "MALFORMED_TIMELINE",
        `Event ${curr.eventId} timestamp precedes ${prev.eventId}`,
      );
    }
  }
}
