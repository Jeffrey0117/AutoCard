export type FontFamily = 'sans' | 'serif' | 'mono' | 'hand' | 'marker' | 'rounded' | 'mincho' | 'pixel';

export interface FontOption {
  id: FontFamily;
  name: string;
  cssValue: string; // The tailwind class or raw css font-family
}

export interface Theme {
  id: string;
  name: string;
  defaultFontFamily: FontFamily; // Changed from fixed fontFamily to default
  headingColor: string;
  bodyColor: string;
  backgroundColor: string;
  slideClassName: string;
  accentColor: string;
  proseStyle: string;
  contentAlign: 'start' | 'center';
  isDark?: boolean;
}

export enum AIServiceAction {
  SUMMARIZE = 'SUMMARIZE',
  IMPROVE = 'IMPROVE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  EXPAND = 'EXPAND',
  MAKE_SOCIAL = 'MAKE_SOCIAL',
  GENERATE_CAPTION = 'GENERATE_CAPTION' // New action
}

export interface AIState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export interface SocialCaptionResult {
  captions: string[];
}