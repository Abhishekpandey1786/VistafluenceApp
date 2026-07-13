import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Image } from 'react-native';
import { api } from '../../api/index';
import { useTheme } from '../../context/Themecontext';

export default function InfluencerPublicProfileScreen({ route, navigation }) {
  const { G } = useTheme();
  const { influencerId } = route.params;
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicInfluencerProfile(influencerId);
        if (res && res.success) setInfluencer(res.profile);
      } catch (err) {
        console.error("Error fetching influencer profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (influencerId) fetchProfile();
  }, [influencerId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: G.bg }}>
        <ActivityIndicator size="large" color={G.gold} />
      </View>
    );
  }

  if (!influencer) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: G.bg }}>
        <Text style={{ color: G.textSub, fontSize: 16 }}>Profile not found.</Text>
      </View>
    );
  }

  const platforms = [
    { label: 'Instagram', followers: influencer.instagramFollowers, link: influencer.instagramLink },
    { label: 'YouTube',   followers: influencer.youtubeFollowers,   link: influencer.youtubeLink },
    { label: 'Twitter',   followers: influencer.twitterFollowers,   link: influencer.twitterLink },
    { label: 'LinkedIn',  followers: influencer.linkedinFollowers,  link: influencer.linkedinLink },
    { label: 'Facebook',  followers: influencer.facebookFollowers,  link: influencer.facebookLink },
    { label: 'TikTok',    followers: influencer.tiktokFollowers,    link: influencer.tiktokLink },
  ].filter(p => p.followers || p.link);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: G.bg }} showsVerticalScrollIndicator={false}>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ margin: 20, marginBottom: 0 }}>
        <Text style={{ color: G.gold, fontSize: 14, fontWeight: '700' }}>← Back</Text>
      </TouchableOpacity>

      {/* Cover Image */}
      {influencer.coverImage ? (
        <Image source={{ uri: influencer.coverImage }} style={{ width: '100%', height: 160, backgroundColor: G.bgCard }} />
      ) : (
        <View style={{ width: '100%', height: 120, backgroundColor: G.bgCard }} />
      )}

      {/* Avatar + Name */}
      <View style={{ flexDirection: 'row', padding: 20, gap: 16, alignItems: 'center' }}>
        {influencer.avatar ? (
          <Image source={{ uri: influencer.avatar }} style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: G.gold }} />
        ) : (
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: G.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: G.gold }}>
            <Text style={{ color: G.gold, fontSize: 28, fontWeight: '900' }}>{influencer.name?.[0] || '?'}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: G.text, fontSize: 22, fontWeight: '900' }}>{influencer.name}</Text>
            {influencer.verified && <Text style={{ color: G.gold }}>✓</Text>}
          </View>
          <Text style={{ color: G.gold, fontSize: 13, marginTop: 2 }}>@{influencer.handle || influencer.username}</Text>
          {influencer.location ? <Text style={{ color: G.textSub, fontSize: 12, marginTop: 4 }}>📍 {influencer.location}</Text> : null}
        </View>
      </View>

      {/* Bio */}
      {influencer.bio ? (
        <View style={{ backgroundColor: G.bgCard, marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: G.borderAlt }}>
          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 }}>ABOUT</Text>
          <Text style={{ color: G.text, fontSize: 14, lineHeight: 22 }}>{influencer.bio}</Text>
        </View>
      ) : null}

      {/* Stats Row */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, gap: 10 }}>
        {[
          { val: influencer.followers  || '0',  label: 'FOLLOWERS'  },
          { val: influencer.engagement || '0%', label: 'ENGAGEMENT' },
          { val: influencer.perPost    || '₹0', label: 'PER POST'   },
        ].map((s, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: G.bgCard, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: G.borderAlt }}>
            <Text style={{ color: G.gold, fontSize: 16, fontWeight: '900' }}>{s.val}</Text>
            <Text style={{ color: G.textSub, fontSize: 8, fontWeight: '800', letterSpacing: 1, marginTop: 4 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      {influencer.categories ? (
        <View style={{ backgroundColor: G.bgCard, marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: G.borderAlt }}>
          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 }}>NICHE / CATEGORIES</Text>
          <Text style={{ color: G.text, fontSize: 14 }}>{influencer.categories}</Text>
        </View>
      ) : null}

      {/* Social Platforms */}
      {platforms.length > 0 && (
        <View style={{ backgroundColor: G.bgCard, marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: G.borderAlt }}>
          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 }}>SOCIAL PLATFORMS</Text>
          {platforms.map((p, i) => (
            <TouchableOpacity
              key={p.label}
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: i < platforms.length - 1 ? 1 : 0, borderBottomColor: G.borderAlt }}
              onPress={() => p.link && Linking.openURL(p.link)}
            >
              <Text style={{ color: G.text, fontSize: 13, fontWeight: '700' }}>{p.label}</Text>
              <Text style={{ color: G.gold, fontSize: 13, fontWeight: '600' }}>{p.followers || 'View Profile'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Contact */}
      {(influencer.email || influencer.phone || influencer.website) && (
        <View style={{ backgroundColor: G.bgCard, marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: G.borderAlt }}>
          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 }}>CONTACT</Text>
          {influencer.email   && <Text style={{ color: G.textSub, fontSize: 13, marginBottom: 8 }}>✉️  {influencer.email}</Text>}
          {influencer.phone   && <Text style={{ color: G.textSub, fontSize: 13, marginBottom: 8 }}>📞  {influencer.phone}</Text>}
          {influencer.website && (
            <TouchableOpacity onPress={() => Linking.openURL(influencer.website)}>
              <Text style={{ color: G.gold, fontSize: 13, marginBottom: 8 }}>🌐  {influencer.website}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}