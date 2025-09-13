// app/(tabs)/index.tsx
import Screen from '@/components/Screen';
import { FontAwesome } from '@expo/vector-icons';
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
        headers: { Authorization: `Basic ${basic}` },
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
              accessibilityHint="Toque no check quadrado para marcar como feito. Use o botão de alto-falante à direita para ouvir a tarefa."
            >
              {/* Área esquerda: check + texto */}
              <View style={styles.left}>
                {/* Check quadrado */}
                <Pressable
                  onPress={() => completeTask(item.id)}
                  hitSlop={12}
                  style={({ pressed }) => [
                    styles.checkBox,
                    item.done && styles.checkBoxDone,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.done ? 'Desmarcar tarefa' : 'Marcar tarefa como concluída'}
                >
                  {item.done && <Text style={styles.checkMark}>✓</Text>}
                </Pressable>

                {/* Texto */}
                <Pressable
                  onPress={() => completeTask(item.id)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, flex: 1 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.description}. ${item.date}`}
                  accessibilityHint="Toque para marcar como feito e sincronizar"
                >
                  <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
                    {item.description}
                  </Text>
                  <Text style={styles.itemSub}>{item.date}</Text>
                </Pressable>
              </View>

              {/* Área direita: botão ouvir ocupa 1/4 */}
              <Pressable
                onPress={(e) => { /* @ts-ignore */ e?.stopPropagation?.(); speak(`${item.description}. ${item.date}`); }}
                onLongPress={() => Speech.stop()}
                style={({ pressed }) => [styles.speakArea, { opacity: pressed ? 0.85 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={`Ouvir: ${item.description}. ${item.date}`}
                accessibilityHint="Toque para ouvir. Toque e segure para parar."
              >
                <FontAwesome name="volume-up" size={42} color="#fff" />
              </Pressable>
            </View>
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7', padding: 24 },
  title: { fontSize: 34, fontWeight: '900', color: '#000', marginBottom: 18, textAlign: 'center' },

  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  itemDone: { backgroundColor: '#e5ffe7' },

  left: { flex: 3, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },

  // CHECK quadrado
  checkBox: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: '#0097b2',
    borderRadius: 6, // bordas levemente arredondadas mas quadrado
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxDone: {
    backgroundColor: '#0097b2',
  },
  checkMark: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '900',
  },

  itemText: { fontSize: 22, color: '#000', fontWeight: '700' },
  itemSub: { marginTop: 6, fontSize: 16, color: '#444' },
  itemTextDone: { textDecorationLine: 'line-through', color: '#2e7d32' },

  // BOTÃO DE OUVIR ocupa 1/4
  speakArea: {
    flex: 1,
    backgroundColor: '#0097b2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakIcon: { color: '#fff', fontSize: 60, fontWeight: '1200' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, color: '#444' },
});
