import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StatusBar, ImageBackground, ActivityIndicator
} from 'react-native';
import { api } from '../../api/index';
import { useTheme } from '../../context/Themecontext';

export default function ApplyScreen({ route, navigation }) {
  const { G } = useTheme();
  const { campaign } = route.params || {};
  const [pitch, setPitch] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [rate, setRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApply = async () => {
    if (!pitch) return Alert.alert('Wait!', 'Please write a pitch to impress the brand.');
    if (!campaign?._id) return Alert.alert('Error', 'Campaign ID is missing.');

    try {
      setSubmitting(true);
      const payload = {
        campaign: campaign._id,
        coverNote: pitch,
        proposedRate: rate,
        portfolioLink: portfolio
      };
      const response = await api.applyToCampaign(campaign._id, payload);
      if (response && response.success) {
        Alert.alert('Application Sent! 🚀', `Your pitch has been sent to ${campaign?.brandName || 'the Brand Host'}.`);
        navigation.goBack();
      } else {
        Alert.alert('Failed', response.message || 'Something went wrong.');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        Alert.alert('Limit Reached 🚀', 'You have reached your free plan limit. Please upgrade.',
          [{ text: 'Later' }, { text: 'Upgrade Plan', onPress: () => navigation.navigate('SubscriptionScreen') }]
        );
      } else {
        Alert.alert('ERROR', error.message || 'Something went wrong.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 15 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ color: G.gold, fontWeight: '700', fontSize: 14 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: G.text, fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>Apply Now</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        {/* Campaign Mini Card */}
        <ImageBackground
          source={{ uri: campaign?.imageUrl || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500' }}
          style={{ height: 120, marginBottom: 25, overflow: 'hidden', borderRadius: 16 }}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt }}>
            <Text style={{ color: G.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>
              {typeof campaign?.brandName === 'string' ? campaign.brandName : (campaign?.brand?.name || 'PREMIUM BRAND')}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{campaign?.title}</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 4 }}>{campaign?.budget}</Text>
          </View>
        </ImageBackground>

        {/* Form */}
        <View style={{ marginTop: 10 }}>

          <Text style={{ fontSize: 11, color: G.textSub, fontWeight: '800', marginBottom: 10, letterSpacing: 1 }}>
            YOUR PITCH <Text style={{ color: G.gold }}>*</Text>
          </Text>
          <TextInput
            style={{ backgroundColor: G.bgInput, color: G.text, borderRadius: 12, padding: 16, fontSize: 14, borderWidth: 1, borderColor: G.borderAlt, marginBottom: 20, height: 140, lineHeight: 20, textAlignVertical: 'top' }}
            placeholder="Why should this brand choose you? Share your creative vision..."
            placeholderTextColor={G.textSub}
            value={pitch} onChangeText={setPitch}
            multiline textAlignVertical="top"
            editable={!submitting}
          />

          <Text style={{ fontSize: 11, color: G.textSub, fontWeight: '800', marginBottom: 10, letterSpacing: 1 }}>
            PORTFOLIO / SOCIAL LINK
          </Text>
          <TextInput
            style={{ backgroundColor: G.bgInput, color: G.text, borderRadius: 12, padding: 16, fontSize: 14, borderWidth: 1, borderColor: G.borderAlt, marginBottom: 20 }}
            placeholder="https://instagram.com/yourprofile"
            placeholderTextColor={G.textSub}
            value={portfolio} onChangeText={setPortfolio}
            autoCapitalize="none" editable={!submitting}
          />

          <Text style={{ fontSize: 11, color: G.textSub, fontWeight: '800', marginBottom: 10, letterSpacing: 1 }}>
            EXPECTED RATE (OPTIONAL)
          </Text>
          <TextInput
            style={{ backgroundColor: G.bgInput, color: G.text, borderRadius: 12, padding: 16, fontSize: 14, borderWidth: 1, borderColor: G.borderAlt, marginBottom: 20 }}
            placeholder="e.g. ₹10,000"
            placeholderTextColor={G.textSub}
            value={rate} onChangeText={setRate}
            keyboardType="numeric" editable={!submitting}
          />

          <TouchableOpacity
            style={{ backgroundColor: G.gold, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 10, marginBottom: 40, elevation: 5, opacity: submitting ? 0.6 : 1 }}
            onPress={handleApply} activeOpacity={0.8} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color={G.bg} size="small" />
              : <Text style={{ color: G.bg, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 }}>Submit Application</Text>
            }
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}