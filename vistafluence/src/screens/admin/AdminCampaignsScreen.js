import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../api/index';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
};

const FILTERS = ['all', 'active', 'paused', 'completed'];

const badgeMap = {
  active:    { bg: '#064e3b', text: '#6ee7b7' },
  paused:    { bg: '#78350f', text: '#fcd34d' },
  completed: { bg: '#1e3a5f', text: '#93c5fd' },
  rejected:  { bg: '#7f1d1d', text: '#fca5a5' },
  draft:     { bg: '#1e293b', text: '#94a3b8' },
};

function Badge({ label }) {
  const c = badgeMap[label] || badgeMap.draft;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

export default function AdminCampaignsScreen() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      // ✅ No manual headers — api.js handles token automatically
      const res = await api.get(`/admin/campaigns${params}`);
      // ✅ res.campaigns directly — no res.data
      if (res.success) setCampaigns(res.campaigns);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [filter]);

  // ✅ Backend route: PUT /admin/campaigns/:id/status
  // Pehle galat tha: api.patch() — backend mein PUT route hai, PATCH nahi
  const updateStatus = (id, newStatus) => {
    Alert.alert('Status Change', `Campaign ko "${newStatus}" karo?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await api.put(`/admin/campaigns/${id}/status`, { status: newStatus });
            setCampaigns(prev =>
              prev.map(c => c._id === id ? { ...c, status: newStatus } : c)
            );
          } catch (e) {
            Alert.alert('Error', e.message || 'Kuch galat hua');
          }
        },
      },
    ]);
  };

  const deleteCampaign = (id) => {
    Alert.alert('Campaign Delete', 'Yeh permanently delete hogi!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            // ✅ api.delete — pehle api.js mein missing tha
            await api.delete(`/admin/campaigns/${id}`);
            setCampaigns(prev => prev.filter(c => c._id !== id));
          } catch (e) {
            Alert.alert('Error', e.message || 'Kuch galat hua');
          }
        },
      },
    ]);
  };

  const renderCampaign = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>
            Brand: {item.brand?.name || item.brand?.companyName || 'Unknown'} • ₹{item.budget?.toLocaleString()}
          </Text>
        </View>
        <Badge label={item.status} />
      </View>
      <View style={styles.cardActions}>
        {item.status === 'active' ? (
          <TouchableOpacity
            style={[styles.btn, { borderColor: C.warning }]}
            onPress={() => updateStatus(item._id, 'paused')}
          >
            <Text style={[styles.btnText, { color: C.warning }]}>⏸ Pause</Text>
          </TouchableOpacity>
        ) : item.status === 'paused' ? (
          <TouchableOpacity
            style={[styles.btn, { borderColor: C.success }]}
            onPress={() => updateStatus(item._id, 'active')}
          >
            <Text style={[styles.btnText, { color: C.success }]}>▶ Activate</Text>
          </TouchableOpacity>
        ) : null}
        {item.status !== 'active' && (
          <TouchableOpacity
            style={[styles.btn, { borderColor: C.danger }]}
            onPress={() => deleteCampaign(item._id)}
          >
            <Text style={[styles.btnText, { color: C.danger }]}>🗑 Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Campaigns</Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Sab' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={i => i._id}
          renderItem={renderCampaign}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={C.accent}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>Koi campaign nahi mili</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '600', color: C.text },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    borderWidth: 0.5, borderColor: C.border, backgroundColor: C.card,
  },
  filterBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  filterText: { color: C.muted, fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '500' },
  card: {
    backgroundColor: C.card, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: C.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 3 },
  cardSub: { fontSize: 12, color: C.muted },
  cardActions: { flexDirection: 'row', gap: 8 },
  btn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 0.5 },
  btnText: { fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40 },
});