

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;
const SESSION_KEY = 'agn_guest_session';

export interface AnalyticsEventDto {
  eventId: string;
  eventType: string;
  occurredAt: number;
  articleId?: string;
  storyId?: string;
  sourceId?: string;
  category?: string;
  language?: string;
  searchMode?: string;
  position?: number;
}

export interface AnalyticsBatchRequest {
  routeType?: string;
  sessionId: string;
  events: AnalyticsEventDto[];
}

let eventQueue: AnalyticsEventDto[] = [];
let flushTimeout: NodeJS.Timeout | null = null;
let currentRoute: string = 'HOME';

export const analyticsClient = {
  getGuestSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  },

  getConsent(): boolean {
    if (typeof window === 'undefined') return false;
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
    // Check localStorage preference if available (implemented in UI)
    const stored = localStorage.getItem('analytics_enabled');
    if (stored === 'false') return false;

    // Check Do Not Track (DNT)
    if (navigator.doNotTrack === '1' || (window as unknown as { doNotTrack: string }).doNotTrack === '1') {
      return false;
    }
    
    // Check Global Privacy Control (GPC)
    // Some browsers expose this property directly
    if ((navigator as unknown as { globalPrivacyControl: boolean }).globalPrivacyControl) {
      return false;
    }

    return true; // default true unless explicitly opted out
  },

  setRoute(routeType: string) {
    currentRoute = routeType;
  },

  track(eventType: string, data: Partial<AnalyticsEventDto> = {}) {
    if (!this.getConsent()) return;

    const event: AnalyticsEventDto = {
      eventId: crypto.randomUUID(),
      eventType,
      occurredAt: Date.now(),
      ...data,
    };

    eventQueue.push(event);

    if (eventQueue.length >= BATCH_SIZE) {
      this.flush();
    } else if (!flushTimeout) {
      flushTimeout = setTimeout(() => this.flush(), FLUSH_INTERVAL_MS);
    }
  },

  async flush() {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    if (eventQueue.length === 0 || !this.getConsent()) {
      eventQueue = [];
      return;
    }

    const batch: AnalyticsBatchRequest = {
      routeType: currentRoute,
      sessionId: this.getGuestSessionId(),
      events: [...eventQueue],
    };

    eventQueue = [];

    try {
      const payload = JSON.stringify(batch);
      const url = (typeof window !== 'undefined' && window.location) ? '/api/analytics' : 'http://localhost:3000/api/analytics';
      
      let sent = false;
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
         // sendBeacon sends text/plain unless we use Blob, but we can send a Blob to keep application/json
         const blob = new Blob([payload], { type: 'application/json' });
         sent = navigator.sendBeacon(url, blob);
      }
      
      if (!sent) {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: payload,
          keepalive: true
        });
      }
    } catch (e) {
      console.warn('Analytics batch failed to send', e);
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    analyticsClient.flush();
  });
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      analyticsClient.flush();
    }
  });
}
