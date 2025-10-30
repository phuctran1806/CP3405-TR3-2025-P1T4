import { Zap, Wind, Wifi, Accessibility } from 'lucide-react-native';

export type AccessibilityFeature = 'power' | 'cool' | 'wifi' | 'accessible';

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
  wifi: {
    icon: Wifi,
    label: 'WiFi',
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
