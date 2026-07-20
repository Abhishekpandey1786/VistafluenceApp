import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Linking, Platform, TextInput, Alert
} from 'react-native';
import { useTheme } from '../context/Themecontext'; // adjust path if needed

// ⚠️ IMPORTANT: Replace these with your actual app IDs once published
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.yourcompany.vistafluence';
const APP_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';

export default function RatingModal({ visible, onClose, onFeedbackSubmit }) {
  const { G } = useTheme();
  const [rating, setRating] = useState(0);
  const [step, setStep] = useState('rate'); // 'rate' | 'feedback' | 'thanks'
  const [feedbackText, setFeedbackText] = useState('');

  const resetAndClose = () => {
    setRating(0);
    setStep('rate');
    setFeedbackText('');
    onClose();
  };

  const handleStarPress = (star) => {
    setRating(star);
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    if (rating >= 4) {
      // High rating -> redirect to Play Store / App Store
      const url = Platform.OS === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
      Linking.openURL(url).catch(() =>
        Alert.alert('Error', 'Could not open store page. Please try again later.')
      );
      resetAndClose();
    } else {
      // Low rating -> collect feedback in-app instead of sending to store
      setStep('feedback');
    }
  };

  const handleFeedbackSubmit = () => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit({ rating, feedback: feedbackText });
    }
    setStep('thanks');
    setTimeout(() => {
      resetAndClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: G.bg || '#1a1a1a', borderRadius: 18, padding: 24, borderWidth: 1, borderColor: G.borderAlt || '#333' }}>

          {step === 'rate' && (
            <>
              <Text style={{ color: G.text || '#fff', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>
                Application Sent! 🎉
              </Text>
              <Text style={{ color: G.textSub || '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
                Kaisa laga aapko Vistafluence app use karke?
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 22 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                    <Text style={{ fontSize: 34, marginHorizontal: 4 }}>
                      {star <= rating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={rating === 0}
                style={{
                  backgroundColor: rating === 0 ? '#555' : (G.gold || '#FFD700'),
                  borderRadius: 12, padding: 14, alignItems: 'center'
                }}
              >
                <Text style={{ fontWeight: '800', color: '#000', fontSize: 15 }}>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetAndClose} style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: G.textSub || '#888', fontSize: 13 }}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'feedback' && (
            <>
              <Text style={{ color: G.text || '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 6 }}>
                Sorry to hear that 😔
              </Text>
              <Text style={{ color: G.textSub || '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
                Please tell us what went wrong so we can improve.
              </Text>

              <TextInput
                style={{
                  backgroundColor: G.bgInput || '#2a2a2a', color: G.text || '#fff',
                  borderRadius: 12, padding: 14, fontSize: 14, borderWidth: 1,
                  borderColor: G.borderAlt || '#333', height: 100, textAlignVertical: 'top', marginBottom: 16
                }}
                placeholder="Your feedback helps us improve..."
                placeholderTextColor={G.textSub || '#888'}
                value={feedbackText}
                onChangeText={setFeedbackText}
                multiline
              />

              <TouchableOpacity
                onPress={handleFeedbackSubmit}
                style={{ backgroundColor: G.gold || '#FFD700', borderRadius: 12, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '800', color: '#000', fontSize: 15 }}>Send Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetAndClose} style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: G.textSub || '#888', fontSize: 13 }}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'thanks' && (
            <Text style={{ color: G.text || '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center', paddingVertical: 20 }}>
              Thanks for your feedback! 🙏
            </Text>
          )}

        </View>
      </View>
    </Modal>
  );
}