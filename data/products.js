export const products = [
  {
    id: "wand-unicorn-hair-001",
    image: "images/products/magic-wand.jpg",
    name: "Magic Wand (Unicorn Hair Core)",
    rating: { stars: 4.5, count: 87 },
    priceCents: 1090,
    keywords: ["wand", "unicorn hair", "focus", "spellcasting"]
  },
  {
    id: "shrunken-head-001",
    image: "images/products/shrunken-head.png",
    name: "Shrunken Head",
    rating: { stars: 4, count: 127 },
    priceCents: 2095,
    keywords: ["cursed", "decor", "necromancy"]
  },
  {
    id: "dragon-egg-001",
    image: "images/products/dragon-egg.jpg",
    name: "Dragon Egg",
    rating: { stars: 4.5, count: 56 },
    priceCents: 799,
    keywords: ["dragon", "egg", "creatures", "rare"]
  },
  {
    id: "mandrake-plant-001",
    image: "images/products/mandrake.jpg",
    name: "Mandrake Plant",
    rating: { stars: 5, count: 1002 },
    priceCents: 1899,
    keywords: ["herbology", "plant", "ingredient", "screaming plant"]
  },
  {
    id: "spell-book-adv-001",
    image: "images/products/spell-book.jpg",
    name: "Spell Book: Advanced Magic",
    rating: { stars: 4, count: 167 },
    priceCents: 3000,
    keywords: ["spell", "learning", "wizardry"]
  },
  {
    id: "necronomicon-001",
    image: "images/products/necronomicon.jpg",
    name: "Necronomicon",
    rating: { stars: 5, count: 626 },
    priceCents: 10000,
    keywords: ["learning", "necromancy", "forbidden"]
  },
  {
    id: "book-of-solomon-001",
    image: "images/products/key-of-solomon.jpg",
    name: "Key of Solomon",
    rating: { stars: 3.5, count: 1200 },
    priceCents: 5000,
    keywords: ["demonology", "exorcism", "beginner"]
  },
  {
    id: "phoenix-feather-001",
    image: "images/products/phoenix-feather.jpg",
    name: "Phoenix Feather",
    rating: { stars: 4, count: 254 },
    priceCents: 3500,
    keywords: ["feather", "alchemy", "pyromancy"]
  },
  {
    id: "wizard-robe-001",
    image: "images/products/wizard-robe.jpg",
    name: "Wizard Robe",
    rating: { stars: 4.5, count: 56 },
    priceCents: 799,
    keywords: ["robes", "academy", "uniform"],
    type: "clothing",
    sizeChartLink: "images/clothing-size-chart.png"
  }
];

export function getProduct(productId) {
  return products.find((p) => p.id === productId);
}