import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "tickets": "Tickets",
      "create_ticket": "Create Ticket",
      "users": "Users",
      "login": "Login",
      "status": "Status",
      "priority": "Priority",
      "light_mode": "Light Mode",
      "dark_mode": "Dark Mode"
    }
  },
  ar: {
    translation: {
      "dashboard": "لوحة القيادة",
      "tickets": "التذاكر",
      "create_ticket": "إنشاء تذكرة",
      "users": "المستخدمين",
      "login": "تسجيل الدخول",
      "status": "الحالة",
      "priority": "الأولوية",
      "light_mode": "الوضع الفاتح",
      "dark_mode": "الوضع الداكن"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
