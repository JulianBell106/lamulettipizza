/**
 * ============================================================================
 * VENDOR CONFIGURATION FILE
 * ============================================================================
 * This is the ONLY file that changes between customers.
 * Every piece of customer-specific content and branding lives here.
 *
 * TO ONBOARD A NEW CUSTOMER:
 *   1. Copy this file into their deployment
 *   2. Fill in their details below
 *   3. Done — the app reads everything automatically from CONFIG
 * ============================================================================
 */

const CONFIG = {

  /* --------------------------------------------------------------------------
     MENU SHEET
     Published Google Sheet CSV URL — vendor edits the sheet, app updates live.
     Set to '' to disable and use the menu array below instead.
  -------------------------------------------------------------------------- */
   menuSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTL19TeZ5Md3zJkz3qzGmc7e5dOnL29w3w8s6Rp9FBH6JC8Po2BRSaa-VXsMXqt3EbE76SiYUryme51/pub?output=csv',
   eventsSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTedQCoKEWfdPwuhUYqQoYeGrb5dGTB9pay0ecFv2BBTDrLxeHfjJ-DTssRTpnWagNUh07jCmWTjBei/pub?output=csv',
   offersSheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vReFvkHBO0a-QRn9dCJQCjjgFd0N0s_0cqOWNYb3-4qiwbAOkfs1p47w8HOeclwzKQW93ovnruJafRp/pub?output=csv',

  /* --------------------------------------------------------------------------
     VENDOR IDENTITY
     id: Firestore document key — never change once orders are live.
  -------------------------------------------------------------------------- */
  vendor: {
    id: 'lamuletti',
  },

  /* --------------------------------------------------------------------------
     DOMAINS
     Forward-compatible field — not used at runtime yet.
     Lists all valid domains for this customer deployment.
     Used in future for: domain validation, multi-tenant routing, CORS config.
     Update when the customer goes live on their own domain.
  -------------------------------------------------------------------------- */
  domains: [
    'stalliq-demo.netlify.app',
    'lamulettipizza.co.uk',
  ],

  /* --------------------------------------------------------------------------
     BUSINESS IDENTITY
  -------------------------------------------------------------------------- */
  business: {
    name:        'La Muletti Pizza',
    nameShort:   'La Muletti',
    tagline:     'Neapolitan Wood-Fired Pizza',
    description: 'Traditional Neapolitan recipes, a wood-fired oven on wheels, and a husband & wife who live for great pizza.',
    location:    'Milton Keynes',
    type:        'pizza',
    currency:    '£',
    year:        '2025',
  },

  /* --------------------------------------------------------------------------
     BRANDING & COLOURS
     Change these to retheme the whole site for a new customer.
  -------------------------------------------------------------------------- */
  theme: {
    primary:      '#C4271A',   // true red (updated Session 12 — was #C8410B orange)
    primaryHover: '#D93B25',   // ember hover (updated Session 12 — was #E85D2A)
    primaryDark:  '#8B1810',
    accent:       '#D4A043',
    dark:         '#1A0A00',
    darkMid:      '#2C1A0A',
    light:        '#FDF6EC',
    muted:        '#8B6347',
  },

  /* --------------------------------------------------------------------------
     CONTACT DETAILS
  -------------------------------------------------------------------------- */
  contact: {
    phone:       '07951 050383',
    email:       'hello@lamulettipizza.co.uk',
    website:     'lamulettipizza.co.uk',
    websiteUrl:  'https://www.lamulettipizza.co.uk',
    facebook:    '@lamulettipizza',
    facebookUrl: 'https://facebook.com/lamulettipizza',
  },

  /* --------------------------------------------------------------------------
     IMAGES
  -------------------------------------------------------------------------- */
  images: {
    hero:     'https://i.ibb.co/bMvvnQxp/pizza-image-7.jpg',
    founders: 'https://i.ibb.co/ccpwqTzX/cartoon.jpg',
    icon:     'https://i.ibb.co/bMvvnQxp/pizza-image-7.jpg',
  },

  /* --------------------------------------------------------------------------
     DESKTOP HERO
  -------------------------------------------------------------------------- */
  hero: {
    eyebrow:      'Wood-fired · Neapolitan · Milton Keynes',
    titleLine1:   'Authentic Pizza,',
    titleLine2:   'Fired with Soul',
    subtitle:     'Traditional Neapolitan recipes, a wood-fired oven on wheels, and a husband & wife who live for great pizza.',
    ctaPrimary:   '🍕 View Our Menu',
    ctaSecondary: '📍 Find Us',
    navCta:       'Book a Catering Event',
  },

  /* --------------------------------------------------------------------------
     STRIP BAR
  -------------------------------------------------------------------------- */
  stripItems: [
    { icon: '🔥', text: 'Wood-fired oven' },
    { icon: '🇮🇹', text: 'Neapolitan tradition' },
    { icon: '🚐', text: 'Mobile pizzeria' },
    { icon: '🎉', text: 'Private catering' },
    { icon: '💵', text: 'Pay on collection' },
  ],

  /* --------------------------------------------------------------------------
     MENU ITEMS
     id:        Unique — never change once orders are live
     diet:      'VE' | 'V' | '🌶️' | ''
     available: false to hide without deleting
     Note: if menuSheetUrl is set and loads successfully, this array is
     used only as a fallback (sheet not reachable / URL not set).
  -------------------------------------------------------------------------- */
  menu: [
    { id: 1, name: 'Marinara',            price: 8,  diet: 'VE', available: true,
      desc: 'Tomato base, garlic, oregano, olive oil with fresh basil' },
    { id: 2, name: 'Margherita',          price: 9,  diet: 'V',  available: true,
      desc: 'Tomato base, Parmesan, Fior di latte mozzarella, fresh basil and olive oil' },
    { id: 3, name: 'Prosciutto e Funghi', price: 10, diet: '',   available: true,
      desc: 'Tomato base, Parmesan, Fior di latte mozzarella, prosciutto, mushrooms, fresh basil with olive oil' },
    { id: 4, name: 'Bella Pepperoni',     price: 10, diet: '',   available: true,
      desc: 'Tomato base, Parmesan, Fior di latte mozzarella, pepperoni, fresh basil with olive oil' },
    { id: 5, name: 'Capricciosa',         price: 11, diet: '',   available: true,
      desc: 'Tomato base, Parmesan, Fior di latte mozzarella, ham, mushrooms, würstel, artichokes, black olives, fresh basil and olive oil' },
    { id: 6, name: 'La Mamma Muletti',    price: 12, diet: '🌶️', available: true,
      desc: 'Tomato base, Parmesan, Fior di latte mozzarella, fresh basil, salame di Napoli, nduja, red onions, hot honey' },
  ],

  /* --------------------------------------------------------------------------
     ABOUT / STORY
  -------------------------------------------------------------------------- */
  about: {
    eyebrow:    'Our story',
    titleLine1: 'Born in Sicily,',
    titleLine2: 'Made in MK',
    storyParagraphs: [
      'La Muletti Pizza was born from a simple idea: bring the soul of a Neapolitan pizzeria to the communities of Milton Keynes and beyond. What started as a passion project between two pizza-obsessed newlyweds has grown into a much-loved mobile pizza van, popping up at local events, markets, and private celebrations.',
      'Every pizza is made fresh using traditional Neapolitan techniques — slow-fermented dough, San Marzano tomatoes, and the finest Fior di latte mozzarella. No shortcuts. No compromises.',
    ],
    imageCaption: 'Daniele & Danielle — La Muletti Pizza',
    founders: [
      {
        name: 'Daniele', avatar: '👨‍🍳',
        role: 'Head Pizzaiolo & Co-founder',
        bio:  'Born in Sicily, Daniele grew up watching his nonna stretch dough by hand. After years honing his craft in Italian kitchens, he brought his passion for authentic pizza to the streets of Milton Keynes.',
      },
      {
        name: 'Danielle', avatar: '👩‍💼',
        role: 'Operations & Co-founder',
        bio:  'Danielle is the heart behind the business — managing bookings, events, and ensuring every customer leaves with a smile. Her warmth and attention to detail make every La Muletti experience truly special.',
      },
    ],
  },

  /* --------------------------------------------------------------------------
     VALUES
  -------------------------------------------------------------------------- */
  values: {
    eyebrow:    'What we stand for',
    titleLine1: 'Pizza the',
    titleLine2: 'Right Way',
    items: [
      { icon: '🌾', name: 'Quality',   desc: 'Premium Italian ingredients, sourced with care for every pizza we make.' },
      { icon: '❤️', name: 'Passion',   desc: 'Every pizza carries the love and tradition of generations of Neapolitan craft.' },
      { icon: '🤝', name: 'Community', desc: 'Proud to serve MK and the surrounding area, one pizza at a time.' },
      { icon: '🔥', name: 'Authentic', desc: 'True Neapolitan style — wood-fired, hand-stretched, no compromises.' },
    ],
  },

  /* --------------------------------------------------------------------------
     MOBILE HOME PILLS
  -------------------------------------------------------------------------- */
  homePills: [
    { icon: '🍕', title: 'Authentic Neapolitan', desc: 'Wood-fired to perfection, traditional Italian recipes' },
    { icon: '🚐', title: 'Mobile Pizzeria',      desc: 'We come to you — events, weddings, pop-ups & more' },
    { icon: '🎉', title: 'Private Catering',     desc: 'Corporate events to birthdays — we cater it all' },
    { icon: '💵', title: 'Pay on Collection',    desc: 'Order ahead to secure your slot, pay when you collect' },
  ],

  /* --------------------------------------------------------------------------
     UPCOMING EVENTS
     Leave empty [] to show "no upcoming events" message.
  -------------------------------------------------------------------------- */
  events: [
    // Fallback only — events are driven by eventsSheetUrl above.
    // Leave empty until Google Sheet is populated with upcoming dates.
  ],

  /* --------------------------------------------------------------------------
     ORDER SETTINGS
  -------------------------------------------------------------------------- */
  ordering: {
    waitMins:       15,
    timeoutMins:    10,
    refPrefix:      'LM',
    paymentNote:    '💵 Cash or card on collection',
    confirmMsg:     'Thanks for your order! Please collect and pay on pickup. Your fresh pizza will be ready soon 🍕',
    waitOptions:    [10, 15, 20, 25],
    allowCustomWait: true,
  },

  /* --------------------------------------------------------------------------
     SEO / META
  -------------------------------------------------------------------------- */
  meta: {
    title:       'La Muletti Pizza — Neapolitan Wood-Fired Pizza · Milton Keynes',
    description: 'Authentic Neapolitan wood-fired pizza on wheels. Based in Milton Keynes. Order for collection or book us for your event.',
    appTitle:    'La Muletti',
  },

};
