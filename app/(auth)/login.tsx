// app/(auth)/login.tsx
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setErr(null);
    try {
      if (!email || !pass) throw new Error("Preencha e-mail e senha");
      router.replace("/(tabs)");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Marca do app */}
        <Text style={styles.brand}>ZELO</Text>

        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="cover"
        />

        <Text style={styles.title}>Entrar</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#666"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
          textContentType="oneTimeCode"
          autoComplete="off"
          autoCorrect={false}
        />

        {err ? <Text style={styles.error}>{err}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
        >
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7", // 👈 cinzinha neutro
  },
  brand: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#2c3e50",
    marginBottom: 8,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#2c3e50",
  },
  input: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    color: "red",
    marginBottom: 16,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#0097b2", // 👈 nova cor do botão
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 999,
    marginTop: 8,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
