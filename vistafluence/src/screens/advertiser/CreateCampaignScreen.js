import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  Alert, StatusBar, ActivityIndicator, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/Themecontext';

const CATEGORIES = ['Fashion', 'Tech', 'Beauty', 'Food', 'Fitness', 'Travel', 'Gaming'];
const API_BASE = 'http://192.168.1.2:5000/api';

async function postFormData(path, formData) {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    let token = await AsyncStorage.getItem('vistafluence_token');
    if (!token || token === 'undefined') return { success: false, message: "Session expired. Please Re-login." };
    if (token.startsWith('"') && token.endsWith('"')) token = token.slice(1, -1);
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    return await res.json();
  } catch (error) {
    return { success: false, message: "Network handshake failed." };
  }
}

export default function CreateCampaignScreen({ navigation }) {
  const { G } = useTheme();

  const [form, setForm] = useState({
    title: '', description: '', budget: '', deadline: '', category: '', deliverables: '',
  });
  const [image, setImage] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSelectImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("PERMISSION REQUIRED", "App needs storage permissions to select layouts.");
        return;
      }
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsEditing: false, quality: 0.8,
      });
      if (response.canceled) return;
      if (response.assets && response.assets.length > 0) {
        const selectedAsset = response.assets[0];
        setImage({ uri: selectedAsset.uri, type: selectedAsset.mimeType || 'image/jpeg', fileName: selectedAsset.fileName || `campaign_${Date.now()}.jpg` });
        setImageUrlInput('');
      }
    } catch (err) {
      Alert.alert("SYSTEM FAULT", "Failed to launch native gallery module.");
    }
  };

  const handleCreateCampaign = async () => {
    const { title, description, budget, deadline, category, deliverables } = form;
    if (!title.trim() || !budget.trim() || !category) {
      Alert.alert("VALIDATION ERROR", "Please provide Title, Budget, and Category.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('budget', Number(budget));
    formData.append('deadline', deadline);
    formData.append('category', category);
    const parsedDeliverables = deliverables ? deliverables.split(',').map(item => item.trim()) : [];
    formData.append('deliverables', JSON.stringify(parsedDeliverables));
    if (image) {
      const fileUri = Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri;
      formData.append('coverArt', { uri: fileUri, type: image.type, name: image.fileName });
    } else if (imageUrlInput.trim()) {
      formData.append('coverArt', imageUrlInput.trim());
    } else {
      formData.append('coverArt', 'https://picsum.photos/800/450');
    }
    const data = await postFormData('/campaigns', formData);
    setLoading(false);
    if (data.success) {
      Alert.alert("SUCCESS", "Campaign deployed successfully!");
      setForm({ title: '', description: '', budget: '', deadline: '', category: '', deliverables: '' });
      setImage(null);
      setImageUrlInput('');
      if (navigation) navigation.goBack();
    } else {
      Alert.alert("DEPLOYMENT FAILED", data.message || "Something went wrong.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: G.bg, paddingHorizontal: 20 }}>
      <StatusBar barStyle="light-content" />
      <View style={{ marginTop: 60, marginBottom: 30 }}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: G.text, marginTop: 5 }}>
          LAUNCH <Text style={{ color: G.gold }}>CAMPAIGN</Text>
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity
          style={{ width: '100%', height: 180, backgroundColor: G.bgCard, borderWidth: 1, borderColor: image ? G.teal : G.borderAlt, borderStyle: 'dashed', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, zIndex: 999 }}
          onPress={handleSelectImage} activeOpacity={0.7}>
          {image ? (
            <>
              <Text style={{ color: G.teal, fontSize: 30, fontWeight: '300' }}>✓</Text>
              <Text style={{ color: G.teal, fontSize: 12, fontWeight: '800', marginTop: 10, letterSpacing: 1 }}>ART READY TO DEPLOY</Text>
              <Text style={{ color: G.textSub, fontSize: 10, marginTop: 5 }}>{image.fileName ? image.fileName.slice(-25) : 'Image captured'}</Text>
            </>
          ) : (
            <>
              <Text style={{ color: G.gold, fontSize: 30, fontWeight: '300' }}>+</Text>
              <Text style={{ color: G.text, fontSize: 12, fontWeight: '800', marginTop: 10, letterSpacing: 1 }}>UPLOAD COVER ART</Text>
              <Text style={{ color: G.textSub, fontSize: 10, marginTop: 5 }}>16:9 recommended</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Image URL Input */}
        {!image && (
          <View style={{ marginBottom: 25 }}>
            <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>IMAGE URL(OPTIONAL)</Text>
            <TextInput
              style={{ backgroundColor: G.bgCard, color: G.text, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600' }}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor={G.textSub}
              value={imageUrlInput}
              onChangeText={setImageUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        )}
        <View style={{ marginBottom: 35 }}>
          <Text style={{ color: G.gold, fontSize: 11, fontWeight: '900', marginBottom: 20, opacity: 0.8 }}>/ CORE_IDENTITY</Text>

          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>CAMPAIGN TITLE *</Text>
          <TextInput
            style={{ backgroundColor: G.bgCard, color: G.text, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600', marginBottom: 20 }}
            placeholder="e.g. AIR MAX URBAN SERIES"
            placeholderTextColor={G.textSub}
            value={form.title}
            onChangeText={v => update('title', v)}
          />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>BUDGET (₹) *</Text>
              <TextInput
                style={{ backgroundColor: G.bgCard, color: G.text, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600' }}
                placeholder="15000" placeholderTextColor={G.textSub}
                keyboardType="numeric" value={form.budget}
                onChangeText={v => update('budget', v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>DEADLINE</Text>
              <TextInput
                style={{ backgroundColor: G.bgCard, color: G.text, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600' }}
                placeholder="20/05/2026" placeholderTextColor={G.textSub}
                value={form.deadline} onChangeText={v => update('deadline', v)}
              />
            </View>
          </View>
        </View>

        {/* Category */}
        <View style={{ marginBottom: 35 }}>
          <Text style={{ color: G.gold, fontSize: 11, fontWeight: '900', marginBottom: 20, opacity: 0.8 }}>/ TARGET_NICHE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: form.category === cat ? G.gold : G.bgCard, marginRight: 10, borderWidth: 1, borderColor: form.category === cat ? G.gold : G.borderAlt, borderRadius: 8 }}
                onPress={() => update('category', cat)}>
                <Text style={{ color: form.category === cat ? G.bg : G.textSub, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description & Deliverables */}
        <View style={{ marginBottom: 35 }}>
          <Text style={{ color: G.gold, fontSize: 11, fontWeight: '900', marginBottom: 20, opacity: 0.8 }}>/ PROJECT_BRIEF</Text>

          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>DESCRIPTION</Text>
          <TextInput
            style={{ backgroundColor: G.bgCard, color: G.text, borderWidth: 1, borderColor: G.borderAlt, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600', marginBottom: 20, height: 120, textAlignVertical: 'top' }}
            placeholder="Outline the creative vision..."
            placeholderTextColor={G.textSub} multiline
            value={form.description} onChangeText={v => update('description', v)}
          />

          <Text style={{ color: G.textSub, fontSize: 9, fontWeight: '800', marginBottom: 8, letterSpacing: 1 }}>DELIVERABLES (Comma Separated)</Text>
          <TextInput
            style={{ backgroundColor: G.bgCard, color: G.text, borderWidth: 1, borderColor: G.borderAlt, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600', marginBottom: 20, height: 80, textAlignVertical: 'top' }}
            placeholder="e.g. 2 Reels, 1 Static Post"
            placeholderTextColor={G.textSub} multiline
            value={form.deliverables} onChangeText={v => update('deliverables', v)}
          />
        </View>

        {/* Launch Button */}
        <TouchableOpacity
          style={{ backgroundColor: G.gold, marginTop: 10, padding: 20, height: 60, justifyContent: 'center', borderRadius: 8, opacity: loading ? 0.7 : 1 }}
          activeOpacity={0.9} onPress={handleCreateCampaign} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={G.bg} />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: G.bg, fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>INITIATE DEPLOYMENT</Text>
              <Text style={{ color: G.bg, fontSize: 20, fontWeight: '900' }}>→</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}