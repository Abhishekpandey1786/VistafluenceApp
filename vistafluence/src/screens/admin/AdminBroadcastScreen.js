import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { C } from '../../theme/colors';
import { api } from '../../api/index';

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
  } catch (e) { Alert.alert('Error', e.message); }
  setLoading(false);
};


  return (
    <View style={s.wrap}>
      <Text style={s.h1}>Admin Broadcast</Text>
      <Text style={s.label}>Title</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Big announcement" placeholderTextColor={C.textMuted} />
      <Text style={s.label}>Message</Text>
      <TextInput style={[s.input, { height: 100 }]} value={body} onChangeText={setBody} multiline placeholder="Write notification..." placeholderTextColor={C.textMuted} />
      <Text style={s.label}>Send to</Text>
      <View style={{ flexDirection:'row', gap:8 }}>
        {['all','influencer','advertiser'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTarget(t)}
            style={[s.chip, target === t && s.chipActive]}>
            <Text style={[s.chipTxt, target === t && { color: C.bg }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={send} disabled={loading}>
        <Text style={s.btnTxt}>{loading ? 'Sending...' : 'Send Broadcast'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex:1, backgroundColor:C.bg, padding:20, paddingTop:60 },
  h1: { color:C.text, fontSize:22, fontWeight:'900', marginBottom:20 },
  label: { color:C.textSub, fontSize:12, marginTop:14, marginBottom:6, fontWeight:'700' },
  input: { backgroundColor:C.bgDeep, color:C.text, borderRadius:10, padding:12, borderWidth:1, borderColor:C.border },
  chip: { paddingHorizontal:14, paddingVertical:8, borderRadius:20, borderWidth:1, borderColor:C.border },
  chipActive: { backgroundColor:C.teal, borderColor:C.teal },
  chipTxt: { color:C.text, fontWeight:'700', textTransform:'capitalize' },
  btn: { backgroundColor:C.teal, marginTop:24, padding:14, borderRadius:12, alignItems:'center' },
  btnTxt: { color:C.bg, fontWeight:'900', fontSize:15 },
});
