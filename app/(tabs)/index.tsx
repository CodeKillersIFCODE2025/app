// app/(tabs)/index.tsx
import Screen from '@/components/Screen';
import * as Speech from 'expo-speech';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { config } from '../../config';
import { getAuthBasic } from '../../utils/auth';

type ApiTask = { id: string; description: string; date: string };
type Task = { id: string; description: string; date: string; done: boolean };

export default function TabTodo() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [basic, setBasic] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const speak = useCallback((text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'pt-BR', pitch: 1.0, rate: 1.0 });
  }, []);

  useEffect(() => {
    (async () => {
      const b = await getAuthBasic();
      if (!b) {
        Alert.alert('Sessão', 'Faça login novamente para carregar suas tarefas.');
        setLoading(false);
        return;
      }
      setBasic(b);
    })();
  }, []);

  async function fetchTasks(authBasic: string) {
    try {
      setLoading(true);
      const res = await fetch(`${config.base_url}/elderly/tasks/today`, {
        method: 'GET',
        headers: { Authorization: `Basic ${authBasic}` },
      });
      if (!res.ok) throw new Error(`Falha ao carregar (${res.status})`);

      const data: ApiTask[] = await res.json();
      const parsed: Task[] = data.map(t => ({
        id: t.id,
        description: t.description,
        date: t.date,
        done: false,
      }));
      setTasks(parsed);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (basic) fetchTasks(basic);
  }, [basic]);

  const onRefresh = useCallback(async () => {
    if (!basic) return;
    setRefreshing(true);
    await fetchTasks(basic);
    setRefreshing(false);
  }, [basic]);

  async function completeTask(id: string) {
    if (!basic) {
      Alert.alert('Sessão', 'Faça login novamente.');
      return;
    }

    setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));

    try {
      const res = await fetch(`${config.base_url}/elderly/tasks/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${basic}`,
        },
      });

      if (!res.ok) throw new Error(`Falha ao completar (${res.status})`);
    } catch (e: any) {
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
      Alert.alert('Erro', e?.message || 'Não foi possível completar a tarefa.');
      return;
    }

    fetchTasks(basic);
  }

  const empty = useMemo(() => !loading && tasks.length === 0, [loading, tasks.length]);

  return (
    <Screen style={{ backgroundColor: '#F2F4F7' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Minhas Tarefas</Text>

        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
          ListEmptyComponent={empty ? (
            <View style={styles.empty}><Text style={styles.emptyText}>Sem tarefas para hoje.</Text></View>
          ) : null}
          renderItem={({ item }) => (
            <View
              style={[styles.item, item.done && styles.itemDone]}
              accessible
              accessibilityLabel={`${item.description}. ${item.date}`}
              accessibilityHint="Toque no título para marcar como feito. Use o botão de alto-falante para ouvir a tarefa."
            >
              <View style={styles.itemRow}>
                <Pressable
                  onPress={() => completeTask(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, flex: 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.description}. ${item.date}`}
                  accessibilityHint="Toque para marcar como feito e sincronizar"
                >
                  <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
                    {item.done ? '✓ ' : '○ '} {item.description}
                  </Text>
                  <Text style={styles.itemSub}>{item.date}</Text>
                </Pressable>
                <Pressable
                  onPress={(e) => { /* @ts-ignore */ e?.stopPropagation?.(); speak(`${item.description}. ${item.date}`); }}
                  onLongPress={() => Speech.stop()}
                  style={({ pressed }) => [styles.speakBtn, { opacity: pressed ? 0.85 : 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvir: ${item.description}. ${item.date}`}
                  accessibilityHint="Toque para ouvir. Toque e segure para parar."
                >
                  <Text style={styles.speakIcon}>🔊</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#000', marginBottom: 16, textAlign: 'center' },

  item: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemDone: { backgroundColor: '#e5ffe7' },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemText: { fontSize: 22, color: '#000', fontWeight: '700' },
  itemSub: { marginTop: 4, fontSize: 16, color: '#444' },
  itemTextDone: { textDecorationLine: 'line-through', color: '#2e7d32' },

  speakBtn: { marginLeft: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#0097b2', borderRadius: 999 },
  speakIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, color: '#444' },
});
