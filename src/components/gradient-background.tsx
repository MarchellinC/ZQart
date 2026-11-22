import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette } from '@/constants/colors';

type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export function GradientBackground({ children, style }: Props) {
  return (
    <LinearGradient
      colors={[Palette.gradientStart, Palette.gradientEnd]}
      locations={[0.09, 0.78]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={style}>
      {children}
    </LinearGradient>
  );
}
