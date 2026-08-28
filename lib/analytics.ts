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
  totalReaders: 1420,
  activeReaders: 384,
  totalViews: 4890,
  totalDownloads: 1245,
  perIssue: {
    "ac9eba56-8f9a-4af3-a659-91016f78c6f5": {
      views: 1250,
      readers: 410,
      downloads: 380,
      lastViewedAt: "2026-08-25T08:30:00Z",
      lastDownloadedAt: "2026-08-25T07:15:00Z",
    },
    "c6b21c7d-1974-4952-bfda-a58edd0f4846": {
      views: 980,
      readers: 310,
      downloads: 245,
      lastViewedAt: "2026-08-24T18:20:00Z",
      lastDownloadedAt: "2026-08-24T15:40:00Z",
    },
    "1c75dda5-93d4-4783-a52a-92ae1b60bfe6": {
      views: 860,
      readers: 260,
      downloads: 210,
      lastViewedAt: "2026-08-24T21:10:00Z",
      lastDownloadedAt: "2026-08-23T19:05:00Z",
    },
    "67cb3136-4910-4ca6-9811-0bb031b72bad": {
      views: 1120,
      readers: 340,
      downloads: 290,
      lastViewedAt: "2026-08-25T04:50:00Z",
      lastDownloadedAt: "2026-08-24T12:30:00Z",
    },
    "1be4746a-8a78-4a60-8343-edab07b37508": {
      views: 680,
      readers: 220,
      downloads: 120,
      lastViewedAt: "2026-08-25T06:10:00Z",
      lastDownloadedAt: "2026-08-25T05:40:00Z",
    },
  },
  lastUpdated: new Date().toISOString(),
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
