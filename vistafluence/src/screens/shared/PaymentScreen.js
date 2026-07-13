import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function PaymentScreen({ route, navigation }) {
  const { amount, campaignTitle, influencerName } = route.params || {
    amount: '₹15,000',
    campaignTitle: 'Summer Run Challenge',
    influencerName: 'Sneha Patel',
  };

  const handlePay = () => {
    // TODO: Razorpay integration
    // import RazorpayCheckout from 'react-native-razorpay';
    // var options = {
    //   description: campaignTitle,
    //   currency: 'INR',
    //   key: 'YOUR_RAZORPAY_KEY',
    //   amount: amountInPaise,
    //   name: 'ColabHub',
    //   prefill: { email: 'user@example.com', contact: '9999999999' },
    //   theme: { color: '#d946ef' }
    // };
    // RazorpayCheckout.open(options)
    //   .then(data => Alert.alert('Payment Success', data.razorpay_payment_id))
    //   .catch(err => Alert.alert('Payment Failed', err.description));
    Alert.alert('Razorpay', 'Integrate your Razorpay Key ID here.');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Payment Summary</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Campaign</Text>
          <Text style={styles.value}>{campaignTitle}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Influencer</Text>
          <Text style={styles.value}>{influencerName}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={styles.label}>Platform Fee (5%)</Text>
          <Text style={styles.value}>₹750</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.row}>
          <Text style={[styles.label, { color: '#f1f5f9', fontWeight: '700' }]}>Total</Text>
          <Text style={styles.total}>{amount}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
        <Text style={styles.payText}>Pay {amount} via Razorpay 🔒</Text>
      </TouchableOpacity>
      <Text style={styles.secure}>🔐 Secured by Razorpay · 256-bit SSL</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 56 },
  back: { marginBottom: 24 },
  backText: { color: '#94a3b8' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 28 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  label: { fontSize: 14, color: '#94a3b8' },
  value: { fontSize: 14, color: '#f1f5f9', fontWeight: '600' },
  total: { fontSize: 20, color: '#4ade80', fontWeight: '800' },
  separator: { height: 1, backgroundColor: '#334155' },
  payBtn: {
    backgroundColor: '#d946ef', borderRadius: 14,
    padding: 18, alignItems: 'center', marginBottom: 14,
  },
  payText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secure: { textAlign: 'center', color: '#475569', fontSize: 12 },
});