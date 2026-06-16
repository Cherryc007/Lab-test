export interface KpiMetrics {
  shiftFillRate: number;
  onTimeClockInRate: number;
  activeLoneWorkerAlertsCount: number;
  openShiftsCount: number;
  pendingActivityLogsCount: number;
}

export interface ClientCoverageSummary {
  siteId: string;
  siteName: string;
  scheduledHours: number;
  actualHours: number;
  coveragePercentage: number;
}
