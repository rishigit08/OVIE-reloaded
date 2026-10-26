import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bg: '#F6F3EE',
  surface: '#FFFFFF',
  sunken: '#EFEAE2',
  ink: '#1B1B3A',
  inkSoft: '#55546E',
  muted: '#9694A8',
  line: '#E8E2D8',

  plum: '#6B3A63',
  plumDeep: '#4A2545',
  plumSoft: '#F4E9F1',

  tangerine: '#FF8A3D',
  sun: '#FFC83D',
  teal: '#1FB5A6',
  sky: '#3E8BFF',
  pink: '#FF6B9A',
  leaf: '#6CC24A',

  goodBg: '#E2F6F3',
  goodInk: '#0E7268',
  warnBg: '#FFF3D1',
  warnInk: '#7A5600',
  gapBg: '#FFE6EE',
  gapInk: '#A3214F',
};

/** The tile colors Moe (and every mosaic accent in the app) is built from. */
export const mosaic = [
  colors.tangerine,
  colors.sun,
  colors.teal,
  colors.sky,
  colors.pink,
  colors.leaf,
  colors.plum,
];

export const fonts = {
  display: 'HindVadodara_700Bold',
  displaySemi: 'HindVadodara_600SemiBold',
  body: 'HindVadodara_400Regular',
  medium: 'HindVadodara_500Medium',
  semi: 'HindVadodara_600SemiBold',
  bold: 'HindVadodara_700Bold',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

/** Minimum touch target, per iOS HIG / Material. */
export const HIT = 44;

// Each shadow is built whole for its platform. Don't spread one of these and then
// override a single shadow* prop: on web that adds a second, solid black shadow.
function makeShadow(opacity: number, blur: number, y: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: { shadowColor: '#2A1B3D', shadowOpacity: opacity, shadowRadius: blur, shadowOffset: { width: 0, height: y } },
    android: { elevation },
    default: { boxShadow: `0 ${y}px ${Math.round(blur * 1.25)}px rgba(42,27,61,${opacity})` },
  })!;
}

/** Cards and other resting surfaces. */
export const shadow = makeShadow(0.08, 16, 6, 3);
/** Floating bars. */
export const shadowBar = makeShadow(0.14, 16, 6, 6);
/** Sheets rising from the bottom edge: the shadow falls upward. */
export const shadowUp = makeShadow(0.1, 16, -6, 12);
/** Panels floating over a dimmed screen. */
export const shadowStrong = makeShadow(0.25, 30, 10, 16);

export const type: Record<string, TextStyle> = {
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, color: colors.ink, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.semi, fontSize: 17, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  bodyInk: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: {
    fontFamily: fonts.semi,
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
};
