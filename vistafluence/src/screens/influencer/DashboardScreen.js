import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';

// Design Tokens (Consistency with Onboarding & Profile)
const T = {
  black: '#0A0A0A',
  white: '#FFFFFF',
  gold: '#E8C87A',
  pink: '#FF6B8A',
  surface: '#161616',
  surfaceAlt: '#1E1E1E',
  border: 'rgba(255,255,255,0.08)',
  muted: 'rgba(255,255,255,0.38)',
  sub: 'rgba(255,255,255,0.6)',
  teal: '#00C9A7',
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();

  const stats = [
    { label: 'APPLIED', value: '12', color: T.pink },
    { label: 'ACTIVE', value: '3', color: '#7B61FF' },
    { label: 'EARNED', value: '₹24K', color: T.gold },
    { label: 'PENDING', value: '₹6K', color: T.muted },
  ];

  const recentCampaigns = [
    { id: '1', brand: 'Nike India', title: 'Summer Run Challenge', budget: '₹15,000', status: 'Open', accent: '#7B61FF' },
    { id: '2', brand: 'Boat Audio', title: 'Unboxing Series', budget: '₹8,000', status: 'Open', accent: T.gold },
    { id: '3', brand: 'Mamaearth', title: 'Skincare Routine', budget: '₹12,000', status: 'Closing', accent: T.pink },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />
      
      {/* Background Ambient Glow */}
      <View style={s.blob1} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Hey, {user?.name || 'Creator'} 👋</Text>
            <Text style={s.subText}>Here's your campaign overview</Text>
          </View>
          <TouchableOpacity style={s.notifBtn} onPress={() => navigation.navigate('Notifications')}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <View style={s.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={s.statsRow}>
          {stats.map((item, i) => (
            <View key={i} style={s.statCard}>
              <Text style={[s.statVal, { color: item.color }]}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Campaign Section Header */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Trending Campaigns</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Campaigns')}>
            <Text style={s.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>

        {/* Campaign List */}
        {recentCampaigns.map(c => (
          <TouchableOpacity 
            key={c.id} 
            style={s.campaignCard}
            onPress={() => navigation.navigate('Campaigns', { screen: 'CampaignDetail', params: { campaign: c } })}
            activeOpacity={0.85}
          >
            <View style={s.cardTop}>
              <View style={[s.brandDot, { backgroundColor: c.accent }]} />
              <Text style={s.brandName}>{c.brand.toUpperCase()}</Text>
              <View style={[s.badge, { backgroundColor: c.status === 'Open' ? 'rgba(0, 201, 167, 0.1)' : 'rgba(255, 107, 138, 0.1)' }]}>
                <Text style={[s.badgeText, { color: c.status === 'Open' ? T.teal : T.pink }]}>{c.status}</Text>
              </View>
            </View>

            <Text style={s.campaignTitle}>{c.title}</Text>
            
            <View style={s.cardFooter}>
              <View>
                <Text style={s.budgetLabel}>REWARD</Text>
                <Text style={s.budgetVal}>{c.budget}</Text>
              </View>
              <View style={s.applyBtn}>
                <Text style={s.applyBtnText}>View Details</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.black },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: T.gold, opacity: 0.04, top: -50, left: -100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greeting: { fontSize: 26, fontWeight: '900', color: T.white, letterSpacing: -0.5 },
  subText: { fontSize: 14, color: T.sub, marginTop: 4 },
  
  notifBtn: { 
    width: 50, height: 50, 
    backgroundColor: T.surfaceAlt, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: T.border
  },
  notifDot: { position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: T.pink, borderWidth: 2, borderColor: T.surfaceAlt },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  statCard: { 
    flex: 1, 
    minWidth: '45%', 
    backgroundColor: T.surface, 
    borderRadius: 20, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: T.border,
    alignItems: 'flex-start'
  },
  statVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: T.muted, marginTop: 6, fontWeight: '800', letterSpacing: 1 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: T.white },
  viewAll: { color: T.gold, fontSize: 13, fontWeight: '700' },

  campaignCard: { 
    backgroundColor: T.surfaceAlt, 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: T.border 
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  brandDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  brandName: { fontSize: 11, color: T.muted, fontWeight: '800', letterSpacing: 1, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },

  campaignTitle: { fontSize: 18, fontWeight: '800', color: T.white, marginBottom: 20, lineHeight: 24 },
  
  cardFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: T.border,
    paddingTop: 16
  },
  budgetLabel: { fontSize: 9, color: T.muted, fontWeight: '800', marginBottom: 2 },
  budgetVal: { fontSize: 18, fontWeight: '900', color: T.gold },
  
  applyBtn: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border
  },
  applyBtnText: { color: T.white, fontSize: 12, fontWeight: '700' },
});