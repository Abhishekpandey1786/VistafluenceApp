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

const T = {  black: '#0A0A0A',
  white: '#FFFFFF',
  gold: '#E8C87A',
  surface: '#161616',
  surfaceAlt: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.6)',
  teal: '#00C9A7',
};
const BACKEND_URL = 'https://vistafluenceapp.onrender.com/api/auth/login'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, loginContext = login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
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
      Alert.alert(
        'Connection Error', 
        'Backend server tak request nahi pahonchi. Check karein ki IP address sahi hai aur Server ON hai.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />
      
      <View style={s.blob1} />
      <View style={s.blob2} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={s.scrollContainer}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.header}>
            <Text style={s.title}>Welcome <Text style={{color: T.gold}}>Back</Text></Text>
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
              <TextInput
                style={s.input}
                placeholder="••••••••"
                placeholderTextColor={T.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <TouchableOpacity style={s.forgotBtn}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.mainBtn} 
              onPress={handleLogin} 
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={T.black} />
              ) : (
                <Text style={s.mainBtnText}>Login to Account —</Text>
              )}
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

          <TouchableOpacity 
            style={s.footer} 
            onPress={() => navigation.navigate('Signup')}
          >
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
  inputGroup: { gap: 8 },
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
  secondaryBtn: {
    backgroundColor: T.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border,
  },
  secondaryBtnText: { color: T.white, fontWeight: '700' },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: 20 },
  footerText: { color: T.sub, fontSize: 14 },
  linkText: { color: T.white, fontWeight: '800' },
});