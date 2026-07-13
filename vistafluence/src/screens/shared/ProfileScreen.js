import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, StatusBar, TextInput, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import InviteFriendsScreen from '../influencer/Invitefriendsscreen';
import DarkModeScreen      from '../influencer/Darkmodescreen';
import AboutScreen         from '../influencer/Aboutscreen';
import HelpSupportScreen   from '../influencer/Helpsupportscreen';
import TermsScreen         from '../influencer/Termsscreen';
import DisclaimerScreen    from '../influencer/Disclaimerscreen';
import { useTheme } from '../../context/Themecontext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.2:5000';

async function fetchProfile(token) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json;
}

async function updateProfile(token, body) {
  const res = await fetch(`${API_BASE}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Update failed');
  return data;
}

function Header({ title, onBack, rightElement }) {
  const { G } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt }}>
      <TouchableOpacity onPress={onBack} style={{ width: 40, height: 40, justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, color: G.gold }}>←</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '700', color: G.text }}>{title}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' }}>
        {rightElement || <View style={{ width: 40 }} />}
      </View>
    </View>
  );
}

function GoldDivider() {
  const { G } = useTheme();
  return <View style={{ height: 1, backgroundColor: G.borderAlt, marginHorizontal: 16 }} />;
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function SettingsScreen({ onBack, onLogout }) {
  const { G } = useTheme();
  const [subScreen, setSubScreen] = useState(null);

  if (subScreen === 'invite')     return <InviteFriendsScreen navigation={{ goBack: () => setSubScreen(null) }} />;
  if (subScreen === 'darkmode')   return <DarkModeScreen      navigation={{ goBack: () => setSubScreen(null) }} />;
  if (subScreen === 'about')      return <AboutScreen         navigation={{ goBack: () => setSubScreen(null) }} />;
  if (subScreen === 'help')       return <HelpSupportScreen   navigation={{ goBack: () => setSubScreen(null) }} />;
  if (subScreen === 'terms')      return <TermsScreen         navigation={{ goBack: () => setSubScreen(null) }} />;
  if (subScreen === 'disclaimer') return <DisclaimerScreen    navigation={{ goBack: () => setSubScreen(null) }} />;

  const ITEMS = [
    { icon: '📤', label: 'Invite Friends',     key: 'invite'     },
    { icon: '🌙', label: 'Dark Mode',          key: 'darkmode'   },
    { icon: 'ℹ️',  label: 'About',              key: 'about'      },
    { icon: '❓', label: 'Help & Support',     key: 'help'       },
    { icon: '📄', label: 'Terms & Conditions', key: 'terms'      },
    { icon: '⚠️', label: 'Disclaimer',         key: 'disclaimer' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <Header title="Settings" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: G.bgCard, marginHorizontal: 16, marginVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, overflow: 'hidden' }}>
          {ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: i < ITEMS.length - 1 ? 1 : 0, borderBottomColor: G.borderAlt, gap: 14 }}
              activeOpacity={0.7}
              onPress={() => setSubScreen(item.key)}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 15, color: G.text }}>{item.label}</Text>
              <Text style={{ fontSize: 20, color: G.textSub }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 8, backgroundColor: G.bgCard, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)', gap: 14 }}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.12)', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: G.red }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ─── Edit Profile Screen ──────────────────────────────────────────────────────
function EditProfileScreen({ onBack, isBrand, profileData, onSave, token }) {
  const { G } = useTheme();
  const [form, setForm]     = useState({ ...profileData });
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Denied', 'Camera roll permissions required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9], quality: 0.60, base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      set(type)(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
    }
  };

  const brandFields = [
    { label: 'Brand Name',                   key: 'brandName',  placeholder: 'Your brand name',            keyboard: 'default' },
    { label: 'Handle',                       key: 'handle',     placeholder: '@handle',                    keyboard: 'default' },
    { label: 'Email',                        key: 'email',      placeholder: 'collab@yourbrand.com',       keyboard: 'email-address' },
    { label: 'Website',                      key: 'website',    placeholder: 'https://',                   keyboard: 'url' },
    { label: 'Phone / WhatsApp',             key: 'phone',      placeholder: '+91 Phone number',           keyboard: 'phone-pad' },
    { label: 'Location',                     key: 'location',   placeholder: 'City, Country',              keyboard: 'default' },
    { label: 'Categories (Comma Separated)', key: 'categories', placeholder: 'Beauty, Skincare, Lifestyle',keyboard: 'default' },
    { label: 'GST / Business Reg. No.',      key: 'gst',        placeholder: 'For verified brand badge',   keyboard: 'default' },
  ];
  const influencerFields = [
    { label: 'Username',                     key: 'username',   placeholder: 'Enter username',             keyboard: 'default' },
    { label: 'Handle',                       key: 'handle',     placeholder: '@handle',                    keyboard: 'default' },
    { label: 'Email',                        key: 'email',      placeholder: 'Enter email',                keyboard: 'email-address' },
    { label: 'Website',                      key: 'website',    placeholder: 'https://',                   keyboard: 'url' },
    { label: 'Location',                     key: 'location',   placeholder: 'Tap to auto-detect ◈',       keyboard: 'default' },
    { label: 'Categories (Comma Separated)', key: 'categories', placeholder: 'Fashion, Lifestyle, Beauty', keyboard: 'default' },
    { label: 'Phone Number',                 key: 'phone',      placeholder: '+91 Phone number',           keyboard: 'phone-pad' },
  ];
  const fields = isBrand ? brandFields : influencerFields;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        handle: form.handle, email: form.email, website: form.website, phone: form.phone,
        location: form.location, categories: form.categories, bio: form.bio,
        avatar: form.avatar, coverImage: form.coverImage,
        ...(isBrand ? { brandName: form.brandName, gst: form.gst } : { username: form.username }),
      };
      const data = await updateProfile(token, payload);
      if (data.success) { onSave(data.profile); Alert.alert('✅ Saved!', 'Profile updated successfully.'); }
      else Alert.alert('Error', data.message || 'Could not save profile.');
    } catch (err) { Alert.alert('Network Error', err.message); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <Header title="Edit Profile" onBack={onBack} rightElement={
        <TouchableOpacity onPress={handleSave} disabled={saving}
          style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: G.goldFaint, borderRadius: 8, borderWidth: 1, borderColor: G.border }}
          activeOpacity={0.7}>
          {saving ? <ActivityIndicator size="small" color={G.gold} />
                  : <Text style={{ color: G.gold, fontWeight: '700', fontSize: 14 }}>Save</Text>}
        </TouchableOpacity>
      } />
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: G.gold, marginBottom: 8 }}>Profile Media</Text>
        <View style={{ height: 180, marginBottom: 48, position: 'relative' }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: G.bgInput, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: G.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
            onPress={() => pickImage('coverImage')} activeOpacity={0.8}>
            {form.coverImage
              ? <Image source={{ uri: form.coverImage }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              : <Text style={{ color: G.textSub, fontSize: 13 }}>🖼️ Choose Cover Photo (16:9 Landscape)</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[{ position: 'absolute', bottom: -32, left: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: G.bgCard, borderWidth: 3, borderColor: G.gold, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 4 }, isBrand && { borderRadius: 22 }]}
            onPress={() => pickImage('avatar')} activeOpacity={0.8}>
            {form.avatar
              ? <Image source={{ uri: form.avatar }} style={[{ width: '100%', height: '100%', resizeMode: 'cover' }, isBrand && { borderRadius: 20 }]} />
              : <Text style={{ fontSize: 24 }}>📷</Text>}
          </TouchableOpacity>
        </View>

        {fields.map((f) => (
          <View key={f.key} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: G.gold, marginBottom: 8 }}>{f.label}</Text>
            <TextInput
              style={{ backgroundColor: G.bgInput, borderRadius: 12, borderWidth: 1, borderColor: G.border, padding: 14, color: G.text, fontSize: 14 }}
              value={form[f.key] || ''} onChangeText={set(f.key)}
              placeholder={f.placeholder} placeholderTextColor={G.textSub}
              keyboardType={f.keyboard} autoCapitalize="none"
            />
          </View>
        ))}

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: G.gold, marginBottom: 8 }}>{isBrand ? 'Brand Bio' : 'Creator Bio'}</Text>
          <TextInput
            style={{ backgroundColor: G.bgInput, borderRadius: 12, borderWidth: 1, borderColor: G.border, padding: 14, color: G.text, fontSize: 14, height: 100, textAlignVertical: 'top' }}
            value={form.bio || ''} onChangeText={set('bio')}
            placeholder={isBrand ? 'Describe your brand...' : 'Describe yourself...'}
            placeholderTextColor={G.textSub} multiline
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  const { G } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: G.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={G.gold} />
      <Text style={{ color: G.goldDim, fontSize: 13 }}>Loading profile…</Text>
    </View>
  );
}

// ─── Main Profile Screen ──────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { G } = useTheme();
  const { user, logout, token } = useAuth();

  const [screen,      setScreen]      = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await fetchProfile(token);
      if (data.success) setProfileData(data.profile);
      else setError(data.message || 'Failed to load profile');
    } catch (err) {
      setError(err.message);
      if (user) {
        const role = user.role || 'influencer';
        const isBrand = role === 'brand';
        setProfileData(isBrand
          ? { brandName: user.name||'', handle: user.handle||'', email: user.email||'', website:'', phone:'', location:'', categories:'', bio:'', gst:'', campaignsCount:'0', applicantsCount:'0', totalSpent:'₹0', avatar:'', coverImage:'' }
          : { username: user.name||'', handle: user.handle||'', email: user.email||'', website:'', phone:'', location:'', categories:'', bio:'', followers:'0', engagement:'0%', perPost:'₹0', avatar:'', coverImage:'' }
        );
      }
    } finally { setLoading(false); setRefreshing(false); }
  }, [token, user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const role    = user?.role || profileData?.role || 'influencer';
  const isBrand = role === 'brand';

  const displayName = isBrand
    ? (profileData?.brandName || user?.name || 'No Name Set')
    : (profileData?.username  || user?.name || 'No Username Set');

  const displayHandle = profileData?.handle
    ? (profileData.handle.startsWith('@') ? profileData.handle : `@${profileData.handle}`)
    : `@${displayName.toLowerCase().replace(/\s/g, '_')}`;

  const initial = displayName && !['No Name Set','No Username Set'].includes(displayName)
    ? displayName[0].toUpperCase() : 'V';

  const categoryTags = profileData?.categories
    ? profileData.categories.split(',').map(t => t.trim()).filter(Boolean) : [];

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  if (screen === 'settings')
    return <SettingsScreen onBack={() => setScreen('profile')} onLogout={handleLogout} />;

  if (screen === 'editProfile' && profileData)
    return (
      <EditProfileScreen
        isBrand={isBrand} profileData={profileData} token={token}
        onSave={(updated) => { setProfileData(prev => ({ ...prev, ...updated })); setScreen('profile'); loadProfile(); }}
        onBack={() => setScreen('profile')}
      />
    );

  if (loading) return <LoadingSkeleton />;

  const stats = isBrand
    ? [
        { val: String(profileData?.campaignsCount  ?? '0'), label: 'Campaigns'   },
        { val: String(profileData?.applicantsCount ?? '0'), label: 'Applicants'  },
      ]
    : [
        { val: profileData?.followers  ?? '0',  label: 'Followers'  },
        { val: profileData?.engagement ?? '0%', label: 'Engagement' },
        { val: profileData?.perPost    ?? '₹0', label: 'Per Post'   },
      ];

  const campaigns = profileData?.campaignsData?.length
    ? profileData.campaignsData
    : [{ icon: '📸', color: '#E1306C', name: 'No Active Campaigns', sub: 'Create a new campaign to start', val: '—', status: 'Draft', statusColor: G.textSub }];

  const channels = profileData?.channelsData?.length
    ? profileData.channelsData
    : [{ icon: '📱', color: G.gold, name: 'No Channels Connected', sub: 'Connect your socials from settings', val: '0', status: 'Disconnected', statusColor: G.red }];

  const hasAvatar = profileData?.avatar     && typeof profileData.avatar     === 'string' && profileData.avatar.trim().length     > 0;
  const hasCover  = profileData?.coverImage && typeof profileData.coverImage === 'string' && profileData.coverImage.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={G.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} tintColor={G.gold} colors={[G.gold]} />}
      >
        {/* Top Bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '900', color: G.text, letterSpacing: -0.5 }}>My Profile</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {isBrand && (
              <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: G.bgCard, borderWidth: 1, borderColor: G.border, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 16 }}>📤</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: G.bgCard, borderWidth: 1, borderColor: G.border, justifyContent: 'center', alignItems: 'center' }}
              onPress={() => setScreen('settings')}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(239,68,68,0.1)', marginHorizontal: 16, marginTop: 8, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' }}>
            <Text style={{ color: G.red, fontSize: 12, flex: 1 }}>⚠️ {error} — showing cached data</Text>
            <TouchableOpacity onPress={() => loadProfile()}>
              <Text style={{ color: G.gold, fontSize: 12, fontWeight: '700', marginLeft: 10 }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cover */}
        <View style={{ height: 200, backgroundColor: G.bgCard, overflow: 'hidden', position: 'relative' }}>
          {hasCover
            ? <Image source={{ uri: profileData.coverImage }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} key={profileData.coverImage} />
            : <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundColor: G.gold }} />
          }
          <TouchableOpacity
            style={{ position: 'absolute', bottom: 12, right: 14, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: G.border, zIndex: 10 }}
            onPress={() => setScreen('editProfile')}>
            <Text style={{ color: G.gold, fontSize: 11, fontWeight: '700' }}>📷  Edit Cover</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={{ paddingHorizontal: 18, paddingBottom: 20, marginTop: -53 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={[{ width: 106, height: 106, borderRadius: 53, borderWidth: 3, borderColor: G.gold, padding: 3, overflow: 'hidden', backgroundColor: G.bg }, isBrand && { borderRadius: 24 }]}>
              <View style={[{ flex: 1, borderRadius: 48, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, isBrand && { borderRadius: 20 }]}>
                {hasAvatar
                  ? <Image source={{ uri: profileData.avatar }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} key={profileData.avatar} />
                  : <Text style={{ fontSize: 36, fontWeight: '900', color: G.gold }}>{initial}</Text>
                }
              </View>
            </View>
            <TouchableOpacity
              style={{ borderWidth: 1.5, borderColor: G.gold, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: G.goldFaint }}
              onPress={() => setScreen('editProfile')}>
              <Text style={{ color: G.gold, fontWeight: '700', fontSize: 13 }}>✏️  Edit Profile</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 22, fontWeight: '900', color: G.text, letterSpacing: -0.5, marginTop: 12 }}>{displayName}</Text>
          <Text style={{ fontSize: 13, color: G.goldDim, marginTop: 2, marginBottom: 10 }}>{displayHandle}</Text>

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <View style={{ backgroundColor: G.goldFaint, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: G.gold, fontSize: 12, fontWeight: '700' }}>{isBrand ? '🏢 Brand' : '🎬 Creator'}</Text>
            </View>
            {isBrand && profileData?.verified && (
              <View style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)', paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: G.green, fontSize: 12, fontWeight: '700' }}>✓ Verified</Text>
              </View>
            )}
            {profileData?.location && (
              <View style={{ backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: G.textSub, fontSize: 12 }}>📍 {profileData.location}</Text>
              </View>
            )}
          </View>

          {profileData?.bio ? <Text style={{ fontSize: 13, color: G.textSub, lineHeight: 20, marginBottom: 12 }}>{profileData.bio}</Text> : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 }}>
            {categoryTags.map(t => (
              <View key={t} style={{ backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: G.text, fontSize: 12 }}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', backgroundColor: G.bgCard, borderRadius: 18, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: G.border, paddingVertical: 18 }}>
          {stats.map((s, i) => (
            <View key={i} style={[{ flex: 1, alignItems: 'center' }, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: G.borderAlt }]}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: G.gold, letterSpacing: -0.5 }}>{s.val}</Text>
              <Text style={{ fontSize: 10, color: G.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Info */}
        <Text style={{ fontSize: 10, fontWeight: '700', color: G.goldDim, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 18, marginBottom: 10, marginTop: 4 }}>
          {isBrand ? 'Brand Info' : 'Creator Info'}
        </Text>
        <View style={{ backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
          {[
            { icon: '✉️', label: 'Email',    val: profileData?.email    || 'Not specified' },
            { icon: '🌐', label: 'Website',  val: profileData?.website  || 'Not specified' },
            { icon: '📍', label: 'Location', val: profileData?.location || 'Not specified' },
            ...(profileData?.phone ? [{ icon: '📞', label: 'Phone', val: profileData.phone }] : []),
          ].map((item, i) => (
            <View key={i}>
              {i > 0 && <GoldDivider />}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, gap: 14 }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: G.textSub }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: G.text, fontWeight: '500', marginTop: 1 }}>{item.val}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Campaigns / Channels */}
        {isBrand ? (
          <>
            <Text style={{ fontSize: 10, fontWeight: '700', color: G.goldDim, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 18, marginBottom: 10, marginTop: 4 }}>Active Campaigns</Text>
            <View style={{ backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
              {campaigns.map((c, i) => (
                <View key={i}>
                  {i > 0 && <GoldDivider />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (c.color || G.gold) + '20', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18 }}>{c.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: G.text }}>{c.name}</Text>
                      <Text style={{ fontSize: 11, color: G.textSub, marginTop: 1 }}>{c.sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: G.gold }}>{c.val}</Text>
                      <View style={{ backgroundColor: (c.statusColor || G.textSub) + '20', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: c.statusColor }}>{c.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 10, fontWeight: '700', color: G.goldDim, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 18, marginBottom: 10, marginTop: 4 }}>Connected Channels</Text>
            <View style={{ backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' }}>
              {channels.map((ch, i) => (
                <View key={i}>
                  {i > 0 && <GoldDivider />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (ch.color || G.gold) + '20', justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: G.text }}>{ch.name}</Text>
                      <Text style={{ fontSize: 11, color: G.textSub, marginTop: 1 }}>{ch.sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 15, fontWeight: '900', color: G.gold }}>{ch.val}</Text>
                      <View style={{ backgroundColor: (ch.statusColor || G.red) + '20', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: ch.statusColor }}>{ch.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}