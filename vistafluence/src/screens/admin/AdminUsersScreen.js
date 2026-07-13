import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../../api/index';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  success: '#10b981', danger: '#ef4444',
};

const FILTERS = ['all', 'influencer', 'brand'];

function Badge({ type }) {
  const map = {
    influencer: { bg: '#1e3a5f', text: '#93c5fd', label: 'Influencer' },
    brand:      { bg: '#2e1f5e', text: '#c4b5fd', label: 'Brand' },
    active:     { bg: '#064e3b', text: '#6ee7b7', label: 'Active' },
    banned:     { bg: '#7f1d1d', text: '#fca5a5', label: 'Banned' },
  };
  const c = map[type] || map.active;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (reset = false) => {
    // ✅ hasMore check: reset=true ho toh bypass karo
    if (!hasMore && !reset) return;
    try {
      const pg = reset ? 1 : page;
      const params = new URLSearchParams({ page: pg, limit: 15 });
      if (filter !== 'all') params.append('role', filter);
      if (search) params.append('search', search);

      // ✅ api.js khud token attach karta hai — headers manually mat do
      const res = await api.get(`/admin/users?${params}`);

      // ✅ fetch-based api.js seedha JSON return karta hai — res.data nahi, res directly
      if (res.success) {
        setUsers(reset ? res.users : prev => [...prev, ...res.users]);
        setHasMore(pg < res.pages);
        setPage(pg + 1);
      }
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, search, page, hasMore]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoading(true);
    load(true);
  }, [filter, search]);

  // ✅ Backend routes: PUT /admin/users/:id/ban  aur  PUT /admin/users/:id/unban
  // Pehle galat tha: api.patch('/admin/users/:id/status') — ye route exist nahi karta
  const banUser = (userId, currentStatus) => {
    const isBanned = currentStatus === 'banned';
    Alert.alert(
      isBanned ? 'User Unban Karo' : 'User Ban Karo',
      'Kya aap sure hain?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isBanned) {
                await api.put(`/admin/users/${userId}/unban`, {});
              } else {
                await api.put(`/admin/users/${userId}/ban`, { reason: 'Admin action' });
              }
              setUsers(prev =>
                prev.map(u =>
                  u._id === userId ? { ...u, status: isBanned ? 'active' : 'banned', isBanned: !isBanned } : u
                )
              );
              Alert.alert('Success', `User ${isBanned ? 'Unbanned' : 'Banned'} successfully`);
            } catch (e) {
              Alert.alert('Error', e.message || 'Kuch galat hua');
            }
          },
        },
      ]
    );
  };

  const deleteUser = (userId) => {
    Alert.alert('User Delete Karo', 'Yeh action undo nahi hoga!', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            // ✅ api.delete — pehle api.js mein ye method missing tha
            await api.delete(`/admin/users/${userId}`);
            setUsers(prev => prev.filter(u => u._id !== userId));
          } catch (e) {
            Alert.alert('Error', e.message || 'Kuch galat hua');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }) => {
    // ✅ Backend isBanned field use karta hai, status field nahi — dono check karo
    const isBanned = item.isBanned || item.status === 'banned';
    return (
      <View style={styles.userCard}>
        <View style={styles.userTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.name || item.email)?.[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.name || 'No name'}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
          <Badge type={item.role} />
        </View>
        <View style={styles.userBottom}>
          <Badge type={isBanned ? 'banned' : 'active'} />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: isBanned ? C.success : C.danger }]}
              onPress={() => banUser(item._id, isBanned ? 'banned' : 'active')}
            >
              <Text style={[styles.actionText, { color: isBanned ? C.success : C.danger }]}>
                {isBanned ? 'Unban' : 'Ban'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: C.danger }]}
              onPress={() => deleteUser(item._id)}
            >
              <Text style={[styles.actionText, { color: C.danger }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Naam ya email se dhundo..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'Sab' : f === 'influencer' ? 'Influencers' : 'Brands'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={C.accent} /></View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={i => i._id}
          renderItem={renderUser}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); setPage(1); setHasMore(true); load(true); }}
              tintColor={C.accent}
            />
          }
          onEndReached={() => load()}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={<Text style={styles.empty}>Koi user nahi mila</Text>}
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
  searchBox: {
    marginHorizontal: 16, marginBottom: 10,
    backgroundColor: C.card, borderRadius: 10,
    borderWidth: 0.5, borderColor: C.border,
  },
  searchInput: { color: C.text, padding: 12, fontSize: 14 },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    borderWidth: 0.5, borderColor: C.border, backgroundColor: C.card,
  },
  filterBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
  filterText: { color: C.muted, fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: '500' },
  userCard: {
    backgroundColor: C.card, borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: C.border,
  },
  userTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#2e1f5e',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: C.accent, fontWeight: '700', fontSize: 14 },
  userName: { fontSize: 14, fontWeight: '600', color: C.text },
  userEmail: { fontSize: 12, color: C.muted, marginTop: 1 },
  userBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 6, borderWidth: 0.5 },
  actionText: { fontSize: 12, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { textAlign: 'center', color: C.muted, marginTop: 40 },
});