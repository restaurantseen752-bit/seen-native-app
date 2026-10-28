import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ImageBackground, TouchableOpacity, ActivityIndicator, SafeAreaView, Linking, Modal, TextInput, Alert, RefreshControl, AppState, Animated, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { G, Path, Text as SvgText, Defs, LinearGradient, Stop, TextPath, Rect, Circle } from 'react-native-svg';

const CURRENT_VERSION = '1.0.0';
const VERSION_URL = 'https://raw.githubusercontent.com/restaurantseen752-bit/seen-native-app/main/version.json';

const CompetitionsIcon = () => (
  <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
    <Image source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80' }} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 40 }} />
    <View style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 40, backgroundColor: 'rgba(0,0,0,0.75)' }} />
    <Svg viewBox="0 0 100 100" width="100%" height="100%">
      <Defs>
        <LinearGradient id="goldMain" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor="#FFF8DC" /><Stop offset="30%" stopColor="#FFD700" /><Stop offset="60%" stopColor="#DAA520" /><Stop offset="100%" stopColor="#8B6508" /></LinearGradient>
        <LinearGradient id="goldDark" x1="0%" y1="0%" x2="100%" y2="100%"><Stop offset="0%" stopColor="#8B6508" /><Stop offset="100%" stopColor="#4a3500" /></LinearGradient>
        <Path id="textArc" d="M 10 45 A 40 40 0 0 1 90 45" fill="transparent" />
      </Defs>
      <SvgText fontFamily="sans-serif" fontSize="9" fontWeight="900" fill="#FFD700" stroke="#1a1a1a" strokeWidth="0.5"><TextPath href="#textArc" startOffset="50%" textAnchor="middle">WIN WITH US</TextPath></SvgText>
      <G transform="translate(50, 60) scale(0.45)">
        <Path d="M 0 -45 L 11 -16 L 42 -16 L 17 4 L 26 36 L 0 18 L -26 36 L -17 4 L -42 -16 L -11 -16 Z" fill="url(#goldDark)" transform="translate(3, 5)" />
        <Path d="M 0 -45 L 11 -16 L 42 -16 L 17 4 L 26 36 L 0 18 L -26 36 L -17 4 L -42 -16 L -11 -16 Z" fill="url(#goldMain)" stroke="#FFF8DC" strokeWidth="2" strokeLinejoin="miter" />
        <SvgText x="0" y="15" fontFamily="sans-serif" fontSize="40" fontWeight="900" fill="#FFFFFF" textAnchor="middle">1</SvgText>
      </G>
    </Svg>
  </View>
);

const FacebookIcon = () => (
  <Svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><Path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></Svg>
);

const TikTokIcon = () => (
  <Svg viewBox="0 0 24 24" width="10" height="10" fill="#fff"><Path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.72a6.34 6.34 0 0 0 10.86 4.29 6.33 6.33 0 0 0 1.8-4.41v-6.7a8.28 8.28 0 0 0 4.84 1.55v-3.4a4.85 4.85 0 0 1-2.91-1.06z" /></Svg>
);

export default function App() {
  const [fontsLoaded] = useFonts({ 'ArefRuqaa': 'https://github.com/google/fonts/raw/main/ofl/arefruqaa/ArefRuqaa-Regular.ttf' });
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [offers, setOffers] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [screen, setScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [orderVisible, setOrderVisible] = useState(false);
  const [orderInfo, setOrderInfo] = useState({ name: '', phone: '', address: '', notes: '', paymentMethod: 'cash', deliveryFee: 0, deliveryArea: '' });
  const [receiptImage, setReceiptImage] = useState(null);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', icon: null });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ visible: false, latestVersion: '', url: '' });
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const logoPulse = useRef(new Animated.Value(0.6)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1.03, duration: 1500, useNativeDriver: true }),
          Animated.timing(logoPulse, { toValue: 0.8, duration: 1500, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(logoScale, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(logoPulse, { toValue: 0.6, duration: 1500, useNativeDriver: true })
        ])
      ])
    ).start();

    loadData();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') { loadData(); }
    });
    return () => { subscription.remove(); };
  }, []);

  const checkForUpdates = () => {
    fetch(VERSION_URL + '?t=' + Date.now())
      .then(res => res.json())
      .then(data => {
        if (data.latest_version && data.latest_version !== CURRENT_VERSION) {
          setUpdateInfo({ visible: true, latestVersion: data.latest_version, url: data.update_url || '' });
        }
      }).catch(() => {});
  };

  const loadData = () => {
    checkForUpdates();
    fetch('https://seen-restaurant.pages.dev/api/data')
      .then(res => res.json())
      .then(json => {
        setItems(json.items || []);
        setCategories(json.categories || []);
        setSettings(json.settings || {});
        setOffers(json.offers || []);
        setCompetitions(json.competitions || []);
        setDeliveryAreas(json.delivery_areas || []);
        setLoading(false);
        setRefreshing(false);
      }).catch(err => { console.error(err); setLoading(false); setRefreshing(false); });
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };
  const showAlert = (title, message, icon = null) => { setAlertConfig({ visible: true, title, message, icon }); };
  const openDetails = (item) => { setSelectedItem(item); setDetailsVisible(true); };

  const addToCart = (item) => {
    if (settings.status === 'closed') { showAlert('نعتذر منك، المطعم مغلق حالياً', '', '🙏'); return; }
    const existing = cart.find(i => i.id === item.id);
    if (existing) { setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)); }
    else { setCart([...cart, { ...item, qty: 1 }]); }
    showAlert('تمت الإضافة', 'تم إضافة ' + item.name + ' إلى السلة');
  };

  const changeQty = (id, change) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const newQty = item.qty + change;
    if (newQty <= 0) { setCart(cart.filter(i => i.id !== id)); }
    else { setCart(cart.map(i => i.id === id ? { ...i, qty: newQty } : i)); }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 1 });
      if (!result.canceled) {
        setLoading(true);
        const compressPromise = ImageManipulator.manipulateAsync(result.assets[0].uri, [{ resize: { width: 800 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000));
        const manipResult = await Promise.race([compressPromise, timeoutPromise]);
        setReceiptImage(manipResult.uri);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showAlert('خطأ في الصورة', 'تعذر معالجة الصورة. قد تكون كبيرة جداً أو بصيغة غير مدعومة.', '⚠️');
    }
  };

  const submitOrder = async () => {
    if (settings.status === 'closed') { showAlert('نعتذر منك، المطعم مغلق حالياً', '', '🙏'); return; }
    if (!orderInfo.deliveryArea) { showAlert('بيانات ناقصة', 'الرجاء اختيار طريقة الاستلام أولاً'); return; }
    if (!orderInfo.name) { showAlert('بيانات ناقصة', 'الرجاء إدخال الاسم الثلاثي'); return; }
    if (!orderInfo.phone) { showAlert('بيانات ناقصة', 'الرجاء إدخال رقم الهاتف'); return; }
    if (orderInfo.phone.length !== 10) { showAlert('خطأ في الهاتف', 'رقم الهاتف يجب أن يتكون من 10 أرقام كاملة'); return; }
    if (orderInfo.deliveryArea !== 'استلام من المطعم' && !orderInfo.address) { showAlert('بيانات ناقصة', 'الرجاء إدخال العنوان بالتفصيل'); return; }
    if (orderInfo.paymentMethod === 'prepayment' && !receiptImage) { showAlert('بيانات ناقصة', 'الرجاء رفع صورة إيصال الدفع المسبق'); return; }

    setLoading(true);
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const total = subtotal + orderInfo.deliveryFee;
    let msg = `*طلب جديد من مطعم سين (تطبيق أندرويد)*\n\n👤 *الاسم:* ${orderInfo.name}\n📞 *الهاتف:* ${orderInfo.phone}\n📍 *العنوان:* ${orderInfo.deliveryArea === 'استلام من المطعم' ? 'استلام من المطعم' : orderInfo.address}\n📝 *ملاحظات:* ${orderInfo.notes || 'لا يوجد'}\n💳 *الدفع:* ${orderInfo.paymentMethod === 'prepayment' ? 'مسبق' : 'عند الاستلام'}\n\n*الطلبات:*\n`;
    cart.forEach(i => { msg += `▪️ ${i.name} (${i.qty}) - ${i.price * i.qty} د.ل\n`; });
    msg += `\n💰 *المجموع الفرعي:* ${subtotal} د.ل\n🛵 *التوصيل:* ${orderInfo.deliveryFee} د.ل\n💵 *الإجمالي:* ${total} د.ل`;

    const formData = new FormData();
    formData.append('action', 'send_telegram');
    formData.append('total', total);
    formData.append('message', msg);
    if (receiptImage) {
      const filename = receiptImage.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: receiptImage, name: filename, type });
    }
    try {
      const res = await fetch('https://seen-restaurant.pages.dev/api/data', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setCart([]); setOrderVisible(false); setCartVisible(false);
        setOrderInfo({ name: '', phone: '', address: '', notes: '', paymentMethod: 'cash', deliveryFee: 0, deliveryArea: '' });
        setReceiptImage(null);
        showAlert('تم بنجاح', 'تم استلام طلبك بنجاح!');
      } else { showAlert('فشل', data.error || 'حدث خطأ'); }
    } catch (e) { showAlert('فشل الاتصال', 'تأكد من الإنترنت'); }
    finally { setLoading(false); }
  };

  if (!fontsLoaded) { return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#f39c12" /></View>; }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (loading) { return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#f39c12" /></View>); }

  const renderHome = () => (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' }} style={styles.bgImage} blurRadius={15}>
      <BlurView intensity={40} experimentalBlurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.bgOverlay}>
        <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 0 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f39c12" colors={["#f39c12"]} />}>
          
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600&auto=format&fit=crop' }} style={styles.heroBanner} blurRadius={10}>
            <View style={styles.heroBannerOverlay} />
            
            <TouchableOpacity style={styles.qrContainer} onPress={() => showAlert('مشاركة', 'الباركود سيتوفر قريباً')}>
              <Image source={{ uri: 'https://seen-restaurant.pages.dev/qr.png' }} style={styles.qrImage} />
              <Text style={styles.qrText}>شارك تطبيقنا</Text>
            </TouchableOpacity>

            <View style={styles.heroContent}>
              <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
                <Image source={{ uri: 'https://seen-restaurant.pages.dev/logo.png' }} style={styles.logoImage} />
              </Animated.View>
              <Text style={styles.title}>طعم الأصالة .. بنكهة لا تقاوم</Text>
              <Text style={styles.subtitle}>مطعم سين / SEEN SIRT</Text>
              
              <View style={styles.contactBar}>
                <View style={styles.infoRow}>
                  <Text style={styles.contactIcon}>📞</Text>
                  <Text style={styles.contactLabel}>الهاتف:</Text>
                  <Text style={styles.contactValue}>{settings.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.contactIcon}>📍</Text>
                  <Text style={styles.contactLabel}>العنوان:</Text>
                  <Text style={styles.contactValue}>{settings.address}</Text>
                </View>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerDiamond}>❖</Text>
                  <View style={styles.dividerLine} />
                </View>
                <Text style={styles.socialTitle}>شاركونا لحظاتكم السعيدة.. تفضلوا بزيارة موقعنا على</Text>
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.fbBtn} onPress={() => Linking.openURL('https://www.facebook.com/Sseen78')}>
                    <FacebookIcon />
                    <Text style={styles.btnText}>فيسبوك</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tiktokBtn} onPress={() => Linking.openURL('https://www.tiktok.com/@sseen78')}>
                    <TikTokIcon />
                    <Text style={styles.btnText}>تيك توك</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
          
          {settings.status === 'closed' && (
            <View style={styles.closedBannerContainer}>
              <View style={styles.closedBanner}>
                <Text style={styles.closedBannerText}>🚨 {settings.announcement || 'المطعم مغلق حالياً'} 🚨</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.mainCard} onPress={() => setScreen('menu')}>
            <View style={styles.topGoldLine} />
            <View style={[styles.iconCircleWrapper, styles.glow]}><Image source={{ uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80' }} style={styles.iconCircle} /></View>
            <Text style={[styles.mainCardTitle, styles.glowText]}>قسم الطعام</Text>
            <Text style={styles.mainCardSubtitle}>طلبك لبيتك</Text>
          </TouchableOpacity>
          
          <View style={styles.rowCards}>
            <TouchableOpacity style={styles.smallCard} onPress={() => setScreen('offers')}>
              <View style={styles.topGoldLine} />
              <View style={[styles.smallIconWrapper, styles.glow, {backgroundColor: '#1a1a1a'}]}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop&q=80' }} style={{width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 40}} />
              </View>
              <Text style={[styles.smallCardTitle, styles.glowText]}>قسم العروض</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallCard} onPress={() => setScreen('competitions')}>
              <View style={styles.topGoldLine} />
              <View style={[styles.smallIconWrapper, styles.glow]}><CompetitionsIcon /></View>
              <Text style={[styles.smallCardTitle, styles.glowText]}>المسابقات</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );

  const renderMenu = () => {
    let sortedCategories = [...categories];
    const pIndex = sortedCategories.findIndex(c => c.name.includes('معجنات'));
    const dIndex = sortedCategories.findIndex(c => c.name.includes('مشروب'));
    if (pIndex > -1 && dIndex > -1) { const p = sortedCategories.splice(pIndex, 1)[0]; const nd = sortedCategories.findIndex(c => c.name.includes('مشروب')); sortedCategories.splice(nd, 0, p); }
    
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' }} style={styles.bgImage} blurRadius={15}>
          <BlurView intensity={40} experimentalBlurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.bgOverlay}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}><Text style={{ color: '#f39c12', fontSize: 34, fontWeight: 'bold' }}>→</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>قائمة الطعام</Text><View style={{width: 40}} />
              </View>
              <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" contentContainerStyle={{ padding: 15, paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f39c12" colors={["#f39c12"]} />}>
                {sortedCategories.map((cat, index) => {
                  const isActive = cat.is_active !== 0;
                  if (!isActive) {
                    return (
                      <TouchableOpacity key={index} style={[styles.categoryCard, {opacity: 0.6}]} onPress={() => showAlert('غير متوفر', 'نعتذر منك، هذا القسم غير متوفر حالياً', '🙏')}>
                        <ImageBackground source={{ uri: getCategoryImage(cat.name) }} style={styles.catBg} imageStyle={{ borderRadius: 15 }}>
                          <View style={styles.catOverlay}><Text style={styles.categoryName}>{cat.name}</Text><View style={[styles.categoryBadge, {backgroundColor: '#c0392b', borderColor: '#c0392b'}]}><Text style={[styles.categoryBadgeText, {color: '#fff'}]}>غير متوفر حالياً</Text></View></View>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity key={index} style={[styles.categoryCard, styles.glow]} onPress={() => { setSelectedCategory(cat); setScreen('category'); }}>
                      <ImageBackground source={{ uri: getCategoryImage(cat.name) }} style={styles.catBg} imageStyle={{ borderRadius: 15 }}>
                        <View style={styles.catOverlay}><Text style={styles.categoryName}>{cat.name}</Text><View style={styles.categoryBadge}><Text style={styles.categoryBadgeText}>افتح واختر</Text></View></View>
                      </ImageBackground>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const renderCategory = () => {
    if (!selectedCategory) return null;
    const catItems = items.filter(i => i.category === selectedCategory.name);
    return (
      <View style={styles.container}>
        <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' }} style={styles.bgImage} blurRadius={15}>
          <BlurView intensity={40} experimentalBlurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.bgOverlay}>
            <View style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => setScreen('menu')} style={styles.backBtn}><Text style={{ color: '#f39c12', fontSize: 34, fontWeight: 'bold' }}>→</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>{selectedCategory.name}</Text><View style={{width: 40}} />
              </View>
              <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" contentContainerStyle={{ padding: 15, paddingBottom: 100 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f39c12" colors={["#f39c12"]} />}>
                <View style={[styles.itemsList, styles.glow]}>
                  {catItems.map(item => {
                    if (item.is_active === 0) {
                      return (
                        <View key={item.id} style={[styles.itemRow, {opacity: 0.7}]}>
                          <View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemPrice}>{item.price} د.ل</Text></View>
                          <View style={styles.soldOutBadge}><Text style={styles.soldOutText}>نفدت الكمية</Text><Text style={styles.soldOutSubtext}>غير متوفر</Text></View>
                        </View>
                      );
                    }
                    const hasDetails = (item.description && item.description.trim() !== '') || (item.image_url && item.image_url.trim() !== '');
                    if (hasDetails) {
                      return (
                        <View key={item.id} style={styles.itemRow}>
                          <View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemPrice}>{item.price} د.ل</Text></View>
                          <TouchableOpacity style={[styles.detailsBtn, styles.glow]} onPress={() => openDetails(item)}><Text style={styles.detailsBtnText}>🔍 التفاصيل</Text></TouchableOpacity>
                        </View>
                      );
                    }
                    return (
                      <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemPrice}>{item.price} د.ل</Text></View>
                        <TouchableOpacity style={[styles.addBtn, styles.glow]} onPress={() => addToCart(item)}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const renderOffers = () => (
    <View style={styles.container}>
      <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' }} style={styles.bgImage} blurRadius={15}>
        <BlurView intensity={40} experimentalBlurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.bgOverlay}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}><TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}><Text style={{ color: '#f39c12', fontSize: 34, fontWeight: 'bold' }}>→</Text></TouchableOpacity><Text style={styles.headerTitle}>قسم العروض</Text><View style={{width: 40}} /></View>
            <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" contentContainerStyle={{ padding: 15 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f39c12" colors={["#f39c12"]} />}>
              {offers.length === 0 ? <Text style={{color: '#aaa', textAlign: 'center', marginTop: 50, fontSize: 16, fontWeight: 'bold'}}>لا توجد عروض حالياً</Text> : offers.map(offer => (
                <View key={offer.id} style={[styles.offerCard, styles.glow]}><Text style={{ fontSize: 30, marginBottom: 10 }}>🎁</Text><Text style={styles.offerText}>{offer.text}</Text><Text style={styles.offerPrice}>{offer.price} د.ل</Text><TouchableOpacity style={[styles.offerBtn, styles.glow]} onPress={() => addToCart({ id: 'offer_'+offer.id, name: offer.text, price: offer.price })}><Text style={{ color: '#fff', fontWeight: 'bold' }}>اغتنم الفرصة</Text></TouchableOpacity></View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  const renderCompetitions = () => (
    <View style={styles.container}>
      <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' }} style={styles.bgImage} blurRadius={15}>
        <BlurView intensity={40} experimentalBlurMethod="dimezisBlurView" tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.bgOverlay}>
          <View style={{ flex: 1 }}>
            <View style={styles.header}><TouchableOpacity onPress={() => setScreen('home')} style={styles.backBtn}><Text style={{ color: '#f39c12', fontSize: 34, fontWeight: 'bold' }}>→</Text></TouchableOpacity><Text style={styles.headerTitle}>المسابقات</Text><View style={{width: 40}} /></View>
            <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" contentContainerStyle={{ padding: 15 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f39c12" colors={["#f39c12"]} />}>
              {competitions.length === 0 ? <Text style={{color: '#aaa', textAlign: 'center', marginTop: 50, fontSize: 16, fontWeight: 'bold'}}>لا توجد مسابقات حالياً</Text> : competitions.map(comp => (
                <View key={comp.id} style={[styles.offerCard, styles.glow]}><Text style={{ fontSize: 30, marginBottom: 10 }}>🏆</Text><Text style={styles.offerText}>{comp.title}</Text><Text style={{ color: '#fff', marginBottom: 5 }}>الجائزة: {comp.prize}</Text><Text style={{ color: '#aaa', fontSize: 12 }}>{comp.duration}</Text></View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        style={screen === 'home' ? "light" : "dark"} 
        backgroundColor={screen === 'home' ? "transparent" : "#f39c12"} 
        translucent={screen === 'home'} 
      />
      {screen === 'home' && renderHome()}
      {screen === 'menu' && renderMenu()}
      {screen === 'category' && renderCategory()}
      {screen === 'offers' && renderOffers()}
      {screen === 'competitions' && renderCompetitions()}

      {totalItems > 0 && (
        <TouchableOpacity style={[styles.cartBar, styles.glow]} onPress={() => setCartVisible(true)}>
          <View style={styles.cartInfo}><Text style={styles.cartText}>{totalItems} أصناف | {totalPrice} د.ل</Text><Text style={styles.cartTextSmall}>عرض السلة</Text></View>
        </TouchableOpacity>
      )}

      <Modal visible={alertConfig.visible} transparent animationType="none">
        <View style={styles.alertOverlay}><View style={styles.alertBox}>
          {alertConfig.icon && <Text style={{fontSize: 55, marginBottom: 15}}>{alertConfig.icon}</Text>}
          {alertConfig.title ? <Text style={[styles.alertTitle, alertConfig.icon ? {marginBottom: 20, textAlign: 'center'} : null]}>{alertConfig.title}</Text> : null}
          {alertConfig.message ? <Text style={styles.alertMessage}>{alertConfig.message}</Text> : null}
          <TouchableOpacity style={styles.alertButton} onPress={() => setAlertConfig({ ...alertConfig, visible: false })}><Text style={styles.alertButtonText}>حسناً، فهمت</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={cartVisible} transparent animationType="none">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15}}>
            <Text style={{color: '#f39c12', fontSize: 20, fontWeight: 'bold'}}>سلة الطلبات</Text>
            <TouchableOpacity onPress={() => setCartVisible(false)}><Text style={{color: '#aaa', fontSize: 24}}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never" style={{maxHeight: 300}}>
            {cart.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={{flex: 1}}><Text style={{color: '#fff', fontWeight: 'bold'}}>{item.name}</Text><Text style={{color: '#f39c12'}}>{item.price * item.qty} د.ل</Text></View>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, -1)}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                  <Text style={{color: '#fff', fontWeight: 'bold', width: 20, textAlign: 'center'}}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item.id, 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => changeQty(item.id, -item.qty)}><Text style={{color: '#e74c3c', fontSize: 12}}>حذف</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={{borderTopWidth: 37, borderTopColor: '#333', paddingTop: 15, marginTop: 15}}>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => { setCartVisible(false); setOrderVisible(true); }}><Text style={styles.primaryBtnText}>إتمام الطلب</Text></TouchableOpacity>
          </View>
        </View></View>
      </Modal>

      <Modal visible={orderVisible} transparent animationType="none">
        <View style={styles.modalOverlay}><View style={styles.modalContent}>
          <Text style={{color: '#f39c12', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center'}}>بيانات الطلب</Text>
          <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never">
            <Text style={styles.inputLabel}>الاسم الثلاثي</Text>
            <TextInput style={styles.input} value={orderInfo.name} onChangeText={t => setOrderInfo({...orderInfo, name: t})} placeholder="أدخل اسمك" placeholderTextColor="#777" />
            <Text style={styles.inputLabel}>رقم الهاتف</Text>
            <TextInput style={styles.input} value={orderInfo.phone} onChangeText={t => setOrderInfo({...orderInfo, phone: t})} keyboardType="numeric" maxLength={10} placeholder="09XXXXXXXX" placeholderTextColor="#777" />
            <Text style={styles.inputLabel}>طريقة الاستلام</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setDropdownVisible(true)}>
              <Text style={styles.dropdownText}>{orderInfo.deliveryArea ? orderInfo.deliveryArea + (orderInfo.deliveryArea === 'استلام من المطعم' ? '' : ` (${orderInfo.deliveryFee} د.ل)`) : '-- اختر طريقة الاستلام --'}</Text>
              <Text style={{color: '#f39c12'}}>▼</Text>
            </TouchableOpacity>
            {orderInfo.deliveryArea !== 'استلام من المطعم' && orderInfo.deliveryArea !== '' && (<>
              <Text style={styles.inputLabel}>العنوان بالتفصيل</Text>
              <TextInput style={styles.input} value={orderInfo.address} onChangeText={t => setOrderInfo({...orderInfo, address: t})} placeholder="الشارع، العمارة..." placeholderTextColor="#777" />
            </>)}
            <Text style={styles.inputLabel}>طريقة الدفع</Text>
            <View style={{flexDirection: 'row', gap: 10, marginBottom: 15}}>
              <TouchableOpacity style={[styles.selectBtn, orderInfo.paymentMethod === 'cash' && styles.selectBtnActive]} onPress={() => setOrderInfo({...orderInfo, paymentMethod: 'cash'})}><Text style={styles.selectBtnText}>عند الاستلام</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.selectBtn, orderInfo.paymentMethod === 'prepayment' && styles.selectBtnActive]} onPress={() => setOrderInfo({...orderInfo, paymentMethod: 'prepayment'})}><Text style={styles.selectBtnText}>دفع مسبق</Text></TouchableOpacity>
            </View>
            {orderInfo.paymentMethod === 'prepayment' && (
              <View style={{marginBottom: 15}}>
                <View style={styles.prepaymentInfoBox}><Text style={styles.prepaymentInfoTitle}>معلومات الدفع المسبق:</Text><Text style={styles.prepaymentInfoText}>{settings.prepayment_info || 'لم يتم وضع معلومات دفع.'}</Text></View>
                <Text style={styles.inputLabel}>صورة الإيصال (إجباري)</Text>
                <TouchableOpacity style={{backgroundColor: '#333', padding: 15, borderRadius: 8, alignItems: 'center'}} onPress={pickImage}><Text style={{color: '#f39c12'}}>{receiptImage ? 'تم اختيار الصورة ✅' : 'اضغط لاختيار صورة'}</Text></TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.primaryBtn} onPress={submitOrder}><Text style={styles.primaryBtnText}>تأكيد الطلب</Text></TouchableOpacity>
            <TouchableOpacity style={{marginTop: 10, alignItems: 'center'}} onPress={() => setOrderVisible(false)}><Text style={{color: '#aaa'}}>إلغاء</Text></TouchableOpacity>
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={dropdownVisible} transparent animationType="none">
        <View style={styles.dropdownOverlay}><View style={styles.dropdownContent}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => { setOrderInfo({...orderInfo, deliveryArea: 'استلام من المطعم', deliveryFee: 0}); setDropdownVisible(false); }}><Text style={styles.dropdownItemText}>الاستلام من المطعم</Text></TouchableOpacity>
          {deliveryAreas.map(area => (
            <TouchableOpacity key={area.id} style={styles.dropdownItem} onPress={() => { setOrderInfo({...orderInfo, deliveryArea: area.name, deliveryFee: area.fee}); setDropdownVisible(false); }}><Text style={styles.dropdownItemText}>{area.name} ({area.fee} د.ل)</Text></TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.dropdownItem, {borderBottomWidth: 0}]} onPress={() => setDropdownVisible(false)}><Text style={[styles.dropdownItemText, {color: '#e74c3c'}]}>إلغاء</Text></TouchableOpacity>
        </View></View>
      </Modal>

      <Modal visible={detailsVisible} transparent animationType="none">
        <View style={styles.alertOverlay}>
          <View style={styles.detailsModalBox}>
            <TouchableOpacity style={styles.detailsCloseBtn} onPress={() => setDetailsVisible(false)}><Text style={{color: '#aaa', fontSize: 24}}>✕</Text></TouchableOpacity>
            {selectedItem && (
              <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never">
                {selectedItem.image_url && (<View style={styles.detailsImageContainer}><Image source={{ uri: selectedItem.image_url }} style={styles.detailsImage} resizeMode="cover" /></View>)}
                <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
                <Text style={styles.detailsPrice}>{selectedItem.price} د.ل</Text>
                {selectedItem.description && <Text style={styles.detailsDesc}>{selectedItem.description}</Text>}
                <TouchableOpacity style={styles.primaryBtn} onPress={() => { addToCart(selectedItem); setDetailsVisible(false); }}><Text style={styles.primaryBtnText}>إضافة إلى السلة</Text></TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={updateInfo.visible} transparent animationType="none">
        <View style={styles.alertOverlay}><View style={styles.alertBox}>
          <Text style={{fontSize: 55, marginBottom: 15}}>🚀</Text>
          <Text style={[styles.alertTitle, {marginBottom: 20}]}>تحديث جديد متوفر!</Text>
          <Text style={styles.alertMessage}>تم إصدار نسخة جديدة من التطبيق ({updateInfo.latestVersion}). يرجى التحديث للاستفادة من أحدث الميزات.</Text>
          <TouchableOpacity style={styles.alertButton} onPress={() => { if (updateInfo.url) Linking.openURL(updateInfo.url); setUpdateInfo({ ...updateInfo, visible: false }); }}><Text style={styles.alertButtonText}>تحديث الآن</Text></TouchableOpacity>
          <TouchableOpacity style={{marginTop: 12, alignItems: 'center'}} onPress={() => setUpdateInfo({ ...updateInfo, visible: false })}><Text style={{color: '#aaa', fontSize: 13}}>لاحقاً</Text></TouchableOpacity>
        </View></View>
      </Modal>

    </View>
  );
}

function getCategoryImage(name) {
  if (name.includes('محشية')) return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80';
  if (name.includes('عادية') || name.includes('بيتزا')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80';
  if (name.includes('سندوتش')) return 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&q=80';
  if (name.includes('وجب')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80';
  if (name.includes('بوكس')) return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80';
  if (name.includes('معجنات')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80';
  if (name.includes('مشروب')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80';
  return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  loadingContainer: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  bgOverlay: { flex: 1, backgroundColor: 'rgba(10,10,10,0.75)' }, 
  
  glow: { shadowColor: '#f39c12', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
  glowText: { textShadowColor: 'rgba(243, 156, 18, 0.6)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  
  // ===== البانر (نسخة الويب الحرفية) =====
  heroBanner: { width: '100%', borderBottomWidth: 2, borderBottomColor: '#f39c12', borderTopWidth: 37, borderTopColor: '#f39c12', marginBottom: 20, overflow: 'hidden', backgroundColor: '#1a1a1a' },
  heroBannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.96)' },
  heroContent: { position: 'relative', zIndex: 2, alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 15, width: '100%' },
  
  qrContainer: { position: 'absolute', top: 15, left: 15, zIndex: 10, alignItems: 'center' },
  qrImage: { width: 40, height: 40, borderRadius: 8, borderWidth: 2, borderColor: '#f39c12', backgroundColor: '#fff', padding: 2 },
  qrText: { color: '#f39c12', fontSize: 10, fontWeight: 'bold', marginTop: 4, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 },
  
  logoContainer: { width: 85, height: 85, marginBottom: 10, borderRadius: 42.5, borderWidth: 3, borderColor: '#f39c12', backgroundColor: '#000', overflow: 'hidden', shadowColor: '#f39c12', shadowOpacity: 0.6, shadowRadius: 15, elevation: 10 },
  logoImage: { width: '100%', height: '100%', backgroundColor: '#fff' },
  
  title: { color: '#f39c12', fontSize: 20, fontWeight: '800', marginBottom: 5, textShadowColor: '#000', textShadowOffset: {width: 2, height: 2}, textShadowRadius: 4 },
  subtitle: { fontSize: 14, color: '#ddd', marginBottom: 12, fontWeight: 'bold', letterSpacing: 1 },
  
  contactBar: { backgroundColor: 'rgba(18,18,18,0.85)', borderWidth: 1, borderColor: 'rgba(243,156,18,0.4)', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12, width: '90%', maxWidth: 380, marginVertical: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 4, elevation: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3, justifyContent: 'flex-start' },
  contactIcon: { color: '#f39c12', fontSize: 11, marginLeft: 6 },
  contactLabel: { color: '#aaa', fontSize: 10, marginLeft: 4 },
  contactValue: { color: '#fff', fontWeight: '600', fontSize: 11 },
  
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 5, opacity: 0.8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(243,156,18,0.3)', marginHorizontal: 10 },
  dividerDiamond: { color: '#f39c12', fontSize: 8 },
  
  socialTitle: { color: '#f39c12', fontSize: 11, fontWeight: 'bold', marginBottom: 6, lineHeight: 15, textAlign: 'center' },
  socialButtons: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  fbBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#1877F2', paddingVertical: 3, paddingHorizontal: 12, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 },
  tiktokBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#000', paddingVertical: 3, paddingHorizontal: 12, borderRadius: 15, borderWidth: 1, borderColor: '#444', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 2, elevation: 2 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
  
  // ===== بقية العناصر =====
  mainCard: { backgroundColor: 'rgba(31,31,31,0.95)', marginHorizontal: 20, marginTop: 20, borderRadius: 20, paddingVertical: 35, alignItems: 'center', borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  iconCircleWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#f39c12', padding: 3, marginBottom: 15, shadowColor: '#f39c12', shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 20, elevation: 15 },
  iconCircle: { width: '100%', height: '100%', borderRadius: 50 },
  mainCardTitle: { color: '#f39c12', fontSize: 26, fontWeight: 'bold', marginBottom: 5, textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  mainCardSubtitle: { color: '#f39c12', fontSize: 20, fontFamily: 'ArefRuqaa', marginTop: 8, letterSpacing: 1 },
  topGoldLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#f39c12' },
  
  rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 15, marginBottom: 20 },
  smallCard: { backgroundColor: 'rgba(31,31,31,0.95)', width: '48%', borderRadius: 20, paddingVertical: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333', overflow: 'hidden' },
  smallIconWrapper: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: '#f39c12', padding: 2, marginBottom: 15, justifyContent: 'center', alignItems: 'center', shadowColor: '#f39c12', shadowOffset: {width: 0, height: 0}, shadowOpacity: 1, shadowRadius: 20, elevation: 15 },
  smallCardTitle: { color: '#f39c12', fontSize: 18, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: 'rgba(10,10,10,0.9)', borderBottomWidth: 2, borderBottomColor: '#f39c12', borderTopWidth: 37, borderTopColor: '#f39c12' },
  headerTitle: { color: '#f39c12', fontSize: 22, fontWeight: 'bold' },
  backBtn: { padding: 5 },
  
  categoryCard: { height: 100, borderRadius: 15, marginBottom: 15 },
  catBg: { flex: 1, justifyContent: 'center' },
  catOverlay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, height: '100%', borderWidth: 1, borderColor: '#f39c12' },
  categoryName: { color: '#f39c12', fontSize: 22, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  categoryBadge: { backgroundColor: 'transparent', borderColor: '#f39c12', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryBadgeText: { color: '#f39c12', fontSize: 12, fontWeight: 'bold' },
  
  itemsList: { backgroundColor: 'rgba(26,26,26,0.95)', borderRadius: 15, padding: 10, borderWidth: 1, borderColor: '#f39c12' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  itemInfo: { flex: 1 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemPrice: { color: '#f39c12', fontSize: 14, marginTop: 5, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#f39c12', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#000', fontSize: 24, fontWeight: 'bold', marginTop: -2 },
  
  soldOutBadge: { backgroundColor: 'rgba(231,76,60,0.15)', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center' },
  soldOutText: { color: '#e74c3c', fontSize: 11, fontWeight: 'bold' },
  soldOutSubtext: { color: '#ff9999', fontSize: 9 },
  detailsBtn: { backgroundColor: 'rgba(243, 156, 18, 0.15)', borderWidth: 1, borderColor: '#f39c12', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  detailsBtnText: { color: '#f39c12', fontSize: 11, fontWeight: 'bold' },
  
  cartBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#f39c12', padding: 15, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  cartInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  cartText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  cartTextSmall: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  
  offerCard: { backgroundColor: 'rgba(31,31,31,0.9)', borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#f39c12' },
  offerText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 10 },
  offerPrice: { color: '#f39c12', fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  offerBtn: { backgroundColor: '#2ecc71', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
  qtyBtn: { backgroundColor: '#333', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#f39c12', fontSize: 20, fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#f39c12', padding: 15, borderRadius: 10, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  
  inputLabel: { color: '#f39c12', marginBottom: 5, fontWeight: 'bold', textAlign: 'right' },
  input: { backgroundColor: '#222', color: '#fff', borderRadius: 8, padding: 10, marginBottom: 15, textAlign: 'right', borderWidth: 1, borderColor: '#444' },
  selectBtn: { flex: 1, backgroundColor: '#222', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#444' },
  selectBtnActive: { borderColor: '#f39c12', backgroundColor: 'rgba(243,156,18,0.2)' },
  selectBtnText: { color: '#fff', fontSize: 12 },
  
  alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertBox: { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#f39c12', borderRadius: 20, padding: 25, width: '100%', maxWidth: 350, alignItems: 'center' },
  alertTitle: { color: '#f39c12', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  alertMessage: { color: '#ddd', fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 24 },
  alertButton: { backgroundColor: '#2ecc71', width: '100%', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  alertButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#444', marginBottom: 15 },
  dropdownText: { color: '#fff', fontSize: 14 },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  dropdownContent: { backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#f39c12', borderRadius: 12, width: '80%', maxWidth: 350 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#333', alignItems: 'center' },
  dropdownItemText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  closedBannerContainer: { paddingHorizontal: 20, marginTop: 15 },
  closedBanner: { backgroundColor: 'rgba(192, 57, 43, 0.9)', paddingVertical: 12, paddingHorizontal: 15, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#f39c12' },
  closedBannerText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  
  prepaymentInfoBox: { backgroundColor: 'rgba(243, 156, 18, 0.1)', borderWidth: 1, borderColor: '#f39c12', borderRadius: 10, padding: 15, marginBottom: 15 },
  prepaymentInfoTitle: { color: '#f39c12', fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'right' },
  prepaymentInfoText: { color: '#fff', fontSize: 14, lineHeight: 22, textAlign: 'right' },
  
  detailsModalBox: { backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: '#f39c12', borderRadius: 20, padding: 20, width: '90%', maxWidth: 400, maxHeight: '85%' },
  detailsCloseBtn: { position: 'absolute', top: 10, right: 15, zIndex: 10 },
  detailsImageContainer: { width: '100%', height: 220, backgroundColor: '#000', borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
  detailsImage: { width: '100%', height: '100%' },
  detailsTitle: { color: '#f39c12', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  detailsPrice: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  detailsDesc: { color: '#ddd', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 20 }
});
