export const restaurants = [
  {
    id: 1,
    name: "Kigali Serena Restaurant",
    description: "Fine dining with panoramic views of Kigali city.",
    location: "KN 3 Ave, Kigali",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80",
    cuisine: "International",
    priceRange: "$$$$",
    tables: [
      { id: 1, number: "T1", capacity: 2, status: "available" },
      { id: 2, number: "T2", capacity: 4, status: "available" },
      { id: 3, number: "T3", capacity: 6, status: "booked" },
      { id: 4, number: "T4", capacity: 2, status: "available" },
      { id: 5, number: "T5", capacity: 8, status: "available" },
    ],
    menu: [
      { id: 1, name: "Grilled Tilapia", price: 12000, description: "Fresh Lake Victoria tilapia" },
      { id: 2, name: "Brochettes", price: 8000, description: "Rwandan-style grilled meat skewers" },
      { id: 3, name: "Isombe", price: 6000, description: "Cassava leaves with peanut sauce" },
      { id: 4, name: "Matoke", price: 5000, description: "Steamed green bananas" },
    ],
  },
  {
    id: 2,
    name: "Heaven Restaurant",
    description: "Rooftop dining with stunning sunset views.",
    location: "KG 7 Ave, Kiyovu",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
    cuisine: "African Fusion",
    priceRange: "$$$",
    tables: [
      { id: 6, number: "T1", capacity: 2, status: "available" },
      { id: 7, number: "T2", capacity: 4, status: "available" },
      { id: 8, number: "T3", capacity: 4, status: "booked" },
      { id: 9, number: "T4", capacity: 6, status: "available" },
    ],
    menu: [
      { id: 5, name: "Nyama Choma", price: 15000, description: "Roasted goat meat" },
      { id: 6, name: "Ugali & Stew", price: 4500, description: "Maize meal with beef stew" },
      { id: 7, name: "Sambaza", price: 9000, description: "Fried small lake fish" },
      { id: 8, name: "Chapati & Beans", price: 3500, description: "Flatbread with spiced beans" },
    ],
  },
  {
    id: 3,
    name: "Repub Lounge",
    description: "Vibrant lounge with live music and local cuisine.",
    location: "KN 82 St, Nyamirambo",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    cuisine: "Rwandan",
    priceRange: "$$",
    tables: [
      { id: 10, number: "T1", capacity: 2, status: "available" },
      { id: 11, number: "T2", capacity: 4, status: "available" },
      { id: 12, number: "T3", capacity: 2, status: "available" },
    ],
    menu: [
      { id: 9, name: "Ibihaza", price: 3000, description: "Pumpkin cooked in milk" },
      { id: 10, name: "Umutsima", price: 3500, description: "Cassava and corn porridge" },
      { id: 11, name: "Inyama y'Inka", price: 10000, description: "Rwandan beef stew" },
      { id: 12, name: "Akabenz", price: 2500, description: "Fried dough snack" },
    ],
  },
];

export const shops = [
  {
    id: 1,
    name: "Rwanda Craft Market",
    description: "Authentic Rwandan handicrafts, baskets, and souvenirs.",
    location: "KN 4 Ave, Kigali City Center",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
    category: "Crafts & Souvenirs",
    products: [
      { id: 1, name: "Agaseke Basket", price: 15000, description: "Traditional woven peace basket", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", stock: 20 },
      { id: 2, name: "Imigongo Art", price: 25000, description: "Geometric cow dung art painting", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80", stock: 10 },
      { id: 3, name: "Rwandan Fabric", price: 8000, description: "Colorful kitenge fabric", image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=300&q=80", stock: 50 },
    ],
  },
  {
    id: 2,
    name: "Kigali Fresh Market",
    description: "Fresh local produce, spices, and organic foods.",
    location: "KG 11 Ave, Remera",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    category: "Food & Produce",
    products: [
      { id: 4, name: "Rwandan Coffee (1kg)", price: 12000, description: "Premium single-origin Arabica", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&q=80", stock: 100 },
      { id: 5, name: "Honey Jar (500g)", price: 6000, description: "Pure organic Rwandan honey", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80", stock: 40 },
      { id: 6, name: "Dried Chili Mix", price: 2500, description: "Assorted local dried chilies", image: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=300&q=80", stock: 60 },
    ],
  },
  {
    id: 3,
    name: "Inzozi Fashion",
    description: "Modern African fashion with Rwandan designs.",
    location: "KN 78 St, Kimihurura",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80",
    category: "Fashion",
    products: [
      { id: 7, name: "Kitenge Dress", price: 35000, description: "Hand-tailored African print dress", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4f7f?w=300&q=80", stock: 15 },
      { id: 8, name: "Woven Sandals", price: 18000, description: "Handmade leather sandals", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80", stock: 25 },
      { id: 9, name: "Beaded Necklace", price: 9000, description: "Traditional beaded jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80", stock: 30 },
    ],
  },
];

export const featuredItems = {
  restaurants: restaurants.slice(0, 3),
  shops: shops.slice(0, 3),
};
