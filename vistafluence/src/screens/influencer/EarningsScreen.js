import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Premium Gold Theme
const T = {
  black: '#0A0A0A',
  cardBg: '#121212',
  gold: '#E8C87A',
  goldMuted: 'rgba(232, 200, 122, 0.15)',
  white: '#FFFFFF',
  muted: '#8E8E8E',
  border: 'rgba(255,255,255,0.08)',
  green: '#4ade80',
  orange: '#fb923c',
};

const TRANSACTIONS = [
  { id: '1', brand: 'Nike India', campaign: 'Summer Run Challenge', amount: '₹15,000', date: '10 May 2026', status: 'Paid' },
  { id: '2', brand: 'Boat Audio', campaign: 'Unboxing Series', amount: '₹8,000', date: '5 May 2026', status: 'Paid' },
  { id: '3', brand: 'Mamaearth', campaign: 'Skincare Routine', amount: '₹12,000', date: '1 May 2026', status: 'Pending' },
  { id: '4', brand: 'Swiggy', campaign: 'Food Review', amount: '₹5,000', date: '28 Apr 2026', status: 'Processing' },
];

export default function EarningsScreen() {
  const total = '₹40,000';
  const pending = '₹17,000';
  const withdrawn = '₹23,000';

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>MY <Text style={{ color: T.gold }}>FINANCES</Text></Text>
          <Text style={s.subtitle}>Track your campaign revenues</Text>
        </View>

        {/* Main Wallet Card */}
        <View style={s.walletCard}>
          <Text style={s.walletLabel}>Available to Withdraw</Text>
          <Text style={s.walletAmount}>{withdrawn}</Text>
          <View style={s.walletDivider} />
          <TouchableOpacity style={s.withdrawBtn} activeOpacity={0.8}>
            <Text style={s.withdrawText}>Withdraw to Bank</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Row */}
        <View style={s.row}>
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>Total Earned</Text>
            <Text style={[s.miniValue, { color: T.green }]}>{total}</Text>
          </View>
          <View style={s.miniCard}>
            <Text style={s.miniLabel}>In Review</Text>
            <Text style={[s.miniValue, { color: T.orange }]}>{pending}</Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Transaction History</Text>
          <TouchableOpacity><Text style={s.viewAll}>View All</Text></TouchableOpacity>
        </View>

        {TRANSACTIONS.map((t) => (
          <View key={t.id} style={s.txCard}>
            <View style={s.brandCircle}>
              <Text style={s.brandInitial}>{t.brand[0]}</Text>
            </View>
            
            <View style={s.txInfo}>
              <Text style={s.txBrand}>{t.brand}</Text>
              <Text style={s.txCampaign} numberOfLines={1}>{t.campaign}</Text>
              <Text style={s.txDate}>{t.date}</Text>
            </View>

            <View style={s.txRight}>
              <Text style={s.txAmount}>{t.amount}</Text>
              <View style={[s.statusBadge, { backgroundColor: getStatusBg(t.status) }]}>
                <Text style={[s.statusText, { color: getStatusColor(t.status) }]}>{t.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for dynamic styling
const getStatusBg = (status) => {
  if (status === 'Paid') return 'rgba(74, 222, 128, 0.1)';
  if (status === 'Pending') return 'rgba(251, 146, 60, 0.1)';
  return 'rgba(96, 165, 250, 0.1)';
};

const getStatusColor = (status) => {
  if (status === 'Paid') return T.green;
  if (status === 'Pending') return T.orange;
  return '#60a5fa';
};

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: T.black },
  container: { flex: 1, paddingHorizontal: 20 },
  
  header: { marginTop: 20, marginBottom: 25 },
  title: { fontSize: 26, fontWeight: '900', color: T.white, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: T.muted, marginTop: 4 },

  walletCard: { 
    backgroundColor: T.cardBg, borderRadius: 24, padding: 25, 
    borderWidth: 1, borderColor: T.border, marginBottom: 20,
    alignItems: 'center', shadowColor: T.gold, shadowOpacity: 0.05, shadowRadius: 15
  },
  walletLabel: { color: T.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  walletAmount: { color: T.gold, fontSize: 42, fontWeight: '900', marginVertical: 10 },
  walletDivider: { width: '100%', height: 1, backgroundColor: T.border, marginVertical: 15 },
  withdrawBtn: { backgroundColor: T.white, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  withdrawText: { color: T.black, fontWeight: '800', fontSize: 14 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 30 },
  miniCard: { 
    flex: 1, backgroundColor: T.cardBg, padding: 18, borderRadius: 20, 
    borderWidth: 1, borderColor: T.border 
  },
  miniLabel: { color: T.muted, fontSize: 10, fontWeight: '700', marginBottom: 5 },
  miniValue: { fontSize: 20, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: T.white },
  viewAll: { color: T.gold, fontSize: 12, fontWeight: '700' },

  txCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: T.cardBg, 
    padding: 15, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: T.border 
  },
  brandCircle: { 
    width: 45, height: 45, borderRadius: 15, backgroundColor: '#1A1A1A', 
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: T.border 
  },
  brandInitial: { color: T.gold, fontSize: 18, fontWeight: '900' },
  txInfo: { flex: 1, marginLeft: 15 },
  txBrand: { color: T.white, fontSize: 15, fontWeight: '700' },
  txCampaign: { color: T.muted, fontSize: 12, marginTop: 2 },
  txDate: { color: 'rgba(142, 142, 142, 0.5)', fontSize: 10, marginTop: 4 },
  
  txRight: { alignItems: 'flex-end' },
  txAmount: { color: T.white, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
});