import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { VideoView, useVideoPlayer } from "expo-video";
import { api } from "../../api/index";

const T = {
  black: "#000000",
  panel: "#09090B",
  card: "#121214",
  gold: "#E8C87A",
  white: "#FFFFFF",
  muted: "#71717A",
  border: "#27272A",
  fuchsia: "#a855f7",
  green: "#22C55E",
};

const LEVEL_COLORS = {
  Beginner: { bg: "#052e16", border: "#166534", text: "#22c55e" },
  Intermediate: { bg: "#1c1917", border: "#78350f", text: "#f59e0b" },
  Advanced: { bg: "#1a0a0a", border: "#7f1d1d", text: "#ef4444" },
};

function getTotalVideos(course) {
  return course.videos?.length || 0;
}
function getTotalDuration(course) {
  return course.videos?.reduce((s, v) => s + (v.durationMins || 0), 0) || 0;
}
function getWatchedCount(course) {
  return course.videos?.filter((v) => v.watched).length || 0;
}

/* ─────────────────────────── VIDEO PLAYER ─────────────────────────── */
function VideoPlayer({ video, course, onClose }) {
  const player = useVideoPlayer(video.videoUrl, (p) => {
    p.play();
  });
  return (
    <View style={ps.wrap}>
      <View style={ps.topBar}>
        <TouchableOpacity style={ps.closeBtn} onPress={onClose}>
          <Text style={ps.closeArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={ps.courseTag} numberOfLines={1}>
          {course.title}
        </Text>
      </View>
      <VideoView
        player={player}
        style={ps.video}
        fullscreenOptions={{ isFullscreenButtonHidden: false }}
        allowsPictureInPicture
      />
      <ScrollView contentContainerStyle={ps.infoScroll}>
        <Text style={ps.videoTitle}>{video.title}</Text>
        <Text style={ps.videoMeta}>
          {video.durationMins} min
          {video.isFree ? "  ·  Free Preview" : ""}
        </Text>
        {!!video.pdfUrl && (
          <TouchableOpacity
            style={ps.pdfBtn}
            onPress={() => Linking.openURL(video.pdfUrl)}
            activeOpacity={0.8}
          >
            <Text style={ps.pdfIcon}>📄</Text>
            <View>
              <Text style={ps.pdfBtnTitle}>PDF Notes</Text>
              <Text style={ps.pdfBtnSub}>Tap to open / download</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={ps.courseInfoBox}>
          <Text style={ps.courseInfoLabel}>COURSE</Text>
          <Text style={ps.courseInfoTitle}>{course.title}</Text>
          <Text style={ps.courseInfoMeta}>
            {course.category} · {course.level} · {getTotalVideos(course)} videos
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────── COURSE CARD ─────────────────────────── */
function CourseCard({ course, expanded, onToggle, onVideoPress }) {
  const levelStyle = LEVEL_COLORS[course.level] || LEVEL_COLORS.Beginner;
  const totalVideos = getTotalVideos(course);
  const totalMins = getTotalDuration(course);
  const watchedCount = getWatchedCount(course);
  const progress =
    totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;

  return (
    <View style={styles.courseCard}>
      <View style={styles.courseThumbnail}>
        <Text style={styles.thumbnailEmoji}>🎓</Text>
        <View
          style={[
            styles.levelBadge,
            { backgroundColor: levelStyle.bg, borderColor: levelStyle.border },
          ]}
        >
          <Text style={[styles.levelBadgeText, { color: levelStyle.text }]}>
            {course.level}
          </Text>
        </View>
      </View>

      <View style={styles.courseBody}>
        <Text style={styles.courseCategory}>
          {(course.category || "").toUpperCase()}
        </Text>
        <Text style={styles.courseTitle}>{course.title}</Text>
        {!!course.description && (
          <Text style={styles.courseDesc}>{course.description}</Text>
        )}

        <View style={styles.courseMeta}>
          <Text style={styles.metaItem}>▶ {totalVideos} videos</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaItem}>⏱ {totalMins} min</Text>
          {watchedCount > 0 && (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Text style={[styles.metaItem, { color: T.green }]}>
                {watchedCount}/{totalVideos} done
              </Text>
            </>
          )}
        </View>

        {watchedCount > 0 && (
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        )}

        <TouchableOpacity
          style={styles.expandBtn}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          <Text style={styles.expandBtnText}>
            {expanded ? "HIDE VIDEOS ↑" : "VIEW VIDEOS ↓"}
          </Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.videoList}>
          <View style={styles.videoListDivider} />
          {(course.videos || []).length === 0 && (
            <Text
              style={{
                color: T.muted,
                fontSize: 12,
                textAlign: "center",
                paddingVertical: 16,
              }}
            >
              Abhi koi video nahi hai
            </Text>
          )}
          {(course.videos || []).map((video, idx) => (
            <TouchableOpacity
              key={video._id}
              style={styles.videoItem}
              onPress={() => onVideoPress(video, course)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.videoIndex,
                  video.watched && { backgroundColor: T.green },
                ]}
              >
                <Text
                  style={[
                    styles.videoIndexText,
                    video.watched && { color: T.black },
                  ]}
                >
                  {video.watched ? "✓" : String(idx + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.videoTitle,
                    video.watched && { color: T.muted },
                  ]}
                >
                  {video.title}
                </Text>
                <Text style={styles.videoDuration}>
                  {video.durationMins} min
                  {video.isFree ? " · Free" : ""}
                  {video.pdfUrl ? " · PDF" : ""}
                </Text>
              </View>
              <Text style={styles.videoPlay}>▶</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

/* ─────────────────────────── PASSWORD GATE ─────────────────────────── */
function AcademyPasswordGate({ onUnlock, onBack }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!password.trim()) {
      setError("Password daalo");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await api.post("/academy/verify-password", {
        password: password.trim(),
      });
      if (res?.success) {
        onUnlock();
      } else {
        setError(res?.message || "Wrong password");
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Verify nahi ho saka. Dobara try karo.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={gs.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={gs.header}>
        <TouchableOpacity
          style={gs.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Text style={gs.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={gs.headerLabel}>ACADEMY </Text>
      </View>

      <View style={gs.center}>
        <View style={gs.card}>
          <View style={gs.accent} />
          <View style={{ padding: 24 }}>
            <Text style={gs.lockIcon}>🔒</Text>
            <Text style={gs.title}>
              Enter Academy <Text style={{ color: T.gold }}>Password</Text>
            </Text>
            <Text style={gs.sub}>
              Enjoy premium courses, expert guidance, and exclusive content by
              upgrading to the Advanced or Premium Plan. Your unlock password
              will be delivered to your email after successful verification.
            </Text>

            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError("");
              }}
              placeholder="VF-xxxxxx"
              placeholderTextColor={T.muted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              style={gs.input}
              onSubmitEditing={submit}
              returnKeyType="go"
            />

            {!!error && <Text style={gs.error}>⚠ {error}</Text>}

            <TouchableOpacity
              style={[gs.submitBtn, loading && { opacity: 0.6 }]}
              onPress={submit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={T.black} />
              ) : (
                <Text style={gs.submitText}>UNLOCK ACADEMY →</Text>
              )}
            </TouchableOpacity>

            <Text style={gs.hint}>
              Access Code Provided via Email.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ─────────────────────────── MAIN SCREEN ─────────────────────────── */
export default function AcademyScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeCourse, setActiveCourse] = useState(null);

  const [unlocked, setUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [expiresAt, setExpiresAt] = useState(null);

  useFocusEffect(
    useCallback(() => {
      checkAccess();
    }, []),
  );

  const checkAccess = async () => {
    setCheckingAccess(true);
    try {
      const res = await api.get("/academy/my-access");

      if (res?.hasAccess) {
        setUnlocked(true);
        setExpiresAt(res.expiresAt || null);
        fetchCourses();
      } else {
        setUnlocked(false);
        setCourses([]);
        setExpiresAt(null);
      }
    } catch {
      setUnlocked(false);
      setCourses([]);
    } finally {
      setCheckingAccess(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/academy/courses");
      if (res?.success && Array.isArray(res.courses)) {
        setCourses(res.courses);
      } else if (res?.accessDenied) {
        setUnlocked(false);
        setCourses([]);
      } else {
        setCourses([]);
      }
    } catch (e) {
      // ✅ FIXED: 403 = access revoked, baki errors = normal error message
      if (e?.response?.status === 403 || e?.status === 403) {
        setUnlocked(false);
        setCourses([]);
      } else {
        setError("Courses load nahi ho sake. Dobara try karo.");
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    setUnlocked(true);
    fetchCourses();
  };

  const categories = [
    "All",
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];
  const filtered =
    activeCategory === "All"
      ? courses
      : courses.filter((c) => c.category === activeCategory);
  const totalVideos = courses.reduce((a, c) => a + getTotalVideos(c), 0);
  const totalHours = Math.round(
    courses.reduce((a, c) => a + getTotalDuration(c), 0) / 60,
  );

  const handleVideoPress = (video, course) => {
    setActiveVideo(video);
    setActiveCourse(course);
  };
  const handleClosePlayer = () => {
    setActiveVideo(null);
    setActiveCourse(null);
  };

  // 1) Initial access check
  if (checkingAccess) {
    return (
      <View style={styles.bootScreen}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={T.gold} />
        <Text style={styles.bootText}>Checking access...</Text>
      </View>
    );
  }

  // 2) Locked — show password gate
  if (!unlocked) {
    return (
      <AcademyPasswordGate
        onUnlock={handleUnlock}
        onBack={() => navigation.goBack()}
      />
    );
  }

  // 3) Loading courses
  if (loading) {
    return (
      <View style={styles.bootScreen}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={T.gold} />
        <Text style={styles.bootText}>Loading...</Text>
      </View>
    );
  }

  // 4) Video player
  if (activeVideo && activeCourse) {
    return (
      <VideoPlayer
        video={activeVideo}
        course={activeCourse}
        onClose={handleClosePlayer}
      />
    );
  }

  // 5) Main academy
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerLabel}>ACADEMY // VISTAFLUENCE</Text>
        {!!expiresAt && (
          <View style={styles.expiryBadge}>
            <Text style={styles.expiryText}>
              Exp: {new Date(expiresAt).toLocaleDateString("en-IN")}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View style={styles.heroBanner}>
          <View style={styles.heroAccent} />
          <View style={styles.heroContent}>
            <Text style={styles.heroTag}>// INFLUENCER GROWTH PROGRAM</Text>
            <Text style={styles.heroTitle}>
              Vistafluence{"\n"}
              <Text style={{ color: T.gold }}>Academy</Text>
            </Text>
            <Text style={styles.heroSub}>
              Brand deals, content strategy aur growth — sab ek jagah.
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{courses.length}</Text>
                <Text style={styles.heroStatLabel}>Courses</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{totalVideos}</Text>
                <Text style={styles.heroStatLabel}>Videos</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{totalHours}h+</Text>
                <Text style={styles.heroStatLabel}>Content</Text>
              </View>
            </View>
          </View>
        </View>

        {!!error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catChip,
                activeCategory === cat && styles.catChipActive,
              ]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.catChipText,
                  activeCategory === cat && styles.catChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.courseCount}>
          {filtered.length} COURSE{filtered.length !== 1 ? "S" : ""}
        </Text>

        {filtered.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            expanded={expandedId === course._id}
            onToggle={() =>
              setExpandedId(expandedId === course._id ? null : course._id)
            }
            onVideoPress={handleVideoPress}
          />
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎓</Text>
            <Text style={styles.emptyText}>
              Abhi koi course available nahi hai.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */
const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    backgroundColor: T.black,
    justifyContent: "center",
    alignItems: "center",
  },
  bootText: { color: T.muted, fontSize: 13, marginTop: 12 },
  container: { flex: 1, backgroundColor: T.black, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: T.muted, fontSize: 18, fontWeight: "600" },
  headerLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    color: T.gold,
    textTransform: "uppercase",
    flex: 1,
  },
  expiryBadge: {
    backgroundColor: "#052e16",
    borderWidth: 1,
    borderColor: "#166534",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  expiryText: {
    color: T.green,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 6,
    padding: 10,
  },
  errorText: { color: "#ef4444", fontSize: 12, fontWeight: "600" },
  heroBanner: {
    margin: 20,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  heroAccent: { height: 3, backgroundColor: T.gold },
  heroContent: { padding: 22 },
  heroTag: {
    fontSize: 9,
    color: T.muted,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: T.white,
    letterSpacing: -0.5,
    lineHeight: 36,
    marginBottom: 10,
  },
  heroSub: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 20,
  },
  heroStats: { flexDirection: "row", alignItems: "center" },
  heroStat: { alignItems: "center", flex: 1 },
  heroStatNum: { fontSize: 22, fontWeight: "900", color: T.gold },
  heroStatLabel: {
    fontSize: 10,
    color: T.muted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  heroStatDivider: { width: 1, height: 32, backgroundColor: T.border },
  catScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 8,
    flexDirection: "row",
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 3,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
  },
  catChipActive: { backgroundColor: T.white, borderColor: T.white },
  catChipText: {
    color: T.muted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  catChipTextActive: { color: T.black },
  courseCount: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    color: T.muted,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  courseCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    overflow: "hidden",
  },
  courseThumbnail: {
    height: 120,
    backgroundColor: "#0D0D10",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  thumbnailEmoji: { fontSize: 48 },
  levelBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  levelBadgeText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  courseBody: { padding: 18 },
  courseCategory: {
    fontSize: 9,
    fontWeight: "900",
    color: "#a855f7",
    letterSpacing: 2,
    marginBottom: 6,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: T.white,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  courseDesc: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "500",
    lineHeight: 19,
    marginBottom: 12,
  },
  courseMeta: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  metaItem: { fontSize: 12, color: T.muted, fontWeight: "600" },
  metaDot: { color: T.border, marginHorizontal: 6, fontSize: 14 },
  progressBarBg: {
    height: 3,
    backgroundColor: T.border,
    borderRadius: 2,
    marginBottom: 14,
    overflow: "hidden",
  },
  progressBarFill: { height: 3, backgroundColor: "#22C55E", borderRadius: 2 },
  expandBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: T.border,
  },
  expandBtnText: {
    color: T.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  videoList: { paddingHorizontal: 18, paddingBottom: 8 },
  videoListDivider: { height: 1, backgroundColor: T.border, marginBottom: 8 },
  videoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1E",
  },
  videoIndex: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#1A1A1E",
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  videoIndexText: { color: T.muted, fontSize: 11, fontWeight: "900" },
  videoTitle: {
    color: T.white,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  videoDuration: { color: T.muted, fontSize: 11, fontWeight: "500" },
  videoPlay: { color: T.gold, fontSize: 12 },
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: T.muted, fontSize: 14, textAlign: "center" },
});

/* ─────────────────────────── VIDEO PLAYER STYLES ─────────────────────────── */
const ps = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.black, paddingTop: 56 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeBtn: { paddingVertical: 6, paddingHorizontal: 2 },
  closeArrow: {
    color: T.gold,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  courseTag: {
    flex: 1,
    fontSize: 10,
    color: T.muted,
    fontWeight: "700",
    letterSpacing: 1,
  },
  video: { width: "100%", height: 220, backgroundColor: "#000" },
  infoScroll: { padding: 20, paddingBottom: 60 },
  videoTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: T.white,
    marginBottom: 6,
    lineHeight: 26,
  },
  videoMeta: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 24,
    fontWeight: "600",
  },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#0f0f1a",
    borderWidth: 1,
    borderColor: "#3730a3",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  pdfIcon: { fontSize: 28 },
  pdfBtnTitle: { color: "#a5b4fc", fontWeight: "800", fontSize: 14 },
  pdfBtnSub: { color: T.muted, fontSize: 11, marginTop: 2 },
  courseInfoBox: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 8,
    padding: 16,
  },
  courseInfoLabel: {
    fontSize: 9,
    color: T.gold,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 6,
  },
  courseInfoTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: T.white,
    marginBottom: 4,
  },
  courseInfoMeta: { fontSize: 12, color: T.muted, fontWeight: "600" },
});

/* ─────────────────────────── GATE STYLES ─────────────────────────── */
const gs = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: T.black, paddingTop: 60 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { color: T.muted, fontSize: 18, fontWeight: "600" },
  headerLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 3,
    color: T.gold,
    textTransform: "uppercase",
  },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  accent: { height: 3, backgroundColor: T.gold },
  lockIcon: { fontSize: 44, marginBottom: 14 },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: T.white,
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 30,
  },
  sub: {
    fontSize: 13,
    color: "#A1A1AA",
    fontWeight: "500",
    lineHeight: 19,
    marginBottom: 22,
  },
  input: {
    backgroundColor: "#0D0D10",
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: T.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
  },
  error: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: T.gold,
    borderRadius: 6,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  submitText: {
    color: T.black,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  hint: {
    color: T.muted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
