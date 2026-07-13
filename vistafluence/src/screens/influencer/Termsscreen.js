import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const LAST_UPDATED = 'January 1, 2025'; // 🔁 Update date

const TERMS = [
  {
    title: '1. Acceptance of Terms',
    content:
      'ColabX app use karke aap in Terms & Conditions se agree karte ho. Agar aap agree nahi karte, toh please app use mat karo. Hum kabhi bhi in terms ko update kar sakte hain — continued use matlab acceptance hai.',
  },
  {
    title: '2. Eligibility',
    content:
      'App use karne ke liye aapki age 18+ honi chahiye. Agar aap kisi brand ya organization ki taraf se register kar rahe ho, toh aapko unhe legally represent karne ka adhikar hona chahiye.',
  },
  {
    title: '3. Account Responsibility',
    content:
      'Aap apne account aur password ke liye khud zimmedaar ho. Apna password kisi ke saath share mat karo. Suspicious activity notice ho toh turant humse contact karo.',
  },
  {
    title: '4. Content Guidelines',
    content:
      'Aap sirf wo content post kar sakte ho jo aapka khud ka ho ya jinke liye aapke paas rights hain. Hateful, abusive, misleading ya illegal content strictly prohibited hai. Hum aisa content remove karne ka adhikar rakhte hain.',
  },
  {
    title: '5. Collaboration Rules',
    content:
      'Brands aur influencers ke beech jo bhi agreement hogi, wo direct unke beech hogi. ColabX sirf platform provide karta hai. Hum kisi bhi third-party disputes ke liye responsible nahi hain.',
  },
  {
    title: '6. Payments & Fees',
    content:
      'Platform fees clearly campaigns mein mentioned honge. Payments influencers ko directly brands se milenge. ColabX payment disputes ke liye liable nahi hai — yeh parties ke beech ka matter hai.',
  },
  {
    title: '7. Privacy',
    content:
      'Aapka data humare Privacy Policy ke according handle hoga. Hum aapka data third parties ko bina permission ke sell nahi karte. App use karke aap humare data practices se agree karte ho.',
  },
  {
    title: '8. Intellectual Property',
    content:
      'ColabX ka logo, design, aur code humaari intellectual property hai. Creators apne content ke rights apne paas rakhte hain, lekin platform ko display rights de dete hain.',
  },
  {
    title: '9. Termination',
    content:
      'Hum kisi bhi account ko bina notice ke terminate kar sakte hain agar Terms violate ho rahe hon. Aap bhi kabhi bhi account delete kar sakte ho — support se contact karo.',
  },
  {
    title: '10. Governing Law',
    content:
      'Yeh Terms Indian law ke under governed hain. Koi bhi dispute Delhi courts ke jurisdiction mein resolve hoga.',
  },
];

export default function TermsScreen({ navigation }) {
  const { G } = useTheme();
  const s = makeStyles(G);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* Hero */}
        <View style={s.heroCard}>
          <Text style={{ fontSize: 36, marginBottom: 10 }}>📄</Text>
          <Text style={s.heroTitle}>Terms & Conditions</Text>
          <Text style={s.heroSub}>Last updated: {LAST_UPDATED}</Text>
          <Text style={s.heroDesc}>
            Please in terms ko dhyan se padho. App use karke aap in sabse agree karte ho.
          </Text>
        </View>

        {/* Terms Sections */}
        {TERMS.map((section, i) => (
          <View key={i} style={s.termCard}>
            <Text style={s.termTitle}>{section.title}</Text>
            <Text style={s.termContent}>{section.content}</Text>
          </View>
        ))}

        {/* Contact Note */}
        <View style={s.noteCard}>
          <Text style={s.noteTitle}>📬 Questions hain?</Text>
          <Text style={s.noteText}>
            Agar in terms ke baare mein koi sawaal ho toh humse contact karo:{'\n'}
            <Text style={{ color: G.gold }}>legal@yourapp.com</Text>
          </Text>
        </View>

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
  heroCard:    { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, padding: 24, alignItems: 'center', marginBottom: 16 },
  heroTitle:   { fontSize: 20, fontWeight: '900', color: G.gold },
  heroSub:     { fontSize: 11, color: G.textSub, marginTop: 4 },
  heroDesc:    { fontSize: 12, color: G.textSub, textAlign: 'center', lineHeight: 18, marginTop: 10 },
  termCard:    { backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.borderAlt, padding: 16, marginBottom: 10 },
  termTitle:   { fontSize: 13, fontWeight: '800', color: G.gold, marginBottom: 8 },
  termContent: { fontSize: 13, color: G.textSub, lineHeight: 21 },
  noteCard:    { backgroundColor: G.goldFaint, borderRadius: 14, borderWidth: 1, borderColor: G.border, padding: 18, marginTop: 6 },
  noteTitle:   { fontSize: 14, fontWeight: '700', color: G.gold, marginBottom: 8 },
  noteText:    { fontSize: 13, color: G.textSub, lineHeight: 20 },
});