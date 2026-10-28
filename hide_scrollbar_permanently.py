with open('App.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. إخفاء شريط التمرير من كل الشاشات بكل الطرق الممكنة
js = js.replace(
    'showsVerticalScrollIndicator={false}',
    'showsVerticalScrollIndicator={false} persistentScrollbar={false} overScrollMode="never"'
)

# 2. التأكد من أن البانر يملأ العرض بالكامل بدون أي هوامش
js = js.replace(
    "heroBanner: { width: '100%', paddingTop: 20, paddingBottom: 15, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#f39c12', marginBottom: 20, backgroundColor: '#1a1a1a', overflow: 'hidden' },",
    "heroBanner: { width: '100%', paddingTop: 20, paddingBottom: 15, paddingHorizontal: 15, borderBottomWidth: 2, borderBottomColor: '#f39c12', marginBottom: 20, backgroundColor: '#1a1a1a', overflow: 'hidden', borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 },"
)

# 3. إضافة padding أفقي 0 للـ ScrollView الرئيسي
js = js.replace(
    'contentContainerStyle={{ paddingBottom: 100 }} refreshControl',
    'contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 0 }} refreshControl'
)

with open('App.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("✅ تم إخفاء شريط التمرير نهائياً وإزالة أي حواف جانبية!")
