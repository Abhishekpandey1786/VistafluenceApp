import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/index';

const TYPE_ICONS = { application:'📬', payment:'💰', campaign:'📢', message:'💬', accepted:'✅', admin:'📣' };
const TYPE_COLORS = { application:C.teal, payment:'#4ADE80', campaign:C.amber, message:C.info, accepted:'#4ADE80', admin:'#A78BFA' };

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function NotificationsScreen({ navigation }) {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      const list = Array.isArray(res) ? res : (res?.notifications || res?.data || []);
      setNotifs(list);
    } catch (e) {
      console.log('notif load err:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1) Pehli baar screen mount hote hi load karo
  useEffect(() => {
    load();
  }, [load]);

  // 2) Jab bhi user is tab pe wapas focus kare (dusri screen se aaye), fresh data le aao
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // 3) (Optional) Har 30 sec me background poll — agar real-time push/socket nahi hai to ye lagao
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifs(n => n.map(x => ({ ...x, read: true })));
    } catch (e) { console.log(e.message); }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAll}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>
      </View>

      <FlatList
        data={notifs}
        keyExtractor={i => i._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.teal} />}
        ListEmptyComponent={
          !loading && (
            <Text style={{ color: C.textMuted, textAlign:'center', marginTop: 40 }}>No notifications yet</Text>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.notifCard, item.urgent && !item.read && styles.notifUrgent]}>
            <View style={[styles.iconCircle, { backgroundColor: (TYPE_COLORS[item.type] || C.teal) + '22' }]}>
              <Text style={{ fontSize: 18 }}>{TYPE_ICONS[item.type] || '🔔'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.notifTop}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              <Text style={styles.notifBody}>{item.body}</Text>
              {item.type === 'application' && item.meta?.influencerId && user?.role === 'advertiser' && (
                <TouchableOpacity
                  style={styles.viewProfileBtn}
                  onPress={() => navigation.navigate('HomeTab', {
                    screen: 'InfluencerPublicProfile',
                    params: { influencerId: item.meta.influencerId }
                  })}
                >
                  <Text style={styles.viewProfileText}>View Influencer Profile →</Text>
                </TouchableOpacity>
              )}
            </View>
            {item.urgent && !item.read && <View style={styles.urgentDot} />}
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.border, marginLeft: 72 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingTop:52, paddingBottom:16, backgroundColor:C.bgDeep, borderBottomWidth:1, borderBottomColor:C.border },
  title: { fontSize:20, fontWeight:'900', color:C.text },
  markAll: { fontSize:13, color:C.teal, fontWeight:'600' },
  notifCard: { flexDirection:'row', alignItems:'flex-start', gap:14, paddingHorizontal:16, paddingVertical:14, backgroundColor:C.bg },
  notifUrgent: { backgroundColor: C.tealDark + '22' },
  iconCircle: { width:42, height:42, borderRadius:21, justifyContent:'center', alignItems:'center' },
  notifTop: { flexDirection:'row', justifyContent:'space-between', marginBottom:4 },
  notifTitle: { fontSize:13, fontWeight:'700', color:C.text, flex:1 },
  notifTime: { fontSize:10, color:C.textMuted },
  notifBody: { fontSize:12, color:C.textSub, lineHeight:18 },
  viewProfileBtn: { marginTop:10, backgroundColor:C.teal, borderRadius:20, paddingHorizontal:14, paddingVertical:7, alignSelf:'flex-start' },
  urgentDot: { width:8, height:8, borderRadius:4, backgroundColor:C.teal, marginTop:4 },
});