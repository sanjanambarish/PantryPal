/**
 * Food & Editorial Image Registry
 * ─────────────────────────────────────────────────────────────
 * All 15 curated Pinterest food photography assets in /public/food/
 */

export const FOOD_IMAGES = {
  bowls:       "/food/bowls.jpg",       // Asian food bowls on red/white S-curve
  woodmenu:    "/food/woodmenu.jpg",    // Rustic wooden menu board with circular plates
  scroll:      "/food/scroll.jpg",      // Vintage parchment scroll in warm rustic kitchen
  woodtable:   "/food/woodtable.jpg",   // Dark wood cutting board framed by heirloom veggies
  leafframe:   "/food/leafframe.jpg",   // Dark wood tabletop framed by lush foliage & berries
  spices:      "/food/spices.jpg",      // Wooden scoops with colourful spices on dark slate
  veggies:     "/food/veggies.jpg",     // Vibrant green & red fresh vegetables flat-lay
  fruits:      "/food/fruits.jpg",      // Colourful citrus, berries & kiwi flat-lay
  harvest:     "/food/harvest.jpg",     // Wholesome grains in bowls with broccoli, corn & peppers
  cookingpan:  "/food/cookingpan.jpg",  // Levitating Greek salad on dark studio backdrop
  earthy:      "/food/earthy.jpg",      // Earthy roots, nuts, garlic, ginger, cocoa & cinnamon
  purple:      "/food/purple.jpg",      // Monochrome purple harvest: artichokes, figs, berries
  colorsplit:  "/food/colorsplit.jpg",  // Bold blue & orange split produce flat-lay
  sunlit:      "/food/sunlit.jpg",      // Sunlit minimalist green apples, lemon slices & rosemary
  citrusspice: "/food/citrusspice.jpg", // Warm glowing orange slices, cinnamon & star anise
};

/**
 * Per-page hero image assignments
 */
export const PAGE_HEROES = {
  dashboard: FOOD_IMAGES.woodtable,
  scan:      FOOD_IMAGES.cookingpan,
  pantry:    FOOD_IMAGES.fruits,
  recipes:   FOOD_IMAGES.scroll,
  shopping:  FOOD_IMAGES.bowls,
  analytics: FOOD_IMAGES.spices,
  timeline:  FOOD_IMAGES.leafframe,
  login:     FOOD_IMAGES.veggies,
  register:  FOOD_IMAGES.citrusspice,
};

/**
 * Category → curated photography mapping for cards & filters
 */
export const CATEGORY_IMAGES = {
  All:            FOOD_IMAGES.harvest,
  Dairy:          FOOD_IMAGES.sunlit,
  Fruits:         FOOD_IMAGES.fruits,
  Vegetables:     FOOD_IMAGES.veggies,
  Snacks:         FOOD_IMAGES.earthy,
  Drinks:         FOOD_IMAGES.citrusspice,
  "Frozen Foods": FOOD_IMAGES.colorsplit,
  Bakery:         FOOD_IMAGES.scroll,
  Meat:           FOOD_IMAGES.bowls,
  Seafood:        FOOD_IMAGES.cookingpan,
  Grains:         FOOD_IMAGES.harvest,
  Other:          FOOD_IMAGES.spices,
};

/**
 * Curated Seasonal Collections for Dashboard & Inspiration Carousels
 */
export const CURATED_COLLECTIONS = [
  {
    id: "levitating-fresh",
    title: "Zero-Waste Salads",
    subtitle: "Crisp greens & feta bowls",
    tag: "AI Chef Pick",
    image: FOOD_IMAGES.cookingpan,
    accent: "#3A6B3A",
    link: "/recipes",
  },
  {
    id: "purple-antioxidants",
    title: "Royal Purple Harvest",
    subtitle: "Figs, blackberries & heirloom brassicas",
    tag: "Seasonal Palette",
    image: FOOD_IMAGES.purple,
    accent: "#6B3FA0",
    link: "/pantry",
  },
  {
    id: "earthy-staples",
    title: "Artisanal Roots & Aromatics",
    subtitle: "Ginger, garlic, walnuts & warm spices",
    tag: "Pantry Staples",
    image: FOOD_IMAGES.earthy,
    accent: "#8B5A2B",
    link: "/pantry",
  },
  {
    id: "citrus-botanicals",
    title: "Sunlit Citrus & Herbs",
    subtitle: "Green apple, rosemary & star anise",
    tag: "Botanical Infusions",
    image: FOOD_IMAGES.sunlit,
    accent: "#4A7A4A",
    link: "/recipes",
  },
  {
    id: "warm-spices",
    title: "Spiced Winter Glow",
    subtitle: "Blood orange, cinnamon bark & anise",
    tag: "Aromatic Blend",
    image: FOOD_IMAGES.citrusspice,
    accent: "#C17B4A",
    link: "/recipes",
  },
  {
    id: "color-contrast",
    title: "Vibrant Color Theory",
    subtitle: "Blueberry & tangerine vitamin boost",
    tag: "Fresh Produce",
    image: FOOD_IMAGES.colorsplit,
    accent: "#2A5A8A",
    link: "/pantry",
  },
];
