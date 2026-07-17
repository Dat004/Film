import type React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  width?: string | number;
  height?: string | number;
}

// Custom SVG icons
export { default as PlayIconCustom } from './PlayIconCustom';

// Player controls icons
export {
  PlayIcon,
  BackWardsIcon,
  ForWardsIcon,
  PcaIcon,
  PhoneIcon,
  TvIcon,
  PcIcon,
  PlayDisabled,
} from './PlayerIcons';

// Navigation / UI icons
export { BarMenuIcon, BlockEyesIcon, BackToTopIcon, DotIcon } from './NavIcons';

// User interface icons
export { PersonIcon, SettingsIcon, LogoutIcon, HeartIcon, HistoryIcon } from './UserIcons';

// Auth icons
export { GoogleIcon } from './AuthIcons';
