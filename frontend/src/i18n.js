import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      sidebar: {
        dashboard: 'Dashboard',
        scanner: 'AI Scanner',
        alerts: 'Alerts',
        reports: 'Reports',
        brands: 'Brand Database',
        history: 'Scan History',
        settings: 'Settings',
        main: 'MAIN',
        management: 'MANAGEMENT',
        system_online: 'System Online'
      },
      topbar: {
        search: 'Search...',
        language: 'Language'
      },
      dashboard: {
        title: 'BrandGuard AI Overview',
        total_scans: 'Total Scans',
        threats: 'Threats Detected',
        active_brands: 'Active Brands',
        avg_confidence: 'Avg. Confidence',
        live_feed: '🔴 LIVE THREAT FEED',
        trends: 'Detection Trends',
        counterfeits: 'Counterfeits',
        originals: 'Originals',
        recent_scans: 'Recent Scans'
      },
      scanner: {
        title: 'AI Scanner',
        subtitle: 'Upload product image to analyze',
        upload_title: 'Upload Product Image',
        drag_drop: 'Drag & drop image here',
        browse: 'or click to browse',
        brand: 'Brand',
        source: 'Source',
        analyze_btn: 'Analyze Product',
        result: {
          original: 'ORIGINAL VERIFIED',
          counterfeit: 'COUNTERFEIT DETECTED',
          suspicious: 'SUSPICIOUS PRODUCT',
          score: 'Authenticity Score',
          report: 'Report',
          save: 'Save'
        }
      },
      ai_points: {
        'Visual Recognition': 'Visual Recognition',
        'No clear object detected': 'No clear object detected',
        'Low confidence': 'Low confidence',
        'WARN': 'WARN',
        'Packaging Layout': 'Packaging Layout',
        'Cannot verify structure': 'Cannot verify structure',
        'Missing features': 'Missing features',
        'Color Profile': 'Color Profile',
        'Inconclusive': 'Inconclusive',
        'Needs manual review': 'Needs manual review',
        'Category Match': 'Category Match',
        'Product matches brand profile': 'Product matches brand profile',
        'Valid class': 'Valid class',
        'Shape & Dimensions': 'Shape & Dimensions',
        'Standard boundaries': 'Standard boundaries',
        'Within tolerance': 'Within tolerance',
        'Visual Profile': 'Visual Profile',
        'Confirmed structure': 'Confirmed structure',
        'High match': 'High match',
        'Mismatch with brand profile': 'Mismatch with brand profile',
        'Unexpected product': 'Unexpected product',
        'Anomaly Detection': 'Anomaly Detection',
        'Inconsistent visual signature': 'Inconsistent visual signature',
        'High risk': 'High risk',
        'PASS': 'PASS',
        'FAIL': 'FAIL'
      }
    }
  },
  uz: {
    translation: {
      sidebar: {
        dashboard: 'Boshqaruv Paneli',
        scanner: 'AI Skaner',
        alerts: 'Xabarnomalar',
        reports: 'Hisobotlar',
        brands: 'Brendlar Bazasi',
        history: 'Skanerlash Tarixi',
        settings: 'Sozlamalar',
        main: 'ASOSIY',
        management: 'BOSHQARUV',
        system_online: 'Tizim Ishlamoqda'
      },
      topbar: {
        search: 'Qidirish...',
        language: 'Til'
      },
      dashboard: {
        title: 'BrandGuard AI Umumiy Holati',
        total_scans: 'Jami Skanerlashlar',
        threats: 'Aniqlangan Xavflar',
        active_brands: 'Faol Brendlar',
        avg_confidence: 'O\'rtacha Aniqlik',
        live_feed: '🔴 JONLI XAVF LENTASI',
        trends: 'Aniqlash Statistikasi',
        counterfeits: 'Soxta',
        originals: 'Original',
        recent_scans: 'Oxirgi Skanerlashlar'
      },
      scanner: {
        title: 'AI Skaner',
        subtitle: 'Tahlil qilish uchun mahsulot rasmini yuklang',
        upload_title: 'Mahsulot Rasmini Yuklash',
        drag_drop: 'Rasmni bu yerga tashlang',
        browse: 'yoki yuklash uchun bosing',
        brand: 'Brend',
        source: 'Manba',
        analyze_btn: 'Mahsulotni Tahlil Qilish',
        result: {
          original: 'ORIGINAL TASDIQLANDI',
          counterfeit: 'SOXTA MAHSULOT ANIQLANDI',
          suspicious: 'SHUBHALI MAHSULOT',
          score: 'Haqiqiylik Darajasi',
          report: 'Xabar berish',
          save: 'Saqlash'
        }
      },
      ai_points: {
        'Visual Recognition': 'Vizual Aniqlash',
        'No clear object detected': 'Aniq obyekt topilmadi',
        'Low confidence': 'Past ishonchlilik',
        'WARN': 'OGOHLANTIRISH',
        'Packaging Layout': 'Qadoq Dizayni',
        'Cannot verify structure': 'Tuzilmani tasdiqlab bo\'lmadi',
        'Missing features': 'Xususiyatlar yetishmayapti',
        'Color Profile': 'Rang Profili',
        'Inconclusive': 'Noma\'lum',
        'Needs manual review': 'Qo\'lda tekshirish kerak',
        'Category Match': 'Kategoriya Mosligi',
        'Product matches brand profile': 'Mahsulot brend profiliga mos',
        'Valid class': 'To\'g\'ri sinf',
        'Shape & Dimensions': 'Shakl va O\'lchamlar',
        'Standard boundaries': 'Standart chegaralar',
        'Within tolerance': 'Meyorida',
        'Visual Profile': 'Vizual Profil',
        'Confirmed structure': 'Tasdiqlangan tuzilma',
        'High match': 'Yuqori moslik',
        'Mismatch with brand profile': 'Brend profiliga mos kelmaydi',
        'Unexpected product': 'Kutilmagan mahsulot',
        'Anomaly Detection': 'Anomaliyani Aniqlash',
        'Inconsistent visual signature': 'Mos kelmaydigan vizual belgi',
        'High risk': 'Yuqori xavf',
        'PASS': 'YAXSHI',
        'FAIL': 'XATO'
      }
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  })

export default i18n
