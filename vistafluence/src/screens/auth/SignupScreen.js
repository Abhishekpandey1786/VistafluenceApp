import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform 
} from 'react-native';

const T = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  gold: '#E8C87A',
  pink: '#FF6B8A',
  surfaceAlt: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.6)',
};

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleNext = () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Missing Info', 'Please fill all fields before proceeding.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }

    if (password.length < 6) {
      return Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
    }
    navigation.navigate('RoleSelect', { 
      name: name.trim(), 
      email: email.trim().toLowerCase(), 
      password: password 
    });
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />
      
      {/* Decorative Blur Ambient Blob */}
      <View style={s.blob1} />

      {/* Keyboard layout wrapper for smooth UI transitions */}
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
            <Text style={s.title}>Create <Text style={{color: T.pink}}>Account</Text></Text>
            <Text style={s.subText}>Join the elite 1% of Indian creators.</Text>
          </View>

          <View style={s.form}>
            <View style={s.inputGroup}>
              <Text style={s.label}>FULL NAME</Text>
              <TextInput 
                style={s.input} 
                placeholder="John Doe" 
                placeholderTextColor={T.muted}
                value={name} 
                onChangeText={setName} 
                autoCorrect={false}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput 
                style={s.input} 
                placeholder="john@example.com" 
                placeholderTextColor={T.muted}
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                autoCorrect={false}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.label}>PASSWORD</Text>
              <View style={s.passwordWrapper}>
                <TextInput 
                  style={s.passwordInput} 
                  placeholder="Create a strong password" 
                  placeholderTextColor={T.muted}
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={s.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={s.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={s.mainBtn} onPress={handleNext} activeOpacity={0.8}>
              <Text style={s.mainBtnText}>Continue to Roles —</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={s.footer} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.footerText}>
              Already have an account? <Text style={s.linkText}>Log In</Text>
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
  blob1: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: T.pink, opacity: 0.05, top: -50, left: -50 },
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
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: T.white,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 16,
  },
  eyeText: {
    color: T.pink,
    fontSize: 12,
    fontWeight: '700',
  },
  mainBtn: {
    backgroundColor: T.white,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    height: 56,
    justifyContent: 'center',
  },
  mainBtnText: { color: T.black, fontWeight: '900', fontSize: 15 },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: 20 },
  footerText: { color: T.sub, fontSize: 14 },
  linkText: { color: T.white, fontWeight: '800' },
});