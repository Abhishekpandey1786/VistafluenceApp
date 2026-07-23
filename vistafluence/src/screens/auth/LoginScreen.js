import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  StatusBar, 
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const T = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  gold: '#E8C87A',
  surface: '#161616',
  surfaceAlt: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.6)',
  teal: '#00C9A7',
};

const AUTH_BASE = 'https://vistafluenceapp.onrender.com/api/auth';

export default function LoginScreen({ navigation }) {
  // ---- Login state ----
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- View mode: 'login' | 'forgot' | 'reset' ----
  const [mode, setMode] = useState('login');

  // ---- Forgot password state ----
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // ---- Reset password state ----
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const { login, loginContext = login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();

      if (response.status === 200 && data.success) {
        await login(data.token, data.user);
        Alert.alert('Success', `Welcome back, ${data.user.name}!`);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid Credentials');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Connection Error', 'Backend server tak request nahi pahonchi. Check karein ki IP address sahi hai aur Server ON hai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      return Alert.alert('Error', 'Please enter your email');
    }
    setForgotLoading(true);
    try {
      const response = await fetch(`${AUTH_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert('Check your email', 'Agar ye email registered hai, to reset code bhej diya gaya hai.');
        setMode('reset');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      Alert.alert('Connection Error', 'Server tak request nahi pahonchi');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim()) {
      return Alert.alert('Error', 'Reset code paste karo (email mein bheja gaya)');
    }
    if (newPassword.length < 6) {
      return Alert.alert('Error', 'Password kam se kam 6 characters ka hona chahiye');
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert('Error', 'Passwords match nahi ho rahe');
    }
    setResetLoading(true);
    try {
      const response = await fetch(`${AUTH_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), newPassword }),
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Password reset ho gaya, ab login karo', [
          {
            text: 'OK',
            onPress: () => {
              setMode('login');
              setForgotEmail('');
              setResetToken('');
              setNewPassword('');
              setConfirmPassword('');
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Reset fail ho gaya');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      Alert.alert('Connection Error', 'Server tak request nahi pahonchi');
    } finally {
      setResetLoading(false);
    }
  };

  // ---------------- FORGOT PASSWORD VIEW ----------------
  if (mode === 'forgot') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={T.black} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => setMode('login')} style={s.backBtn}>
              <Text style={s.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <View style={s.header}>
              <Text style={s.title}>Forgot <Text style={{ color: T.gold }}>Password</Text></Text>
              <Text style={s.subText}>Enter your email to receive a reset code</Text>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                placeholder="name@example.com"
                placeholderTextColor={T.muted}
                value={forgotEmail}
                onChangeText={setForgotEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!forgotLoading}
              />
            </View>

            <TouchableOpacity style={s.mainBtn} onPress={handleForgotPassword} disabled={forgotLoading}>
              {forgotLoading ? <ActivityIndicator color={T.black} /> : <Text style={s.mainBtnText}>Send Reset Code</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => setMode('reset')}>
              <Text style={s.forgotText}>Already have a code? Reset now</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ---------------- RESET PASSWORD VIEW ----------------
  if (mode === 'reset') {
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={T.black} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scrollContainer} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => setMode('login')} style={s.backBtn}>
              <Text style={s.backText}>← Back to Login</Text>
            </TouchableOpacity>

            <View style={s.header}>
              <Text style={s.title}>Reset <Text style={{ color: T.gold }}>Password</Text></Text>
              <Text style={s.subText}>Enter the code from your email and new password</Text>
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>RESET CODE</Text>
              <TextInput
                style={s.input}
                placeholder="Paste reset code here"
                placeholderTextColor={T.muted}
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
                editable={!resetLoading}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>NEW PASSWORD</Text>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={T.muted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!resetLoading}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>CONFIRM PASSWORD</Text>
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={T.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!resetLoading}
              />
            </View>

            <TouchableOpacity style={s.mainBtn} onPress={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? <ActivityIndicator color={T.black} /> : <Text style={s.mainBtnText}>Reset Password</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  // ---------------- LOGIN VIEW (default) ----------------
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />
      <View style={s.blob1} />
      <View style={s.blob2} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scrollContainer} bounces={false} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <Text style={s.title}>Welcome <Text style={{ color: T.gold }}>Back</Text></Text>
            <Text style={s.subText}>Login to your creator dashboard</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                placeholder="name@example.com"
                placeholderTextColor={T.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.passwordWrapper}>
                <TextInput
                  style={s.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={T.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={s.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={s.forgotBtn} onPress={() => setMode('forgot')}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.mainBtn} onPress={handleLogin} activeOpacity={0.8} disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color={T.black} /> : <Text style={s.mainBtnText}>Login to Account —</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.dividerRow}>
            <View style={s.line} />
            <Text style={s.divText}>OR CONTINUE WITH</Text>
            <View style={s.line} />
          </View>

          <TouchableOpacity style={s.secondaryBtn}>
            <Text style={s.secondaryBtnText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.footer} onPress={() => navigation.navigate('Signup')}>
            <Text style={s.footerText}>
              New here? <Text style={s.linkText}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.black },
  scrollContainer: { flexGrow: 1, padding: 24, paddingTop: 40 },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: T.gold, opacity: 0.05, top: -50, right: -50 },
  blob2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#7B61FF', opacity: 0.05, bottom: 100, left: -50 },
  backBtn: { marginBottom: 32 },
  backText: { color: T.sub, fontSize: 14, fontWeight: '600' },
  header: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', color: T.white, letterSpacing: -1 },
  subText: { fontSize: 14, color: T.sub, marginTop: 8 },
  form: { gap: 20 },
  inputGroup: { gap: 8, marginBottom: 4 },
  label: { fontSize: 10, fontWeight: '800', color: T.muted, letterSpacing: 1 },
  input: {
    backgroundColor: T.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    color: T.white,
    fontSize: 15,
    borderWidth: 1,
    borderColor: T.border,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  passwordInput: { flex: 1, padding: 16, color: T.white, fontSize: 15 },
  eyeBtn: { paddingHorizontal: 16 },
  eyeText: { color: T.gold, fontSize: 12, fontWeight: '700' },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -8 },
  forgotText: { color: T.gold, fontSize: 12, fontWeight: '700' },
  mainBtn: {
    backgroundColor: T.gold,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: T.gold,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
  },
  mainBtnText: { color: T.black, fontWeight: '900', fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 32 },
  line: { flex: 1, height: 1, backgroundColor: T.border },
  divText: { fontSize: 10, color: T.muted, fontWeight: '800' },
  secondaryBtn: { backgroundColor: T.surface, padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  secondaryBtnText: { color: T.white, fontWeight: '700' },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: 20 },
  footerText: { color: T.sub, fontSize: 14 },
  linkText: { color: T.white, fontWeight: '800' },
});