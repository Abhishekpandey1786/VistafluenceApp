import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { api } from '../../api/index'; // Import core api engine pipeline properly

// Dark & Gold Theme Tokens
const T = {
  black: '#0A0A0A',
  cardBg: '#121212',
  gold: '#E8C87A',
  white: '#FFFFFF',
  muted: '#8E8E8E',
  border: 'rgba(255,255,255,0.08)',
};

const STATUS_THEME = {
  'Accepted':     { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80' },
  'Rejected':     { bg: 'rgba(248, 113, 113, 0.1)', text: '#f87171' },
  'Under Review': { bg: 'rgba(232, 200, 122, 0.1)', text: '#E8C87A' }, 
  'pending':      { bg: 'rgba(232, 200, 122, 0.1)', text: '#E8C87A' }, // Added backend string match mapping
};

const FILTERS = ['All', 'Under Review', 'Accepted', 'Rejected'];

export default function MyApplicationsScreen({ navigation }) {
  const [filter, setFilter] = useState('All');
  const [applications, setApplications] = useState([]); // Dynamic state array replaces hardcoded data
  const [loading, setLoading] = useState(true);

  // Fetching dynamic user actions records from backend
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.getMyApplications(); // Hit database node pipeline
        if (response && response.success) {
          setApplications(response.applications || []);
        }
      } catch (error) {
        console.log("❌ Applications fetch structural pipeline error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Normalizing status labels for checking matching chip values cleanly
  const getNormalizedStatus = (status) => {
    if (status === 'pending') return 'Under Review';
    return status;
  };

  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => getNormalizedStatus(a.status) === filter);

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.gold} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={s.header}>
        <Text style={s.title}>MY <Text style={{color: T.gold}}>APPLICATIONS</Text></Text>
        <Text style={s.subtitle}>Track your proposal status</Text>
      </View>

      {/* Modern Filter Chips */}
      <View style={{height: 50, marginBottom: 10}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.chip, filter === f && s.chipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 30}}>
        {filtered.length === 0 && (
          <View style={s.emptyContainer}>
            <Text style={s.empty}>No applications in this category</Text>
          </View>
        )}
        
        {filtered.map(app => {
          // Dynamic keys extraction fallback checks
          const normalizedStatus = getNormalizedStatus(app.status);
          const theme = STATUS_THEME[app.status] || STATUS_THEME['pending'];
          
          const brandDisplay = app.campaign?.brandName || app.brand?.name || 'PREMIUM BRAND';
          const campaignTitleDisplay = app.campaign?.title || 'Active Campaign Proposal';
          const budgetDisplay = app.campaign?.budget ? `₹${Number(app.campaign.budget).toLocaleString('en-IN')}` : (app.proposedRate ? `₹${app.proposedRate}` : '💸 Review Pending');
          
          // Formatted Date compute
          const dateDisplay = app.createdAt 
            ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Just Now';

          return (
            <View key={app._id || app.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.brandSection}>
                   <View style={s.brandDot} />
                   <Text style={s.brand}>{brandDisplay}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: theme.bg }]}>
                  <Text style={[s.badgeText, { color: theme.text }]}>{normalizedStatus}</Text>
                </View>
              </View>

              <Text style={s.campaignTitle}>{campaignTitleDisplay}</Text>
              
              <View style={s.cardBottom}>
                <View>
                   <Text style={s.label}>BUDGET</Text>
                   <Text style={s.budget}>{budgetDisplay}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                   <Text style={s.label}>APPLIED ON</Text>
                   <Text style={s.date}>{dateDisplay}</Text>
                </View>
              </View>

              {app.status === 'Accepted' && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={s.chatBtn}
                  onPress={() => navigation.navigate('Chats', {
                    screen: 'ChatRoom',
                    params: { name: brandDisplay },
                  })}
                >
                  <Text style={s.chatBtnText}>Open Collaboration Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: T.black, paddingHorizontal: 20, paddingTop: 50 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', color: T.white, letterSpacing: 1 },
  subtitle: { fontSize: 13, color: T.muted, marginTop: 4 },

  filterRow: { alignItems: 'center', paddingRight: 20 },
  chip: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 12, backgroundColor: '#1A1A1A', marginRight: 10,
    borderWidth: 1, borderColor: T.border
  },
  chipActive: { backgroundColor: T.gold, borderColor: T.gold },
  chipText: { color: T.muted, fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: T.black },

  emptyContainer: { marginTop: 100, alignItems: 'center' },
  empty: { color: T.muted, fontSize: 14, fontWeight: '600' },

  card: { 
    backgroundColor: T.cardBg, borderRadius: 20, padding: 20, 
    marginBottom: 15, borderWidth: 1, borderColor: T.border 
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brandSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.gold },
  brand: { fontSize: 12, color: T.gold, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' },
  
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  
  campaignTitle: { fontSize: 18, fontWeight: '800', color: T.white, marginBottom: 18 },
  
  cardBottom: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    borderTopWidth: 1, borderTopColor: T.border, paddingTop: 15 
  },
  label: { fontSize: 9, color: T.muted, fontWeight: '800', marginBottom: 4, letterSpacing: 1 },
  budget: { fontSize: 16, color: T.white, fontWeight: '900' },
  date: { fontSize: 13, color: T.white, fontWeight: '600' },

  chatBtn: {
    backgroundColor: T.white, borderRadius: 12,
    padding: 14, alignItems: 'center', marginTop: 18,
  },
  chatBtnText: { color: T.black, fontWeight: '900', fontSize: 13 },
});