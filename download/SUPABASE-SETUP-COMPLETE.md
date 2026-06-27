# ✅ Supabase تم إعداده بالكامل!

## معلومات المشروع

| الحقل | القيمة |
|------|--------|
| **اسم المشروع** | Aden Dot |
| **Reference ID** | `bkqsetwjfdhuxtbtzatw` |
| **المنطقة** | ap-southeast-1 (Singapore) |
| **URL** | `https://bkqsetwjfdhuxtbtzatw.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/bkqsetwjfdhuxtbtzatw |

## حالة قاعدة البيانات

- ✅ 29 جدول تم إنشاؤها (users, posts, comments, stories, chat_rooms, gifts, wallets, ...)
- ✅ 83 سياسة RLS (Row Level Security)
- ✅ 190 تريغر (trigger)
- ✅ 10 دوال (functions)
- ✅ 20 نوع هدية (gift types) — وردة، قلب، نجمة، تاج، ...
- ✅ 12 إنجاز (achievements) — أول منشور، صانع محتوى، ...
- ✅ حساب الأدمن منشّط

## حساب الأدمن

- **البريد**: `admin@adendot.app`
- **كلمة المرور**: `Aden@2026`
- **UID**: `49fc3406-bf19-43ef-ad5a-d1efdd9248a4`
- **الصلاحية**: admin + verified + premium
- **الرصيد**: 100,000 عملة ذهبية + 10,000 ألماسة

## 🚨 الخطوة التالية المطلوبة منك: أضف GitHub Secrets

لتفعيل البناء التلقائي عبر GitHub Actions، اذهب إلى:

### https://github.com/atro2829-hub/aden-dot/settings/secrets/actions

وأضف 3 أسرار (Secrets):

### 1️⃣ `SUPABASE_URL`
```
https://bkqsetwjfdhuxtbtzatw.supabase.co
```

### 2️⃣ `SUPABASE_ANON_KEY`
انسخه من: Supabase Dashboard → Project Settings → API → `anon` `public`

> ابحث عن: `eyJhbGci...` (سلسلة طويلة تبدأ بهذا)

### 3️⃣ `SUPABASE_SERVICE_ROLE_KEY`
انسخه من: Supabase Dashboard → Project Settings → API → `service_role`

> ⚠️ هذا المفتاح سري — لا تشاركه مع أحد

## اختبار سريع

للتأكد من أن Supabase يعمل، جرّب هذا في terminal:

```bash
curl -X POST 'https://bkqsetwjfdhuxtbtzatw.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: <anon_key>' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@adendot.app","password":"Aden@2026"}'
```

إذا رجع `access_token` — كل شيء يعمل ✅

## في تطبيق Aden Dot على هاتفك

عند فتح التطبيق لأول مرة، ستظهر شاشة "إعداد قاعدة البيانات":

| الحقل | القيمة |
|------|--------|
| **عنوان URL للمشروع** | `https://bkqsetwjfdhuxtbtzatw.supabase.co` |
| **مفتاح anon public** | (انسخه من Dashboard) |

ثم اضغط "اتصال وتحقق" — وسيعمل التطبيق بالكامل!

## لتسجيل الدخول كأدمن

- **البريد**: `admin@adendot.app`
- **كلمة المرور**: `Aden@2026`

## ملاحظات

- مشروع "Get Wallet" السابق تم إيقافه مؤقتاً لتحرير مكان للمشروع الجديد
- يمكنك استعادته من Dashboard في أي وقت: https://supabase.com/dashboard/projects
- الباقة المجانية تتيح مشروعين نشطين فقط — اختر بعناية
