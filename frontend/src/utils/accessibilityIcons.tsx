import { Zap, Wind, Accessibility, VolumeOff } from 'lucide-react-native';

export type AccessibilityFeature = 'power' | 'cool' | 'quiet' | 'accessible';

interface AccessibilityInfo {
  icon: any;
  label: string;
  color: string;
}

export const accessibilityMapping: Record<AccessibilityFeature, AccessibilityInfo> = {
  power: {
    icon: Zap,
    label: 'Power plugs',
    color: '$amber500',
  },
  cool: {
    icon: Wind,
    label: 'Air-conditioned',
    color: '$blue500',
  },
  quiet: {
    icon: VolumeOff,
    label: 'Quiet area',
    color: '$green500',
  },
  accessible: {
    icon: Accessibility,
    label: 'Accessible',
    color: '$purple500',
  },
};

export function getAccessibilityIcon(feature: AccessibilityFeature) {
  return accessibilityMapping[feature];
}
