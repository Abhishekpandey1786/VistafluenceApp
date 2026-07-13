import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const T = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  gold: '#E8C87A',
  pink: '#FF6B8A',
  surface: '#161616',
  surfaceAlt: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.6)',
  teal: '#00C9A7',
};

// 💻 APNE LAPTOP KA LOCAL IP ADDRESS YAHAN UPDATE KAREIN
const BACKEND_URL = 'http://192.168.1.2:5000/api/auth/register';

export default function RoleSelectScreen({ route, navigation }) {
  const [selected, setSelected] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🛠️ Safe Fallback Setup: Dono names ko useAuth context se extract kiya taaki property error hamesha ke liye khatam ho jaye
  const { login, loginContext = login } = useAuth();
  
  const { name, email, password } = route.params || {};

  const handleSelect = async (role) => {
    if (isSubmitting) return; 
    
    setSelected(role);
    setIsSubmitting(true);

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          role: role 
        })
      });

      const data = await response.json();

      if (response.status === 201 && data.success) {
        // Here it uses the safe fallback method mapped above
        await login(data.token, data.user);
        Alert.alert('Account Created!', `Welcome to Vistafluence, ${data.user.name}`);
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
      }

    } catch (error) {
      console.error('Register Fetch Error:', error);
      Alert.alert(
        'Connection Error', 
        'Backend server tak request nahi pahonchi. Check karein ki IP address sahi hai aur Server ON hai.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      key: 'influencer',
      icon: '🎥',
      title: 'I am a Creator',
      accent: T.pink,
      sub: 'Apply to brand campaigns, grow your audience & earn money.',
      perks: ['Browse 100+ campaigns', 'Instant payouts', 'Growth tools'],
    },
    {
      key: 'brand', 
      icon: '🏢',
      title: 'I am a Brand',
      accent: T.gold,
      sub: 'Post campaigns, find the right creators & track ROI.',
      perks: ['Access 10K+ creators', 'Advanced analytics', 'Secure payments'],
    },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />
      
      <View style={s.blob1} />
      <View style={s.blob2} />

      <View style={s.container}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={s.backBtn}
          disabled={isSubmitting}
        >
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={s.header}>
          <Text style={s.title}>One last <Text style={{color: T.gold}}>Step</Text></Text>
          <Text style={s.subText}>Tell us how you want to use the platform</Text>
        </View>

        {roles.map((r) => {
          const isActive = selected === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              style={[
                s.card, 
                isActive && { borderColor: r.accent, backgroundColor: 'rgba(255,255,255,0.03)' }
              ]}
              onPress={() => handleSelect(r.key)}
              activeOpacity={0.9}
              disabled={isSubmitting}
            >
              <View style={s.cardTop}>
                <View style={[s.iconBox, { backgroundColor: isActive ? r.accent : T.surfaceAlt }]}>
                  {isSubmitting && isActive ? (
                    <ActivityIndicator size="small" color={T.black} />
                  ) : (
                    <Text style={s.iconText}>{r.icon}</Text>
                  )}
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, isActive && { color: r.accent }]}>{r.title}</Text>
                  <Text style={s.cardSub}>{r.sub}</Text>
                </View>

                <View style={[s.radio, isActive && { borderColor: r.accent }]}>
                  {isActive && <View style={[s.radioDot, { backgroundColor: r.accent }]} />}
                </View>
              </View>

              <View style={s.perksWrapper}>
                {r.perks.map((p, i) => (
                  <View key={i} style={s.perkItem}>
                    <Text style={[s.perkCheck, { color: isActive ? r.accent : T.muted }]}>✦</Text>
                    <Text style={s.perkLabel}>{p}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={s.infoText}>
          You can also switch your account type later from settings.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.black },
  container: { flex: 1, padding: 24, paddingTop: 40 },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: T.gold, opacity: 0.04, bottom: -100, right: -100 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: T.pink, opacity: 0.04, top: 100, left: -100 },
  backBtn: { marginBottom: 32 },
  backText: { color: T.sub, fontSize: 14, fontWeight: '600' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '900', color: T.white, letterSpacing: -1 },
  subText: { fontSize: 15, color: T.sub, marginTop: 8 },
  card: {
    backgroundColor: T.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: T.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 18 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 24 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: T.white, marginBottom: 4 },
  cardSub: { fontSize: 12, color: T.muted, lineHeight: 18 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  perksWrapper: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    borderTopWidth: 1, 
    borderTopColor: T.border, 
    paddingTop: 16 
  },
  perkItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  perkCheck: { fontSize: 12, fontWeight: '900' },
  perkLabel: { fontSize: 11, color: T.sub, fontWeight: '600' },
  infoText: {
    textAlign: 'center',
    color: T.muted,
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});