import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";

import { api } from "../../api/index";
import { useTheme } from "../../context/Themecontext";
import { useSocket } from "../../context/Socketcontext";

const AVATAR_COLORS = ["#E8C87A", "#2DD4BF", "#FF6B8A", "#F59E0B", "#60A5FA"];

export default function ChatListScreen({ navigation }) {
  const { G } = useTheme();
  const styles = makeStyles(G);
  const { socket, onlineUsers } = useSocket();

  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.getChatList();
      if (res.success) {
        setChats(res.conversations || []);
      }
    } catch (err) {
      console.log("CHAT ERROR:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchChats);
    return unsubscribe;
  }, [navigation, fetchChats]);

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      const senderId = msg?.sender?._id || msg?.sender;

      setChats((prev) => {
        const idx = prev.findIndex((c) => c.user?._id === senderId);

        if (idx === -1) {
          fetchChats();
          return prev;
        }

        const updatedChat = {
          ...prev[idx],
          lastMessage: msg,
          unread: (prev[idx].unread || 0) + 1,
        };

        const next = [...prev];
        next.splice(idx, 1);
        next.unshift(updatedChat);
        return next;
      });
    };

    socket.on("receive_message", handleIncoming);
    return () => socket.off("receive_message", handleIncoming);
  }, [socket, fetchChats]);

  const filtered = chats.filter((item) => {
    const matchesSearch = item?.user?.name
      ?.toLowerCase()
      .includes(search.toLowerCase());
    if (item?.lastMessage === null) {
      return matchesSearch && item?.user;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={G.gold} />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>Messages</Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={G.textSub}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => item?.user?._id || index.toString()}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 20,
          flexGrow: filtered.length === 0 ? 1 : 0,
        }}
        renderItem={({ item, index }) => {
          const user = item.user;
          const lastMessage = item.lastMessage;
          const isOnline = onlineUsers?.includes(user?._id);

          return (
            <TouchableOpacity
              style={styles.chatRow}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("ChatRoom", {
                  userId: user?._id,
                  name: user?.name,
                  role: user?.role,
                  avatar: user?.avatar,
                })
              }
            >
              <View style={styles.avatarWrap}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor:
                        AVATAR_COLORS[index % AVATAR_COLORS.length] + "22",
                      borderColor:
                        AVATAR_COLORS[index % AVATAR_COLORS.length] + "44",
                      overflow: "hidden",
                    },
                  ]}
                >
                  {user?.avatar ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={{ width: "100%", height: "100%", borderRadius: 25 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.avatarText,
                        { color: AVATAR_COLORS[index % AVATAR_COLORS.length] },
                      ]}
                    >
                      {user?.name?.[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
                {isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatTop}>
                  <View style={styles.nameRow}>
                    <Text
                      style={[
                        styles.chatName,
                        item.unread > 0 && { color: G.gold },
                      ]}
                    >
                      {user?.name}
                    </Text>

                    <View
                      style={[
                        styles.rolePill,
                        {
                          backgroundColor:
                            user?.role === "brand" ? G.pinkDark : G.tealDark,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          { color: user?.role === "brand" ? G.pink : G.teal },
                        ]}
                      >
                        {user?.role}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.chatTime,
                      item.unread > 0 && { color: G.gold },
                    ]}
                  >
                    {lastMessage?.createdAt
                      ? new Date(lastMessage.createdAt).toLocaleDateString()
                      : ""}
                  </Text>
                </View>

                <View style={styles.chatBottom}>
                  <Text
                    style={[
                      styles.lastMsg,
                      item.unread > 0 && { color: G.textSub },
                    ]}
                    numberOfLines={1}
                  >
                    {lastMessage?.text || "No messages yet. Tap to chat!"}
                  </Text>

                  {item.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => (
          <View
            style={{ height: 1, backgroundColor: G.border, marginLeft: 76 }}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySub}>
              Start chatting with approved users
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const makeStyles = (G) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: G.bg },
    loaderContainer: {
      flex: 1,
      backgroundColor: G.bg,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: { marginTop: 12, color: G.text, fontSize: 14 },
    header: {
      paddingHorizontal: 20,
      paddingTop: 56,
      paddingBottom: 16,
      backgroundColor: G.bgDeep,
      borderBottomWidth: 1,
      borderBottomColor: G.border,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    backBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: G.bgCard,
      borderWidth: 1,
      borderColor: G.border,
      justifyContent: "center",
      alignItems: "center",
    },
    backIcon: { fontSize: 16, color: G.text, fontWeight: "700" },
    title: {
      fontSize: 24,
      fontWeight: "900",
      color: G.text,
      letterSpacing: -0.5,
    },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: G.bgCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: G.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
    },
    searchIcon: { fontSize: 14 },
    searchInput: { flex: 1, color: G.text, fontSize: 14 },
    chatRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 14,
      backgroundColor: G.bg,
    },
    avatarWrap: { position: "relative" },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 1.5,
      justifyContent: "center",
      alignItems: "center",
    },
    onlineDot: {
      position: "absolute",
      bottom: 1,
      right: 1,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#22C55E",
      borderWidth: 2,
      borderColor: G.bg,
    },
    avatarText: { fontWeight: "900", fontSize: 20 },
    chatContent: { flex: 1 },
    chatTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 5,
    },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    chatName: { fontSize: 15, fontWeight: "700", color: G.text },
    rolePill: { borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
    roleText: { fontSize: 9, fontWeight: "800", textTransform: "capitalize" },
    chatTime: { fontSize: 11, color: G.textSub },
    chatBottom: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    lastMsg: { fontSize: 13, color: G.textSub, flex: 1 },
    unreadBadge: {
      backgroundColor: G.gold,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 5,
      marginLeft: 8,
    },
    unreadText: { color: G.bg, fontSize: 11, fontWeight: "900" },
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 18, fontWeight: "700", color: G.text, marginBottom: 6 },
    emptySub: { fontSize: 13, color: G.textSub, textAlign: "center" },
  });