import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../api/index';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6',
};

function StatCard({ label, value, color, sub }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color || C.accent }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: color || C.text }]}>{value ?? '—'}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Badge({ label, type }) {
  const colors = {
    active:     { bg: '#064e3b', text: '#6ee7b7' },
    pending:    { bg: '#78350f', text: '#fcd34d' },
    paused:     { bg: '#7f1d1d', text: '#fca5a5' },
    inactive:   { bg: '#1e293b', text: '#94a3b8' },
    approved:   { bg: '#064e3b', text: '#6ee7b7' },
    rejected:   { bg: '#7f1d1d', text: '#fca5a5' },
    influencer: { bg: '#1e3a5f', text: '#93c5fd' },
    brand:      { bg: '#2e1f5e', text: '#c4b5fd' },
  };
  const c = colors[type] || colors.inactive;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets(); // 👈 NAYA
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statsRes, usersRes, campRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=4'),
        api.get('/admin/campaigns?limit=4'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setRecentUsers(usersRes.users);
      if (campRes.success) setRecentCampaigns(campRes.campaigns);

    } catch (e) {
      console.error('Dashboard load error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      // 👇 FIXED — bottom me safe area + extra space taaki last card gesture-bar/nav-buttons ke peeche na chhupe
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
    >
      {/* 👇 FIXED — hardcoded paddingTop: 56 ki jagah safe area top inset use kiya */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Vistafluence</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>SA</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard label="Total Users"         value={stats?.totalUsers}        color={C.accent} />
        <StatCard label="Influencers"         value={stats?.totalInfluencers}  color={C.info} />
        <StatCard label="Brands"              value={stats?.totalBrands}       color={C.success} />
        <StatCard label="Active Campaigns"    value={stats?.activeCampaigns}   color={C.warning} />
        <StatCard label="Total Campaigns"     value={stats?.totalCampaigns}    color={C.info} />
        <StatCard
          label="Banned Users"
          value={stats?.bannedUsers}
          color={C.danger}
          sub={stats?.bannedUsers > 0 ? 'Needs review' : undefined}
        />
        <StatCard label="New Users (30 days)" value={stats?.newUsers}          color={C.success} />
        <StatCard label="Total Applications"  value={stats?.totalApplications} color={C.muted} />
      </View>

      <SectionCard title="Recent Users">
        {recentUsers.length === 0
          ? <Text style={styles.empty}>Koi user nahi</Text>
          : recentUsers.map(u => (
            <View key={u._id} style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(u.name || u.email)?.[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{u.name || 'No name'}</Text>
                <Text style={styles.rowSub}>{u.email}</Text>
              </View>
              <Badge label={u.role} type={u.role} />
            </View>
          ))
        }
      </SectionCard>

      <SectionCard title="Recent Campaigns">
        {recentCampaigns.length === 0
          ? <Text style={styles.empty}>Koi campaign nahi</Text>
          : recentCampaigns.map(c => (
            <View key={c._id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{c.title}</Text>
                <Text style={styles.rowSub}>
                  {c.brand?.companyName || c.brand?.name || 'Unknown brand'} • ₹{c.budget?.toLocaleString()}
                </Text>
              </View>
              <Badge label={c.status} type={c.status} />
            </View>
          ))
        }
      </SectionCard>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20,
    // 👇 paddingTop yahan se hata diya, ab inline style se dynamically aayega
  },
  headerTitle: { fontSize: 22, fontWeight: '600', color: C.text },
  headerSub:   { fontSize: 13, color: C.muted, marginTop: 2 },
  adminBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center',
  },
  adminBadgeText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  statsGrid:  { paddingHorizontal: 16, gap: 10 },
  statCard: {
    backgroundColor: C.card, borderRadius: 12, padding: 16,
    borderLeftWidth: 3, marginBottom: 2,
  },
  statLabel: { fontSize: 12, color: C.muted, marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: '700', color: C.text },
  statSub:   { fontSize: 11, color: C.danger, marginTop: 2 },
  sectionCard: {
    backgroundColor: C.card, borderRadius: 12,
    margin: 16, marginBottom: 0, padding: 16,
    borderWidth: 0.5, borderColor: C.border,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 14 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  avatar: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#2e1f5e',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: C.accent, fontWeight: '600', fontSize: 13 },
  rowName: { fontSize: 14, fontWeight: '500', color: C.text },
  rowSub:  { fontSize: 12, color: C.muted, marginTop: 1 },
  badge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  empty: { fontSize: 13, color: C.muted, textAlign: 'center', paddingVertical: 12 },
});