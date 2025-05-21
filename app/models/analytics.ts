export interface AnalyticsData {
  events: MetricData;
  users: MetricData;
  revenue: MetricData;
  event_growth: Record<string, number>;
  user_growth: Record<string, number>;
}

export interface MetricData {
  total: number;
  percentage_change: number;
}
