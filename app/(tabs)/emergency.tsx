// app/(tabs)/emergency.tsx
import Screen from '@/components/Screen';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

function call(number: string) {
  Linking.openURL(`tel:${number}`).catch(() =>
    Alert.alert('Erro', 'Não foi possível iniciar a chamada.')
  );
}

export default function EmergencyScreen() {
  return (
    <Screen style={{ backgroundColor: '#D0EDFF' }}>
      <View style={styles.container}>
        <Pressable
          onPress={() => call('190')} // pode trocar por contato do familiar
          style={({ pressed }) => [styles.sos, { opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Botão de emergência"
          accessibilityHint="Toca para ligar imediatamente para o número de emergência"
        >
          <Text style={styles.sosText}>SOS</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable style={styles.shortcut} onPress={() => call('190')}>
            <Text style={styles.shortcutText}>Polícia{'\n'}190</Text>
          </Pressable>
          <Pressable style={styles.shortcut} onPress={() => call('192')}>
            <Text style={styles.shortcutText}>SAMU{'\n'}192</Text>
          </Pressable>
          <Pressable style={styles.shortcut} onPress={() => call('193')}>
            <Text style={styles.shortcutText}>Bombeiros{'\n'}193</Text>
          </Pressable>
        </View>

        <Text style={styles.tip}>
          Dica: podemos configurar para ligar para um familiar.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D0EDFF', // 👈 fundo ajustado
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sos: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  sosText: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: 2,
  },
  row: { flexDirection: 'row', gap: 12 },
  shortcut: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minWidth: 110,
    alignItems: 'center',
  },
  shortcutText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '800',
    textAlign: 'center',
  },
  tip: {
    marginTop: 16,
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});
