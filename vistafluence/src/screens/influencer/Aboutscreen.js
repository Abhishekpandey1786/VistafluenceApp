import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const APP_VERSION    = '1.0.0';
const BUILD_NUMBER   = '100';
const WEBSITE_URL    = 'https://yourapp.com';       // 🔁 Replace
const PRIVACY_URL    = 'https://yourapp.com/privacy'; // 🔁 Replace
const INSTAGRAM_URL  = 'https://instagram.com/yourapp'; // 🔁 Replace

export default function AboutScreen({ navigation }) {
  const { G } = useTheme();
  const s = makeStyles(G);

  const openLink = (url) => Linking.openURL(url).catch(() => {});

  const INFO_ROWS = [
    { label: 'App Name',      val: 'ColabX' },      // 🔁 Replace with your app name
    { label: 'Version',       val: APP_VERSION },
    { label: 'Build',         val: BUILD_NUMBER },
    { label: 'Platform',      val: 'React Native (Expo)' },
    { label: 'Made with ❤️',  val: 'India 🇮🇳' },
  ];

  const LINKS = [
    { icon: '🌐', label: 'Visit Website',    onPress: () => openLink(WEBSITE_URL) },
    { icon: '🔒', label: 'Privacy Policy',   onPress: () => openLink(PRIVACY_URL) },
    { icon: '📸', label: 'Follow on Instagram', onPress: () => openLink(INSTAGRAM_URL) },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* Logo / Brand Card */}
        <View style={s.brandCard}>
          <View style={s.logoBox}>
            <Text style={{ fontSize: 40 }}>🤝</Text>
          </View>
          <Text style={s.appName}>ColabX</Text>
          <Text style={s.tagline}>India's Premium Influencer–Brand Platform</Text>
          <View style={s.versionBadge}>
            <Text style={s.versionBadgeTxt}>v{APP_VERSION}</Text>
          </View>
        </View>

        {/* App Info */}
        <Text style={s.sectionLabel}>APP INFO</Text>
        <View style={s.infoCard}>
          {INFO_ROWS.map((row, i) => (
            <View key={i} style={[s.infoRow, i < INFO_ROWS.length - 1 && s.rowBorder]}>
              <Text style={s.infoLabel}>{row.label}</Text>
              <Text style={s.infoVal}>{row.val}</Text>
            </View>
          ))}
        </View>

        {/* What is this app */}
        <Text style={s.sectionLabel}>ABOUT THE APP</Text>
        <View style={s.descCard}>
          <Text style={s.descText}>
            <Text style={{ color: G.gold, fontWeight: '700' }}>ColabX</Text> ek premium platform hai jo{' '}
            <Text style={{ color: G.text, fontWeight: '600' }}>influencers aur brands</Text> ko
            directly connect karta hai — bina kisi middleman ke.{'\n\n'}
            Creators apna portfolio showcase kar sakte hain, aur brands apne campaigns ke liye
            perfect influencers dhundh sakte hain.{'\n\n'}
            Hum believe karte hain ki{' '}
            <Text style={{ color: G.gold, fontWeight: '600' }}>authentic collaborations</Text>{' '}
            se hi real growth hoti hai. 🚀
          </Text>
        </View>

        {/* Links */}
        <Text style={s.sectionLabel}>LINKS</Text>
        <View style={s.linksCard}>
          {LINKS.map((link, i) => (
            <TouchableOpacity
              key={i}
              style={[s.linkRow, i < LINKS.length - 1 && s.rowBorder]}
              onPress={link.onPress}
              activeOpacity={0.7}
            >
              <View style={s.linkIcon}>
                <Text style={{ fontSize: 16 }}>{link.icon}</Text>
              </View>
              <Text style={s.linkLabel}>{link.label}</Text>
              <Text style={{ color: G.gold, fontSize: 16 }}>↗</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <Text style={s.footerTxt}>
          © 2025 ColabX. All rights reserved.{'\n'}
          Made with ❤️ in India 🇮🇳
        </Text>

      </ScrollView>
    </View>
  );
}

const makeStyles = (G) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: G.bg },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  backBtn:        { width: 40, height: 40, justifyContent: 'center' },
  backIcon:       { fontSize: 20, color: G.gold },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: G.text },
  sectionLabel:   { fontSize: 10, fontWeight: '700', color: G.goldDim, letterSpacing: 1.5, marginBottom: 10, marginTop: 20 },
  brandCard:      { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, padding: 30, alignItems: 'center', marginBottom: 8 },
  logoBox:        { width: 80, height: 80, borderRadius: 22, backgroundColor: G.goldFaint, borderWidth: 2, borderColor: G.border, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  appName:        { fontSize: 26, fontWeight: '900', color: G.gold, letterSpacing: -0.5 },
  tagline:        { fontSize: 12, color: G.textSub, marginTop: 4, textAlign: 'center' },
  versionBadge:   { marginTop: 12, backgroundColor: G.goldFaint, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 14, paddingVertical: 4 },
  versionBadgeTxt:{ color: G.gold, fontSize: 12, fontWeight: '700' },
  infoCard:       { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, overflow: 'hidden' },
  infoRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  rowBorder:      { borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  infoLabel:      { fontSize: 13, color: G.textSub },
  infoVal:        { fontSize: 13, color: G.text, fontWeight: '600' },
  descCard:       { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, padding: 18 },
  descText:       { fontSize: 13, color: G.textSub, lineHeight: 22 },
  linksCard:      { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, overflow: 'hidden' },
  linkRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  linkIcon:       { width: 34, height: 34, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  linkLabel:      { flex: 1, fontSize: 14, color: G.text, fontWeight: '600' },
  footerTxt:      { textAlign: 'center', color: G.textSub, fontSize: 11, lineHeight: 18, marginTop: 30 },
});