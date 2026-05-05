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
 *
 * ⚠️  DEVELOP BRANCH — DEMO VENDOR (Street Stack)
 *     This is NOT La Muletti. Generic fictional vendor for demo purposes.
 *     La Muletti config lives on main branch only.
 * ============================================================================
 */

const CONFIG = {

  /* --------------------------------------------------------------------------
     MENU SHEET
     Blanked for demo — app falls back to static menu array below.
  -------------------------------------------------------------------------- */
   menuSheetUrl:   '',
   eventsSheetUrl: '',
   offersSheetUrl: '',

  /* --------------------------------------------------------------------------
     VENDOR IDENTITY
     id: Firestore document key — points to dev sandbox (stalliq Firebase project).
  -------------------------------------------------------------------------- */
  vendor: {
    id: 'demo',
  },

  /* --------------------------------------------------------------------------
     DOMAINS
  -------------------------------------------------------------------------- */
  domains: [
    'stalliq-demo.netlify.app',
    'demo.stalliq.co.uk',
  ],

  /* --------------------------------------------------------------------------
     BUSINESS IDENTITY
  -------------------------------------------------------------------------- */
  business: {
    name:        'Street Stack',
    nameShort:   'Street Stack',
    tagline:     'Smash Burgers & Loaded Fries',
    description: 'Proper smash burgers, crispy loaded fries, and sauces made from scratch. Street food done right.',
    location:    'Milton Keynes',
    type:        'burgers',
    currency:    '£',
    year:        '2024',
  },

  /* --------------------------------------------------------------------------
     BRANDING & COLOURS
  -------------------------------------------------------------------------- */
  theme: {
    primary:      '#14B8A6',   // Stalliq teal
    primaryHover: '#0D9488',   // deeper teal
    primaryDark:  '#0A7C72',
    accent:       '#2DD4BF',   // lighter teal highlight
    dark:         '#0B1221',   // Stalliq midnight
    darkMid:      '#111E35',
    light:        '#F0FDFA',   // Stalliq cool white
    muted:        '#5B8E8A',
  },

  /* --------------------------------------------------------------------------
     CONTACT DETAILS
  -------------------------------------------------------------------------- */
  contact: {
    phone:        '07700 900123',
    email:        'hello@streetstack.co.uk',
    website:      'streetstack.co.uk',
    websiteUrl:   'https://www.streetstack.co.uk',
    facebook:     '@streetstackburgers',
    facebookUrl:  'https://www.facebook.com/streetstackburgers',
    instagram:    '@street_stack',
    instagramUrl: 'https://www.instagram.com/street_stack',
    messengerUrl: 'https://m.me/streetstackburgers',
  },

  /* --------------------------------------------------------------------------
     IMAGES
     Using generic food placeholder images for demo.
  -------------------------------------------------------------------------- */
  images: {
    hero:     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    founders: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&q=80',
    icon:     'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  },

  /* --------------------------------------------------------------------------
     DESKTOP HERO
  -------------------------------------------------------------------------- */
  hero: {
    eyebrow:      'Smash burgers · Loaded fries · Milton Keynes',
    titleLine1:   'Street Food,',
    titleLine2:   'Done Properly',
    subtitle:     'Proper smash burgers, crispy loaded fries, and sauces made from scratch. Street food done right.',
    ctaPrimary:   '🍔 View Our Menu',
    ctaSecondary: '📍 Find Us',
    navCta:       'Book Us for Your Event',
  },

  /* --------------------------------------------------------------------------
     STRIP BAR
  -------------------------------------------------------------------------- */
  stripItems: [
    { icon: '🔥', text: 'Fresh smash patties' },
    { icon: '🧀', text: 'Proper melted cheese' },
    { icon: '🚚', text: 'Mobile street food' },
    { icon: '🎉', text: 'Events & catering' },
    { icon: '💵', text: 'Pay on collection' },
  ],

  /* --------------------------------------------------------------------------
     MENU ITEMS
     Static fallback — used because sheet URLs are blank on demo branch.
  -------------------------------------------------------------------------- */
  menu: [
    { id: 1, name: 'Classic Stack',       price: 8,  diet: '',   available: true,
      desc: 'Double smash patty, American cheese, shredded lettuce, pickles, Stack sauce' },
    { id: 2, name: 'Bacon Stack',         price: 9,  diet: '',   available: true,
      desc: 'Double smash patty, streaky bacon, American cheese, caramelised onions, Stack sauce' },
    { id: 3, name: 'Crispy Chicken',      price: 9,  diet: '',   available: true,
      desc: 'Buttermilk fried chicken thigh, slaw, pickled jalapeños, honey mustard' },
    { id: 4, name: 'Mushroom Melt',       price: 8,  diet: 'V',  available: true,
      desc: 'Double smash patty (plant-based), sautéed mushrooms, Swiss-style cheese, truffle mayo' },
    { id: 5, name: 'Loaded Fries',        price: 5,  diet: 'V',  available: true,
      desc: 'Skin-on fries, cheese sauce, crispy onions, chives — add bacon +£1' },
    { id: 6, name: 'Dirty Stack',         price: 11, diet: '🌶️', available: true,
      desc: 'Triple smash patty, ghost pepper sauce, crispy jalapeños, pepper jack cheese, pickles. 🌶️ Very hot.' },
  ],

  /* --------------------------------------------------------------------------
     ABOUT / STORY
  -------------------------------------------------------------------------- */
  about: {
    eyebrow:    'Our story',
    titleLine1: 'Born on the Street,',
    titleLine2: 'Built for Flavour',
    storyParagraphs: [
      'Street Stack started with one obsession: the perfect smash burger. Thin, crispy-edged patties, proper cheese pull, sauces made from scratch every single day. No frozen patties, no shortcuts.',
      'We bring the van to markets, events, and private catering across Milton Keynes and beyond. If you want a burger that actually tastes like something, you\'ve found us.',
    ],
    imageCaption: 'Marco & Priya — Street Stack',
    founders: [
      {
        name: 'Marco', avatar: '👨‍🍳',
        role: 'Head Chef & Co-founder',
        bio:  'Marco spent five years cooking in professional kitchens before deciding the best burgers are made outside, not in. He developed the Stack sauce recipe over 200+ attempts.',
      },
      {
        name: 'Priya', avatar: '👩‍💼',
        role: 'Operations & Co-founder',
        bio:  'Priya handles everything that keeps the van running — bookings, events, logistics, and making sure the queue moves fast. She also developed the loaded fries menu.',
      },
    ],
  },

  /* --------------------------------------------------------------------------
     VALUES
  -------------------------------------------------------------------------- */
  values: {
    eyebrow:    'What we stand for',
    titleLine1: 'Quality you',
    titleLine2: 'Can Taste',
    items: [
      { icon: '🥩', name: 'Fresh daily',  desc: 'Patties pressed and cooked to order. Nothing sits around.' },
      { icon: '🔥', name: 'Proper heat',  desc: 'A ripping hot griddle is the only way to get that crust.' },
      { icon: '🧄', name: 'From scratch', desc: 'Our sauces and seasonings are made fresh every service.' },
      { icon: '🤝', name: 'Community',    desc: 'Proud to feed MK — one smash burger at a time.' },
    ],
  },

  /* --------------------------------------------------------------------------
     MOBILE HOME PILLS
  -------------------------------------------------------------------------- */
  homePills: [
    { icon: '🍔', title: 'Smash Burgers',    desc: 'Double smash patties, proper cheese pull, made to order' },
    { icon: '🚚', title: 'Mobile Street Van', desc: 'We come to you — markets, events, private hire' },
    { icon: '🎉', title: 'Event Catering',    desc: 'Weddings, festivals, corporate — we bring the van' },
    { icon: '💵', title: 'Pay on Collection', desc: 'Order ahead to skip the queue, pay when you collect' },
  ],

  /* --------------------------------------------------------------------------
     UPCOMING EVENTS
  -------------------------------------------------------------------------- */
  events: [],

  /* --------------------------------------------------------------------------
     ORDER SETTINGS
  -------------------------------------------------------------------------- */
  ordering: {
    waitMins:        8,
    timeoutMins:     10,
    refPrefix:       'SS',
    paymentNote:     '💵 Cash or card on collection',
    confirmMsg:      'Order received! Your fresh smash burger will be ready soon 🍔 Come and collect when we call your name.',
    waitOptions:     [5, 8, 10, 15],
    allowCustomWait: true,
  },

  /* --------------------------------------------------------------------------
     SEO / META
  -------------------------------------------------------------------------- */
  meta: {
    title:       'Street Stack — Smash Burgers & Loaded Fries · Milton Keynes',
    description: 'Proper smash burgers and loaded fries from a mobile street food van. Based in Milton Keynes. Order for collection or book us for your event.',
    appTitle:    'Street Stack',
  },

};
