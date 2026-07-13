import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const CAMPAIGN_STATS = [
  { title: 'Summer Run Challenge', reach: '2.4L', engagement: '18K', clicks: '3.2K', spent: '₹15,000' },
  { title: 'Unboxing Series', reach: '98K', engagement: '7.6K', clicks: '1.1K', spent: '₹8,000' },
];

export default function AnalyticsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Analytics 📊</Text>

      <View style={styles.overviewRow}>
        {[
          { label: 'Total Reach', value: '3.4L', color: '#d946ef' },
          { label: 'Engagements', value: '25.6K', color: '#22d3ee' },
          { label: 'Total Clicks', value: '4.3K', color: '#4ade80' },
          { label: 'Total Spent', value: '₹58K', color: '#f97316' },
        ].map(s => (
          <View key={s.label} style={styles.overviewCard}>
            <Text style={[styles.overviewVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.overviewLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Campaign Breakdown</Text>
      {CAMPAIGN_STATS.map((c, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{c.title}</Text>
          <View style={styles.metricsGrid}>
            {[
              { label: 'Reach', value: c.reach },
              { label: 'Engagement', value: c.engagement },
              { label: 'Clicks', value: c.clicks },
              { label: 'Spent', value: c.spent },
            ].map(m => (
              <View key={m.label} style={styles.metricBox}>
                <Text style={styles.metricVal}>{m.value}</Text>
                <Text style={styles.metricLabel}>{m.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.barContainer}>
            <Text style={styles.barLabel}>Engagement Rate</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: i === 0 ? '72%' : '45%' }]} />
            </View>
            <Text style={styles.barPct}>{i === 0 ? '7.5%' : '7.8%'}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 20, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  overviewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  overviewCard: {
    backgroundColor: '#1e293b', borderRadius: 12,
    padding: 14, alignItems: 'center', width: '47%',
  },
  overviewVal: { fontSize: 22, fontWeight: '800' },
  overviewLabel: { fontSize: 11, color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },
  card: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 14 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metricBox: { alignItems: 'center' },
  metricVal: { fontSize: 16, fontWeight: '800', color: '#f97316' },
  metricLabel: { fontSize: 11, color: '#64748b', marginTop: 3 },
  barContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { fontSize: 12, color: '#94a3b8', width: 110 },
  barBg: { flex: 1, backgroundColor: '#0f172a', borderRadius: 4, height: 8, overflow: 'hidden' },
  barFill: { height: 8, backgroundColor: '#f97316', borderRadius: 4 },
  barPct: { fontSize: 12, color: '#f97316', fontWeight: '700', width: 36 },
});