import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../api/index';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  success: '#10b981', danger: '#ef4444',
};

const TABS = ['pending', 'approved', 'rejected'];

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('pending');

  const load = useCallback(async () => {
    try {
      // ✅ api.js token auto-attach karta hai — manual headers nahi chahiye
      const res = await api.get(`/admin/applications?status=${tab}`);
      // ✅ res.applications directly — no res.data.applications
      if (res.success) setApplications(res.applications);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => { setLoading(true); load(); }, [tab]);

  // ✅ Backend route: PATCH /admin/applications/:id — ye backend mein add kiya hai
  const updateApp = (id, status) => {
    Alert.alert(
      status === 'approved' ? 'Application Approve' : 'Application Reject',
      'Kya aap confirm karte hain?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: status === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await api.patch(`/admin/applications/${id}`, { status });
              setApplications(prev => prev.filter(a => a._id !== id));
            } catch (e) {
              Alert.alert('Error', e.message || 'Kuch galat hua');
            }
          },
        },
      ]
    );
  };

  const renderApp = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(item.influencer?.name || item.influencer?.email)?.[0]?.toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.influencer?.name || 'Influencer'}</Text>
          <Text style={styles.sub}>{item.influencer?.email}</Text>
        </View>
      </View>
      <View style={styles.campaignRow}>
        <Text style={styles.campaignLabel}>Campaign:</Text>
        <Text style={styles.campaignName}>{item.campaign?.title || 'Unknown'}</Text>
      </View>
      {tab === 'pending' && (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#064e3b', borderColor: C.success }]}
            onPress={() => updateApp(item._id, 'approved')}
          >
            <Text style={[styles.actionText, { color: '#6ee7b7' }]}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#7f1d1d', borderColor: C.danger }]}
            onPress={() => updateApp(item._id, 'rejected')}
          >
            <Text style={[styles.actionText, { color: '#fca5a5' }]}>✗ Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applications</Text>
      </View>

      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={i => i._id}
          renderItem={renderApp}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={C.accent}
            />
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === 'pending' ? 'Koi pending application nahi hai 🎉' : `Koi ${tab} application nahi`}
            </Text>
          }
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
  tabBar: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12,
    backgroundColor: C.card, borderRadius: 10, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 7, alignItems: 'center' },
  tabActive: { backgroundColor: C.accent },
  tabText: { fontSize: 13, color: C.muted, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  card: {
    backgroundColor: C.card, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: C.border,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#2e1f5e',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: C.accent, fontWeight: '700', fontSize: 14 },
  name: { fontSize: 14, fontWeight: '600', color: C.text },
  sub: { fontSize: 12, color: C.muted, marginTop: 1 },
  campaignRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  campaignLabel: { fontSize: 12, color: C.muted, marginRight: 6 },
  campaignName: { fontSize: 13, color: C.text, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 0.5,
    alignItems: 'center',
  },
  actionText: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40, lineHeight: 24 },
});