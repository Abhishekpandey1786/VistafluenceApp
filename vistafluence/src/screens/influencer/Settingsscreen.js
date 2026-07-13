import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { G } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  const ITEMS = [
    {
      icon: '📤',
      label: 'Invite Friends',
      sub: 'Share app with your network',
      onPress: () => navigation.navigate('InviteFriends'),
    },
    {
      icon: '🌙',
      label: 'Dark Mode',
      sub: 'Toggle app appearance',
      onPress: () => navigation.navigate('DarkMode'),
    },
    {
      icon: 'ℹ️',
      label: 'About',
      sub: 'App version & info',
      onPress: () => navigation.navigate('About'),
    },
    {
      icon: '❓',
      label: 'Help & Support',
      sub: 'FAQs & contact us',
      onPress: () => navigation.navigate('HelpSupport'),
    },
    {
      icon: '📄',
      label: 'Terms & Conditions',
      sub: 'Read our terms',
      onPress: () => navigation.navigate('Terms'),
    },
    {
      icon: '⚠️',
      label: 'Disclaimer',
      sub: 'Important disclaimers',
      onPress: () => navigation.navigate('Disclaimer'),
    },
  ];

  const s = makeStyles(G);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Profile Section Label */}
        <Text style={s.sectionLabel}>PREFERENCES</Text>

        <View style={s.group}>
          {ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.row, i < ITEMS.length - 1 && s.rowBorder]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={s.iconWrap}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{item.label}</Text>
                <Text style={s.rowSub}>{item.sub}</Text>
              </View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <Text style={s.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity style={s.logoutRow} onPress={handleLogout} activeOpacity={0.8}>
          <View style={[s.iconWrap, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.logoutLabel}>Logout</Text>
            <Text style={s.rowSub}>Sign out of your account</Text>
          </View>
        </TouchableOpacity>

        {/* Version */}
        <Text style={s.versionTxt}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (G) => StyleSheet.create({
  container:   { flex: 1, backgroundColor: G.bg },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  backIcon:    { fontSize: 20, color: G.gold },
  headerTitle: { fontSize: 18, fontWeight: '700', color: G.text },
  sectionLabel:{ fontSize: 10, fontWeight: '700', color: G.goldDim, letterSpacing: 1.5, marginLeft: 20, marginTop: 24, marginBottom: 8 },
  group:       { backgroundColor: G.bgCard, marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, overflow: 'hidden' },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  rowBorder:   { borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  iconWrap:    { width: 38, height: 38, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  rowLabel:    { fontSize: 15, color: G.text, fontWeight: '600' },
  rowSub:      { fontSize: 11, color: G.textSub, marginTop: 1 },
  arrow:       { fontSize: 20, color: G.textSub },
  logoutRow:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, backgroundColor: G.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', gap: 14 },
  logoutLabel: { fontSize: 15, fontWeight: '700', color: G.red },
  versionTxt:  { textAlign: 'center', color: G.textSub, fontSize: 12, marginTop: 32 },
});