"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsClient } from "@/lib/analytics/analytics-client";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    // Route Sanitization — raw query/search params are NEVER included in event data
    let routeType = 'HOME';
    if (pathname.startsWith('/search')) routeType = 'SEARCH';
    else if (pathname.startsWith('/story')) routeType = 'STORY_DETAIL';
    else if (pathname.startsWith('/article')) routeType = 'ARTICLE_DETAIL';
    else if (pathname.startsWith('/source')) routeType = 'SOURCE_DETAIL';
    else if (pathname.startsWith('/account/notifications')) routeType = 'NOTIFICATIONS';
    else if (pathname.startsWith('/account')) routeType = 'ACCOUNT';
    else if (pathname.startsWith('/for-you')) routeType = 'FOR_YOU';
    else if (pathname.startsWith('/trending')) routeType = 'TRENDING';
    else routeType = pathname.toUpperCase().replace(/\//g, '_') || 'HOME';

    // Map route to specific view event — never a click event from navigation alone
    let viewEvent = 'PAGE_VIEW';
    if (routeType === 'SEARCH') viewEvent = 'SEARCH_VIEW';
    else if (routeType === 'STORY_DETAIL') viewEvent = 'STORY_VIEW';
    else if (routeType === 'ARTICLE_DETAIL') viewEvent = 'ARTICLE_VIEW';
    else if (routeType === 'SOURCE_DETAIL') viewEvent = 'SOURCE_VIEW';
    else if (routeType === 'NOTIFICATIONS') viewEvent = 'NOTIFICATION_CENTER_VIEW';
    else if (routeType === 'FOR_YOU') viewEvent = 'FOR_YOU_VIEW';
    else if (routeType === 'TRENDING') viewEvent = 'TRENDING_VIEW';

    // Extract IDs from URL if present
    const parts = pathname.split('/');
    let articleId, storyId, sourceId;
    if (routeType === 'ARTICLE_DETAIL' && parts.length > 2) articleId = parts[2];
    if (routeType === 'STORY_DETAIL' && parts.length > 2) storyId = parts[2];
    if (routeType === 'SOURCE_DETAIL' && parts.length > 2) sourceId = parts[2];

    analyticsClient.setRoute(routeType);
    analyticsClient.track(viewEvent, { 
      articleId,
      storyId, 
      sourceId,
      category: ['ARTICLE_DETAIL', 'STORY_DETAIL', 'SOURCE_DETAIL', 'SEARCH', 'HOME', 'NOTIFICATIONS', 'ACCOUNT', 'FOR_YOU', 'TRENDING'].includes(routeType) ? undefined : routeType 
    });

    // Click Tracker — only fires when user clicks an article/story link
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (href && (href.startsWith('/article/') || href.startsWith('/story/'))) {
        let clickEvent: string | null = null;
        if (routeType === 'SEARCH') clickEvent = 'SEARCH_RESULT_CLICK';
        else if (routeType === 'FOR_YOU') clickEvent = 'FOR_YOU_CLICK';
        else if (routeType === 'TRENDING') clickEvent = 'TRENDING_CLICK';
        
        if (clickEvent) {
          analyticsClient.track(clickEvent, { category: routeType });
        }
      }
    };

    document.addEventListener('click', clickHandler);
    return () => {
      document.removeEventListener('click', clickHandler);
    };
  }, [pathname, searchParams]);

  return null;
}

