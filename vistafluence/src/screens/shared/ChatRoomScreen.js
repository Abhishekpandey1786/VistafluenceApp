import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { api } from "../../api/index";
import { useTheme } from "../../context/Themecontext";
import { useSocket } from "../../context/Socketcontext";

export default function ChatRoomScreen({ route, navigation }) {
  const { G } = useTheme();
  const styles = makeStyles(G);
  const { socket } = useSocket();

  const { userId, name, role, avatar } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const flatRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const myIdRef = useRef(null);

  const accentColor = role === "brand" ? G.pink : G.teal;

  useEffect(() => {
    fetchMessages();
    api
      .getMe()
      .then((res) => {
        if (res.success) myIdRef.current = res.user?._id;
      })
      .catch((err) => console.log("GET ME ERROR:", err));
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.getChatMessages(userId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.log("MESSAGE ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (msg) => {
      const senderId = msg?.sender?._id || msg?.sender;
      if (senderId !== userId) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setIsTyping(false);

      setTimeout(() => {
        flatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleTyping = (senderId) => {
      if (senderId === userId) setIsTyping(true);
    };

    const handleStopTyping = (senderId) => {
      if (senderId === userId) setIsTyping(false);
    };

    socket.on("receive_message", handleIncoming);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleIncoming);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [socket, userId]);

  const handleTypingInput = (text) => {
    setInput(text);
    if (!socket || !myIdRef.current) return;

    socket.emit("typing", { receiverId: userId, senderId: myIdRef.current });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId: userId, senderId: myIdRef.current });
    }, 1500);
  };

  const send = async (customText = null) => {
    const textToSend = customText !== null ? customText : input.trim();
    if (!textToSend) return;

    try {
      setSending(true);
      if (customText === null) {
        setInput("");
      }
      if (socket && myIdRef.current) {
        socket.emit("stop_typing", { receiverId: userId, senderId: myIdRef.current });
      }

      const res = await api.sendMessage(userId, textToSend, "text", "");

      if (res.success) {
        setMessages((prev) => [...prev, res.message]);
        setTimeout(() => {
          flatRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.log("SEND ERROR:", err);
    } finally {
      setSending(false);
    }
  };

  const handleAttachmentPick = async () => {
    Alert.alert(
      "Share Media & Files",
      "Choose what type of asset you want to deploy to the chat:",
      [
        { text: "📸 Camera or Gallery Image", onPress: pickImageStream },
        { text: "📄 PDF or Document File", onPress: pickDocumentStream },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const pickImageStream = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Refused",
          "Gallery storage access mapping is mandatory to capture layout images."
        );
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets?.[0]) {
        const a = pickerResult.assets[0];
        uploadFileToCloudinary(
          a.uri,
          a.fileName || `image_${Date.now()}.jpg`,
          a.mimeType || "image/jpeg"
        );
      }
    } catch (err) {
      console.log("IMAGE PICK ERROR:", err);
      Alert.alert("Image Pick Failed", err?.message || String(err));
    }
  };

  const pickDocumentStream = async () => {
    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (!docResult.canceled && docResult.assets?.[0]) {
        const a = docResult.assets[0];
        uploadFileToCloudinary(a.uri, a.name, a.mimeType);
      }
    } catch (err) {
      console.log("DOCUMENT PICK ERROR:", err);
      Alert.alert("Document Pick Failed", err?.message || String(err));
    }
  };

  const uploadFileToCloudinary = async (fileUri, fileName, mimeType) => {
    try {
      setUploadingMedia(true);
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
        type:
          mimeType ||
          (fileName?.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
        name: fileName || "upload_asset",
      });

      const uploadRes = await api.uploadMediaAsset(formData);

      if (uploadRes?.success) {
        const messageType = uploadRes.resourceType === "document" ? "document" : "image";
        const caption = messageType === "image" ? "📷 Photo" : `📄 ${fileName || "Document"}`;

        const res = await api.sendMessage(userId, caption, messageType, uploadRes.url);

        if (res.success) {
          setMessages((prev) => [...prev, res.message]);
          setTimeout(() => {
            flatRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else {
        Alert.alert("Upload Failed", uploadRes?.message || "Could not upload file. Try again.");
      }
    } catch (err) {
      console.log("UPLOAD ATTACHMENT FAULT:", err);
      Alert.alert("Upload Failed", "Could not upload file. Try again.");
    } finally {
      setUploadingMedia(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={G.gold} />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: accentColor + "55",
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.headerAvatar,
              { backgroundColor: accentColor + "22", borderColor: accentColor + "55" },
            ]}
          >
            <Text style={[styles.headerAvatarText, { color: accentColor }]}>
              {name?.[0]?.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={[styles.headerRole, { color: accentColor }]}>
            {isTyping ? "typing..." : `● ${role}`}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item, index) => item?._id || index.toString()}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => {
          const senderId = item?.sender?._id || item?.sender;
          const isMe = senderId && userId ? senderId !== userId : true;

          return (
            <View style={[styles.bubbleWrap, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
              <View style={[styles.bubble, isMe ? styles.myBubble : styles.otherBubble]}>
                {item.messageType === "image" && item.fileUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      Linking.openURL(item.fileUrl).catch(() =>
                        Alert.alert("Error", "Unable to open image")
                      )
                    }
                  >
                    <Image
                      source={{ uri: item.fileUrl }}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 10,
                        marginBottom: 6,
                      }}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : item.messageType === "document" && item.fileUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      Linking.openURL(item.fileUrl).catch(() =>
                        Alert.alert("Error", "Unable to open document")
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        {
                          color: isMe ? G.bg : G.text,
                          textDecorationLine: "underline",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      📄 {item.text || "Open Document"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.bubbleText, { color: isMe ? G.bg : G.text }]}>
                    {item?.text}
                  </Text>
                )}

                <Text
                  style={[
                    styles.bubbleTime,
                    { color: isMe ? "rgba(0,0,0,0.5)" : G.textSub },
                  ]}
                >
                  {item?.createdAt
                    ? new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputWrap}>
        {uploadingMedia && (
          <View style={styles.mediaLoaderRow}>
            <ActivityIndicator size="small" color={G.gold} />
            <Text style={styles.mediaLoaderText}>
              Uploading attachment...
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={handleAttachmentPick}
            activeOpacity={0.7}
          >
            <Text style={styles.attachmentIconText}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type message..."
            placeholderTextColor={G.textSub}
            value={input}
            onChangeText={handleTypingInput}
            multiline
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              { backgroundColor: input.trim() ? G.gold : G.bgCard },
            ]}
            onPress={() => send()}
            disabled={!input.trim() || sending || uploadingMedia}
          >
            <Text
              style={{
                color: input.trim() ? G.bg : G.textSub,
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              ➤
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (G) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: G.bg },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: G.bg,
    },
    loadingText: { color: G.text, marginTop: 12 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 50,
      paddingBottom: 14,
      paddingHorizontal: 16,
      backgroundColor: G.bgDeep,
      borderBottomWidth: 1,
      borderBottomColor: G.border,
    },
    backBtn: { marginRight: 12 },
    backText: { color: G.text, fontSize: 20 },
    headerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    headerAvatarText: { fontSize: 18, fontWeight: "800" },
    headerInfo: { marginLeft: 12, flex: 1 },
    headerName: { color: G.text, fontWeight: "700", fontSize: 15 },
    headerRole: { marginTop: 2, fontSize: 11, textTransform: "capitalize" },
    msgList: { padding: 16 },
    bubbleWrap: { marginBottom: 12 },
    bubbleLeft: { alignItems: "flex-start" },
    bubbleRight: { alignItems: "flex-end" },
    bubble: {
      maxWidth: "75%",
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    myBubble: { backgroundColor: G.gold, borderBottomRightRadius: 4 },
    otherBubble: {
      backgroundColor: G.bgCard,
      borderWidth: 1,
      borderColor: G.border,
      borderBottomLeftRadius: 4,
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTime: { marginTop: 4, fontSize: 10, textAlign: "right" },
    inputWrap: {
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: G.border,
      backgroundColor: G.bgDeep,
    },
    inputRow: { flexDirection: "row", alignItems: "center" },
    attachmentButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: G.bgCard,
      borderWidth: 1,
      borderColor: G.border,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      marginBottom: 2,
    },
    attachmentIconText: { fontSize: 18, color: G.text },
    input: {
      flex: 1,
      backgroundColor: G.bgCard,
      borderWidth: 1,
      borderColor: G.border,
      borderRadius: 22,
      color: G.text,
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginRight: 10,
      maxHeight: 100,
    },
    sendBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    mediaLoaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingBottom: 8,
      paddingHorizontal: 4,
    },
    mediaLoaderText: { color: G.textSub, fontSize: 11, fontWeight: "500" },
  });