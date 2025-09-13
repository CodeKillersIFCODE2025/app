// app/(tabs)/emergency.tsx
import Screen from '@/components/Screen';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { config } from '../../config';
import { getAuthBasic } from '../../utils/auth';

type Responsible = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  elderly: {
    id: string;
    name: string;
    email: string;
    lastCheckIn: string;
    todayCheckInDone: boolean;
  };
};

function call(number?: string) {
  if (!number) {
    Alert.alert('Telefone indisponível', 'Não foi possível obter o telefone do responsável.');
    return;
  }
  const tel = number.replace(/[^\d+]/g, '');
  Linking.openURL(`tel:${tel}`).catch(() =>
    Alert.alert('Erro', 'Não foi possível iniciar a chamada.')
  );
}

export default function EmergencyScreen() {
  const [resp, setResp] = useState<Responsible | null>(null);
  const [loading, setLoading] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const b = await getAuthBasic();
        if (!b) {
          setLoading(false);
          Alert.alert('Sessão', 'Faça login novamente.');
          return;
        }

        const res = await fetch(`${config.base_url}/responsibles`, {
          method: 'GET',
          headers: { Authorization: `Basic ${b}` },
        });
        if (!res.ok) throw new Error(`Falha ao carregar responsável (${res.status})`);
        const data: Responsible = await res.json();
        setResp(data);
      } catch (e: any) {
        Alert.alert('Erro', e?.message || 'Não foi possível carregar o responsável.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // animação de pulso infinito
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const firstName = resp?.name?.split(' ')[0] || 'Responsável';

  return (
    <Screen style={{ backgroundColor: '#F2F4F7' }}>
      <View style={styles.container}>
        {/* Pergunta em destaque */}
        <Text style={styles.question}>Precisa de ajuda?</Text>

        {/* Botão pulsante */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={() => call(resp?.phone)}
            disabled={loading}
            style={({ pressed }) => [styles.helpBtn, { opacity: pressed ? 0.9 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel={`Botão de ajuda, ligar para ${firstName}`}
            accessibilityHint="Liga imediatamente para o responsável"
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.helpBtnText}>Ligar para {firstName}</Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Card de info */}
        <View style={styles.infoCard}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="large" color="#0097b2" />
              <Text style={styles.loadingText}>Carregando responsável…</Text>
            </View>
          ) : resp ? (
            <>
              <Text style={styles.infoTitle}>Responsável</Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Nome: </Text>{resp.name}
              </Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Telefone: </Text>{resp.phone || '—'}
              </Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Endereço: </Text>{resp.address}
              </Text>

              <View style={styles.divider} />

              <Text style={styles.infoTitle}>Idoso(a)</Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Nome: </Text>{resp.elderly?.name}
              </Text>
              <Text style={styles.infoLine}>
                <Text style={styles.infoLabel}>Último check-in: </Text>{resp.elderly?.lastCheckIn}
              </Text>
            </>
          ) : (
            <Text style={styles.errorText}>
              Não foi possível obter os dados do responsável.
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  question: {
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },

  helpBtn: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  helpBtnText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: { fontSize: 20, fontWeight: '900', color: '#000', marginBottom: 6 },
  infoLine: { fontSize: 18, color: '#000', marginBottom: 4 },
  infoLabel: { fontWeight: '800', color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 18, color: '#000' },
  errorText: { fontSize: 16, color: '#b00020' },
});
