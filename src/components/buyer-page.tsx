import type { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from './gradient-background';
import { BottomNavigation } from './bottom-navigation';

type Tab = 'home' | 'favorites' | 'cart' | 'profile';
type Props = { active: Tab; children: ReactNode };

export function BuyerPage({ active, children }: Props) {
  return (
    <GradientBackground style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {children}
        <BottomNavigation active={active} />
      </SafeAreaView>
    </GradientBackground>
  );
}
