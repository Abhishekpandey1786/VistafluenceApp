import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Linking, TextInput, Alert,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const SUPPORT_EMAIL = 'support@yourapp.com'; // 🔁 Replace

const FAQS = [
  {
    q: 'Profile update kyun nahi ho raha?',
    a: 'Apna internet connection check karo. Agar problem bani rahe toh app restart karo ya support ko contact karo.',
  },
  {
    q: 'Brand ko collaborate kaise karu?',
    a: 'Campaign page pe jao, koi bhi campaign dhundho aur "Apply" button dabao. Brand ko notification milega aur wo review karega.',
  },
  {
    q: 'Payment kab milega?',
    a: 'Campaign complete hone ke 7-10 working days ke andar payment process hota hai. Bank details profile mein update karo.',
  },
  {
    q: 'Kya main multiple platforms link kar sakta hoon?',
    a: 'Haan! Edit Profile mein jao aur Instagram, YouTube, TikTok, Twitter, LinkedIn, Facebook — sab link kar sakte ho.',
  },
  {
    q: 'Account delete kaise karo?',
    a: 'Account delete karne ke liye support@yourapp.com pe email karo. 24 hours mein process ho jayega.',
  },
  {
    q: 'Password bhool gaya toh kya karu?',
    a: 'Login screen pe "Forgot Password" option hai. Email pe OTP aayega, usse password reset karo.',
  },
  {
    q: 'App crash ho raha hai, kya karu?',
    a: 'App ko force close karke reopen karo. Agar problem continue rahe toh phone storage check karo ya app reinstall karo.',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const { G } = useTheme();
  const [openFaq, setOpenFaq]   = useState(null);
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const s = makeStyles(G);

  const sendEmail = () => {
    const subject = encodeURIComponent('ColabX App Support Request');
    const body    = encodeURIComponent(message || 'Hi, I need help with...');
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(`Hi ColabX Support,\n\n${message || 'I need help with...'}`);
    Linking.openURL(`https://wa.me/919999999999?text=${text}`); // 🔁 Replace with your WhatsApp number
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* Hero */}
        <View style={s.heroCard}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>🛟</Text>
          <Text style={s.heroTitle}>Hum Yahan Hain!</Text>
          <Text style={s.heroSub}>Koi bhi problem ho, hum help karne ke liye ready hain. Neeche FAQ dekho ya directly contact karo.</Text>
        </View>

        {/* Quick Contact Buttons */}
        <Text style={s.sectionLabel}>QUICK CONTACT</Text>
        <View style={s.contactRow}>
          <TouchableOpacity style={[s.contactBtn, { borderColor: '#25D366' }]} onPress={sendWhatsApp} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>💬</Text>
            <Text style={[s.contactBtnTxt, { color: '#25D366' }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.contactBtn, { borderColor: G.gold }]} onPress={sendEmail} activeOpacity={0.8}>
            <Text style={{ fontSize: 20 }}>✉️</Text>
            <Text style={[s.contactBtnTxt, { color: G.gold }]}>Email Us</Text>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <Text style={s.sectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
        <View style={s.faqCard}>
          {FAQS.map((faq, i) => (
            <View key={i}>
              {i > 0 && <View style={{ height: 1, backgroundColor: G.borderAlt }} />}
              <TouchableOpacity
                style={s.faqHeader}
                onPress={() => setOpenFaq(openFaq === i ? null : i)}
                activeOpacity={0.7}
              >
                <Text style={s.faqQ}>{faq.q}</Text>
                <Text style={[s.faqArrow, openFaq === i && { transform: [{ rotate: '90deg' }] }]}>›</Text>
              </TouchableOpacity>
              {openFaq === i && (
                <View style={s.faqBody}>
                  <Text style={s.faqA}>{faq.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Message Form */}
        <Text style={s.sectionLabel}>SEND A MESSAGE</Text>
        <View style={s.messageCard}>
          <Text style={s.messageLabel}>Apni problem describe karo</Text>
          <TextInput
            style={s.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Yahan apni problem likhो..."
            placeholderTextColor={G.textSub}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={s.messageBtns}>
            <TouchableOpacity style={s.msgBtn} onPress={sendWhatsApp} activeOpacity={0.8}>
              <Text style={s.msgBtnTxt}>💬 WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.msgBtn, { backgroundColor: G.gold }]} onPress={sendEmail} activeOpacity={0.8}>
              <Text style={[s.msgBtnTxt, { color: G.bg }]}>✉️ Email Karo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Email Display */}
        <View style={s.emailNote}>
          <Text style={{ fontSize: 14 }}>📧</Text>
          <Text style={s.emailNoteText}>
            Direct email: <Text style={{ color: G.gold }}>{SUPPORT_EMAIL}</Text>
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (G) => StyleSheet.create({
  container:     { flex: 1, backgroundColor: G.bg },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  backBtn:       { width: 40, height: 40, justifyContent: 'center' },
  backIcon:      { fontSize: 20, color: G.gold },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: G.text },
  sectionLabel:  { fontSize: 10, fontWeight: '700', color: G.goldDim, letterSpacing: 1.5, marginBottom: 10, marginTop: 20 },
  heroCard:      { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, padding: 26, alignItems: 'center', marginBottom: 8 },
  heroTitle:     { fontSize: 22, fontWeight: '900', color: G.gold, marginBottom: 6 },
  heroSub:       { fontSize: 13, color: G.textSub, textAlign: 'center', lineHeight: 20 },
  contactRow:    { flexDirection: 'row', gap: 12 },
  contactBtn:    { flex: 1, backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: 'center', gap: 8 },
  contactBtnTxt: { fontWeight: '700', fontSize: 14 },
  faqCard:       { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, overflow: 'hidden' },
  faqHeader:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 10 },
  faqQ:          { flex: 1, fontSize: 13, color: G.text, fontWeight: '600', lineHeight: 20 },
  faqArrow:      { fontSize: 20, color: G.gold },
  faqBody:       { paddingHorizontal: 16, paddingBottom: 14 },
  faqA:          { fontSize: 13, color: G.textSub, lineHeight: 20 },
  messageCard:   { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, padding: 16 },
  messageLabel:  { fontSize: 12, color: G.gold, fontWeight: '600', marginBottom: 10 },
  messageInput:  { backgroundColor: G.bgInput, borderRadius: 12, borderWidth: 1, borderColor: G.border, padding: 14, color: G.text, fontSize: 13, minHeight: 100 },
  messageBtns:   { flexDirection: 'row', gap: 10, marginTop: 12 },
  msgBtn:        { flex: 1, backgroundColor: G.bgInput, borderRadius: 12, borderWidth: 1, borderColor: G.border, paddingVertical: 13, alignItems: 'center' },
  msgBtnTxt:     { color: G.text, fontWeight: '700', fontSize: 13 },
  emailNote:     { flexDirection: 'row', gap: 10, backgroundColor: G.bgCard, borderRadius: 12, borderWidth: 1, borderColor: G.borderAlt, padding: 14, marginTop: 4, alignItems: 'center' },
  emailNoteText: { fontSize: 13, color: G.textSub },
});