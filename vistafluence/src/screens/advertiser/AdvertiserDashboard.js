import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, ActivityIndicator,
  RefreshControl, Image, TouchableOpacity, StatusBar, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../api/index";
import { useTheme } from "../../context/Themecontext";

const CampaignItem = React.memo(({ item, G, onDelete }) => {
  const handleDeletePress = () => {
    if (!item.canDelete) {
      Alert.alert(
        "Not Allowed Yet",
        "You can delete this campaign only after 24 hours of posting it."
      );
      return;
    }

    Alert.alert(
      "Delete Campaign",
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item._id) },
      ]
    );
  };

  return (
    <TouchableOpacity style={{
      backgroundColor: G.bgCard, marginBottom: 25,
      borderWidth: 1, borderColor: G.borderAlt, borderRadius: 12,
    }}>
      <Image
        source={{ uri: item.coverArt || "https://via.placeholder.com/600x300" }}
        style={{ width: "100%", height: 180, backgroundColor: G.bgInput }}
      />
      <View style={{ padding: 15 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <Text style={{ color: G.text, fontSize: 16, fontWeight: "900", letterSpacing: 0.5, flex: 1, flexShrink: 1, marginRight: 10 }} numberOfLines={2}>
            {item.title.toUpperCase()}
          </Text>
          <View style={{ backgroundColor: G.goldFaint, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: G.border, flexShrink: 0 }}>
            <Text style={{ color: G.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1 }}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={{ color: G.textSub, fontSize: 12, lineHeight: 18, marginBottom: 15 }} numberOfLines={2}>
          {item.description || "No description provided."}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 15, borderTopWidth: 1, borderTopColor: G.borderAlt }}>
          <View>
            <Text style={{ color: G.textSub, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 4 }}>BUDGET</Text>
            <Text style={{ color: G.text, fontSize: 13, fontWeight: "700" }}>₹{item.budget?.toLocaleString()}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: G.textSub, fontSize: 9, fontWeight: "900", letterSpacing: 1, marginBottom: 4 }}>CATEGORY</Text>
            <Text style={{ color: G.text, fontSize: 13, fontWeight: "700" }}>{item.category.toUpperCase()}</Text>
          </View>
        </View>

        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: G.borderAlt,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20 }}>
              <Text style={{ color: G.gold, fontSize: 13, fontWeight: "900", marginRight: 5 }}>
                {item.likesCount ?? item.likes?.length ?? 0}
              </Text>
              <Text style={{ color: G.textSub, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
                LIKES
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ color: G.gold, fontSize: 13, fontWeight: "900", marginRight: 5 }}>
                {item.commentsCount ?? item.comments?.length ?? 0}
              </Text>
              <Text style={{ color: G.textSub, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
                COMMENTS
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleDeletePress}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6,
              borderWidth: 1, borderColor: item.canDelete ? "#E5484D" : G.borderAlt,
              opacity: item.canDelete ? 1 : 0.5,
            }}
          >
            <Text style={{ color: item.canDelete ? "#E5484D" : G.textSub, fontSize: 11, fontWeight: "900", letterSpacing: 0.5 }}>
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function AdvertiserDashboard() {
  const { G } = useTheme();
  const insets = useSafeAreaInsets();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.getMyCampaigns();
      if (res && res.success) setCampaigns(res.campaigns);
    } catch (err) {
      console.log("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleDelete = async (campaignId) => {
    try {
      const res = await api.deleteCampaign(campaignId);
      if (res && res.success) {
        setCampaigns((prev) => prev.filter((c) => c._id !== campaignId));
      } else {
        Alert.alert("Error", res?.message || "Could not delete campaign.");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong while deleting.";
      Alert.alert("Error", msg);
      console.log("Delete Campaign Error:", err);
    }
  };

  const renderItem = useCallback(
    ({ item }) => <CampaignItem item={item} G={G} onDelete={handleDelete} />,
    [G],
  );

  return (
    <View style={{ flex: 1, backgroundColor: G.bg, paddingHorizontal: 20 }}>
      <StatusBar barStyle="light-content" />

      <View style={{ marginTop: insets.top + 16, marginBottom: 30 }}>
        <Text style={{ fontSize: 32, fontWeight: "900", color: G.text, marginTop: 5 }}>
          ACTIVE <Text style={{ color: G.gold }}>CAMPAIGNS</Text>
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color={G.gold} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={campaigns}
          keyExtractor={(item) => item._id}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadCampaigns} tintColor={G.gold} />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          ListEmptyComponent={
            <Text style={{ color: G.textSub, textAlign: "center", marginTop: 50, letterSpacing: 2 }}>
              NO ACTIVE PROJECTS FOUND
            </Text>
          }
        />
      )}
    </View>
  );
}