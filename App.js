import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBNhN0dklcvbPTwTA6MJxJ8cZzTz4bFH9c',
  authDomain: 'achados-e-perdidos-4ea7d.firebaseapp.com',
  projectId: 'achados-e-perdidos-4ea7d',
  storageBucket: 'achados-e-perdidos-4ea7d.firebasestorage.app',
  messagingSenderId: '377809757716',
  appId: '1:377809757716:web:3ba331d955e4581b422901',
  measurementId: 'G-PZ0LCCXPE5',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const getFriendlyAuthError = (error, action) => {
  const code = error?.code || '';

  const messages = {
    'auth/invalid-email': 'O e-mail informado está inválido. Verifique e tente novamente.',
    'auth/user-disabled': 'Essa conta foi desativada. Entre em contato com o suporte.',
    'auth/user-not-found': 'Nenhuma conta foi encontrada com esse e-mail.',
    'auth/wrong-password': 'Senha incorreta. Tente novamente.',
    'auth/email-already-in-use': 'Esse e-mail já está cadastrado. Faça login ou use outro e-mail.',
    'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
    'auth/network-request-failed': 'Não foi possível conectar ao servidor. Verifique sua internet.',
    'auth/configuration-not-found': 'A configuração do Firebase não foi encontrada. Verifique o projeto no console.',
    'auth/operation-not-allowed': 'Esse tipo de login está desativado no Firebase.',
    'auth/requires-recent-login': 'Faça login novamente para concluir esta ação.',
  };

  return messages[code] || `Não foi possível ${action}. Tente novamente.`;
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [user, setUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const clearForm = () => {
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setStatus({ type: 'error', text: 'Preencha nome completo, e-mail e senha para cadastrar.' });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: 'error', text: 'A senha precisa ter pelo menos 6 caracteres.' });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        ...userCredential.user,
        displayName: fullName.trim(),
      };

      setUser(userData);
      setStatus({ type: 'success', text: 'Cadastro realizado com sucesso! Bem-vindo(a).' });
      clearForm();
    } catch (error) {
      setStatus({ type: 'error', text: getFriendlyAuthError(error, 'realizar o cadastro') });
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setStatus({ type: 'error', text: 'Informe seu e-mail e senha para entrar.' });
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setStatus({ type: 'success', text: 'Login realizado com sucesso!' });
      clearForm();
    } catch (error) {
      setStatus({ type: 'error', text: getFriendlyAuthError(error, 'fazer login') });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setStatus({ type: 'success', text: 'Você saiu da conta com sucesso.' });
      clearForm();
      setScreen('login');
    } catch (error) {
      setStatus({ type: 'error', text: getFriendlyAuthError(error, 'sair da conta') });
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      setStatus({ type: 'error', text: 'Nenhuma conta ativa para excluir.' });
      setConfirmDelete(false);
      return;
    }

    try {
      await deleteUser(auth.currentUser);
      setUser(null);
      setStatus({ type: 'success', text: 'Sua conta foi excluída com sucesso.' });
      clearForm();
      setScreen('login');
      setConfirmDelete(false);
    } catch (error) {
      const code = error?.code || '';

      if (code === 'auth/requires-recent-login') {
        setStatus({
          type: 'error',
          text: 'Para excluir a conta, faça login novamente e tente outra vez.',
        });
        setConfirmDelete(false);
        return;
      }

      setStatus({ type: 'error', text: getFriendlyAuthError(error, 'excluir a conta') });
      setConfirmDelete(false);
    }
  };

  if (user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.authContainer}>
          <Text style={styles.title}>Olá!</Text>
          <Text style={styles.userText}>{user.displayName || user.email}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Você está dentro do app</Text>
            <Text style={styles.cardText}>Sua conta foi autenticada com sucesso.</Text>
          </View>

          {status.text ? (
            <Text style={[styles.message, status.type === 'error' ? styles.errorText : styles.successText]}>
              {status.text}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonDelete} onPress={() => setConfirmDelete(true)}>
            <Text style={styles.buttonText}>Excluir conta</Text>
          </TouchableOpacity>

          {confirmDelete && (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>Confirmar exclusão</Text>
              <Text style={styles.confirmText}>
                Essa ação apagará sua conta permanentemente. Deseja continuar?
              </Text>

              <View style={styles.confirmActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmDelete(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDeleteAccount}>
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Achados e Perdidos</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabButton, screen === 'login' && styles.tabButtonActive]}
            onPress={() => setScreen('login')}
          >
            <Text style={[styles.tabText, screen === 'login' && styles.tabTextActive]}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, screen === 'register' && styles.tabButtonActive]}
            onPress={() => setScreen('register')}
          >
            <Text style={[styles.tabText, screen === 'register' && styles.tabTextActive]}>Cadastrar</Text>
          </TouchableOpacity>
        </View>

        {screen === 'login' ? (
          <View style={styles.formBox}>
            <Text style={styles.sectionTitle}>Login</Text>

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formBox}>
            <Text style={styles.sectionTitle}>Cadastro</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>
          </View>
        )}

        {status.text ? (
          <Text style={[styles.message, status.type === 'error' ? styles.errorText : styles.successText]}>
            {status.text}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 6,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#111827',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1f2937',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#111827',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonLogout: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDelete: {
    backgroundColor: '#7f1d1d',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  confirmBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  confirmText: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  userText: {
    fontSize: 18,
    color: '#065f46',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
  },
  successText: {
    color: '#047857',
  },
});
