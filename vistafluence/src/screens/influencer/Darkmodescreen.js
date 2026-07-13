import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Switch,
} from 'react-native';
import { useTheme } from '../../context/Themecontext';

export default function DarkModeScreen({ navigation }) {
  const { G, isDark, toggleTheme } = useTheme();
  const s = makeStyles(G);

  const THEMES = [
    {
      id: 'dark',
      icon: '🌙',
      title: 'Dark Mode',
      sub: 'Aankho ke liye better, battery bhi bachti hai',
      selected: isDark,
    },
    {
      id: 'light',
      icon: '☀️',
      title: 'Light Mode',
      sub: 'Bright aur clean look, din ke time ke liye',
      selected: !isDark,
    },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Dark Mode</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ padding: 20 }}>

        {/* Preview Card */}
        <View style={s.previewCard}>
          <Text style={{ fontSize: 44, marginBottom: 10 }}>{isDark ? '🌙' : '☀️'}</Text>
          <Text style={s.previewTitle}>{isDark ? 'Dark Mode ON' : 'Light Mode ON'}</Text>
          <Text style={s.previewSub}>
            {isDark
              ? 'App dark theme mein hai. Aankho ke liye comfortable!'
              : 'App light theme mein hai. Bright aur fresh look!'}
          </Text>
        </View>

        {/* Toggle Row */}
        <View style={s.toggleCard}>
          <View style={s.toggleIconWrap}>
            <Text style={{ fontSize: 20 }}>{isDark ? '🌙' : '☀️'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.toggleLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
            <Text style={s.toggleSub}>Tap to switch theme</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: G.borderAlt, true: G.gold + '80' }}
            thumbColor={isDark ? G.gold : G.textSub}
            ios_backgroundColor={G.bgCard}
          />
        </View>

        {/* Theme Options */}
        <Text style={s.sectionLabel}>CHOOSE THEME</Text>
        {THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[s.themeCard, theme.selected && s.themeCardSelected]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <View style={s.themeIcon}>
              <Text style={{ fontSize: 22 }}>{theme.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.themeTitle, theme.selected && { color: G.gold }]}>{theme.title}</Text>
              <Text style={s.themeSub}>{theme.sub}</Text>
            </View>
            <View style={[s.radioOuter, theme.selected && s.radioOuterSelected]}>
              {theme.selected && <View style={s.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Info note */}
        <View style={s.noteCard}>
          <Text style={{ fontSize: 14, marginRight: 8 }}>💾</Text>
          <Text style={s.noteText}>
            Tera preference save ho gaya hai. Next time app open karne pe automatically same theme rahega.
          </Text>
        </View>

      </View>
    </View>
  );
}

const makeStyles = (G) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: G.bg },
  header:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: G.borderAlt },
  backBtn:            { width: 40, height: 40, justifyContent: 'center' },
  backIcon:           { fontSize: 20, color: G.gold },
  headerTitle:        { fontSize: 18, fontWeight: '700', color: G.text },
  sectionLabel:       { fontSize: 10, fontWeight: '700', color: G.goldDim, letterSpacing: 1.5, marginBottom: 10, marginTop: 24 },
  previewCard:        { backgroundColor: G.bgCard, borderRadius: 20, borderWidth: 1, borderColor: G.borderAlt, padding: 28, alignItems: 'center', marginBottom: 20 },
  previewTitle:       { fontSize: 20, fontWeight: '900', color: G.gold, marginBottom: 6 },
  previewSub:         { fontSize: 13, color: G.textSub, textAlign: 'center', lineHeight: 20 },
  toggleCard:         { backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.border, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, marginBottom: 4 },
  toggleIconWrap:     { width: 40, height: 40, borderRadius: 12, backgroundColor: G.goldFaint, justifyContent: 'center', alignItems: 'center' },
  toggleLabel:        { fontSize: 15, fontWeight: '700', color: G.text },
  toggleSub:          { fontSize: 11, color: G.textSub, marginTop: 2 },
  themeCard:          { backgroundColor: G.bgCard, borderRadius: 14, borderWidth: 1, borderColor: G.borderAlt, flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14, marginBottom: 10 },
  themeCardSelected:  { borderColor: G.gold, backgroundColor: G.goldFaint },
  themeIcon:          { width: 44, height: 44, borderRadius: 12, backgroundColor: G.bgInput, justifyContent: 'center', alignItems: 'center' },
  themeTitle:         { fontSize: 15, fontWeight: '700', color: G.text },
  themeSub:           { fontSize: 11, color: G.textSub, marginTop: 2 },
  radioOuter:         { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: G.textSub, justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: G.gold },
  radioInner:         { width: 11, height: 11, borderRadius: 6, backgroundColor: G.gold },
  noteCard:           { flexDirection: 'row', backgroundColor: G.bgCard, borderRadius: 12, borderWidth: 1, borderColor: G.borderAlt, padding: 14, marginTop: 24, alignItems: 'flex-start' },
  noteText:           { flex: 1, fontSize: 12, color: G.textSub, lineHeight: 18 },
});