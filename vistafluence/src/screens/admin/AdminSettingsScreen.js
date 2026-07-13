import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  danger: '#ef4444',
};

function SettingRow({ label, value, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.rowLabel, danger && { color: C.danger }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </TouchableOpacity>
  );
}

export default function AdminSettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Kya aap sure hain?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SA</Text>
        </View>
        <View>
          <Text style={styles.profileName}>{user?.name || 'Super Admin'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Admin</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.card}>
        <SettingRow label="Email" value={user?.email} />
        <SettingRow label="Role" value="Super Admin" />
        <SettingRow label="Password Change" onPress={() => Alert.alert('Coming soon')} />
      </View>
      <Text style={styles.sectionLabel}>Platform</Text>
      <View style={styles.card}>
        <SettingRow label="Platform Commission" value="10%" onPress={() => Alert.alert('Coming soon')} />
        <SettingRow label="Min Campaign Budget" value="₹5,000" onPress={() => Alert.alert('Coming soon')} />
        <SettingRow label="Notifications" onPress={() => Alert.alert('Coming soon')} />
      </View>
      <Text style={styles.sectionLabel}>Account</Text>
      <View style={styles.card}>
        <SettingRow label="Logout" danger onPress={handleLogout} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '600', color: C.text },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, margin: 16, borderRadius: 14,
    padding: 16, borderWidth: 0.5, borderColor: C.border,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  profileName: { fontSize: 16, fontWeight: '600', color: C.text },
  profileEmail: { fontSize: 13, color: C.muted, marginTop: 2 },
  roleBadge: {
    backgroundColor: '#2e1f5e', borderRadius: 6, paddingHorizontal: 8,
    paddingVertical: 2, marginTop: 6, alignSelf: 'flex-start',
  },
  roleBadgeText: { color: '#c4b5fd', fontSize: 11, fontWeight: '600' },
  sectionLabel: {
    fontSize: 12, color: C.muted, textTransform: 'uppercase',
    letterSpacing: 0.8, paddingHorizontal: 20, marginBottom: 6, marginTop: 8,
  },
  card: {
    backgroundColor: C.card, marginHorizontal: 16, borderRadius: 12,
    borderWidth: 0.5, borderColor: C.border, marginBottom: 4,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 0.5, borderBottomColor: C.border,
  },
  rowLabel: { flex: 1, fontSize: 14, color: C.text },
  rowValue: { fontSize: 14, color: C.muted, marginRight: 8 },
  chevron: { fontSize: 20, color: C.muted },
});