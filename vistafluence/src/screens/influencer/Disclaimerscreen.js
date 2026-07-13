import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const DISCLAIMERS = [
  {
    icon: '💰',
    title: 'No Earnings Guarantee',
    content:
      'ColabX pe register karna ya profile banana koi income guarantee nahi karta. Collaborations aur earnings depend karte hain aapki performance, reach, aur brands ke decisions pe. Hum koi specific earnings ka promise nahi karte.',
  },
  {
    icon: '🤝',
    title: 'Third-Party Relationships',
    content:
      'ColabX sirf ek platform hai jo brands aur influencers ko connect karta hai. Hum kisi bhi deal, payment dispute, ya agreement ke liye directly responsible nahi hain. Yeh directly parties ke beech ka relationship hai.',
  },
  {
    icon: '📊',
    title: 'Accuracy of Information',
    content:
      'Platform pe jo bhi follower counts, engagement rates ya statistics dikh rahi hain, wo users khud provide karte hain. ColabX in numbers ki independently verify nahi karta. Please apni due diligence karo.',
  },
  {
    icon: '🔒',
    title: 'Data Security',
    content:
      'Hum aapka data secure rakhne ki poori koshish karte hain, lekin internet pe 100% security guarantee possible nahi hai. Sensitive financial information platform pe share mat karo.',
  },
  {
    icon: '⚖️',
    title: 'Legal Compliance',
    content:
      'Aap khud responsible ho apne content aur collaborations ke legal aspects ke liye — jaise ASCI guidelines, tax obligations, ya sponsored content disclosure. ColabX legal advice provide nahi karta.',
  },
  {
    icon: '🌐',
    title: 'External Links',
    content:
      'App mein jo external links hain (social media profiles, websites), unke content ke liye hum responsible nahi hain. Third-party sites ki privacy policies alag ho sakti hain.',
  },
  {
    icon: '🔄',
    title: 'Service Changes',
    content:
      'ColabX kabhi bhi apni features, pricing, ya services ko change ya discontinue kar sakta hai bina advance notice ke. Hum aise changes se hone wale losses ke liye liable nahi hain.',
  },
  {
    icon: '🧑‍⚖️',
    title: 'Limitation of Liability',
    content:
      'ColabX ka total liability kisi bhi circumstance mein aapke last 3 months ke subscription fees se zyada nahi hogi. Indirect ya consequential damages ke liye hum liable nahi hain.',
  },
];

export default function DisclaimerScreen({ navigation }) {
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
        <Text style={s.headerTitle}>Disclaimer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>

        {/* Warning Hero */}
        <View style={s.warningCard}>
          <Text style={{ fontSize: 40, marginBottom: 10 }}>⚠️</Text>
          <Text style={s.warningTitle}>Important Disclaimer</Text>
          <Text style={s.warningText}>
            App use karne se pehle please yeh disclaimer dhyan se padho. Isme important information hai jo
            aapke rights aur responsibilities explain karti hai.
          </Text>
        </View>

        {/* Disclaimer Items */}
        {DISCLAIMERS.map((item, i) => (
          <View key={i} style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.cardIcon}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
              </View>
              <Text style={s.cardTitle}>{item.title}</Text>
            </View>
            <Text style={s.cardContent}>{item.content}</Text>
          </View>
        ))}

        {/* Acknowledgement */}
        <View style={s.ackCard}>
          <Text style={s.ackTitle}>✅ Acknowledgement</Text>
          <Text style={s.ackText}>
            ColabX use karke aap confirm karte ho ki aapne yeh disclaimer padha aur samjha hai.
            Agar koi question ho toh{' '}
            <Text style={{ color: G.gold }}>legal@yourapp.com</Text>{' '}
            pe contact karo.
          </Text>
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
  warningCard:  { backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', padding: 24, alignItems: 'center', marginBottom: 16 },
  warningTitle: { fontSize: 20, fontWeight: '900', color: G.red, marginBottom: 8 },
  warningText:  { fontSize: 13, color: G.textSub, textAlign: 'center', lineHeight: 20 },
  card:         { backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.borderAlt, padding: 16, marginBottom: 10 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  cardIcon:     { width: 40, height: 40, borderRadius: 12, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  cardTitle:    { fontSize: 14, fontWeight: '800', color: G.text, flex: 1 },
  cardContent:  { fontSize: 13, color: G.textSub, lineHeight: 21 },
  ackCard:      { backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)', padding: 18, marginTop: 6 },
  ackTitle:     { fontSize: 14, fontWeight: '700', color: G.green, marginBottom: 8 },
  ackText:      { fontSize: 13, color: G.textSub, lineHeight: 20 },
});