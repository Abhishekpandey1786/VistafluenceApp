import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../api/index';
import { useTheme } from '../../context/Themecontext';

export default function ManageApplicationsScreen({ navigation }) {
  const { G } = useTheme();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await api.getMyCampaigns();
        if (res.success && res.campaigns.length > 0) {
          setCampaigns(res.campaigns);
          setSelectedCampaignId(res.campaigns[0]._id);
        }
      } catch (err) { console.log(err); }
    };
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) fetchApplicants(selectedCampaignId);
  }, [selectedCampaignId]);

  const fetchApplicants = async (id) => {
    setLoading(true);
    try {
      const res = await api.getCampaignApplicants(id);
      if (res.success) setApps(res.applications);
      else setApps([]);
    } catch (err) { console.log(err); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
    setLoading(true);
    try {
      const res = await api.updateApplicationStatus(appId, newStatus);
      if (res.success) {
        setApps(prevApps => prevApps.map(app =>
          app._id === appId ? { ...app, status: newStatus } : app
        ));
        Alert.alert('Success', `Application ${newStatus}ed successfully!`);
      } else {
        Alert.alert('Error', res.message || 'Update failed');
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Something went wrong while updating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>

      {/* Header */}
      <View style={{ padding: 40, paddingBottom: 20 }}>
        <Text style={{ color: G.gold, fontSize: 28, fontWeight: '800', letterSpacing: 4 }}>APPLICATIONS</Text> 
      </View>

      {/* Campaign Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, paddingLeft: 20, marginBottom: 20 }}>
        {campaigns.map((c) => (
          <TouchableOpacity
            key={c._id}
            onPress={() => setSelectedCampaignId(c._id)}
            style={{
              paddingHorizontal: 20, paddingVertical: 10,
              backgroundColor: selectedCampaignId === c._id ? G.bgCard : G.bgInput,
              marginRight: 10,
              borderBottomWidth: 2,
              borderColor: selectedCampaignId === c._id ? G.gold : G.borderAlt,
            }}>
            <Text style={{
              color: selectedCampaignId === c._id ? G.gold : G.textSub,
              fontSize: 12, fontWeight: 'bold',
            }}>
              {c.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <ActivityIndicator color={G.gold} size="large" />
        ) : (
          apps.map((app) => (
            <View key={app._id} style={{
              backgroundColor: G.bgCard,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: G.borderAlt,
              borderRadius: 12,
            }}>
              {/* Gold Line */}
              <View style={{ width: 50, height: 2, backgroundColor: G.gold, marginBottom: 15 }} />

              {/* Name + Rate */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: G.text, fontSize: 18, fontWeight: '700' }}>{app.influencer?.name}</Text>
                <Text style={{ color: G.gold, fontWeight: 'bold' }}>₹{app.proposedRate || 'N/A'}</Text>
              </View>

              <Text style={{ color: G.textSub, fontSize: 12, marginBottom: 15 }}>
                {app.influencer?.niche || 'Digital Creator'}
              </Text>

              <Text style={{ color: G.gold, fontSize: 9, letterSpacing: 2, marginBottom: 5 }}>COVER NOTE:</Text>
              <Text style={{ color: G.textSub, fontSize: 14, fontStyle: 'italic', marginBottom: 20 }}>{app.coverNote}</Text>

              {/* Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{
                  backgroundColor: app.status === 'accepted' ? 'rgba(34,197,94,0.15)'
                    : app.status === 'rejected' ? 'rgba(239,68,68,0.15)'
                    : G.goldFaint,
                  borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: app.status === 'accepted' ? 'rgba(34,197,94,0.4)'
                    : app.status === 'rejected' ? 'rgba(239,68,68,0.4)'
                    : G.border,
                }}>
                  <Text style={{
                    color: app.status === 'accepted' ? G.green
                      : app.status === 'rejected' ? G.red
                      : G.gold,
                    fontSize: 10, fontWeight: '800', letterSpacing: 1,
                  }}>
                    {app.status.toUpperCase()}
                  </Text>
                </View>

                {app.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={{ padding: 8, paddingHorizontal: 15, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}
                      onPress={() => handleStatusUpdate(app._id, 'rejected')}>
                      <Text style={{ color: G.red, fontSize: 10, fontWeight: 'bold' }}>REJECT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ padding: 8, paddingHorizontal: 15, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' }}
                      onPress={() => handleStatusUpdate(app._id, 'accepted')}>
                      <Text style={{ color: G.green, fontSize: 10, fontWeight: 'bold' }}>ACCEPT</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* View Profile Button */}
              <TouchableOpacity
                style={{ marginTop: 12, padding: 10, borderWidth: 1, borderColor: G.gold, alignItems: 'center', borderRadius: 8 }}
                onPress={() => {
                  const influencerId = app.influencer?._id || app.influencer;
                  if (influencerId) navigation.navigate('InfluencerPublicProfile', { influencerId });
                }}>
                <Text style={{ color: G.gold, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>👤  View Influencer Profile</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}