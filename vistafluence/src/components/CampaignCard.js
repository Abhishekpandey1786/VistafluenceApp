import React, { useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { C } from '../theme/colors';

// ─── Category config ──────────────────────────────────────────────────────────
const CAT_CONFIG = {
  Fashion:   { color: '#FF6B8A', bg: 'rgba(255,107,138,0.12)', emoji: '👗' },
  Fitness:   { color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)',  emoji: '🏃' },
  Beauty:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  emoji: '💄' },
  Tech:      { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  emoji: '📱' },
  Food:      { color: '#FB923C', bg: 'rgba(251,146,60,0.12)',  emoji: '🍽️' },
  Travel:    { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', emoji: '✈️' },
  Gaming:    { color: '#34D399', bg: 'rgba(52,211,153,0.12)',  emoji: '🎮' },
  Lifestyle: { color: '#E8C87A', bg: 'rgba(232,200,122,0.12)', emoji: '🌿' },
  Sports:    { color: '#2DD4BF', bg: 'rgba(45,212,191,0.12)',  emoji: '⚽' },
};

const DEFAULT_CAT = { color: C.gold, bg: 'rgba(232,200,122,0.12)', emoji: '📢' };

// ─── Platform badges ──────────────────────────────────────────────────────────
const PLATFORM_ICONS = {
  Instagram: '📸', YouTube: '▶️', TikTok: '🎵',
  Facebook: '👥', Twitter: '🐦', LinkedIn: '💼',
};

function PlatformBadge({ name }) {
  return (
    <View style={styles.platBadge}>
      <Text style={styles.platText}>
        {PLATFORM_ICONS[name] || '📲'} {name}
      </Text>
    </View>
  );
}

// ─── Meta item ────────────────────────────────────────────────────────────────
function MetaItem({ dotColor, label }) {
  return (
    <View style={styles.metaItem}>
      <View style={[styles.metaDot, { backgroundColor: dotColor }]} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
/**
 * CampaignCard
 *
 * Props:
 *   campaign  {object}   — campaign data (see shape below)
 *   variant   {string}   — 'full' (default) | 'compact'
 *   onPress   {function} — tap on card
 *   onApply   {function} — tap on apply button
 *   applied   {boolean}  — already applied?
 *   style     {object}   — extra container styles
 *
 * campaign shape:
 * {
 *   id, title, description,
 *   brand: { name, city },
 *   category,        // e.g. 'Fashion'
 *   budget,          // number ₹
 *   deadline,        // string e.g. '30 Jun 2025'
 *   minFollowers,    // string e.g. '10K+'
 *   platforms,       // string[] e.g. ['Instagram', 'YouTube']
 *   deliverables,    // string[] e.g. ['3 reels', '5 stories']
 *   applicantsCount, // number
 *   featured,        // boolean
 *   bannerEmoji,     // optional string
 * }
 */
export default function CampaignCard({
  campaign,
  variant = 'full',
  onPress,
  onApply,
  applied = false,
  style,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const cat = CAT_CONFIG[campaign.category] || DEFAULT_CAT;
  const isCompact = variant === 'compact';

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 20 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 20 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.card}
      >
        {/* ── Category accent line (top) ── */}
        <View style={[styles.catLine, { backgroundColor: cat.color }]} />

        {/* ── Banner (full variant only) ── */}
        {!isCompact && (
          <View style={[styles.banner, { backgroundColor: cat.color + '15' }]}>
            <Text style={styles.bannerEmoji}>
              {campaign.bannerEmoji || cat.emoji}
            </Text>
            <View style={styles.bannerOverlay} />

            {campaign.featured && (
              <View style={styles.featuredPill}>
                <Text style={styles.featuredText}>✦ FEATURED</Text>
              </View>
            )}
            {campaign.deadline && (
              <View style={styles.deadlinePill}>
                <Text style={styles.deadlineText}>⏰ Deadline: {campaign.deadline}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Card body ── */}
        <View style={[styles.body, isCompact && styles.bodyCompact]}>

          {/* Row: category tag + budget */}
          <View style={styles.topRow}>
            <View style={[styles.catTag, { backgroundColor: cat.bg }]}>
              <Text style={[styles.catTagText, { color: cat.color }]}>
                {campaign.category || 'General'}
              </Text>
            </View>
            <Text style={styles.budget}>
              ₹{Number(campaign.budget).toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Title + brand */}
          <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={2}>
            {campaign.title}
          </Text>
          <Text style={styles.brand} numberOfLines={1}>
            🏢 {campaign.brand?.name || 'Brand'}
            {campaign.brand?.city ? ` · ${campaign.brand.city}` : ''}
            {isCompact && campaign.deadline ? ` · Deadline: ${campaign.deadline}` : ''}
          </Text>

          {/* Deliverables meta (full only) */}
          {!isCompact && campaign.deliverables?.length > 0 && (
            <View style={styles.metaRow}>
              {campaign.minFollowers && (
                <MetaItem dotColor={cat.color} label={campaign.minFollowers + ' followers'} />
              )}
              {campaign.deliverables.map((d, i) => (
                <MetaItem key={i} dotColor={i === 0 ? C.gold : C.textMuted} label={d} />
              ))}
            </View>
          )}

          {/* Platforms (full only) */}
          {!isCompact && campaign.platforms?.length > 0 && (
            <View style={styles.platformsRow}>
              {campaign.platforms.map((p) => (
                <PlatformBadge key={p} name={p} />
              ))}
            </View>
          )}

          {/* Footer: applicants + CTA */}
          <View style={[styles.footer, (isCompact) && { marginTop: 12 }]}>
            <Text style={styles.applicants}>
              👥 {campaign.applicantsCount ?? 0} applied
            </Text>
            <TouchableOpacity
              style={[styles.applyBtn, applied && styles.applyBtnApplied]}
              onPress={(e) => { e.stopPropagation?.(); onApply?.(); }}
              activeOpacity={0.8}
              disabled={applied}
            >
              <Text style={[styles.applyBtnText, applied && styles.applyBtnTextApplied]}>
                {applied ? '✓ Applied' : 'Apply Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161616',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  // Gold accent line at top
  catLine: {
    height: 2,
    width: '40%',
    borderBottomRightRadius: 2,
  },

  // Banner
  banner: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bannerEmoji: { fontSize: 52 },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 60,
    // soft fade to card bg — done via opacity on view since RN doesn't have CSS gradient
    backgroundColor: '#161616',
    opacity: 0.5,
  },
  featuredPill: {
    position: 'absolute',
    top: 10, right: 12,
    backgroundColor: 'rgba(232,200,122,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(232,200,122,0.4)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  featuredText: {
    fontSize: 9, fontWeight: '800',
    color: C.gold, letterSpacing: 1,
  },
  deadlinePill: {
    position: 'absolute',
    bottom: 10, left: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  deadlineText: {
    fontSize: 9, color: 'rgba(255,255,255,0.6)',
  },

  // Body
  body: { padding: 14, paddingTop: 12 },
  bodyCompact: { paddingTop: 12, paddingBottom: 14 },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catTag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  catTagText: { fontSize: 11, fontWeight: '700' },
  budget: {
    fontSize: 20, fontWeight: '900',
    color: C.gold, letterSpacing: -0.5,
  },

  title: {
    fontSize: 15, fontWeight: '800',
    color: '#F5F2ED',
    marginBottom: 4, lineHeight: 21,
  },
  titleCompact: { fontSize: 13, lineHeight: 18 },

  brand: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.38)',
    marginBottom: 12,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaDot: { width: 5, height: 5, borderRadius: 3 },
  metaText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  // Platforms
  platformsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  platBadge: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  platText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  applicants: { fontSize: 11, color: 'rgba(255,255,255,0.3)' },

  // Apply button
  applyBtn: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  applyBtnApplied: {
    backgroundColor: '#0D2E2A',
    borderWidth: 1,
    borderColor: '#2DD4BF',
  },
  applyBtnText: {
    fontSize: 12, fontWeight: '900', color: '#0A0A0A',
  },
  applyBtnTextApplied: { color: '#2DD4BF' },
});