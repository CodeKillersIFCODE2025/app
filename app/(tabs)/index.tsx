// app/(tabs)/index.tsx
import Screen from '@/components/Screen';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Task = { id: string; title: string; done: boolean };

export default function TabTodo() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Tomar remédio 08:00', done: false },
    { id: '2', title: 'Beber água', done: false },
  ]);
  const [newTask, setNewTask] = useState('');
  const insets = useSafeAreaInsets();

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function addTask() {
    const title = newTask.trim();
    if (!title) return;
    setTasks((prev) => [
      { id: Date.now().toString(), title, done: false },
      ...prev,
    ]);
    setNewTask('');
  }

  function clearDone() {
    const any = tasks.some((t) => t.done);
    if (!any) return;
    Alert.alert('Limpar concluídas', 'Remover tarefas concluídas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => setTasks((prev) => prev.filter((t) => !t.done)),
      },
    ]);
  }

  return (
    <Screen style={{ backgroundColor: '#D0EDFF' }}>
      <View style={styles.container}>
        <Text style={styles.title}>Minhas Tarefas</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={newTask}
            onChangeText={setNewTask}
            placeholder="Adicionar tarefa..."
            placeholderTextColor="#666"
          />
          <Pressable
            onPress={addTask}
            style={({ pressed }) => [
              styles.addBtn,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.addText}>Adicionar</Text>
          </Pressable>
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => toggle(item.id)}
              style={({ pressed }) => [
                styles.item,
                item.done && styles.itemDone,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityHint="Toque para marcar como feito ou desfazer"
            >
              <Text
                style={[styles.itemText, item.done && styles.itemTextDone]}
              >
                {item.done ? '✓ ' : '○ '} {item.title}
              </Text>
            </Pressable>
          )}
          ListFooterComponent={
            <Pressable onPress={clearDone} style={styles.clearBtn}>
              <Text style={styles.clearText}>Limpar concluídas</Text>
            </Pressable>
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D0EDFF', padding: 24 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    color: '#000',
    fontSize: 20,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  addBtn: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    borderRadius: 999,
    justifyContent: 'center',
  },
  addText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  item: {
    backgroundColor: '#f7f8fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemDone: { backgroundColor: '#e5ffe7' },
  itemText: { fontSize: 22, color: '#000', fontWeight: '600' },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: '#2e7d32',
  },
  clearBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  clearText: { color: '#007BFF', fontSize: 18, fontWeight: '700' },
});
