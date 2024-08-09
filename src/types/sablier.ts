export type StreamRelativeSchedule = { years: number; days: number; hours: number };
export type StreamAbsoluteSchedule = { startDate: number; endDate: number };
export type StreamSchedule = StreamRelativeSchedule | StreamAbsoluteSchedule;
