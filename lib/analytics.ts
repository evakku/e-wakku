import fs from "fs";
import path from "path";

export interface IssueAnalytics {
  views: number;
  readers: number;
  downloads: number;
  lastViewedAt?: string;
  lastDownloadedAt?: string;
}

export interface AnalyticsData {
  totalReaders: number;
  activeReaders: number;
  totalViews: number;
  totalDownloads: number;
  perIssue: Record<string, IssueAnalytics>;
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");

// Default initial state
const DEFAULT_ANALYTICS: AnalyticsData = {
  totalReaders: 0,
  activeReaders: 0,
  totalViews: 0,
  totalDownloads: 0,
  perIssue: {},
  lastUpdated: "",
};

function readAnalyticsFromFile(): AnalyticsData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ANALYTICS_FILE)) {
      fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(DEFAULT_ANALYTICS, null, 2), "utf-8");
      return DEFAULT_ANALYTICS;
    }
    const raw = fs.readFileSync(ANALYTICS_FILE, "utf-8");
    return JSON.parse(raw) as AnalyticsData;
  } catch (err) {
    console.error("Failed to read analytics file:", err);
    return DEFAULT_ANALYTICS;
  }
}

function writeAnalyticsToFile(data: AnalyticsData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write analytics file:", err);
  }
}

/**
 * Retrieves the current analytics summary including total readers, downloads, and per-issue stats.
 */
export function getAnalyticsSummary(): AnalyticsData {
  return readAnalyticsFromFile();
}

/**
 * Tracks an analytics event (view / download) for a given issue.
 */
export function trackAnalyticsEvent(
  type: "view" | "download",
  issueId?: string
): AnalyticsData {
  const data = readAnalyticsFromFile();
  const now = new Date().toISOString();

  if (type === "view") {
    data.totalViews += 1;
    data.totalReaders += 1;
    data.activeReaders = Math.min(data.totalReaders, Math.max(1, Math.round(data.totalReaders * 0.28)));
  } else if (type === "download") {
    data.totalDownloads += 1;
  }

  if (issueId) {
    if (!data.perIssue[issueId]) {
      data.perIssue[issueId] = {
        views: 0,
        readers: 0,
        downloads: 0,
      };
    }

    if (type === "view") {
      data.perIssue[issueId].views += 1;
      data.perIssue[issueId].readers += 1;
      data.perIssue[issueId].lastViewedAt = now;
    } else if (type === "download") {
      data.perIssue[issueId].downloads += 1;
      data.perIssue[issueId].lastDownloadedAt = now;
    }
  }

  data.lastUpdated = now;
  writeAnalyticsToFile(data);
  return data;
}

/**
 * Removes a single issue's entry from perIssue when it is deleted.
 * Global totals (totalViews, totalDownloads, totalReaders, activeReaders)
 * are intentionally left unchanged.
 */
export function removeIssueAnalytics(issueId: string): void {
  const data = readAnalyticsFromFile();
  if (data.perIssue[issueId]) {
    delete data.perIssue[issueId];
    data.lastUpdated = new Date().toISOString();
    writeAnalyticsToFile(data);
  }
}
