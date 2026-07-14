import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl, Modal
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/Themecontext";

const API_BASE = "https://vistafluenceapp.onrender.com/api";

const STATUS = {
  danger: '#FF4444',
  warning: '#F97316',
};

const PLANS = {
  Basic:    { code: 'BASIC',    price: 99,   oldPrice: 125,  discount: '20% OFF', campaigns: 6,          perks: ['Higher Visibility', 'Apply For 6 Campaigns Monthly'] },
  Standard: { code: 'STANDARD', price: 199,  oldPrice: 599,  discount: '30% OFF', campaigns: 15,         perks: ['Higher Visibility', 'Apply For 15 Campaigns Monthly', 'Direct Message'] },
  Advanced: { code: 'ADVANCE',  price: 499,  oldPrice: 1000, discount: '40% OFF', campaigns: 40,         perks: ['Higher Visibility', 'Apply For 40 Campaigns Monthly', 'Direct Message', 'Academy Course', 'Profile Recommendation'] },
  Premium:  { code: 'PREMIUM',  price: 899,  oldPrice: 1800, discount: '50% OFF', campaigns: 'Unlimited', perks: ['Higher Visibility', 'Unlimited Campaigns', 'Direct Message', 'Academy Access', 'Brand Recommendation', '3 Video Editing Credits'] },
};

export default function SubscriptionCheckoutScreen({ navigation, route }) {
  const { user } = useAuth();
  const { G } = useTheme();

  const [selectedPlan, setSelectedPlan]   = useState(route?.params?.plan || 'Basic');
  const [name, setName]                   = useState(user?.name || '');
  const [email, setEmail]                 = useState(user?.email || '');
  const [phone, setPhone]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [view, setView]                   = useState('checkout');
  const [subscription, setSubscription]   = useState(null);
  const [failMessage, setFailMessage]     = useState('');

 
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [showWebView, setShowWebView] = useState(false);

  const plan  = PLANS[selectedPlan];
  const gst   = parseFloat((plan.price * 0.18).toFixed(2));
  const total = parseFloat((plan.price + gst).toFixed(2));
  const sub            = user?.subscription;
  const hasSub         = sub?.plan && sub?.status === 'Active';
  const expiryDate     = sub?.expiryDate ? new Date(sub.expiryDate) : null;
  const today          = new Date();
  const daysLeft       = expiryDate ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)) : 0;
  const isExpired      = daysLeft <= 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 5;

  const statusColor = isExpired ? STATUS.danger : isExpiringSoon ? STATUS.warning : G.teal;
  const statusText  = isExpired ? 'Expired' : isExpiringSoon ? `Expiring in ${daysLeft} days` : 'Active';
  const miniLabel    = { color: G.textSub, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 8 };
  const sectionLabel = { color: G.gold, fontSize: 11, fontWeight: '900', marginTop: 10, marginBottom: 16, opacity: 0.8, paddingHorizontal: 20 };
  const cardStyle    = { marginHorizontal: 20, marginBottom: 12, padding: 16, backgroundColor: G.bgCard, borderRadius: 12, borderWidth: 1, borderColor: G.borderAlt };
  const inputStyle   = { backgroundColor: G.bgCard, color: G.text, borderBottomWidth: 2, borderBottomColor: G.border, padding: 15, fontSize: 15, fontWeight: '600', marginBottom: 20 };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/instamojo/my-orders/${user._id}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Orders fetch error:', err);
    } finally {
      setOrdersLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const handlePayment = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return Alert.alert('Error', 'Please fill all fields');
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/instamojo/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId:   user._id,
          email:    email.trim().toLowerCase(),
          userName: name.trim(),
          phone:    phone.trim(),
          plan:     { name: selectedPlan, price: total },
        }),
      });
      const data = await response.json();
      if (data.success && data.url) {
     
        setCheckoutUrl(data.url);
        setShowWebView(true);
      } else {
        Alert.alert('Payment Error', data.error || 'Something went wrong');
      }
    } catch (err) {
      Alert.alert('Error', 'Payment request failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationChange = (navState) => {
    if (!navState?.url) return;
    if (!navState.url.includes('/payment-status')) return;

    try {
      const parsed             = new URL(navState.url);
      const payment_id         = parsed.searchParams.get('payment_id');
      const payment_request_id = parsed.searchParams.get('payment_request_id');
      const userId             = parsed.searchParams.get('userId');
      const planCode           = parsed.searchParams.get('plan');

      setShowWebView(false);

      if (payment_id && payment_request_id && userId && planCode) {
        verifyPayment(payment_id, payment_request_id, userId, planCode);
      } else {
       
        setFailMessage('Payment was not completed.');
        setView('failed');
      }
    } catch (e) {
      console.error('Redirect URL parse error:', e);
      setShowWebView(false);
      setFailMessage('Could not read payment result.');
      setView('failed');
    }
  };

  const verifyPayment = async (payment_id, payment_request_id, userId, planCode) => {
    setView('verifying');
    try {
      const res  = await fetch(`${API_BASE}/api/instamojo/verify-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id, payment_request_id, userId, planCode }),
      });
      const data = await res.json();
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        setView('success');
        fetchOrders();
      } else {
        setFailMessage(data.message || 'Payment could not be verified.');
        setView('failed');
      }
    } catch (err) {
      setFailMessage('Network error. Please check your connection.');
      setView('failed');
    }
  };

  // ---- WebView checkout modal ----
  const renderCheckoutWebView = () => (
    <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
      <View style={{ flex: 1, backgroundColor: G.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={{ padding: 8 }}>
            <Text style={{ color: G.text, fontSize: 16, fontWeight: '700' }}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        {checkoutUrl && (
          <WebView
            source={{ uri: checkoutUrl }}
            onNavigationStateChange={handleWebViewNavigationChange}
            startInLoadingState
            renderLoading={() => (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={G.gold} />
              </View>
            )}
          />
        )}
      </View>
    </Modal>
  );

  if (view === 'verifying') {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={G.gold} />
        <Text style={{ color: G.textSub, marginTop: 16, fontSize: 15 }}>Verifying your payment...</Text>
        <Text style={{ color: G.textSub, marginTop: 6, fontSize: 12 }}>Please don't close the app</Text>
      </View>
    );
  }
  if (view === 'failed') {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
        <Text style={{ fontSize: 60 }}>❌</Text>
        <Text style={{ color: STATUS.danger, fontSize: 22, fontWeight: '900', letterSpacing: 1, textAlign: 'center', marginTop: 16 }}>
          PAYMENT FAILED
        </Text>
        <Text style={{ color: G.textSub, textAlign: 'center', marginTop: 8, marginBottom: 8 }}>{failMessage}</Text>
        <Text style={{ color: G.textSub, textAlign: 'center', fontSize: 11, marginBottom: 30 }}>
          If money was deducted, contact support with your payment ID.
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: G.gold, paddingVertical: 18, paddingHorizontal: 34, borderRadius: 8 }}
          activeOpacity={0.9}
          onPress={() => setView('checkout')}>
          <Text style={{ color: G.bg, fontWeight: '900', fontSize: 13, letterSpacing: 1 }}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (view === 'success' && subscription) {
    const sp     = PLANS[subscription.plan];
    const expiry = subscription.expiryDate
      ? new Date(subscription.expiryDate).toDateString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toDateString();

    return (
      <View style={{ flex: 1, backgroundColor: G.bg }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 10 }}>
            <Text style={{ fontSize: 64 }}>🎉</Text>
            <Text style={{ color: G.teal, fontWeight: '900', fontSize: 24, letterSpacing: 1, textAlign: 'center', marginTop: 12 }}>
              SUBSCRIPTION ACTIVATED
            </Text>
            <Text style={{ color: G.textSub, textAlign: 'center', marginTop: 6 }}>
              Welcome to Vistafluence {subscription.plan} Plan
            </Text>
          </View>

          <Text style={sectionLabel}>/ PLAN_DETAILS</Text>
          <View style={cardStyle}>
            {[
              ['Plan',     subscription.plan],
              ['Validity', '30 Days'],
              ['Expiry',   expiry],
              ['Status',   'Active'],
            ].map(([label, val]) => (
              <View key={label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderColor: G.border }}>
                <Text style={{ color: G.textSub, fontSize: 13 }}>{label}</Text>
                <Text style={{ color: label === 'Status' ? G.teal : label === 'Plan' ? G.gold : G.text, fontWeight: '700', fontSize: 13 }}>
                  {val}
                </Text>
              </View>
            ))}
          </View>

          <Text style={sectionLabel}>/ INCLUDED_FEATURES</Text>
          <View style={cardStyle}>
            {(sp?.perks || []).map((perk, i) => (
              <Text key={i} style={{ color: G.text, fontSize: 13, marginVertical: 5 }}>✓  {perk}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={{ marginHorizontal: 20, marginTop: 10, backgroundColor: G.gold, padding: 20, height: 60, justifyContent: 'center', borderRadius: 8 }}
            activeOpacity={0.9}
            onPress={() => setView('checkout')}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: G.bg, fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>VIEW / CHANGE PLAN</Text>
              <Text style={{ color: G.bg, fontSize: 20, fontWeight: '900' }}>→</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: G.bg }}>
      <StatusBar barStyle="light-content" />
      {renderCheckoutWebView()}
      <View style={{ marginTop: 60, marginBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: 36, height: 36, backgroundColor: G.bgCard, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderRadius: 8, borderWidth: 1, borderColor: G.borderAlt }}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <Text style={{ color: G.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 24, fontWeight: '900', color: G.text, marginTop: 4 }}>
            MANAGE <Text style={{ color: G.gold }}>PLAN</Text>
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={G.gold} />}
      >
        <Text style={sectionLabel}>/ CURRENT_SUBSCRIPTION</Text>

        {hasSub && !isExpired ? (
          <View style={{ ...cardStyle, borderColor: statusColor, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 6 }} />
              <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 1, flex: 1, color: statusColor }}>
                {statusText.toUpperCase()}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '900', color: G.gold }}>{sub.plan} PLAN</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>START DATE</Text>
                <Text style={{ color: G.text, fontWeight: '700', fontSize: 13 }}>
                  {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN') : 'N/A'}
                </Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: G.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>EXPIRY DATE</Text>
                <Text style={{ color: statusColor, fontWeight: '700', fontSize: 13 }}>
                  {expiryDate ? expiryDate.toLocaleDateString('en-IN') : 'N/A'}
                </Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: G.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>DAYS LEFT</Text>
                <Text style={{ color: statusColor, fontSize: 22, fontWeight: '900' }}>{daysLeft}</Text>
              </View>
            </View>
            <View style={{ height: 4, backgroundColor: G.border, borderRadius: 2, marginTop: 14, overflow: 'hidden' }}>
              <View style={{
                height: 4, borderRadius: 2, backgroundColor: statusColor,
                width: `${Math.min(100, Math.max(2, (daysLeft / 30) * 100))}%`,
              }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderColor: G.border }}>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>USED</Text>
                <Text style={{ color: G.text, fontWeight: '700', fontSize: 13 }}>{sub.applicationsUsed ?? 0}</Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: G.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>TOTAL</Text>
                <Text style={{ color: G.text, fontWeight: '700', fontSize: 13 }}>
                  {sub.maxApplications === 9999 ? '∞' : sub.maxApplications ?? 0}
                </Text>
              </View>
              <View style={{ width: 0.5, backgroundColor: G.border }} />
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ color: G.textSub, fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>REMAINING</Text>
                <Text style={{ color: G.teal, fontWeight: '700', fontSize: 13 }}>
                  {sub.maxApplications === 9999
                    ? '∞'
                    : Math.max(0, (sub.maxApplications ?? 0) - (sub.applicationsUsed ?? 0))}
                </Text>
              </View>
            </View>
            {isExpiringSoon && (
              <View style={{ marginTop: 12, padding: 10, backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 6 }}>
                <Text style={{ color: STATUS.warning, fontSize: 12, textAlign: 'center' }}>
                  ⚠ Renew now to avoid service interruption!
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={{ ...cardStyle, alignItems: 'center', paddingVertical: 28 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>{isExpired ? '⏰' : '📦'}</Text>
            <Text style={{ color: G.text, fontSize: 15, fontWeight: '900', marginBottom: 4 }}>
              {isExpired ? `Expired on ${expiryDate?.toLocaleDateString('en-IN')}` : 'No Active Plan'}
            </Text>
            <Text style={{ color: G.textSub, textAlign: 'center', fontSize: 12 }}>
              Choose a plan below and subscribe
            </Text>
          </View>
        )}
        <Text style={sectionLabel}>/ PAYMENT_HISTORY</Text>
        {ordersLoading ? (
          <ActivityIndicator color={G.gold} style={{ marginVertical: 20 }} />
        ) : orders.length === 0 ? (
          <View style={{ ...cardStyle, alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ color: G.textSub, fontSize: 13 }}>No payments yet</Text>
          </View>
        ) : (
          orders.map((order, i) => (
            <View key={i} style={{ marginHorizontal: 20, marginBottom: 10, padding: 14, backgroundColor: G.bgCard, borderRadius: 12, borderWidth: 1, borderColor: G.borderAlt }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{ color: G.text, fontWeight: '700', fontSize: 14 }}>{order.plan} Plan</Text>
                  <Text style={{ color: G.textSub, fontSize: 11, marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: G.gold, fontWeight: '900', fontSize: 15 }}>₹{order.amount}</Text>
                  <View style={{
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginTop: 4,
                    backgroundColor: order.paymentStatus === 'SUCCESS' ? 'rgba(45,212,191,0.12)' : 'rgba(255,68,68,0.12)',
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: order.paymentStatus === 'SUCCESS' ? G.teal : STATUS.danger }}>
                      {order.paymentStatus === 'SUCCESS' ? '✓ Paid' : order.paymentStatus === 'PENDING' ? '… Pending' : '✗ Failed'}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={{ color: G.textSub, fontSize: 10, marginTop: 8, letterSpacing: 0.5 }}>TXN: {order.transactionId || '—'}</Text>
            </View>
          ))
        )}
        <Text style={sectionLabel}>
          {hasSub && !isExpired ? '/ UPGRADE_OR_RENEW' : '/ CHOOSE_PLAN'}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10 }}>
          {Object.entries(PLANS).map(([key, p]) => {
            const active    = selectedPlan === key;
            const isCurrent = hasSub && sub.plan === key && !isExpired;
            return (
              <TouchableOpacity
                key={key}
                style={{
                  width: '46%', padding: 14, backgroundColor: G.bgCard, borderRadius: 12, alignItems: 'center',
                  borderWidth: 1, borderColor: active ? G.gold : isCurrent ? G.teal : G.borderAlt,
                }}
                onPress={() => setSelectedPlan(key)}
                activeOpacity={0.8}
              >
                {isCurrent && (
                  <Text style={{ fontSize: 8, color: G.teal, fontWeight: '900', letterSpacing: 1, marginBottom: 4 }}>CURRENT</Text>
                )}
                <Text style={{ color: G.text, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 }}>{key.toUpperCase()}</Text>
                <Text style={{ color: G.gold, fontSize: 20, fontWeight: '900', marginVertical: 4 }}>₹{p.price}</Text>
                <Text style={{ color: G.textSub, fontSize: 11, textDecorationLine: 'line-through' }}>₹{p.oldPrice}</Text>
                <View style={{ backgroundColor: G.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                  <Text style={{ color: G.bg, fontSize: 9, fontWeight: '800' }}>{p.discount}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={cardStyle}>
          <Text style={{ color: G.text, fontSize: 18, fontWeight: '900', marginBottom: 10 }}>{selectedPlan} Plan</Text>
          {plan.perks.map((perk, i) => (
            <Text key={i} style={{ color: G.text, fontSize: 13, marginVertical: 3 }}>• {perk}</Text>
          ))}
          <View style={{ marginTop: 14, borderTopWidth: 0.5, borderColor: G.border, paddingTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ color: G.textSub, fontSize: 13 }}>Plan Price</Text>
              <Text style={{ color: G.text }}>₹{plan.price}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={{ color: G.textSub, fontSize: 13 }}>GST (18%)</Text>
              <Text style={{ color: G.text }}>₹{gst}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginTop: 6, paddingTop: 8, borderTopWidth: 0.5, borderColor: G.border }}>
              <Text style={{ color: G.gold, fontWeight: '800', fontSize: 15 }}>Total</Text>
              <Text style={{ color: G.gold, fontWeight: '900', fontSize: 16 }}>₹{total}</Text>
            </View>
          </View>
        </View>
        <Text style={sectionLabel}>/ YOUR_DETAILS</Text>
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={miniLabel}>FULL NAME</Text>
          <TextInput
            style={inputStyle}
            placeholder="Enter your full name"
            placeholderTextColor={G.textSub}
            value={name}
            onChangeText={setName}
          />

          <Text style={miniLabel}>EMAIL ADDRESS</Text>
          <TextInput
            style={inputStyle}
            placeholder="you@example.com"
            placeholderTextColor={G.textSub}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={miniLabel}>PHONE NUMBER</Text>
          <TextInput
            style={{ ...inputStyle, marginBottom: 10 }}
            placeholder="10-digit mobile number"
            placeholderTextColor={G.textSub}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={{ marginHorizontal: 20, marginTop: 10, backgroundColor: G.gold, padding: 20, height: 60, justifyContent: 'center', borderRadius: 8, opacity: loading ? 0.7 : 1 }}
          activeOpacity={0.9}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={G.bg} />
          ) : (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: G.bg, fontWeight: '900', fontSize: 16, letterSpacing: 1 }}>PAY ₹{total} & ACTIVATE</Text>
              <Text style={{ color: G.bg, fontSize: 20, fontWeight: '900' }}>→</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}