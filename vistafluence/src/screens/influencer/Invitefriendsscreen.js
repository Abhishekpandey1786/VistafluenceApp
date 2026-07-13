import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share, Clipboard, Alert,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const APP_LINK = 'https://yourapp.page.link/invite'; // 🔁 Replace with your real link
const INVITE_MESSAGE = `🚀 Join me on *ColabX* — India's top influencer-brand collaboration platform!\n\nDownload now: ${APP_LINK}`;

export default function InviteFriendsScreen({ navigation }) {
  const { G } = useTheme();
  const [copied, setCopied] = useState(false);
  const s = makeStyles(G);

  const handleShare = async () => {
    try {
      await Share.share({
        message: INVITE_MESSAGE,
        title: 'Invite Friends to ColabX',
      });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(APP_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const SHARE_OPTIONS = [
    { icon: '💬', label: 'WhatsApp',   color: '#25D366', onPress: handleShare },
    { icon: '📸', label: 'Instagram',  color: '#E1306C', onPress: handleShare },
    { icon: '🐦', label: 'Twitter / X',color: '#1DA1F2', onPress: handleShare },
    { icon: '📘', label: 'Facebook',   color: '#1877F2', onPress: handleShare },
    { icon: '✉️', label: 'Email',      color: G.gold,    onPress: handleShare },
    { icon: '📤', label: 'More...',    color: G.textSub, onPress: handleShare },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Invite Friends</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* Hero Card */}
        <View style={s.heroCard}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🎁</Text>
          <Text style={s.heroTitle}>Invite & Earn</Text>
          <Text style={s.heroSub}>
            Apne dosto ko ColabX pe invite karo aur dono ko{' '}
            <Text style={{ color: G.gold, fontWeight: '700' }}>exclusive perks</Text> milenge!
          </Text>
        </View>

        {/* Referral Link */}
        <Text style={s.sectionLabel}>YOUR INVITE LINK</Text>
        <View style={s.linkCard}>
          <Text style={s.linkText} numberOfLines={1}>{APP_LINK}</Text>
          <TouchableOpacity style={[s.copyBtn, copied && s.copiedBtn]} onPress={handleCopy}>
            <Text style={[s.copyTxt, copied && { color: G.green }]}>
              {copied ? '✓ Copied!' : '📋 Copy'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share Buttons */}
        <Text style={s.sectionLabel}>SHARE VIA</Text>
        <View style={s.shareGrid}>
          {SHARE_OPTIONS.map((opt, i) => (
            <TouchableOpacity key={i} style={s.shareBtn} onPress={opt.onPress} activeOpacity={0.75}>
              <View style={[s.shareBtnIcon, { backgroundColor: opt.color + '20' }]}>
                <Text style={{ fontSize: 22 }}>{opt.icon}</Text>
              </View>
              <Text style={s.shareBtnLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Big Share Button */}
        <TouchableOpacity style={s.bigShareBtn} onPress={handleShare} activeOpacity={0.85}>
          <Text style={s.bigShareTxt}>📤   Share Now</Text>
        </TouchableOpacity>

        {/* Steps */}
        <Text style={s.sectionLabel}>HOW IT WORKS</Text>
        <View style={s.stepsCard}>
          {[
            { step: '1', text: 'Apna invite link share karo dosto ke saath' },
            { step: '2', text: 'Dost ColabX join kare aur profile complete kare' },
            { step: '3', text: 'Dono ko special rewards mile automatically!' },
          ].map((item) => (
            <View key={item.step} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={{ color: G.gold, fontWeight: '900', fontSize: 13 }}>{item.step}</Text>
              </View>
              <Text style={s.stepText}>{item.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (G) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: G.bg },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  backBtn:      { width: 40, height: 40, justifyContent: 'center' },
  backIcon:     { fontSize: 20, color: G.gold },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: G.text },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: G.goldDim, letterSpacing: 1.5, marginBottom: 10, marginTop: 20 },
  heroCard:     { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, padding: 28, alignItems: 'center', marginBottom: 8 },
  heroTitle:    { fontSize: 24, fontWeight: '900', color: G.gold, marginBottom: 8 },
  heroSub:      { fontSize: 14, color: G.textSub, textAlign: 'center', lineHeight: 22 },
  linkCard:     { backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.border, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, overflow: 'hidden' },
  linkText:     { flex: 1, color: G.textSub, fontSize: 13 },
  copyBtn:      { backgroundColor: G.goldFaint, paddingHorizontal: 16, paddingVertical: 14, borderLeftWidth: 1, borderLeftColor: G.border },
  copiedBtn:    { backgroundColor: 'rgba(34,197,94,0.12)' },
  copyTxt:      { color: G.gold, fontWeight: '700', fontSize: 13 },
  shareGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  shareBtn:     { width: '30%', alignItems: 'center', backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.borderAlt, paddingVertical: 14, gap: 8 },
  shareBtnIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  shareBtnLabel:{ fontSize: 11, color: G.textSub, fontWeight: '600' },
  bigShareBtn:  { backgroundColor: G.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  bigShareTxt:  { color: G.bg, fontWeight: '900', fontSize: 16 },
  stepsCard:    { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, padding: 16, gap: 16 },
  stepRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepNum:      { width: 30, height: 30, borderRadius: 15, backgroundColor: G.goldFaint, borderWidth: 1, borderColor: G.border, justifyContent: 'center', alignItems: 'center' },
  stepText:     { flex: 1, color: G.textSub, fontSize: 13, lineHeight: 20, paddingTop: 5 },
});