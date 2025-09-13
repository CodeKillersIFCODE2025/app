// components/CheckInGate.tsx
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Weather = {
  temp: number | null;
  wind: number | null;
  code: number | null;
  nextHours: number[]; // próximas 6h temp
};

export default function CheckInGate() {
  const [visible, setVisible] = useState(true);         // visível ao abrir app
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState<'granted'|'denied'|'undetermined'>('undetermined');
  const [weather, setWeather] = useState<Weather>({ temp: null, wind: null, code: null, nextHours: [] });

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setPermission(status === 'granted' ? 'granted' : 'denied');

        if (status !== 'granted') {
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        const json = await res.json();

        const current = json.current_weather || {};
        const hourly = json.hourly || {};
        const idxNow = 0;
        const next6 = (hourly.temperature_2m || []).slice(idxNow, idxNow + 6);

        setWeather({
          temp: typeof current.temperature === 'number' ? current.temperature : null,
          wind: typeof current.windspeed === 'number' ? current.windspeed : null,
          code: typeof current.weathercode === 'number' ? current.weathercode : null,
          nextHours: next6,
        });
      } catch (e) {
        // se falhar, mantém sem dados
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!visible) return null;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <Text style={styles.greeting}>{greeting} 👋</Text>
        <Text style={styles.subtitle}>Antes de continuar, confirme que está tudo bem.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clima agora</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 12 }} />
          ) : permission !== 'granted' ? (
            <Text style={styles.cardText}>Permita localização para mostrar o clima da sua região.</Text>
          ) : weather.temp == null ? (
            <Text style={styles.cardText}>Não foi possível carregar o clima.</Text>
          ) : (
            <>
              <Text style={styles.bigTemp}>{Math.round(weather.temp)}°C</Text>
              {weather.nextHours?.length ? (
                <Text style={styles.cardText}>
                  Próximas horas: {weather.nextHours.map((t, i) => `${Math.round(t)}°`).join(' · ')}
                </Text>
              ) : null}
              {typeof weather.wind === 'number' ? (
                <Text style={styles.cardText}>Vento: {Math.round(weather.wind)} km/h</Text>
              ) : null}
            </>
          )}
        </View>

        <Pressable
          onPress={() => setVisible(false)}
          style={({ pressed }) => [styles.okButton, { opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Estou bem"
        >
          <Text style={styles.okText}>Estou bem!</Text>
        </Pressable>

        <Text style={styles.note}>
          Este passo ajuda familiares a saber que você está seguro. Você pode voltar a qualquer momento pelas abas.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7', // mesmo fundo do app
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: { fontSize: 34, fontWeight: '900', color: '#0B3D5C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#1b4a6b', textAlign: 'center', marginBottom: 20 },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#000', marginBottom: 8 },
  bigTemp: { fontSize: 48, fontWeight: '900', color: '#000', marginBottom: 6 },
  cardText: { fontSize: 18, color: '#000' },
  okButton: {
    backgroundColor: '#007BFF',
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 36,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  okText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  note: { marginTop: 12, fontSize: 14, color: '#1b4a6b', textAlign: 'center' },
});
