// app/(tabs)/apps.tsx
import Screen from '@/components/Screen';
import { Alert, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

async function tryOpen(urls: string[]) {
  for (const u of urls) {
    const can = await Linking.canOpenURL(u);
    if (can) return Linking.openURL(u);
  }
  Alert.alert('Não foi possível abrir', 'Verifique se o aplicativo está instalado.');
}

export default function AppsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <Screen style={{ backgroundColor: '#F2F4F7' }}>
      <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>Apps Importantes</Text>

        <View style={styles.grid}>
          <Shortcut
            label="WhatsApp"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733585.png' }}
            color="#25D366" // verde vivo
            textColor="#fff"
            onPress={() => tryOpen(['whatsapp://send', 'https://wa.me/'])}
          />
          <Shortcut
            label="Telefone"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/724/724664.png' }}
            color="#007AFF" // azul iOS
            textColor="#fff"
            onPress={() => tryOpen(['tel:'])}
          />
          <Shortcut
            label="Mapas"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/854/854878.png' }}
            color="#FF9800" // laranja vibrante
            textColor="#fff"
            onPress={() => tryOpen(['geo:0,0?q=', 'http://maps.google.com/maps'])}
          />
          <Shortcut
            label="YouTube"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png' }}
            color="#FF0000" // vermelho vivo
            textColor="#fff"
            onPress={() => tryOpen(['vnd.youtube://', 'https://youtube.com'])}
          />
          <Shortcut
            label="Calendário"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/747/747310.png' }}
            color="#673AB7" // roxo vivo
            textColor="#fff"
            onPress={() => Alert.alert('Atalho', 'Podemos ligar no calendário do sistema.')}
          />
          <Shortcut
            label="Contatos"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/456/456212.png' }}
            color="#009688" // teal vivo
            textColor="#fff"
            onPress={() => Alert.alert('Atalho', 'Podemos abrir contatos do sistema.')}
          />
        </View>
      </View>
    </Screen>
  );
}

function Shortcut({
  label,
  icon,
  color,
  textColor,
  onPress,
}: {
  label: string;
  icon: any;
  color: string;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: color, opacity: pressed ? 0.9 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${label}`}
    >
      <View style={styles.iconCircle}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={[styles.cardText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#000', textAlign: 'center', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    width: '48%',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff', // fundo claro p/ ícone PB
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: { width: 38, height: 38 },
  cardText: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
});
