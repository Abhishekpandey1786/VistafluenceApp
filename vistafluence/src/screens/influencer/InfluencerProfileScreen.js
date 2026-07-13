import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, StatusBar, TextInput, ActivityIndicator, RefreshControl, Image,
  Linking
} from 'react-native';
import { useTheme } from '../../context/Themecontext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://vistafluenceapp.onrender.com';

async function fetchProfile(token, role) {
  const endpoint = role === 'brand' ? '/api/profile' : '/api/influencer/profile';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return json;
}

async function updateProfile(token, body, role) {
  const endpoint = role === 'brand' ? '/api/profile' : '/api/influencer/profile';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Update failed');
  return data;
}

const SETTINGS_ITEMS = [
  { icon: '📤', label: 'Invite Friends' },
  { icon: '🌙', label: 'Dark Mode' },
  { icon: 'ℹ️',  label: 'About' },
  { icon: '❓', label: 'Help & Support' },
  { icon: '📄', label: 'Terms & Conditions' },
  { icon: '⚠️', label: 'Disclaimer' },
];
function Header({ title, onBack, rightElement }) {
  const { G } = useTheme();
  const hdr = makeHdr(G);
  return (
    <View style={hdr.wrap}>
      <TouchableOpacity onPress={onBack} style={hdr.back}>
        <Text style={hdr.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={hdr.title}>{title}</Text>
      <View style={hdr.rightSlot}>{rightElement || <View style={{ width: 40 }} />}</View>
    </View>
  );
}
const makeHdr = (G) => StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  back:     { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 20, color: G.gold },
  title:    { fontSize: 18, fontWeight: '700', color: G.text },
  rightSlot:{ minWidth: 40, alignItems: 'flex-end', justifyContent: 'center' },
});
function GoldDivider() {
  const { G } = useTheme();
  return <View style={{ height: 1, backgroundColor: G.borderAlt, marginHorizontal: 16 }} />;
}
function SaveBtn({ onPress, saving }) {
  const { G } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} disabled={saving}
      style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: G.goldFaint, borderRadius: 8, borderWidth: 1, borderColor: G.border }}
      activeOpacity={0.7}>
      {saving
        ? <ActivityIndicator size="small" color={G.gold} />
        : <Text style={{ color: G.gold, fontWeight: '700', fontSize: 14 }}>Save</Text>
      }
    </TouchableOpacity>
  );
}
function LoadingSkeleton() {
  const { G } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: G.bg, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <ActivityIndicator size="large" color={G.gold} />
      <Text style={{ color: G.goldDim, fontSize: 13 }}>Loading profile…</Text>
    </View>
  );
}
function EditProfileScreen({ onBack, isBrand, profileData, onSave, token, role }) {
  const { G } = useTheme();
  const ep = makeEp(G);

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
    { label: 'Brand Name',                   key: 'brandName',  placeholder: 'Your brand name',             keyboard: 'default' },
    { label: 'Handle',                        key: 'handle',     placeholder: '@handle',                     keyboard: 'default' },
    { label: 'Email',                         key: 'email',      placeholder: 'collab@yourbrand.com',        keyboard: 'email-address' },
    { label: 'Website',                       key: 'website',    placeholder: 'https://',                    keyboard: 'url' },
    { label: 'Phone / WhatsApp',              key: 'phone',      placeholder: '+91 Phone number',            keyboard: 'phone-pad' },
    { label: 'Location',                      key: 'location',   placeholder: 'City, Country',               keyboard: 'default' },
    { label: 'Categories (Comma Separated)',  key: 'categories', placeholder: 'Beauty, Skincare, Lifestyle', keyboard: 'default' },
    { label: 'GST / Business Reg. No.',       key: 'gst',        placeholder: 'For verified brand badge',    keyboard: 'default' },
  ];

  const influencerFields = [
    { label: 'Username',                      key: 'username',   placeholder: 'Enter username',              keyboard: 'default' },
    { label: 'Handle',                        key: 'handle',     placeholder: '@handle',                     keyboard: 'default' },
    { label: 'Email',                         key: 'email',      placeholder: 'Enter email',                 keyboard: 'email-address' },
    { label: 'Website',                       key: 'website',    placeholder: 'https://',                    keyboard: 'url' },
    { label: 'Location',                      key: 'location',   placeholder: 'Tap to auto-detect ◈',        keyboard: 'default' },
    { label: 'Categories (Comma Separated)',  key: 'categories', placeholder: 'Fashion, Lifestyle, Beauty',  keyboard: 'default' },
    { label: 'Phone Number',                  key: 'phone',      placeholder: '+91 Phone number',            keyboard: 'phone-pad' },
    { label: 'Total Followers',               key: 'followers',  placeholder: 'e.g. 45K or 1.2M',            keyboard: 'default' },
    { label: 'Engagement Rate',               key: 'engagement', placeholder: 'e.g. 6.2%',                   keyboard: 'default' },
    { label: 'Rate Per Post',                 key: 'perPost',    placeholder: 'e.g. ₹15K',                   keyboard: 'default' },
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
        instagramLink: form.instagramLink, instagramFollowers: form.instagramFollowers,
        youtubeLink: form.youtubeLink, youtubeFollowers: form.youtubeFollowers,
        tiktokLink: form.tiktokLink, tiktokFollowers: form.tiktokFollowers,
        twitterLink: form.twitterLink, twitterFollowers: form.twitterFollowers,
        linkedinLink: form.linkedinLink, linkedinFollowers: form.linkedinFollowers,
        facebookLink: form.facebookLink, facebookFollowers: form.facebookFollowers,
        followers: form.followers, engagement: form.engagement, perPost: form.perPost,
        ...(isBrand ? { brandName: form.brandName, gst: form.gst } : { username: form.username }),
      };
      const data = await updateProfile(token, payload, role);
      if (data.success) {
        onSave(data.profile);
        Alert.alert('✅ Saved!', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', data.message || 'Could not save profile.');
      }
    } catch (err) {
      Alert.alert('Network Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <Header title="Edit Profile" onBack={onBack} rightElement={<SaveBtn onPress={handleSave} saving={saving} />} />
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>

        <Text style={ep.label}>Profile Media</Text>
        <View style={ep.mediaUploadRow}>
          <TouchableOpacity style={ep.coverPickerPreview} onPress={() => pickImage('coverImage')} activeOpacity={0.8}>
            {form.coverImage
              ? <Image source={{ uri: form.coverImage }} style={ep.fullImg} />
              : <Text style={ep.uploadIconTxt}>🖼️ Choose Cover Photo (16:9 Landscape)</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity style={[ep.avatarPickerPreview, isBrand && { borderRadius: 22 }]} onPress={() => pickImage('avatar')} activeOpacity={0.8}>
            {form.avatar
              ? <Image source={{ uri: form.avatar }} style={[ep.fullImg, isBrand && { borderRadius: 20 }]} />
              : <Text style={{ fontSize: 24 }}>📷</Text>
            }
          </TouchableOpacity>
        </View>

        {fields.map((f) => (
          <View key={f.key} style={{ marginBottom: 20 }}>
            <Text style={ep.label}>{f.label}</Text>
            <TextInput
              style={ep.input} value={form[f.key] || ''} onChangeText={set(f.key)}
              placeholder={f.placeholder} placeholderTextColor={G.textSub}
              keyboardType={f.keyboard} autoCapitalize="none"
            />
          </View>
        ))}

        {!isBrand && (
          <View style={{ marginTop: 10, marginBottom: 25 }}>
            <Text style={[ep.label, { color: G.pink, fontSize: 14, marginBottom: 15 }]}>🌐 Connect Live Social Channels</Text>
            {[
              { label: '📸 Instagram',   linkKey: 'instagramLink', follKey: 'instagramFollowers', linkPH: 'https://instagram.com/username',    follPH: 'Followers (e.g. 25K)' },
              { label: '📺 YouTube',     linkKey: 'youtubeLink',   follKey: 'youtubeFollowers',   linkPH: 'https://youtube.com/@channel',      follPH: 'Subscribers (e.g. 100K)' },
              { label: '🎵 TikTok',      linkKey: 'tiktokLink',    follKey: 'tiktokFollowers',    linkPH: 'https://tiktok.com/@username',      follPH: 'Followers (e.g. 50K)' },
              { label: '🐦 X / Twitter', linkKey: 'twitterLink',   follKey: 'twitterFollowers',   linkPH: 'https://x.com/username',            follPH: 'Followers (e.g. 12K)' },
              { label: '💼 LinkedIn',    linkKey: 'linkedinLink',  follKey: 'linkedinFollowers',  linkPH: 'https://linkedin.com/in/username',  follPH: 'Connections (e.g. 5K)' },
              { label: '📘 Facebook',    linkKey: 'facebookLink',  follKey: 'facebookFollowers',  linkPH: 'https://facebook.com/pagename',     follPH: 'Followers/Likes (e.g. 30K)' },
            ].map((p) => (
              <View key={p.linkKey} style={ep.platformInputGroup}>
                <Text style={ep.platformSubLabel}>{p.label}</Text>
                <TextInput style={ep.input} value={form[p.linkKey] || ''} onChangeText={set(p.linkKey)} placeholder={p.linkPH} placeholderTextColor={G.textSub} autoCapitalize="none" />
                <TextInput style={[ep.input, { marginTop: 6 }]} value={form[p.follKey] || ''} onChangeText={set(p.follKey)} placeholder={p.follPH} placeholderTextColor={G.textSub} />
              </View>
            ))}
          </View>
        )}

        <View style={{ marginBottom: 20 }}>
          <Text style={ep.label}>{isBrand ? 'Brand Bio' : 'Creator Bio'}</Text>
          <TextInput
            style={[ep.input, { height: 100, textAlignVertical: 'top' }]}
            value={form.bio || ''} onChangeText={set('bio')}
            placeholder={isBrand ? 'Describe your brand...' : 'Describe yourself...'}
            placeholderTextColor={G.textSub} multiline
          />
        </View>

        <TouchableOpacity onPress={handleSave} disabled={saving} style={ep.bottomSaveBtn} activeOpacity={0.8}>
          {saving
            ? <ActivityIndicator size="small" color={G.bg} />
            : <Text style={ep.bottomSaveTxt}>💾  Save Profile</Text>
          }
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
const makeEp = (G) => StyleSheet.create({
  label:               { fontSize: 13, fontWeight: '600', color: G.gold, marginBottom: 8, letterSpacing: 0.3 },
  input:               { backgroundColor: G.bgInput, borderRadius: 12, borderWidth: 1, borderColor: G.border, padding: 14, color: G.text, fontSize: 14 },
  bottomSaveBtn:       { backgroundColor: G.gold, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  bottomSaveTxt:       { color: G.bg, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  mediaUploadRow:      { height: 180, marginBottom: 48, position: 'relative' },
  coverPickerPreview:  { flex: 1, backgroundColor: G.bgInput, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: G.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarPickerPreview: { position: 'absolute', bottom: -32, left: 20, width: 100, height: 100, borderRadius: 50, backgroundColor: G.bgCard, borderWidth: 3, borderColor: G.gold, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  fullImg:             { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadIconTxt:       { color: G.textSub, fontSize: 13, fontWeight: '500' },
  platformInputGroup:  { marginBottom: 16, backgroundColor: G.bgCard, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: G.borderAlt },
  platformSubLabel:    { fontSize: 12, color: G.text, marginBottom: 6, fontWeight: '600' },
});
export function PublicInfluencerProfile({ profileData, onBack }) {
  const { G } = useTheme();
  const pub = makePub(G);

  const openLiveLink = async (url) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const displayName   = profileData?.username || profileData?.name || 'Creator';
  const displayHandle = profileData?.handle
    ? (profileData.handle.startsWith('@') ? profileData.handle : `@${profileData.handle}`)
    : `@${displayName.toLowerCase().replace(/\s/g, '_')}`;
  const initial = displayName[0]?.toUpperCase() || 'C';

  const hasAvatar = profileData?.avatar && profileData.avatar.trim().length > 0;
  const hasCover  = profileData?.coverImage && profileData.coverImage.trim().length > 0;

  const categoryTags = profileData?.categories
    ? profileData.categories.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const liveChannels = [];
  if (profileData?.instagramLink) liveChannels.push({ icon: '📸', color: '#E1306C', name: 'Instagram',   val: profileData.instagramFollowers || '—', url: profileData.instagramLink, statusColor: G.pink });
  if (profileData?.youtubeLink)   liveChannels.push({ icon: '📺', color: '#FF0000', name: 'YouTube',     val: profileData.youtubeFollowers   || '—', url: profileData.youtubeLink,   statusColor: G.red  });
  if (profileData?.tiktokLink)    liveChannels.push({ icon: '🎵', color: '#555',    name: 'TikTok',      val: profileData.tiktokFollowers    || '—', url: profileData.tiktokLink,    statusColor: G.text });
  if (profileData?.twitterLink)   liveChannels.push({ icon: '🐦', color: '#1DA1F2', name: 'X / Twitter', val: profileData.twitterFollowers   || '—', url: profileData.twitterLink,   statusColor: G.teal });
  if (profileData?.linkedinLink)  liveChannels.push({ icon: '💼', color: '#0077B5', name: 'LinkedIn',    val: profileData.linkedinFollowers  || '—', url: profileData.linkedinLink,  statusColor: G.teal });
  if (profileData?.facebookLink)  liveChannels.push({ icon: '📘', color: '#1877F2', name: 'Facebook',    val: profileData.facebookFollowers  || '—', url: profileData.facebookLink,  statusColor: G.green});

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={G.bg} />
      <View style={pub.topBar}>
        <TouchableOpacity onPress={onBack} style={pub.backBtn}>
          <Text style={{ fontSize: 20, color: G.gold }}>←</Text>
        </TouchableOpacity>
        <Text style={pub.topTitle}>Creator Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={pub.coverWrap}>
          {hasCover ? <Image source={{ uri: profileData.coverImage }} style={pub.stretchImg} /> : <View style={pub.coverGradient} />}
          {profileData?.verified && (
            <View style={pub.verifiedBadge}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: G.green }}>✓ VERIFIED</Text>
            </View>
          )}
        </View>
        <View style={pub.heroSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={pub.avatarRing}>
              <View style={[pub.avatar, { overflow: 'hidden' }]}>
                {hasAvatar ? <Image source={{ uri: profileData.avatar }} style={pub.stretchImg} /> : <Text style={pub.avatarText}>{initial}</Text>}
              </View>
            </View>
            <TouchableOpacity style={pub.collabBtn} activeOpacity={0.85}>
              <Text style={pub.collabTxt}>🤝  Collab Now</Text>
            </TouchableOpacity>
          </View>
          <Text style={pub.name}>{displayName}</Text>
          <Text style={pub.handle}>{displayHandle}</Text>
          <View style={pub.badgeRow}>
            <View style={pub.creatorBadge}><Text style={pub.creatorBadgeTxt}>🎬 Creator</Text></View>
            <View style={[pub.creatorBadge, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }]}>
              <Text style={[pub.creatorBadgeTxt, { color: G.green }]}>✓ PRO CREATOR</Text>
            </View>
            {profileData?.location && <View style={pub.locationBadge}><Text style={pub.locationTxt}>📍 {profileData.location}</Text></View>}
          </View>
          <Text style={pub.bio}>{profileData?.bio || 'Open for brand collaborations. DM for enquiries.'}</Text>
          <View style={pub.tagsRow}>
            {(categoryTags.length > 0 ? categoryTags : ['CREATOR']).map(t => (
              <View key={t} style={pub.tag}><Text style={pub.tagTxt}>🔥 {t.toUpperCase()}</Text></View>
            ))}
          </View>
        </View>
        <View style={pub.statsCard}>
          {[
            { val: profileData?.followers  || '—', label: 'Followers'  },
            { val: profileData?.engagement || '—', label: 'Engagement' },
            { val: profileData?.perPost    || '—', label: 'Per Post'   },
          ].map((s, i) => (
            <View key={i} style={[pub.statBox, i < 2 && pub.statDivider]}>
              <Text style={[pub.statVal, s.label === 'Engagement' && { color: G.teal }]}>{s.val}</Text>
              <Text style={pub.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={pub.sectionTitle}>Media Kit Info</Text>
        <View style={pub.card}>
          {[
            { icon: '✉️', label: 'Collaboration Email', val: profileData?.email    || 'Not specified' },
            { icon: '🌐', label: 'Website / Portfolio', val: profileData?.website  || 'Not specified' },
            { icon: '📍', label: 'Location',            val: profileData?.location || 'Not specified' },
            ...(profileData?.phone ? [{ icon: '📞', label: 'Phone / WhatsApp', val: profileData.phone }] : []),
          ].map((item, i) => (
            <View key={i}>
              {i > 0 && <GoldDivider />}
              <View style={pub.infoRow}>
                <View style={pub.infoIcon}><Text style={{ fontSize: 16 }}>{item.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: G.textSub }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: G.text, fontWeight: '500', marginTop: 1 }}>{item.val}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        {liveChannels.length > 0 && (
          <>
            <Text style={pub.sectionTitle}>Social Channels</Text>
            <View style={pub.card}>
              {liveChannels.map((ch, i) => (
                <View key={i}>
                  {i > 0 && <GoldDivider />}
                  <TouchableOpacity style={pub.channelRow} onPress={() => openLiveLink(ch.url)} activeOpacity={0.7}>
                    <View style={[pub.channelIcon, { backgroundColor: ch.color + '18' }]}><Text style={{ fontSize: 18 }}>{ch.icon}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={pub.channelName}>{ch.name}</Text>
                      <Text style={[pub.channelSub, { color: G.gold }]}>Tap to visit ↗</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[pub.channelVal, { color: ch.statusColor }]}>{ch.val}</Text>
                      <View style={{ backgroundColor: ch.statusColor + '15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: ch.statusColor }}>LIVE</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
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

const makePub = (G) => StyleSheet.create({
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },
  backBtn:        { width: 40, height: 40, justifyContent: 'center' },
  topTitle:       { fontSize: 18, fontWeight: '700', color: G.text },
  coverWrap:      { height: 220, backgroundColor: G.bgCard, overflow: 'hidden', position: 'relative' },
  coverGradient:  { flex: 1, backgroundColor: G.goldFaint },
  verifiedBadge:  { position: 'absolute', top: 14, right: 14, backgroundColor: 'rgba(34,197,94,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(34,197,94,0.4)' },
  heroSection:    { paddingHorizontal: 18, paddingBottom: 20, marginTop: -53 },
  avatarRing:     { width: 106, height: 106, borderRadius: 53, borderWidth: 3, borderColor: G.gold, padding: 3, overflow: 'hidden', backgroundColor: G.bg },
  avatar:         { flex: 1, borderRadius: 48, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  avatarText:     { fontSize: 36, fontWeight: '900', color: G.gold },
  collabBtn:      { backgroundColor: G.gold, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  collabTxt:      { color: G.bg, fontWeight: '900', fontSize: 13 },
  name:           { fontSize: 22, fontWeight: '900', color: G.text, letterSpacing: -0.5, marginTop: 12 },
  handle:         { fontSize: 13, color: G.goldDim, marginTop: 2, marginBottom: 10 },
  badgeRow:       { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  creatorBadge:   { backgroundColor: G.goldFaint, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 12, paddingVertical: 4 },
  creatorBadgeTxt:{ color: G.gold, fontSize: 11, fontWeight: '700' },
  locationBadge:  { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, paddingHorizontal: 12, paddingVertical: 4 },
  locationTxt:    { color: G.textSub, fontSize: 12 },
  bio:            { fontSize: 13, color: G.textSub, lineHeight: 22, marginBottom: 12 },
  tagsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  tag:            { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 12, paddingVertical: 5 },
  tagTxt:         { color: G.gold, fontSize: 10, fontWeight: '800' },
  statsCard:      { flexDirection: 'row', backgroundColor: G.bgCard, borderRadius: 18, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: G.border, paddingVertical: 18 },
  statBox:        { flex: 1, alignItems: 'center' },
  statDivider:    { borderRightWidth: 1, borderRightColor: G.borderAlt },
  statVal:        { fontSize: 20, fontWeight: '900', color: G.gold, letterSpacing: -0.5 },
  statLabel:      { fontSize: 10, color: G.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionTitle:   { fontSize: 10, fontWeight: '700', color: G.goldDim, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 18, marginBottom: 10, marginTop: 4 },
  card:           { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' },
  infoRow:        { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 14 },
  infoIcon:       { width: 38, height: 38, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  channelRow:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  channelIcon:    { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  channelName:    { fontSize: 14, fontWeight: '700', color: G.text },
  channelSub:     { fontSize: 11, marginTop: 1 },
  channelVal:     { fontSize: 15, fontWeight: '900' },
  stretchImg:     { width: '100%', height: '100%', resizeMode: 'cover' },
});

export default function ProfileScreen() {
  const { G } = useTheme();
  const ps = makePs(G);

  const { user, logout, token } = useAuth();
  const navigation = useNavigation();
  const [screen,      setScreen]      = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState(null);

  const role    = user?.role || 'influencer';
  const isBrand = role === 'brand';

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await fetchProfile(token, role);
      if (data.success) {
        setProfileData(data.profile);
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message);
      if (user) {
        setProfileData(
          isBrand
            ? { brandName: user.name || '', handle: user.handle || '', email: user.email || '', website: '', phone: '', location: '', categories: '', bio: '', gst: '', campaignsCount: '0', applicantsCount: '0', totalSpent: '₹0', avatar: '', coverImage: '' }
            : { username: user.name || '', handle: user.handle || '', email: user.email || '', website: '', phone: '', location: '', categories: '', bio: '', followers: '0', engagement: '0%', perPost: '₹0', avatar: '', coverImage: '' }
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const onRefresh = () => loadProfile(true);

  const displayName = isBrand
    ? (profileData?.brandName || user?.name || 'No Name Set')
    : (profileData?.username  || user?.name || 'No Username Set');

  const displayHandle = profileData?.handle
    ? (profileData.handle.startsWith('@') ? profileData.handle : `@${profileData.handle}`)
    : `@${displayName.toLowerCase().replace(/\s/g, '_')}`;

  const initial = displayName && !['No Name Set', 'No Username Set'].includes(displayName)
    ? displayName[0].toUpperCase() : 'V';

  const categoryTags = profileData?.categories
    ? profileData.categories.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const handleLogout = () =>
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);

  const openLiveLink = async (url) => {
    if (!url) { Alert.alert('No URL Provided', 'No live link set up yet.'); return; }
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
    else Alert.alert('Error', `Cannot open: ${url}`);
  };

  if (screen === 'editProfile' && profileData)
    return (
      <EditProfileScreen
        isBrand={isBrand} role={role} profileData={profileData} token={token}
        onSave={(updated) => { setProfileData(prev => ({ ...prev, ...updated })); setScreen('profile'); loadProfile(); }}
        onBack={() => setScreen('profile')}
      />
    );

  if (screen === 'publicProfile' && profileData)
    return <PublicInfluencerProfile profileData={profileData} onBack={() => setScreen('profile')} />;

  if (loading) return <LoadingSkeleton />;

  const stats = isBrand
    ? [
        { val: String(profileData?.campaignsCount  ?? '0'), label: 'Campaigns'   },
        { val: String(profileData?.applicantsCount ?? '0'), label: 'Applicants'  },
        { val: profileData?.totalSpent ?? '₹0',             label: 'Total Spent' },
      ]
    : [
        { val: profileData?.followers  ?? '0',  label: 'Followers'  },
        { val: profileData?.engagement ?? '0%', label: 'Engagement' },
        { val: profileData?.perPost    ?? '₹0', label: 'Per Post'   },
      ];

  const campaigns = profileData?.campaignsData?.length
    ? profileData.campaignsData
    : [{ icon: '📸', color: '#E1306C', name: 'No Active Campaigns', sub: 'Create a new campaign to start', val: '—', status: 'Draft', statusColor: G.textSub }];

  const liveChannels = [];
  if (profileData?.instagramLink) liveChannels.push({ icon: '📸', color: '#E1306C', name: 'Instagram',   sub: 'Tap to visit page ↗', val: profileData.instagramFollowers || 'Live', url: profileData.instagramLink, status: 'LIVE LINK', statusColor: G.pink });
  if (profileData?.youtubeLink)   liveChannels.push({ icon: '📺', color: '#FF0000', name: 'YouTube',     sub: 'Tap to visit page ↗', val: profileData.youtubeFollowers   || 'Live', url: profileData.youtubeLink,   status: 'LIVE LINK', statusColor: G.red  });
  if (profileData?.tiktokLink)    liveChannels.push({ icon: '🎵', color: '#000000', name: 'TikTok',      sub: 'Tap to visit page ↗', val: profileData.tiktokFollowers    || 'Live', url: profileData.tiktokLink,    status: 'LIVE LINK', statusColor: G.text });
  if (profileData?.twitterLink)   liveChannels.push({ icon: '🐦', color: '#1DA1F2', name: 'X / Twitter', sub: 'Tap to visit page ↗', val: profileData.twitterFollowers   || 'Live', url: profileData.twitterLink,   status: 'LIVE LINK', statusColor: G.teal });
  if (profileData?.linkedinLink)  liveChannels.push({ icon: '💼', color: '#0077B5', name: 'LinkedIn',    sub: 'Tap to visit page ↗', val: profileData.linkedinFollowers  || 'Live', url: profileData.linkedinLink,  status: 'LIVE LINK', statusColor: G.teal });
  if (profileData?.facebookLink)  liveChannels.push({ icon: '📘', color: '#1877F2', name: 'Facebook',    sub: 'Tap to visit page ↗', val: profileData.facebookFollowers  || 'Live', url: profileData.facebookLink,  status: 'LIVE LINK', statusColor: G.green});

  if (liveChannels.length === 0) {
    liveChannels.push(
      { icon: '📸', color: '#E1306C', name: 'Instagram (Setup Needed)', sub: 'Click Edit Profile to add live link', val: '—', url: null, status: 'NOT CONNECTED', statusColor: G.gold },
      { icon: '📺', color: '#FF0000', name: 'YouTube (Setup Needed)',   sub: 'Click Edit Profile to add live link', val: '—', url: null, status: 'NOT CONNECTED', statusColor: G.gold },
    );
  }

  const hasAvatar = profileData?.avatar     && typeof profileData.avatar     === 'string' && profileData.avatar.trim().length     > 0;
  const hasCover  = profileData?.coverImage && typeof profileData.coverImage === 'string' && profileData.coverImage.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={G.bg} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={G.gold} colors={[G.gold]} />}
      >
        <View style={ps.topBar}>
          <Text style={ps.topTitle}>My Profile</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {isBrand && (
              <TouchableOpacity style={ps.iconBtn}>
                <Text style={{ fontSize: 16 }}>📤</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={ps.iconBtn} onPress={() => navigation.navigate('SettingsTab', { screen: 'SettingsMain' })}>
              <Text style={{ fontSize: 18 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {error && (
          <View style={ps.errorBanner}>
            <Text style={ps.errorTxt}>⚠️ {error} — showing cached data</Text>
            <TouchableOpacity onPress={() => loadProfile()}><Text style={ps.retryTxt}>Retry</Text></TouchableOpacity>
          </View>
        )}

        <View style={ps.coverWrap}>
          {hasCover
            ? <Image source={{ uri: profileData.coverImage }} style={ps.stretchImg} key={profileData.coverImage} />
            : <View style={ps.coverPattern} />
          }
          <TouchableOpacity style={ps.coverEditBtn} onPress={() => setScreen('editProfile')}>
            <Text style={{ color: G.gold, fontSize: 11, fontWeight: '700' }}>📷   Edit Cover</Text>
          </TouchableOpacity>
        </View>

        <View style={ps.heroSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={[ps.avatarRing, isBrand && { borderRadius: 24 }]}>
              <View style={[ps.avatar, isBrand && { borderRadius: 20 }, { overflow: 'hidden' }]}>
                {hasAvatar
                  ? <Image source={{ uri: profileData.avatar }} style={ps.stretchImg} key={profileData.avatar} />
                  : <Text style={ps.avatarText}>{initial}</Text>
                }
              </View>
            </View>
            <TouchableOpacity style={ps.editBtn} onPress={() => setScreen('editProfile')}>
              <Text style={ps.editBtnTxt}>✏️   Edit Profile</Text>
            </TouchableOpacity>
          </View>
          <Text style={ps.name}>{displayName}</Text>
          <Text style={ps.handle}>{displayHandle}</Text>
          <View style={ps.badgeRow}>
            <View style={ps.roleBadge}>
              <Text style={ps.roleTxt}>{isBrand ? '🏢 Brand' : '🎬 Creator'}</Text>
            </View>
            {((isBrand && profileData?.verified) || !isBrand) && (
              <View style={[ps.roleBadge, { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)' }]}>
                <Text style={[ps.roleTxt, { color: G.green }]}>✓ PRO CREATOR</Text>
              </View>
            )}
            {profileData?.location && (
              <View style={ps.locationBadge}>
                <Text style={ps.locationTxt}>📍 {profileData.location}</Text>
              </View>
            )}
          </View>
          <Text style={ps.bio}>
            {profileData?.bio || (isBrand ? 'Describe your brand dashboard narratives.' : 'Delhi based lifestyle & beauty creator. Open for premium long-term brand collaborations. 🌿')}
          </Text>
          <View style={ps.tagsRow}>
            {(categoryTags.length > 0 ? categoryTags : ['BEAUTY', 'LIFESTYLE', 'SKINCARE']).map(t => (
              <View key={t} style={ps.tag}><Text style={ps.tagTxt}>🔥 {t.toUpperCase()}</Text></View>
            ))}
          </View>
        </View>

        <View style={ps.statsCard}>
          {stats.map((s, i) => (
            <View key={i} style={[ps.statBox, i < stats.length - 1 && ps.statDivider]}>
              <Text style={[ps.statVal, s.label === 'Engagement' && { color: G.teal }]}>{s.val}</Text>
              <Text style={ps.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={ps.sectionTitle}>{isBrand ? 'Brand Info' : 'Creator Media Kit Info'}</Text>
        <View style={ps.menuCard}>
          {[
            { icon: '✉️', label: 'Collaboration Email',      val: profileData?.email    || 'Not specified' },
            { icon: '🌐', label: 'Portfolio Link / Website', val: profileData?.website  || 'Not specified' },
            { icon: '📍', label: 'Primary Location',         val: profileData?.location || 'Not specified' },
            ...(profileData?.phone ? [{ icon: '📞', label: 'Phone', val: profileData.phone }] : []),
          ].map((item, i) => (
            <View key={i}>
              {i > 0 && <GoldDivider />}
              <View style={ps.menuRow}>
                <View style={ps.menuIconWrap}><Text style={{ fontSize: 16 }}>{item.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: G.textSub }}>{item.label}</Text>
                  <Text style={{ fontSize: 13, color: G.text, fontWeight: '500', marginTop: 1 }}>{item.val}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {isBrand ? (
          <>
            <Text style={ps.sectionTitle}>Active Campaigns</Text>
            <View style={ps.menuCard}>
              {campaigns.map((c, i) => (
                <View key={i}>
                  {i > 0 && <GoldDivider />}
                  <View style={ps.platformRow}>
                    <View style={[ps.platformIcon, { backgroundColor: (c.color || G.gold) + '20' }]}>
                      <Text style={{ fontSize: 18 }}>{c.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ps.platformName}>{c.name}</Text>
                      <Text style={ps.platformHandle}>{c.sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={ps.platformCount}>{c.val}</Text>
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
            <Text style={ps.sectionTitle}>Connected Channels (Tap to Visit Live)</Text>
            <View style={ps.menuCard}>
              {liveChannels.map((ch, i) => (
                <View key={i}>
                  {i > 0 && <GoldDivider />}
                  <TouchableOpacity style={ps.platformRow} onPress={() => openLiveLink(ch.url)} activeOpacity={0.7}>
                    <View style={[ps.platformIcon, { backgroundColor: (ch.color || G.gold) + '15' }]}>
                      <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={ps.platformName}>{ch.name}</Text>
                      <Text style={[ps.platformHandle, ch.url && { color: G.gold }]}>{ch.sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[ps.platformCount, { color: G.text }]}>{ch.val}</Text>
                      <View style={{ backgroundColor: (ch.statusColor || G.green) + '15', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, marginTop: 3 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: ch.statusColor, letterSpacing: 0.3 }}>{ch.status}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
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
const makePs = (G) => StyleSheet.create({
  topBar:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12 },
  topTitle:      { fontSize: 22, fontWeight: '900', color: G.text, letterSpacing: -0.5 },
  iconBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: G.bgCard, borderWidth: 1, borderColor: G.border, justifyContent: 'center', alignItems: 'center' },
  errorBanner:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(239,68,68,0.1)', marginHorizontal: 16, marginTop: 8, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)' },
  errorTxt:      { color: G.red, fontSize: 12, flex: 1 },
  retryTxt:      { color: G.gold, fontSize: 12, fontWeight: '700', marginLeft: 10 },
  coverWrap:     { height: 200, backgroundColor: G.bgCard, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  coverPattern:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.06, backgroundColor: G.gold },
  coverEditBtn:  { position: 'absolute', bottom: 12, right: 14, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: G.border, zIndex: 10 },
  heroSection:   { paddingHorizontal: 18, paddingBottom: 20, marginTop: -53 },
  avatarRing:    { width: 106, height: 106, borderRadius: 53, borderWidth: 3, borderColor: G.gold, padding: 3, overflow: 'hidden', backgroundColor: G.bg },
  avatar:        { flex: 1, borderRadius: 48, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  avatarText:    { fontSize: 36, fontWeight: '900', color: G.gold },
  name:          { fontSize: 22, fontWeight: '900', color: G.text, letterSpacing: -0.5, marginTop: 12 },
  handle:        { fontSize: 13, color: G.goldDim, marginTop: 2, marginBottom: 10 },
  badgeRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 12 },
  roleBadge:     { backgroundColor: G.goldFaint, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 12, paddingVertical: 4 },
  roleTxt:       { color: G.gold, fontSize: 11, fontWeight: '700' },
  locationBadge: { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, paddingHorizontal: 12, paddingVertical: 4 },
  locationTxt:   { color: G.textSub, fontSize: 12 },
  bio:           { fontSize: 13, color: G.textSub, lineHeight: 22, marginBottom: 12 },
  tagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  tag:           { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.border, paddingHorizontal: 12, paddingVertical: 5 },
  tagTxt:        { color: G.gold, fontSize: 10, fontWeight: '800' },
  editBtn:       { borderWidth: 1.5, borderColor: G.gold, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 9, backgroundColor: G.goldFaint },
  editBtnTxt:    { color: G.gold, fontWeight: '700', fontSize: 13 },
  statsCard:     { flexDirection: 'row', backgroundColor: G.bgCard, borderRadius: 18, marginHorizontal: 16, marginBottom: 24, borderWidth: 1, borderColor: G.border, paddingVertical: 18 },
  statBox:       { flex: 1, alignItems: 'center' },
  statDivider:   { borderRightWidth: 1, borderRightColor: G.borderAlt },
  statVal:       { fontSize: 20, fontWeight: '900', color: G.gold, letterSpacing: -0.5 },
  statLabel:     { fontSize: 10, color: G.textSub, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionTitle:  { fontSize: 10, fontWeight: '700', color: G.goldDim, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 18, marginBottom: 10, marginTop: 4 },
  menuCard:      { backgroundColor: G.bgCard, borderRadius: 16, borderWidth: 1, borderColor: G.borderAlt, marginHorizontal: 16, marginBottom: 20, overflow: 'hidden' },
  menuRow:       { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 14 },
  menuIconWrap:  { width: 38, height: 38, borderRadius: 10, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  platformRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  platformIcon:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  platformName:  { fontSize: 14, fontWeight: '700', color: G.text },
  platformHandle:{ fontSize: 11, color: G.textSub, marginTop: 1 },
  platformCount: { fontSize: 15, fontWeight: '900', color: G.gold },
  stretchImg:    { width: '100%', height: '100%', resizeMode: 'cover' },
});