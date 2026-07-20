import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
  RefreshControl,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // NEW IMPORT
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/index";
import { useTheme } from "../../context/Themecontext";
import { io } from "socket.io-client";

const { width } = Dimensions.get("window");
const FALLBACK_CAMPAIGNS = [
  {
    _id: "mock1",
    brand: { companyName: "Nike India" },
    title: "Summer Run Challenge 2026",
    description:
      "Looking for fitness creators to promote our new Summer collection.",
    budget: 15000,
    category: "Fitness",
    tags: ["Fitness", "Running"],
    postedAt: "2h ago",
    applicantsCount: 24,
    coverArt:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000",
    likes: [],
    comments: [],
  },
];

// UPDATED: BottomNav now uses safe area insets to avoid overlapping with phone's nav buttons
function BottomNav({ active, navigation }) {
  const { G } = useTheme();
  const insets = useSafeAreaInsets(); // NEW: get device safe area (gesture bar / home indicator height)
  const s = makeStyles(G, insets);   // NEW: pass insets to styles
  const tabs = [
    { key: "HomeTab", icon: "🏠", label: "Feed" },
    { key: "CampaignsTab", icon: "📢", label: "Subscription" },
    { key: "ChatsTab", icon: "💬", label: "Chats" },
    { key: "AcademyTab", icon: "🎓", label: "Accedemy" },
    { key: "ProfileTab", icon: "👤", label: "Profile" },
  ];
  return (
    <View style={s.tabBar}>
      {tabs.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={s.tabItem}
          onPress={() => navigation.navigate(t.key)}
        >
          <Text style={s.tabIcon}>{t.icon}</Text>
          <Text style={[s.tabLabel, active === t.key && { color: G.gold }]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function BottomNavBar({ active, navigation }) {
  return <BottomNav active={active} navigation={navigation} />;
}

export default function FeedScreen({ navigation }) {
  const { G } = useTheme();
  const insets = useSafeAreaInsets(); // NEW: for header top spacing too
  const s = makeStyles(G, insets);   // NEW
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const fetchLiveFeed = async () => {
    try {
      const data = await api.getFeed(1);
      if (data && data.success && data.campaigns) {
        const sanitized = data.campaigns.map((c) => ({
          ...c,
          likes: c.likes || [],
          comments: c.comments || [],
        }));
        setCampaigns(sanitized);
      } else {
        setCampaigns(FALLBACK_CAMPAIGNS);
      }
    } catch (error) {
      console.log("❌ Feed Load Error:", error.message);
      setCampaigns(FALLBACK_CAMPAIGNS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFeed();
    const socket = io("https://vistafluenceapp.onrender.com");

    socket.on("campaign_liked", ({ campaignId, likedBy }) => {
      setCampaigns((prev) =>
        prev.map((c) => (c._id === campaignId ? { ...c, likes: likedBy } : c)),
      );
    });
    socket.on("campaign_commented", ({ campaignId, comment }) => {
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === campaignId
            ? { ...c, comments: [...(c.comments || []), comment] }
            : c,
        ),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLikePress = async (campaignId) => {
    try {
      setCampaigns((prev) =>
        prev.map((c) => {
          if (c._id === campaignId) {
            const alreadyLiked = c.likes?.includes(user?._id);
            const newLikes = alreadyLiked
              ? c.likes.filter((id) => id !== user?._id)
              : [...(c.likes || []), user?._id];
            return { ...c, likes: newLikes };
          }
          return c;
        }),
      );
      await api.likeCampaign(campaignId);
    } catch (err) {
      console.log("Like Sync Error:", err.message);
    }
  };
  const handleCommentSubmit = async (campaignId) => {
    const text = commentInputs[campaignId];
    if (!text || !text.trim()) return;

    try {
      setCommentInputs((prev) => ({ ...prev, [campaignId]: "" }));
      await api.commentCampaign(campaignId, { text });
    } catch (err) {
      console.log("Comment Sync Error:", err.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveFeed();
  };

  const filtered = campaigns.filter((c) => {
    const titleMatch = c?.title?.toLowerCase().includes(search.toLowerCase());
    const brandName = c?.brand?.companyName || c?.brand?.name || "";
    const brandMatch = brandName.toLowerCase().includes(search.toLowerCase());
    const tagMatch = c?.tags?.some((t) =>
      t.toLowerCase().includes(search.toLowerCase()),
    );

    return titleMatch || brandMatch || tagMatch;
  });

  if (loading) {
    return (
      <View
        style={[
          s.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={G.gold} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={G.black} />
      <View style={s.header}>
        <Text style={s.logo}>
          VIST<Text style={{ color: G.gold }}>FLUENCE</Text>
        </Text>
        <TouchableOpacity
          style={s.notifBtn}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={s.notifDot} />
        </TouchableOpacity>
      </View>
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 14, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search live campaigns..."
            placeholderTextColor={G.isDark ? "#888888" : "#666666"}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={G.gold}
          />
        }
      >
        {filtered.length === 0 ? (
          <View style={s.emptyContainer}>
            <Text style={s.emptyText}>No Active Campaigns Found</Text>
            <Text style={s.emptySubText}>Swipe down to refresh terminal</Text>
          </View>
        ) : (
          filtered.map((c) => {
            const hostBrand = c?.brand || {};

            const displayBrandName =
              hostBrand.companyName || hostBrand.name || "Premium Brand";

            const brandAvatar =
              hostBrand.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(displayBrandName)}&background=E8C87A&color=000`;
            const campaignImage =
              c?.coverArt ||
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000";
            const displayBudget =
              typeof c.budget === "number"
                ? `₹${c.budget.toLocaleString()}`
                : c.budget;
            const hasUserLiked = c.likes?.includes(user?._id);

            return (
              <View key={c._id || c.id} style={s.post}>
                <TouchableOpacity
                  style={s.postHeader}
                  onPress={() =>
                    navigation.navigate("BrandPublicProfile", {
                      brandId: hostBrand._id,
                      brandName: displayBrandName,
                    })
                  }
                >
                  <View style={s.brandAvatar}>
                    <Image
                      source={{ uri: brandAvatar }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={s.row}>
                      <Text style={s.brandName}>{displayBrandName}</Text>
                      <Text style={s.verifiedCheck}>👑</Text>
                    </View>
                    <Text style={s.brandCategory}>
                      {c.category || "Campaign Partner"} • Active
                    </Text>
                  </View>
                  <Text style={s.moreIcon}>•••</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() =>
                    navigation.navigate("CampaignDetail", { campaign: c })
                  }
                >
                  <Image source={{ uri: campaignImage }} style={s.postImage} />
                </TouchableOpacity>
                <View style={s.interactionBar}>
                  <View style={s.leftActions}>
                    <TouchableOpacity
                      style={s.actionBtn}
                      onPress={() => handleLikePress(c._id)}
                    >
                      <Text style={s.actionEmoji}>
                        {hasUserLiked ? "❤️" : "🤍"}
                      </Text>
                      <Text style={s.actionText}>{c.likes?.length || 0}</Text>
                    </TouchableOpacity>
                    <View style={s.actionBtn}>
                      <Text style={s.actionEmoji}>💬</Text>
                      <Text style={s.actionText}>
                        {c.comments?.length || 0}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={s.applyNowBtn}
                    onPress={() =>
                      navigation.navigate("CampaignDetail", { campaign: c })
                    }
                  >
                    <Text style={s.applyBtnText}>Apply Now</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.postContent}>
                  <View style={s.budgetRow}>
                    <Text style={s.budgetLabel}>OFFERED REWARD:</Text>
                    <Text style={s.budgetValue}>{displayBudget}</Text>
                  </View>

                  <Text style={s.postDescription}>
                    <Text style={s.brandNameDesc}>
                      {displayBrandName.toLowerCase().replace(/\s+/g, "")}{" "}
                    </Text>
                    {c.description}
                  </Text>
                  {c.comments && c.comments.length > 0 && (
                    <View style={s.commentsStreamBox}>
                      {c.comments.slice(-3).map((comm, idx) => (
                        <Text key={idx} style={s.commentLine} numberOfLines={2}>
                          <Text style={s.commentUser}>
                            {comm.user?.name || "User"}:{" "}
                          </Text>
                          <Text style={s.commentText}>{comm.text}</Text>
                        </Text>
                      ))}
                    </View>
                  )}
                  <View style={s.commentInputRow}>
                    <TextInput
                      style={s.commentInput}
                      placeholder="Add a public live comment..."
                      placeholderTextColor={G.textSub}
                      value={commentInputs[c._id] || ""}
                      onChangeText={(txt) =>
                        setCommentInputs((prev) => ({ ...prev, [c._id]: txt }))
                      }
                    />
                    <TouchableOpacity
                      style={s.commentPostBtn}
                      onPress={() => handleCommentSubmit(c._id)}
                    >
                      <Text style={s.commentPostBtnText}>Post</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={s.tagRow}>
                    {c.deliverables &&
                      c.deliverables.slice(0, 2).map((del, idx) => (
                        <Text key={idx} style={s.reqTag}>
                          • {del}
                        </Text>
                      ))}
                    <View style={s.followerTagContainer}>
                      <Text style={s.followerTagText}>👥 Open Pool</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
        {/* UPDATED: spacer height now accounts for bottom nav + safe area, prevents last post being hidden behind nav */}
        <View style={{ height: 100 + insets.bottom }} />
      </ScrollView>

      <BottomNavBar active="HomeTab" navigation={navigation} />
    </View>
  );
}

// UPDATED: makeStyles now accepts insets as second param
const makeStyles = (G, insets = { top: 0, bottom: 0 }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: G.bg,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      // UPDATED: was hardcoded paddingTop: 50 — now respects notch/status bar height dynamically
      paddingTop: insets.top + 10,
      paddingBottom: 15,
    },
    logo: {
      fontSize: 22,
      fontWeight: "900",
      color: G.text,
      letterSpacing: 0.5,
    },
    notifBtn: {
      position: "relative",
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    notifDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: G.gold,
      borderWidth: 1.5,
      borderColor: G.black,
    },
    searchRow: { paddingHorizontal: 16, paddingBottom: 12 },
    searchBox: {
      backgroundColor: G.bgInput,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      height: 45,
      borderWidth: 1,
      borderColor: G.border,
    },
    searchInput: {
      flex: 1,
      color: G.text,
      fontSize: 14,
      fontWeight: "500",
    },
    post: {
      marginBottom: 25,
      borderBottomWidth: 1,
      borderBottomColor: G.border,
      paddingBottom: 15,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 10,
    },
    brandAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    brandInitial: { fontWeight: "900", fontSize: 14 },
    row: { flexDirection: "row", alignItems: "center", gap: 4 },
    brandName: { color: G.text, fontWeight: "700", fontSize: 14 },
    verifiedCheck: { fontSize: 10 },
    brandCategory: { color: G.textSub, fontSize: 11, marginTop: 1 },
    moreIcon: { color: G.text, fontSize: 18 },
    postImage: { width: width, height: width * 1.1, backgroundColor: G.bgCard },
    interactionBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    leftActions: { flexDirection: "row", gap: 18, alignItems: "center" },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
    actionEmoji: { fontSize: 22 },
    actionText: { color: G.text, fontSize: 13, fontWeight: "600" },
    applyNowBtn: {
      backgroundColor: G.gold,
      paddingHorizontal: 20,
      paddingVertical: 9,
      borderRadius: 10,
    },
    applyBtnText: { color: G.black, fontWeight: "800", fontSize: 13 },
    postContent: { paddingHorizontal: 14 },
    budgetRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    budgetLabel: {
      color: G.gold,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1,
    },
    budgetValue: { color: G.text, fontSize: 16, fontWeight: "900" },
    brandNameDesc: { color: G.text, fontWeight: "800" },
    postDescription: {
      color: G.text,
      fontSize: 13,
      lineHeight: 19,
    },
    commentsStreamBox: {
      backgroundColor: G.bgInput,
      padding: 10,
      borderRadius: 10,
      marginVertical: 8,
      borderWidth: 0.5,
      borderColor: G.border,
    },
    commentLine: { marginBottom: 4 },
    commentUser: { color: G.gold, fontWeight: "700", fontSize: 12 },
    commentText: { color: G.textSub, fontSize: 12 },

    commentInputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: G.bgInput,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 40,
      marginTop: 6,
    },
    commentInput: { flex: 1, color: G.text, fontSize: 12, paddingVertical: 0 },
    commentPostBtn: {
      marginLeft: 10,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    commentPostBtnText: { color: G.gold, fontWeight: "800", fontSize: 13 },

    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      gap: 8,
      alignItems: "center",
    },
    reqTag: { color: G.goldDim, fontSize: 13 },
    followerTagContainer: {
      backgroundColor: G.bgInput,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    followerTagText: { color: G.gold, fontSize: 11, fontWeight: "700" },
    emptyContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: { color: G.text, fontSize: 16, fontWeight: "700" },
    emptySubText: { color: G.muted, fontSize: 12, marginTop: 5 },
    tabBar: {
      flexDirection: "row",
      backgroundColor: G.black,
      paddingBottom: 12 + insets.bottom,
      paddingTop: 12,
      borderTopWidth: 0.5,
      borderTopColor: G.border,
    },
    tabItem: { flex: 1, alignItems: "center", gap: 4 },
    tabIcon: { fontSize: 20 },
    tabLabel: { fontSize: 10, color: G.text, fontWeight: "600" },
  });