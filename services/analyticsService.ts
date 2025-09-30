// Analytics Service for tracking user behavior and engagement

export interface AnalyticsEvent {
  event: string;
  [key: string]: unknown;
}

// Helper function to push analytics events to dataLayer
export const pushAnalytics = (eventName: string, payload?: Record<string, unknown>) => {
  try {
    const w: any = window as any;
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: eventName, ...payload });
    console.log('📊 Analytics Event:', eventName, payload); // Debug logging
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Page view tracking
export const trackPageView = (pagePath: string, pageTitle: string) => {
  pushAnalytics('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

// Screen view tracking (for SPA navigation)
export const trackScreenView = (screenName: string) => {
  pushAnalytics('screen_view', {
    screen_name: screenName,
  });
};

// Game session tracking
let gameStartTime: number | null = null;
let currentGameMode: string | null = null;

export const trackGameStart = (gameMode: 'name-it' | 'find-it', difficulty?: string, itemCount?: number) => {
  gameStartTime = Date.now();
  currentGameMode = gameMode;
  
  pushAnalytics('game_start', {
    game_mode: gameMode,
    difficulty: difficulty,
    item_count: itemCount,
    timestamp: gameStartTime,
  });
};

export const trackGameEnd = (stats?: { correct: number; total: number }) => {
  if (!gameStartTime || !currentGameMode) return;
  
  const sessionDuration = Math.round((Date.now() - gameStartTime) / 1000); // in seconds
  const accuracy = stats && stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  
  pushAnalytics('game_end', {
    game_mode: currentGameMode,
    session_duration_seconds: sessionDuration,
    total_attempts: stats?.total || 0,
    correct_attempts: stats?.correct || 0,
    accuracy_percentage: accuracy,
    timestamp: Date.now(),
  });
  
  // Reset session tracking
  gameStartTime = null;
  currentGameMode = null;
};

// User interaction tracking
export const trackInteraction = (interactionType: string, details?: Record<string, unknown>) => {
  pushAnalytics('user_interaction', {
    interaction_type: interactionType,
    ...details,
  });
};

// Answer tracking with enhanced metrics
export const trackAnswer = (
  result: 'correct' | 'incorrect',
  item: string,
  gameMode: string,
  responseTime?: number
) => {
  pushAnalytics('answer', {
    result,
    item,
    game_mode: gameMode,
    response_time_ms: responseTime,
  });
};

// Settings change tracking
export const trackSettingsChange = (setting: string, value: string | number) => {
  pushAnalytics('settings_change', {
    setting,
    value,
  });
};

// Engagement tracking
export const trackEngagement = (engagementType: string, value?: number | string) => {
  pushAnalytics('engagement', {
    engagement_type: engagementType,
    value,
  });
};

// App initialization tracking
export const trackAppInit = () => {
  pushAnalytics('app_initialized', {
    timestamp: Date.now(),
    user_agent: navigator.userAgent,
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    language: navigator.language,
  });
};
