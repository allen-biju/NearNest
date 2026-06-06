import { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'ml';

interface ITranslations {
  tagline: string;
  searchPlaceholder: string;
  showingWithin: string;
  kmAway: string;
  addToCart: string;
  viewStore: string;
  checkoutBtn: string;
  operatingHrs: string;
  preorderText: string;
  ratingAverage: string;
  reviewsCount: string;
  allergenAlert: string;
  ingredientsLabel: string;
  nearbyTitle: string;
  trendingTitle: string;
  newSellersTitle: string;
  freshBakesTitle: string;
  handcraftTitle: string;
}

const translations: Record<Language, ITranslations> = {
  en: {
    tagline: 'Homemade. Nearby. Delivered.',
    searchPlaceholder: 'Search for cakes, biryani, crafts...',
    showingWithin: 'Showing results within',
    kmAway: 'km away',
    addToCart: 'Add to Cart',
    viewStore: 'View Store',
    checkoutBtn: 'Proceed to Checkout',
    operatingHrs: 'Operating Hours',
    preorderText: 'Ready in ~45 mins',
    ratingAverage: 'Average Rating',
    reviewsCount: 'reviews',
    allergenAlert: 'Allergen Info',
    ingredientsLabel: 'Ingredients Used',
    nearbyTitle: 'Discovered Near You',
    trendingTitle: 'Trending in Your Area',
    newSellersTitle: 'New Sellers Nearby',
    freshBakesTitle: 'Fresh Bakes Today',
    handcraftTitle: 'Handcrafted Organic Goods'
  },
  ml: {
    tagline: 'വീട്ടിലുണ്ടാക്കിയത്. തൊട്ടടുത്ത്. വേഗത്തിൽ.',
    searchPlaceholder: 'കേക്കുകൾ, ബിരിയാണി, കരകൗശലവസ്തുക്കൾ തിരയുക...',
    showingWithin: 'ഫലങ്ങൾ കാണിക്കുന്നത്',
    kmAway: 'കി.മീ ദൂരെ',
    addToCart: 'വാങ്ങുക',
    viewStore: 'കട കാണുക',
    checkoutBtn: 'ചെക്ക്ഔട്ട് ചെയ്യുക',
    operatingHrs: 'പ്രവർത്തന സമയം',
    preorderText: 'തയ്യാറാകുന്നത് ~45 മിനിറ്റിൽ',
    ratingAverage: 'ശരാശരി റേറ്റിംഗ്',
    reviewsCount: 'അഭിപ്രായങ്ങൾ',
    allergenAlert: 'അലർജി വിവരങ്ങൾ',
    ingredientsLabel: 'ചേരുവകൾ',
    nearbyTitle: 'നിങ്ങളുടെ അടുത്തുള്ളവ',
    trendingTitle: 'ജനപ്രിയ ഇനങ്ങൾ',
    newSellersTitle: 'പുതിയ കടകൾ',
    freshBakesTitle: 'ഇന്നത്തെ ബേക്കറി പലഹാരങ്ങൾ',
    handcraftTitle: 'നാടൻ കരകൗശലവസ്തുക്കൾ'
  }
};

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof ITranslations) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof ITranslations): string => {
    return translations[language][key] || translations['en'][key] || '';
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
