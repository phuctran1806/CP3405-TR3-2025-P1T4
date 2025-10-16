import NavigationLayout from '@/layouts/navigation';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <NavigationLayout />
    </GluestackUIProvider>
  );
}