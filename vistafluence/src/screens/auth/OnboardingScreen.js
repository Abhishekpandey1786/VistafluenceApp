import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, useWindowDimensions,
} from 'react-native';

// ─── Design Tokens ────────────────────────────────────────────────────
const T = {
  black:      '#0A0A0A',
  white:      '#FFFFFF',
  gold:       '#E8C87A',
  goldDim:    '#C9A84C',
  pink:       '#FF6B8A',
  surface:    '#161616',
  surfaceAlt: '#1E1E1E',
  border:     'rgba(255,255,255,0.08)',
  muted:      'rgba(255,255,255,0.38)',
  sub:        'rgba(255,255,255,0.6)',
};

// ─── Responsive Hook ──────────────────────────────────────────────────
function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isSmall  = width < 360;   // e.g. iPhone SE
  const isMedium = width < 390;   // e.g. iPhone 13 mini
  return {
    w: width,
    h: height,
    hp: (pct) => height * (pct / 100),
    wp: (pct) => width  * (pct / 100),
    fs: (base) => isSmall ? base - 2 : isMedium ? base - 1 : base,
    pad: isSmall ? 18 : 24,
    isSmall,
    isMedium,
  };
}

// ─── Avatar Stack ─────────────────────────────────────────────────────
const AVATARS = [
  { initials: 'AK', color: '#FF6B8A' },
  { initials: 'RV', color: '#7B61FF' },
  { initials: 'MS', color: '#00C9A7' },
  { initials: 'PD', color: '#FFB347' },
];

function AvatarStack() {
  const { fs } = useResponsive();
  return (
    <View style={av.row}>
      {AVATARS.map((a, i) => (
        <View
          key={i}
          style={[av.circle, { backgroundColor: a.color, marginLeft: i === 0 ? 0 : -10, zIndex: 4 - i }]}
        >
          <Text style={[av.initials, { fontSize: fs(10) }]}>{a.initials}</Text>
        </View>
      ))}
      <View style={av.label}>
        <Text style={[av.labelText, { fontSize: fs(12) }]}>+9.8K creators</Text>
      </View>
    </View>
  );
}

const av = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  circle:   {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: T.black,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontWeight: '800', color: T.white },
  label:    {
    marginLeft: 12,
    backgroundColor: T.surfaceAlt,
    borderRadius: 20, borderWidth: 1, borderColor: T.border,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  labelText: { color: T.sub, fontWeight: '600' },
});

// ─── Live Badge ───────────────────────────────────────────────────────
function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={pill.wrap}>
      <Animated.View style={[pill.dotPulse, { transform: [{ scale: pulse }] }]} />
      <View style={pill.dot} />
      <Text style={pill.text}>LIVE CAMPAIGNS</Text>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(232,200,122,0.12)',
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(232,200,122,0.35)',
    paddingHorizontal: 14, paddingVertical: 7, marginBottom: 20,
  },
  dotPulse: {
    position: 'absolute',
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: T.gold, left: 14,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: T.gold, marginRight: 8,
  },
  text: { fontSize: 10, fontWeight: '800', color: T.gold, letterSpacing: 2 },
});

// ─── Stat Card ────────────────────────────────────────────────────────
function StatCard({ val, label, accent }) {
  const { fs } = useResponsive();
  return (
    <View style={[sc.card, { borderColor: accent + '30' }]}>
      <Text style={[sc.val, { color: accent, fontSize: fs(18) }]}>{val}</Text>
      <Text style={[sc.label, { fontSize: fs(9) }]}>{label}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: T.surfaceAlt,
    borderRadius: 14, borderWidth: 1,
  },
  val:   { fontWeight: '900', letterSpacing: -0.5 },
  label: { color: T.muted, marginTop: 3, fontWeight: '600', letterSpacing: 0.5 },
});

// ─── Ticker Strip ─────────────────────────────────────────────────────
const BRANDS = ['Nike ✦', 'Myntra ✦', 'Nykaa ✦', 'Swiggy ✦', 'SUGAR ✦', 'boAt ✦', 'Mamaearth ✦'];

function TickerStrip() {
  const anim = useRef(new Animated.Value(0)).current;
  const STRIP_W = BRANDS.join('  ').length * 10;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: -STRIP_W,
        duration: 14000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const doubled = [...BRANDS, ...BRANDS];

  return (
    <View style={tick.outer}>
      <Animated.View style={[tick.inner, { transform: [{ translateX: anim }] }]}>
        {doubled.map((b, i) => (
          <Text key={i} style={tick.item}>{b}{'   '}</Text>
        ))}
      </Animated.View>
    </View>
  );
}

const tick = StyleSheet.create({
  outer: {
    overflow: 'hidden', height: 30,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: T.border,
    justifyContent: 'center',
  },
  inner: { flexDirection: 'row', alignItems: 'center' },
  item:  { fontSize: 11, color: T.muted, fontWeight: '700', letterSpacing: 1 },
});

// ─── Main Screen ──────────────────────────────────────────────────────
export default function OnboardingScreen({ navigation }) {
  const { w, h, fs, pad, hp, isSmall } = useResponsive();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.93)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  // Responsive font sizes
  const HL_LARGE = fs(isSmall ? 42 : 50);
  const HL_SMALL = fs(isSmall ? 34 : 40);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.black} />

      {/* Ambient blobs — sized relative to screen */}
      <View style={[s.blob1, { width: w * 0.7, height: w * 0.7, borderRadius: w * 0.35 }]} />
      <View style={[s.blob2, { width: w * 0.55, height: w * 0.55, borderRadius: w * 0.275 }]} />
      <View style={[s.blob3, { width: w * 0.45, height: w * 0.45, borderRadius: w * 0.225 }]} />

      {/* Ticker */}
      <TickerStrip />

      {/* Nav */}
      <View style={[s.nav, { paddingHorizontal: pad }]}>
        <View style={s.logoWrap}>
          <View style={s.logoDot} />
          <Text style={[s.logoText, { fontSize: fs(16) }]}>VistaFluence</Text>
        </View>
        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[s.skipText, { fontSize: fs(13) }]}>Sign in</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <Animated.View
        style={[
          s.content,
          { paddingHorizontal: pad },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
        ]}
      >
        <LiveBadge />
        <AvatarStack />

        {/* Headline */}
        <View style={s.headlineWrap}>
          <Text style={[s.hlLight, { fontSize: HL_SMALL }]}>Where</Text>
          <View style={s.headlineRow}>
            <Text style={[s.hlGold,  { fontSize: HL_LARGE }]}>Brands</Text>
            <Text style={[s.hlLight, { fontSize: HL_SMALL }]}> &</Text>
          </View>
          <Text style={[s.hlPink,  { fontSize: HL_LARGE }]}>Creators</Text>
          <Text style={[s.hlWhite, { fontSize: HL_SMALL }]}>collab.</Text>
        </View>

        <Text style={[s.sub, { fontSize: fs(14) }]}>
          India's most trusted influencer marketplace — run campaigns, get paid, grow together.
        </Text>

        {/* Stats */}
        <View style={s.statsRow}>
          <StatCard val="10K+" label="CREATORS" accent={T.pink} />
          <View style={{ width: 10 }} />
          <StatCard val="500+"  label="BRANDS"   accent={T.gold} />
          <View style={{ width: 10 }} />
          <StatCard val="₹2Cr+" label="PAID OUT" accent="#00C9A7" />
        </View>
      </Animated.View>

      {/* Bottom CTA */}
      <Animated.View style={[s.bottom, { paddingHorizontal: pad, opacity: fadeAnim }]}>
        <View style={s.roleRow}>
          <TouchableOpacity
            style={s.roleCardPrimary}
            onPress={() => navigation.navigate('Signup', { role: 'creator' })}
            activeOpacity={0.85}
          >
            <Text style={s.roleIcon}>🎬</Text>
            <Text style={[s.rolePrimaryLabel, { fontSize: fs(15) }]}>I'm a Creator</Text>
            <Text style={[s.roleDesc, { fontSize: fs(11) }]}>Find & join campaigns</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.roleCardSecondary}
            onPress={() => navigation.navigate('Signup', { role: 'brand' })}
            activeOpacity={0.85}
          >
            <Text style={s.roleIcon}>🏢</Text>
            <Text style={[s.roleSecondaryLabel, { fontSize: fs(15) }]}>I'm a Brand</Text>
            <Text style={[s.roleDescAlt, { fontSize: fs(11) }]}>Launch & manage collab</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.loginRow} onPress={() => navigation.navigate('Login')}>
          <Text style={[s.loginText, { fontSize: fs(13) }]}>
            Already have an account?{'  '}
            <Text style={s.loginLink}>Log In →</Text>
          </Text>
        </TouchableOpacity>

        <Text style={[s.terms, { fontSize: fs(10) }]}>
          By continuing you agree to our{' '}
          <Text style={{ color: T.gold }}>Terms</Text>
          {' '}&{' '}
          <Text style={{ color: T.gold }}>Privacy Policy</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.black,
    overflow: 'hidden',
  },

  // Blobs — sizes set dynamically above
  blob1: { position: 'absolute', backgroundColor: '#FF6B8A', opacity: 0.07, top: -60,   right: -80 },
  blob2: { position: 'absolute', backgroundColor: '#7B61FF', opacity: 0.08, top: 180,   left: -70  },
  blob3: { position: 'absolute', backgroundColor: '#E8C87A', opacity: 0.06, bottom: 160, right: -50 },

  // Nav
  nav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 16, marginBottom: 6,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: T.gold },
  logoText: { fontWeight: '900', color: T.white, letterSpacing: -0.5 },
  skipBtn:  { borderWidth: 1, borderColor: T.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  skipText: { color: T.sub, fontWeight: '600' },

  // Content
  content: { flex: 1, justifyContent: 'center', paddingTop: 16 },

  // Headline
  headlineWrap: { marginBottom: 14 },
  hlLight: { fontWeight: '300', color: T.muted,  letterSpacing: -1.5, lineHeight: undefined },
  hlGold:  { fontWeight: '900', color: T.gold,   letterSpacing: -2 },
  hlPink:  { fontWeight: '900', color: T.pink,   letterSpacing: -2 },
  hlWhite: { fontWeight: '300', color: T.white,  letterSpacing: -1.5 },
  headlineRow: { flexDirection: 'row', alignItems: 'baseline' },

  sub: { color: T.sub, lineHeight: 22, marginBottom: 22, maxWidth: '85%' },

  statsRow: { flexDirection: 'row', marginBottom: 16 },

  // Bottom
  bottom: { paddingBottom: 36, paddingTop: 12 },

  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },

  roleCardPrimary: {
    flex: 1, borderRadius: 20, backgroundColor: T.gold,
    padding: 16, alignItems: 'flex-start',
    shadowColor: T.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 10,
  },
  roleCardSecondary: {
    flex: 1, borderRadius: 20,
    backgroundColor: T.surfaceAlt,
    borderWidth: 1, borderColor: T.border,
    padding: 16, alignItems: 'flex-start',
  },
  roleIcon:          { fontSize: 22, marginBottom: 8 },
  rolePrimaryLabel:  { fontWeight: '900', color: T.black,  marginBottom: 3 },
  roleDesc:          { color: 'rgba(0,0,0,0.55)', fontWeight: '600' },
  roleSecondaryLabel:{ fontWeight: '900', color: T.white,  marginBottom: 3 },
  roleDescAlt:       { color: T.muted, fontWeight: '600' },

  loginRow:  { alignItems: 'center', marginBottom: 12 },
  loginText: { color: T.muted },
  loginLink: { color: T.white, fontWeight: '800' },
  terms:     { textAlign: 'center', color: T.muted, lineHeight: 16 },
});