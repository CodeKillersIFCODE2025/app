// components/Screen.tsx
import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: any;
}) {
  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      // ❗️sem background fixo; deixa herdar da cena (Tabs)
      style={[{ flex: 1 }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
