import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image,
} from 'react-native';
import { api } from '../../api/index';
import { useTheme } from '../../context/Themecontext';

export default function BrandPublicProfileScreen({ route, navigation }) {
  const { G } = useTheme();
  const { brandId } = route.params || {};
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (brandId) {
      fetchBrandProfile();
    } else {
      setLoading(false);
      Alert.alert("Context Error", "brandId missing from route params.");
    }
  }, [brandId]);

  const fetchBrandProfile = async () => {
    try {
      setLoading(true);
      const res = await api.getBrandProfile(brandId);
      if (res && res.success) {
        setBrand(res.brand);
      } else {
        Alert.alert("Failed", res?.message || "Unable to load brand profile.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: G.bg }}>
        <ActivityIndicator size="large" color={G.gold} />
        <Text style={{ color: G.textSub, marginTop: 12, fontSize: 13, fontWeight: '500' }}>
          Loading brand profile...
        </Text>
      </View>
    );
  }

  if (!brand) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: G.bg }}>
        <Text style={{ color: G.textSub, marginBottom: 10 }}>Brand profile not available.</Text>
        <TouchableOpacity
          style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: G.bgCard, borderRadius: 8, borderWidth: 1, borderColor: G.borderAlt }}
          onPress={fetchBrandProfile}>
          <Text style={{ color: G.gold, fontWeight: 'bold' }}>🔄 Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 15 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: G.textSub }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ backgroundColor: G.bgCard, padding: 20, paddingTop: 52, borderBottomWidth: 1, borderColor: G.borderAlt }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
            <Text style={{ color: G.textSub, fontSize: 14, fontWeight: '500' }}>← Back</Text>
          </TouchableOpacity>

          {/* Brand Top */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <View style={{ width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: G.gold, backgroundColor: G.bgInput, overflow: 'hidden' }}>
              {brand.avatar ? (
                <Image source={{ uri: brand.avatar }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              ) : (
                <Text style={{ color: G.gold, fontWeight: '900', fontSize: 24 }}>
                  {brand.initial || brand.name?.charAt(0).toUpperCase() || 'B'}
                </Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 20, fontWeight: '900', color: G.text, letterSpacing: 0.3 }}>{brand.name}</Text>
                {brand.verified && (
                  <View style={{ backgroundColor: G.goldFaint, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: G.gold }}>
                    <Text style={{ color: G.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>✓ Verified</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: G.textSub, marginTop: 4, fontWeight: '500' }}>
                {brand.category || 'N/A'}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: G.textSub, lineHeight: 21, marginTop: 4 }}>{brand.about}</Text>
        </View>

        {/* Active Campaigns */}
        <View style={{ paddingHorizontal: 16, marginTop: 26 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: G.text, marginBottom: 14, letterSpacing: 0.3 }}>
            Active Campaigns
          </Text>

          {brand.activeCampaigns && brand.activeCampaigns.length > 0 ? (
            brand.activeCampaigns.map(c => (
              <TouchableOpacity
                key={c._id || c.id}
                style={{ backgroundColor: G.bgCard, borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: G.borderAlt }}
                onPress={() => navigation.navigate('CampaignDetail', { campaign: c })}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: G.text }}>{c.title}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 8, marginLeft: 10 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: G.gold }}>₹{c.budget}</Text>
                  <View style={{ backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}>
                    <Text style={{ color: G.green, fontSize: 10, fontWeight: '700' }}>Open</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: G.textSub, fontSize: 13, fontStyle: 'italic', paddingLeft: 4, marginTop: 2 }}>
              No active campaigns at the moment.
            </Text>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}