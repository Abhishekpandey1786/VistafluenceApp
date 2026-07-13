import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const INVOICES = [
  { id: '1', campaign: 'Summer Run Challenge', influencer: 'Sneha Patel', amount: '₹15,000', date: '10 May 2026', status: 'Paid' },
  { id: '2', campaign: 'Unboxing Series', influencer: 'Rahul Verma', amount: '₹8,000', date: '5 May 2026', status: 'Paid' },
  { id: '3', campaign: 'Festive Offer Reel', influencer: 'Priya Sharma', amount: '₹20,000', date: 'Due 20 May', status: 'Due' },
];

export default function BillingScreen() {
  const handlePay = () => {
    // TODO: Razorpay integration
    Alert.alert('Opening Razorpay...', 'Payment gateway will open here.');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Billing & Payments 💳</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Spent This Month</Text>
        <Text style={styles.balanceVal}>₹43,000</Text>
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.subLabel}>Paid</Text>
            <Text style={[styles.subVal, { color: '#4ade80' }]}>₹23,000</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.subLabel}>Due</Text>
            <Text style={[styles.subVal, { color: '#f87171' }]}>₹20,000</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Invoices</Text>
      {INVOICES.map(inv => (
        <View key={inv.id} style={styles.invoiceCard}>
          <View style={styles.invoiceTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.invoiceCampaign}>{inv.campaign}</Text>
              <Text style={styles.invoiceInfluencer}>To: {inv.influencer}</Text>
              <Text style={styles.invoiceDate}>{inv.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Text style={styles.invoiceAmt}>{inv.amount}</Text>
              <View style={[styles.badge, {
                backgroundColor: inv.status === 'Paid' ? '#14532d' : '#450a0a',
              }]}>
                <Text style={[styles.badgeText, {
                  color: inv.status === 'Paid' ? '#4ade80' : '#f87171',
                }]}>{inv.status}</Text>
              </View>
            </View>
          </View>
          {inv.status === 'Due' && (
            <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
              <Text style={styles.payBtnText}>Pay Now via Razorpay</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  balanceCard: {
    backgroundColor: '#1e293b', borderRadius: 16, padding: 20,
    marginBottom: 28, borderWidth: 1, borderColor: '#f97316' + '44',
  },
  balanceLabel: { fontSize: 13, color: '#94a3b8', marginBottom: 6 },
  balanceVal: { fontSize: 32, fontWeight: '800', color: '#f97316', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  subLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  subVal: { fontSize: 18, fontWeight: '700' },
  divider: { width: 1, height: 36, backgroundColor: '#334155' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },
  invoiceCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 12 },
  invoiceTop: { flexDirection: 'row', justifyContent: 'space-between' },
  invoiceCampaign: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  invoiceInfluencer: { fontSize: 12, color: '#94a3b8' },
  invoiceDate: { fontSize: 11, color: '#475569', marginTop: 4 },
  invoiceAmt: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  payBtn: {
    backgroundColor: '#f97316', borderRadius: 10,
    padding: 12, alignItems: 'center', marginTop: 12,
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});