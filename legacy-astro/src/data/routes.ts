// One entry per frame on the "8 Hi Fi Screens" Figma page.
// `built: false` screens are planned routes that haven't been coded yet.
export interface ScreenRoute {
  path: string;
  figma: string;   // frame name in Figma
  nodeId: string;  // frame node id in Figma
  built: boolean;
}

export const ROUTES = {
  discover:          '/discover',
  discoverElectronic:'/discover/electronic',
  signup:            '/signup',
  signupFilled:      '/signup/filled',
  onboarding:        '/onboarding',
  onboardingSpotify: '/onboarding/spotify',
  onboardingManual:  '/onboarding/manual',
  forYou:            '/discover/for-you',
  recommended:       '/discover/recommended',
  artistWidget:      '/discover/artist',
  artist:            '/artists/fallingislands',
  artistEvents:      '/artists/fallingislands/events',
  eventsList:        '/events/list',
  eventsMap:         '/events/map',
  event:             '/events/battlebox',
  thread:            '/forum/battlebox',
  threadTyping:      '/forum/battlebox/reply',
  threadReplied:     '/forum/battlebox/replied',
  notifications:     '/notifications',
  thanks:            '/thanks',
} as const;

export const SCREENS: ScreenRoute[] = [
  { path: ROUTES.discover,           figma: '📸 1 Discover (web of dots)',                  nodeId: '1431:453',  built: true  },
  { path: ROUTES.discoverElectronic, figma: '📸 2 Discover (electronic music subgenres)',   nodeId: '1431:715',  built: true  },
  { path: ROUTES.signup,             figma: '📸 3 Auth (Sign up)',                          nodeId: '1431:994',  built: true  },
  { path: ROUTES.signupFilled,       figma: '📸 4 Auth (Kit Tan Sign up)',                  nodeId: '1431:1287', built: true  },
  { path: ROUTES.onboarding,         figma: '📸 5 Onboarding (before connect spotify)',     nodeId: '1431:2207', built: true  },
  { path: ROUTES.onboardingSpotify,  figma: '📸 6 Onboarding (connect spotify)',            nodeId: '1431:2082', built: true  },
  { path: ROUTES.onboardingManual,   figma: 'Onboarding (your taste profile — manual)',     nodeId: '1439:278',  built: true  },
  { path: ROUTES.forYou,             figma: '📸 7 Discover (for you)',                      nodeId: '1431:2324', built: true  },
  { path: ROUTES.recommended,        figma: '📸 8 Discover (artist widget expanded)',       nodeId: '1431:2609', built: true  },
  { path: ROUTES.artistWidget,       figma: '📸 9 Discover (artist widget expanded)',       nodeId: '1431:2897', built: true  },
  { path: ROUTES.artist,             figma: '📸 10 Artist page (Artist profile portfolio)', nodeId: '1431:1913', built: true  },
  { path: ROUTES.artistEvents,       figma: '📸 11 Artist page (Artist profile events)',    nodeId: '1431:2008', built: true  },
  { path: ROUTES.eventsList,         figma: '📸 12 Events (List) Filtered',                 nodeId: '1431:3220', built: true  },
  { path: ROUTES.eventsMap,          figma: '📸 13 Events (Map) Filtered',                  nodeId: '1431:3394', built: true  },
  { path: ROUTES.event,              figma: '📸 13 Events (Details)',                       nodeId: '1431:3559', built: true  },
  { path: ROUTES.thread,             figma: '📸 15 Forum (BattleBox 2026)',                 nodeId: '1431:1636', built: true  },
  { path: ROUTES.threadTyping,       figma: '📸 16 Forum (Typing Kit Chan reply)',          nodeId: '1431:1727', built: true  },
  { path: ROUTES.threadReplied,      figma: '📸 17 Forum (Kit Chan reply)',                 nodeId: '1431:1818', built: true  },
  { path: ROUTES.notifications,      figma: 'Notifications',                                nodeId: '1439:170',  built: true  },
  { path: ROUTES.thanks,             figma: '18 End of demo (thank you)',                   nodeId: '1431:3775', built: true  },
];
