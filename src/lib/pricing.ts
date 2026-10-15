export const pricingPlans = [
  {
    id: "individual", name: "باقة الأفراد", priceSar: 20, durationDays: 30, letterLimit: 15, autoRenew: false,
    purchaseUrl: "",
    features: [
      "رصيد حتى 15 معروضاً وخطاباً رسمياً خلال 30 يوماً",
      "التحميل بصيغة Word (DOCX) بالإضافة إلى PDF",
      "حفظ وأرشفة الخطابات والرجوع إليها وتعديلها طوال الـ 30 يوماً",
      "نسختان لكل طلب: نسخة ورقية كاملة وصيغة موجزة للمنصات الحكومية",
    ],
  },
  {
    id: "business", name: "باقة المؤسسات ومكاتب الخدمات", priceSar: 50, durationDays: 30, letterLimit: 100, autoRenew: false,
    purchaseUrl: "",
    features: [
      "رصيد حتى 100 معروض وخطاب رسمي خلال 30 يوماً",
      "تحميل بصيغة Word وPDF مفتوح التعديل",
      "إعادة توجيه نفس المعروض إلى جهة أخرى بضغطة زر",
      "أرشيف وبحث سريع في سجل المعاملات السابقة",
    ],
  },
] as const;