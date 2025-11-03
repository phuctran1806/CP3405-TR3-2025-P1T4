import { Zap, Wind, Wifi, Volume2 } from 'lucide-react-native';

export type AccessibilityFeature = 'power' | 'cool' | 'wifi' | 'quiet';

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
    label: 'Cool space',
    color: '$blue500',
  },
  wifi: {
    icon: Wifi,
    label: 'WiFi',
    color: '$green500',
  },
  quiet: {
    icon: Volume2,
    label: 'Quiet zone',
    color: '$purple500',
  },
};

export function getAccessibilityIcon(feature: AccessibilityFeature) {
  return accessibilityMapping[feature];
}
