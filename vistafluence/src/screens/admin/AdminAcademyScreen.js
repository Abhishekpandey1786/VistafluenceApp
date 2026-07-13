import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl, TextInput,
  Switch, Modal, ScrollView, Clipboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/index';

const BASE_URL = 'http://192.168.1.2:5000/api';

const C = {
  bg: '#0f1117', card: '#1a1d23', border: '#2d3140',
  text: '#f1f5f9', muted: '#94a3b8', accent: '#7c3aed',
  success: '#10b981', danger: '#ef4444', warning: '#f59e0b',
  gold: '#E8C87A', deep: '#13151c',
};

const PLAN_COLORS = {
  free:    { bg: '#1e293b', text: '#94a3b8' },
  Advance: { bg: '#78350f', text: '#fcd34d' },
  Premium: { bg: '#2e1f5e', text: '#c4b5fd' },
};

const TABS = ['Courses', 'Users'];

// ── Plan Badge ────────────────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const c = PLAN_COLORS[plan] || PLAN_COLORS.free;
  return (
    <View style={[ss.badge, { backgroundColor: c.bg }]}>
      <Text style={[ss.badgeText, { color: c.text }]}>{plan || 'free'}</Text>
    </View>
  );
}

// ── Add Course Modal ──────────────────────────────────────────────────────────
function AddCourseModal({ visible, onClose, onAdded }) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [category, setCategory] = useState('General');
  const [level, setLevel]       = useState('Beginner');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!title.trim()) return Alert.alert('Title required');
    setLoading(true);
    try {
      const res = await api.post('/academy/admin/courses', {
        title, description: desc, category, level,
      });
      if (res.success) {
        onAdded(res.course);
        setTitle(''); setDesc(''); setCategory('General'); setLevel('Beginner');
        onClose();
      }
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ss.modalOverlay}>
        <View style={ss.modalCard}>
          <Text style={ss.modalTitle}>New Course</Text>

          <Text style={ss.lbl}>Title *</Text>
          <TextInput
            style={ss.inp} value={title} onChangeText={setTitle}
            placeholder="Course title" placeholderTextColor={C.muted}
          />

          <Text style={ss.lbl}>Description</Text>
          <TextInput
            style={[ss.inp, { height: 70 }]} value={desc} onChangeText={setDesc}
            multiline placeholder="Brief description..." placeholderTextColor={C.muted}
          />

          <Text style={ss.lbl}>Category</Text>
          <TextInput
            style={ss.inp} value={category} onChangeText={setCategory}
            placeholder="e.g. Monetization" placeholderTextColor={C.muted}
          />

          <Text style={ss.lbl}>Level</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Beginner', 'Intermediate', 'Advanced'].map(l => (
              <TouchableOpacity
                key={l} onPress={() => setLevel(l)}
                style={[ss.chip, level === l && ss.chipActive]}
              >
                <Text style={[ss.chipTxt, level === l && { color: '#fff' }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[ss.btn, { flex: 1, backgroundColor: C.border }]}
              onPress={onClose}
            >
              <Text style={[ss.btnTxt, { color: C.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ss.btn, { flex: 1 }]}
              onPress={submit}
              disabled={loading}
            >
              <Text style={ss.btnTxt}>{loading ? 'Creating...' : 'Create'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Add Video Modal ───────────────────────────────────────────────────────────
function AddVideoModal({ visible, course, onClose, onAdded }) {
  const [title, setTitle]         = useState('');
  const [duration, setDuration]   = useState('');
  const [isFree, setIsFree]       = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [progress, setProgress]   = useState('');

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setVideoFile(result.assets[0]);
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.length > 0) {
        setPdfFile(result.assets[0]);
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const resetForm = () => {
    setTitle(''); setDuration(''); setVideoFile(null);
    setPdfFile(null); setIsFree(false); setProgress('');
  };

  const submit = async () => {
    if (!title.trim()) return Alert.alert('Title required');
    if (!videoFile)    return Alert.alert('Video file required');

    setLoading(true);
    setProgress('Preparing upload...');

    try {
      const formData = new FormData();
      formData.append('title',        title.trim());
      formData.append('durationMins', duration || '0');
      formData.append('isFree',       String(isFree));

      formData.append('video', {
        uri:  videoFile.uri,
        name: videoFile.name || `video_${Date.now()}.mp4`,
        type: videoFile.mimeType || 'video/mp4',
      });

      if (pdfFile) {
        formData.append('pdf', {
          uri:  pdfFile.uri,
          name: pdfFile.name || `notes_${Date.now()}.pdf`,
          type: 'application/pdf',
        });
      }

      const token = await AsyncStorage.getItem('vistafluence_token');
      setProgress('Uploading to Cloudinary...');

      const response = await fetch(
        `${BASE_URL}/academy/admin/courses/${course._id}/videos`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const res = await response.json();

      if (res.success) {
        onAdded(course._id, res.video);
        resetForm();
        onClose();
        Alert.alert('Done', 'Video successfully uploaded!');
      } else {
        Alert.alert('Error', res.message || 'Upload failed');
      }
    } catch (e) {
      Alert.alert('Upload Error', e.message);
    }

    setLoading(false);
    setProgress('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={ss.modalOverlay}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={[ss.modalCard, { marginTop: 60 }]}>

            <Text style={ss.modalTitle}>Add Video to "{course?.title}"</Text>

            <Text style={ss.lbl}>Video Title *</Text>
            <TextInput
              style={ss.inp} value={title} onChangeText={setTitle}
              placeholder="e.g. Introduction to Brand Deals"
              placeholderTextColor={C.muted}
            />

            <Text style={ss.lbl}>Video File * (MP4 / MOV)</Text>
            <TouchableOpacity
              style={[ss.filePicker, videoFile && ss.filePickerSelected]}
              onPress={pickVideo}
              disabled={loading}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>📹</Text>
              <Text style={{
                color: videoFile ? C.success : C.accent,
                fontSize: 13, fontWeight: '700', textAlign: 'center',
              }}>
                {videoFile ? `✓  ${videoFile.name}` : 'Select Video File'}
              </Text>
              {videoFile && (
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Tap to change</Text>
              )}
            </TouchableOpacity>

            <Text style={ss.lbl}>PDF Notes (optional)</Text>
            <TouchableOpacity
              style={[ss.filePicker, pdfFile && ss.filePickerSelected, { borderColor: pdfFile ? C.success : C.border }]}
              onPress={pickPdf}
              disabled={loading}
            >
              <Text style={{ fontSize: 22, marginBottom: 4 }}>📄</Text>
              <Text style={{
                color: pdfFile ? C.success : C.muted,
                fontSize: 13, fontWeight: '600', textAlign: 'center',
              }}>
                {pdfFile ? `✓  ${pdfFile.name}` : 'Select PDF File (optional)'}
              </Text>
              {pdfFile && (
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Tap to change</Text>
              )}
            </TouchableOpacity>

            <Text style={ss.lbl}>Duration (minutes)</Text>
            <TextInput
              style={ss.inp} value={duration} onChangeText={setDuration}
              placeholder="e.g. 12" placeholderTextColor={C.muted}
              keyboardType="numeric"
            />

            <View style={{
              flexDirection: 'row', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 20, marginTop: 4,
            }}>
              <Text style={ss.lbl}>Free Preview?</Text>
              <Switch
                value={isFree} onValueChange={setIsFree}
                trackColor={{ false: C.border, true: C.accent }}
                thumbColor={isFree ? '#fff' : C.muted}
                disabled={loading}
              />
            </View>

            {loading && (
              <View style={ss.progressBox}>
                <ActivityIndicator color={C.accent} size="small" />
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 8 }}>{progress}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>
                  Video badi ho to thoda time lagega...
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[ss.btn, { flex: 1, backgroundColor: C.border }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[ss.btnTxt, { color: C.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ss.btn, { flex: 1, opacity: loading ? 0.7 : 1 }]}
                onPress={submit}
                disabled={loading}
              >
                <Text style={ss.btnTxt}>{loading ? 'Uploading...' : 'Upload & Add'}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, onDelete, onTogglePublish, onAddVideo, onDeleteVideo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={ss.courseCard}>
      <View style={ss.courseTop}>
        <View style={{ flex: 1 }}>
          <Text style={ss.courseTitle}>{course.title}</Text>
          <Text style={ss.courseMeta}>
            {course.category} · {course.level} · {course.videos?.length || 0} videos
          </Text>
        </View>
        <View style={[ss.publishBadge, {
          backgroundColor: course.published ? '#10b98122' : '#ef444422',
        }]}>
          <Text style={{ color: course.published ? C.success : C.danger, fontSize: 10, fontWeight: '700' }}>
            {course.published ? 'Live' : 'Draft'}
          </Text>
        </View>
      </View>

      <View style={ss.courseActions}>
        <TouchableOpacity style={ss.actionBtn} onPress={() => onTogglePublish(course._id)}>
          <Text style={[ss.actionBtnTxt, { color: course.published ? C.warning : C.success }]}>
            {course.published ? 'Unpublish' : 'Publish'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={ss.actionBtn} onPress={() => onAddVideo(course)}>
          <Text style={[ss.actionBtnTxt, { color: C.accent }]}>+ Add Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={ss.actionBtn} onPress={() => setExpanded(!expanded)}>
          <Text style={[ss.actionBtnTxt, { color: C.muted }]}>
            {expanded ? 'Hide' : 'Videos'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert('Delete Course?', course.title, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => onDelete(course._id) },
        ])}>
          <Text style={{ color: C.danger, fontSize: 12, fontWeight: '700' }}>Delete</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={ss.videoList}>
          <View style={{ height: 1, backgroundColor: C.border, marginBottom: 8 }} />
          {(!course.videos || course.videos.length === 0) && (
            <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', paddingVertical: 12 }}>
              Koi video nahi — "Add Video" press karo
            </Text>
          )}
          {(course.videos || []).map((v, idx) => (
            <View key={v._id} style={ss.videoRow}>
              <View style={ss.videoNum}>
                <Text style={{ color: C.muted, fontSize: 10, fontWeight: '900' }}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: '600' }}>{v.title}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                  {v.durationMins} min
                  {v.isFree ? ' · Free' : ''}
                  {v.pdfUrl ? ' · PDF' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete Video?', v.title, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => onDeleteVideo(course._id, v._id) },
              ])}>
                <Text style={{ color: C.danger, fontSize: 12 }}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AdminAcademyScreen() {
  const [tab, setTab] = useState('Courses');

  const [courses, setCourses]               = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showAddCourse, setShowAddCourse]   = useState(false);
  const [addVideoFor, setAddVideoFor]       = useState(null);

  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch]             = useState('');
  const [userFilter, setUserFilter]     = useState('all');
  const [togglingId, setTogglingId]     = useState(null);
  const [refreshing, setRefreshing]     = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await api.get('/academy/admin/courses');
      if (res.success) setCourses(res.courses || []);
    } catch (e) { console.log(e.message); }
    setCoursesLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 50 });
      if (userFilter === 'influencer') params.append('role', 'influencer');
      if (search) params.append('search', search);
      const res = await api.get(`/admin/users?${params}`);
      if (res.success) {
        let list = res.users;
        if (userFilter === 'withAccess') list = list.filter(u => u.academyAccess);
        setUsers(list);
      }
    } catch (e) { console.log(e.message); }
    setUsersLoading(false);
    setRefreshing(false);
  }, [userFilter, search]);

  useEffect(() => { loadCourses(); }, []);
  useEffect(() => { if (tab === 'Users') loadUsers(); }, [tab, userFilter, search]);

  const handleTogglePublish = async (courseId) => {
    try {
      const res = await api.patch(`/academy/admin/courses/${courseId}/publish`);
      if (res.success) {
        setCourses(prev => prev.map(c =>
          c._id === courseId ? { ...c, published: res.published } : c
        ));
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await api.delete(`/academy/admin/courses/${courseId}`);
      setCourses(prev => prev.filter(c => c._id !== courseId));
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const handleVideoAdded = (courseId, video) => {
    setCourses(prev => prev.map(c =>
      c._id === courseId ? { ...c, videos: [...(c.videos || []), video] } : c
    ));
  };

  const handleDeleteVideo = async (courseId, videoId) => {
    try {
      await api.delete(`/academy/admin/videos/${videoId}`);
      setCourses(prev => prev.map(c =>
        c._id === courseId
          ? { ...c, videos: c.videos.filter(v => v._id !== videoId) }
          : c
      ));
    } catch (e) { Alert.alert('Error', e.message); }
  };

  // ✅ FIXED toggleAcademy — access band karne pe local state bhi refresh karo
  const toggleAcademy = async (userId, current) => {
    setTogglingId(userId);
    try {
      const res = await api.put(`/admin/users/${userId}/academy`, { access: !current });
      if (res.success) {
        setUsers(prev => prev.map(u =>
          u._id === userId
            ? {
                ...u,
                academyAccess: !current,
                // ✅ Access band karne pe local state mein bhi password + expiry clear karo
                // Taaki UI turant reflect kare ki user locked hai
                ...(current === true && {
                  academyAccessExpiresAt: null,
                }),
              }
            : u
        ));

        if (current) {
          Alert.alert('Access Revoked', 'User ab academy access nahi kar sakta. Password bhi invalidate ho gaya.');
        }
      }
    } catch (e) { Alert.alert('Error', e.message); }
    setTogglingId(null);
  };

  const setPlan = async (userId, plan) => {
    try {
      const res = await api.put(`/admin/users/${userId}/subscription`, { plan });
      if (res.success) {
        setUsers(prev => prev.map(u =>
          u._id === userId
            ? {
                ...u,
                subscription: { ...u.subscription, plan },
                academyAccess: ['Advance', 'Premium'].includes(plan),
              }
            : u
        ));
        Alert.alert(
          'Done',
          `Plan: ${plan}${['Advance', 'Premium'].includes(plan) ? ' + Academy access granted' : ''}`
        );
      }
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const upgradePlan = (userId, name) => {
    Alert.alert(`${name} ka Plan`, 'Kaunsa plan dena hai?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Advance (₹499)',  onPress: () => setPlan(userId, 'Advance') },
      { text: 'Premium (₹999)', onPress: () => setPlan(userId, 'Premium') },
      { text: 'Free (Remove)', style: 'destructive', onPress: () => setPlan(userId, 'free') },
    ]);
  };

  // ✅ FIXED generateAcademyPassword — local state bhi update karo
  const generateAcademyPassword = async (userId, userName, userEmail) => {
    setGeneratingId(userId);
    try {
      const res = await api.post(`/academy/admin/users/${userId}/academy-password`);
      if (res.success) {
        const pwd = res.academyPassword;
        Clipboard.setString(pwd);

        // ✅ Backend ab academyAccess: true set karta hai password generate pe
        // Isliye local state bhi update karo
        setUsers(prev => prev.map(u =>
          u._id === userId ? { ...u, academyAccess: true } : u
        ));

        Alert.alert(
          'Password Ready!',
          `User: ${userName || userEmail}\nEmail: ${userEmail}\n\n` +
          `Academy Password:\n${pwd}\n\n` +
          `Clipboard pe copy ho gaya!\n\n` +
          `Academy access bhi ON kar diya gaya hai.\n` +
          `Ab is password ko manually is user ko email karo.`,
          [{ text: 'Done', style: 'default' }]
        );
      } else {
        Alert.alert('Error', res.message || 'Password generate nahi hua');
      }
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setGeneratingId(null);
  };

  const accessCount = users.filter(u => u.academyAccess).length;

  return (
    <View style={ss.wrap}>

      <View style={ss.header}>
        <Text style={ss.headerTitle}>Academy Admin</Text>
        {tab === 'Courses' && (
          <TouchableOpacity style={ss.addBtn} onPress={() => setShowAddCourse(true)}>
            <Text style={ss.addBtnTxt}>+ New Course</Text>
          </TouchableOpacity>
        )}
        {tab === 'Users' && (
          <View style={ss.countBadge}>
            <Text style={ss.countBadgeTxt}>{accessCount} with access</Text>
          </View>
        )}
      </View>

      <View style={ss.tabs}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t}
            style={[ss.tab, tab === t && ss.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[ss.tabTxt, tab === t && ss.tabTxtActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'Courses' && (
        coursesLoading
          ? <View style={ss.center}><ActivityIndicator color={C.accent} size="large" /></View>
          : <FlatList
              data={courses}
              keyExtractor={i => i._id}
              contentContainerStyle={{ padding: 16 }}
              ListEmptyComponent={
                <View style={ss.center}>
                  <Text style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>
                    Koi course nahi.{'\n'}
                    <Text style={{ color: C.accent }}>+ New Course</Text> press karo.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <CourseCard
                  course={item}
                  onDelete={handleDeleteCourse}
                  onTogglePublish={handleTogglePublish}
                  onAddVideo={setAddVideoFor}
                  onDeleteVideo={handleDeleteVideo}
                />
              )}
            />
      )}

      {tab === 'Users' && (
        <View style={{ flex: 1 }}>
          <View style={ss.searchBox}>
            <TextInput
              style={ss.searchInp}
              placeholder="User dhundo..."
              placeholderTextColor={C.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <View style={ss.filterRow}>
            {[
              { k: 'all',        l: 'Sab' },
              { k: 'withAccess', l: 'Has Access' },
              { k: 'influencer', l: 'Influencers' },
            ].map(f => (
              <TouchableOpacity
                key={f.k}
                style={[ss.filterChip, userFilter === f.k && ss.filterChipActive]}
                onPress={() => setUserFilter(f.k)}
              >
                <Text style={[ss.filterChipTxt, userFilter === f.k && ss.filterChipTxtActive]}>
                  {f.l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ✅ UPDATED: Info banner mein clear explanation */}
          <View style={ss.infoBanner}>
            <Text style={{ color: '#a5b4fc', fontSize: 12, lineHeight: 18 }}>
              Access band karne pe password bhi automatically invalidate ho jata hai — purana password kaam nahi karega.
            </Text>
          </View>

          {usersLoading
            ? <View style={ss.center}><ActivityIndicator color={C.accent} size="large" /></View>
            : <FlatList
                data={users}
                keyExtractor={i => i._id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={() => { setRefreshing(true); loadUsers(); }}
                    tintColor={C.accent}
                  />
                }
                ListEmptyComponent={
                  <Text style={{ color: C.muted, textAlign: 'center', marginTop: 40 }}>
                    Koi user nahi mila
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={ss.userCard}>
                    <View style={ss.userTop}>
                      <View style={ss.avatar}>
                        <Text style={ss.avatarTxt}>
                          {(item.name || item.email)?.[0]?.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={ss.userName}>{item.name || 'No name'}</Text>
                        <Text style={ss.userEmail}>{item.email}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                          <PlanBadge plan={item.subscription?.plan} />
                          {item.academyAccess && (
                            <View style={ss.academyBadge}>
                              <Text style={{ color: C.success, fontSize: 11, fontWeight: '600' }}>
                                Academy
                              </Text>
                            </View>
                          )}
                          {item.academyAccess && item.academyAccessExpiresAt && (
                            <View style={[ss.academyBadge, { borderColor: C.warning }]}>
                              <Text style={{ color: C.warning, fontSize: 10 }}>
                                Expires: {new Date(item.academyAccessExpiresAt).toLocaleDateString('en-IN')}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={ss.userActions}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={{ color: C.text, fontSize: 14, fontWeight: '500' }}>
                            Academy Access
                          </Text>
                          <Text style={{ fontSize: 11, color: item.academyAccess ? C.success : C.danger, marginTop: 2 }}>
                            {item.academyAccess ? 'Active' : 'No Access'}
                          </Text>
                        </View>
                        {togglingId === item._id
                          ? <ActivityIndicator size="small" color={C.accent} />
                          : <Switch
                              value={item.academyAccess || false}
                              onValueChange={() => toggleAcademy(item._id, item.academyAccess || false)}
                              trackColor={{ false: C.border, true: C.accent }}
                              thumbColor={item.academyAccess ? '#fff' : C.muted}
                            />
                        }
                      </View>

                      <TouchableOpacity
                        style={ss.planBtn}
                        onPress={() => upgradePlan(item._id, item.name || item.email)}
                      >
                        <Text style={ss.planBtnTxt}>
                          Plan: {item.subscription?.plan || 'free'} — Change
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[ss.planBtn, ss.pwdBtn]}
                        onPress={() => generateAcademyPassword(item._id, item.name, item.email)}
                        disabled={generatingId === item._id}
                      >
                        {generatingId === item._id
                          ? <ActivityIndicator size="small" color={C.success} />
                          : <Text style={ss.pwdBtnTxt}>
                              Generate Academy Password
                            </Text>
                        }
                      </TouchableOpacity>

                    </View>
                  </View>
                )}
              />
          }
        </View>
      )}

      <AddCourseModal
        visible={showAddCourse}
        onClose={() => setShowAddCourse(false)}
        onAdded={course => setCourses(prev => [course, ...prev])}
      />
      {addVideoFor && (
        <AddVideoModal
          visible={!!addVideoFor}
          course={addVideoFor}
          onClose={() => setAddVideoFor(null)}
          onAdded={handleVideoAdded}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  wrap:        { flex: 1, backgroundColor: C.bg },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text },
  addBtn:      { backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  addBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  countBadge:  { backgroundColor: '#2e1f5e', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  countBadgeTxt: { color: '#c4b5fd', fontSize: 12, fontWeight: '700' },
  tabs:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, marginHorizontal: 20 },
  tab:         { paddingVertical: 10, paddingHorizontal: 16, marginBottom: -1 },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: C.accent },
  tabTxt:      { color: C.muted, fontSize: 14, fontWeight: '600' },
  tabTxtActive:{ color: C.accent },
  courseCard:   { backgroundColor: C.card, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: C.border },
  courseTop:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  courseTitle:  { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  courseMeta:   { fontSize: 12, color: C.muted },
  publishBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  courseActions:{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  actionBtn:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 0.5, borderColor: C.border },
  actionBtnTxt: { fontSize: 12, fontWeight: '600' },
  videoList:    { marginTop: 10 },
  videoRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: C.border },
  videoNum:     { width: 26, height: 26, borderRadius: 4, backgroundColor: C.deep, alignItems: 'center', justifyContent: 'center' },
  searchBox:          { marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: C.card, borderRadius: 10, borderWidth: 0.5, borderColor: C.border },
  searchInp:          { color: C.text, padding: 12, fontSize: 14 },
  filterRow:          { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 0.5, borderColor: C.border, backgroundColor: C.card },
  filterChipActive:   { backgroundColor: C.accent, borderColor: C.accent },
  filterChipTxt:      { color: C.muted, fontSize: 12 },
  filterChipTxtActive:{ color: '#fff', fontWeight: '600' },
  infoBanner:         { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e1b4b', borderRadius: 8, padding: 10, borderWidth: 0.5, borderColor: '#3730a3' },
  userCard:    { backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: C.border },
  userTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  avatar:      { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2e1f5e', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarTxt:   { color: C.accent, fontWeight: '700', fontSize: 15 },
  userName:    { fontSize: 14, fontWeight: '600', color: C.text },
  userEmail:   { fontSize: 12, color: C.muted, marginTop: 1 },
  userActions: { borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 10, gap: 8 },
  academyBadge:{ backgroundColor: '#1e3a2f', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 0.5, borderColor: C.success },
  planBtn:     { backgroundColor: '#1e1b4b', borderRadius: 8, padding: 10, borderWidth: 0.5, borderColor: '#3730a3', alignItems: 'center' },
  planBtnTxt:  { color: '#a5b4fc', fontSize: 13, fontWeight: '600' },
  pwdBtn:      { backgroundColor: '#0d2318', borderColor: '#10b981' },
  pwdBtnTxt:   { color: '#10b981', fontSize: 13, fontWeight: '600' },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:   { fontSize: 11, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderTopWidth: 1, borderColor: C.border },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 16 },
  lbl:          { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 6, marginTop: 10 },
  inp:          { backgroundColor: C.bg, color: C.text, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: C.border, marginBottom: 4 },
  chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  chipActive:   { backgroundColor: C.accent, borderColor: C.accent },
  chipTxt:      { color: C.muted, fontSize: 12, fontWeight: '600' },
  btn:          { backgroundColor: C.accent, borderRadius: 10, padding: 14, alignItems: 'center' },
  btnTxt:       { color: '#fff', fontWeight: '800', fontSize: 14 },
  filePicker: {
    backgroundColor: C.bg, borderRadius: 10, padding: 16,
    borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4, minHeight: 80,
  },
  filePickerSelected: { borderColor: C.success, borderStyle: 'solid', backgroundColor: '#0d2318' },
  progressBox: {
    backgroundColor: C.deep, borderRadius: 10, padding: 16,
    alignItems: 'center', marginBottom: 16, borderWidth: 0.5, borderColor: C.border,
  },
});