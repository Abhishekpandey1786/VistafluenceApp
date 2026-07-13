import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ImageBackground, Dimensions, StatusBar, ActivityIndicator
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

const { width, height } = Dimensions.get('window');

export default function CampaignDetailScreen({ route, navigation }) {
  const { G } = useTheme();
  const { campaign: initialCampaign } = route.params || {};
  const [campaign, setCampaign] = useState(initialCampaign);
  const [loading, setLoading] = useState(!initialCampaign?.description);

  useEffect(() => {
    if (initialCampaign?._id) {
      const fetchFullDetails = async () => {
        try {
          const { api } = require('../../api/index');
          const res = await api.getCampaign(initialCampaign._id);
          if (res.success && res.campaign) setCampaign(res.campaign);
        } catch (err) {
          console.log("Fetch Error:", err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchFullDetails();
    }
  }, [initialCampaign]);

  if (!initialCampaign?._id && !loading) {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: G.text, fontWeight: '700', marginBottom: 15 }}>No Campaign Context Found</Text>
        <TouchableOpacity
          style={{ backgroundColor: G.gold, padding: 12, borderRadius: 10 }}
          onPress={() => navigation.goBack()}>
          <Text style={{ color: G.bg, fontWeight: '900' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={G.gold} />
      </View>
    );
  }

  const brandObject = campaign?.brand || {};
  const brandName = brandObject.companyName || brandObject.name || 'Premium Brand';
  const displayLetter = brandName.charAt(0).toUpperCase();

  const details = {
    _id: campaign?._id,
    brandName,
    title: campaign?.title || 'Active Campaign',
    budget: campaign?.budget
      ? (typeof campaign.budget === 'number' ? `₹${campaign.budget.toLocaleString()}` : `₹${campaign.budget}`)
      : '💸 Best Industry Rate',
    category: campaign?.category || 'General',
    imageUrl: campaign?.coverArt || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
    deadline: campaign?.deadline || '30 May 2026',
    deliverables: campaign?.deliverables?.length > 0
      ? campaign.deliverables
      : ['Custom Reels Integration', 'Dedicated Story Posts'],
    description: campaign?.description || 'No project description provided.',
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero Image */}
        <ImageBackground source={{ uri: details.imageUrl }} style={{ width, height: height * 0.45 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between', padding: 20, paddingTop: 50 }}>
            <TouchableOpacity
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => navigation.goBack()}>
              <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 30 }}>
              <View style={{ backgroundColor: G.gold, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, marginBottom: 10 }}>
                <Text style={{ color: G.bg, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{details.category}</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', lineHeight: 34 }}>{details.title}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Content Card */}
        <View style={{ flex: 1, backgroundColor: G.bg, marginTop: -25, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 }}>

          {/* Brand Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: G.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: G.gold }}>
                <Text style={{ color: G.gold, fontWeight: '900', fontSize: 18 }}>{displayLetter}</Text>
              </View>
              <View>
                <Text style={{ color: G.textSub, fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>BRAND HOST</Text>
                <Text style={{ color: G.text, fontSize: 16, fontWeight: '800' }}>{details.brandName}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: G.goldFaint, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: G.border }}>
              <Text style={{ color: G.gold, fontSize: 10, fontWeight: '900' }}>✓ VERIFIED</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', backgroundColor: G.bgCard, borderRadius: 20, paddingVertical: 20, borderWidth: 1, borderColor: G.borderAlt, marginBottom: 30 }}>
            {[
              { label: 'REWARD',     val: details.budget },
              { label: 'APPLICANTS', val: campaign?.applicantsCount || 0 },
              { label: 'DEADLINE',   val: details.deadline.split('/')[0] || details.deadline },
            ].map((s, i) => (
              <View key={i} style={[{ flex: 1, alignItems: 'center' }, i > 0 && { borderLeftWidth: 1, borderLeftColor: G.borderAlt }]}>
                <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 5, letterSpacing: 0.5 }}>{s.label}</Text>
                <Text style={{ color: G.text, fontSize: 15, fontWeight: '900' }}>{s.val}</Text>
              </View>
            ))}
          </View>

          {/* Campaign Brief */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: G.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Campaign Brief</Text>
            <Text style={{ color: G.textSub, fontSize: 14, lineHeight: 24 }}>{details.description}</Text>
          </View>

          {/* Deliverables */}
          <View style={{ marginBottom: 30 }}>
            <Text style={{ color: G.text, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Deliverables</Text>
            {details.deliverables.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: G.gold }} />
                <Text style={{ color: G.textSub, fontSize: 14, fontWeight: '600' }}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={{ position: 'absolute', bottom: 0, width, paddingHorizontal: 20, paddingBottom: 30, paddingTop: 15, backgroundColor: G.bg + 'EE' }}>
        <TouchableOpacity
          style={{ backgroundColor: G.gold, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 8 }}
          onPress={() => navigation.navigate('Apply', { campaign: details })}>
          <Text style={{ color: G.bg, fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>Apply Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}