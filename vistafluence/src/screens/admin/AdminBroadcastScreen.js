import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { api } from '../../api/index';

// Premium Gold Theme Palette
const G = {
  bg: '#0B0A08',
  bgDeep: '#050403',
  card: '#151109',
  gold: '#D4AF37',
  goldLight: '#F4E5B2',
  goldDeep: '#9C7A1E',
  text: '#F5EFDC',
  textSub: '#C9BFA0',
  textMuted: '#7A7160',
  border: '#3A331F',
  danger: '#E0555C',
};

export default function AdminBroadcastScreen() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState('all'); // 'influencer' | 'advertiser' | 'all'
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!title || !body) return Alert.alert('Fill title and body');
    setLoading(true);
    try {
      await api.post('/admin/broadcast', { title, body, target });
      Alert.alert('✅ Sent', `Notification sent to ${target}`);
      setTitle(''); setBody('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.crestCircle}>
          <Text style={s.crestIcon}>📣</Text>
        </View>
        <View>
          <Text style={s.h1}>Admin Broadcast</Text>
          <Text style={s.subH}>Send announcements to your network</Text>
        </View>
      </View>

      {/* Card */}
      <View style={s.card}>
        <Text style={s.label}>Title</Text>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Big announcement"
          placeholderTextColor={G.textMuted}
        />

        <Text style={s.label}>Message</Text>
        <TextInput
          style={[s.input, { height: 110, textAlignVertical: 'top' }]}
          value={body}
          onChangeText={setBody}
          multiline
          placeholder="Write notification..."
          placeholderTextColor={G.textMuted}
        />

        <Text style={s.label}>Send to</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
          {['all', 'influencer', 'advertiser'].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTarget(t)}
              activeOpacity={0.85}
              style={[s.chip, target === t && s.chipActive]}
            >
              <Text style={[s.chipTxt, target === t && s.chipTxtActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={[s.btn, loading && s.btnDisabled]}
        onPress={send}
        disabled={loading}
        activeOpacity={0.9}
      >
        <Text style={s.btnTxt}>{loading ? 'Sending...' : '✦  Send Broadcast'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: G.bg,
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  crestCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: G.card,
    borderWidth: 1.5,
    borderColor: G.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: G.gold,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  crestIcon: { fontSize: 20 },
  h1: {
    color: G.goldLight,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subH: {
    color: G.textSub,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: G.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: G.border,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: {
    color: G.gold,
    fontSize: 12,
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: G.bgDeep,
    color: G.text,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: G.border,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: G.border,
    backgroundColor: G.bgDeep,
  },
  chipActive: {
    backgroundColor: G.gold,
    borderColor: G.goldLight,
    shadowColor: G.gold,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  chipTxt: {
    color: G.textSub,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  chipTxtActive: {
    color: G.bgDeep,
  },
  btn: {
    backgroundColor: G.gold,
    marginTop: 26,
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: G.goldLight,
    shadowColor: G.gold,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnTxt: {
    color: G.bgDeep,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});