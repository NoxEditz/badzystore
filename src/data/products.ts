import mouseProImg from "@/assets/products/mouse-pro.jpg";
import mouseLightImg from "@/assets/products/mouse-light.jpg";
import mouseWirelessImg from "@/assets/products/mouse-wireless.jpg";
import kb60Img from "@/assets/products/kb-60.jpg";
import kbTklImg from "@/assets/products/kb-tkl.jpg";
import kbKnobImg from "@/assets/products/kb-knob.jpg";
import headsetProImg from "@/assets/products/headset-pro.jpg";
import headsetWirelessImg from "@/assets/products/headset-wireless.jpg";
import mousepadRgbImg from "@/assets/products/mousepad-rgb.jpg";
import cableImg from "@/assets/products/cable-coiled.jpg";
import ledImg from "@/assets/products/led-strip.jpg";
import chairImg from "@/assets/products/chair.jpg";
import controllerImg from "@/assets/products/controller.jpg";
import micImg from "@/assets/products/mic.jpg";
import webcamImg from "@/assets/products/webcam.jpg";

export type Category =
  | "mice"
  | "keyboards"
  | "headsets"
  | "rgb"
  | "streaming"
  | "seating";

export const CATEGORIES: { id: Category; label: string; labelAr: string }[] = [
  { id: "mice", label: "Mice", labelAr: "ماوسات" },
  { id: "keyboards", label: "Keyboards", labelAr: "كيبوردات" },
  { id: "headsets", label: "Headsets", labelAr: "سماعات" },
  { id: "rgb", label: "RGB & Setup", labelAr: "إضاءة وتجهيزات" },
  { id: "streaming", label: "Streaming", labelAr: "بث وميكروفونات" },
  { id: "seating", label: "Seating", labelAr: "كراسي ألعاب" },
];

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  commentAr?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  category: Category;
  price: number; // In EGP
  oldPrice?: number; // In EGP
  rating: number;
  reviews: number;
  image: string;
  shortDesc: string;
  shortDescAr?: string;
  specs: { label: string; value: string }[];
  stock: number;
  tags: string[];
  badge?: string;
  sampleReviews?: ProductReview[];
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p01",
    slug: "badzy-viper-pro",
    name: "Viper Pro Wireless Mouse",
    nameAr: "فأرة فايبر برو اللاسلكية",
    category: "mice",
    price: 4250,
    oldPrice: 5600,
    rating: 4.8,
    reviews: 214,
    image: mouseProImg,
    shortDesc: "26K DPI optical sensor, 70h battery, sub-1ms wireless speed.",
    shortDescAr: "حساس بصري 26 ألف DPI، بطارية 70 ساعة، سرعة لاسلكية أقل من 1 مللي ثانية.",
    specs: [
      { label: "Sensor", value: "26,000 DPI Optical" },
      { label: "Weight", value: "63g" },
      { label: "Battery", value: "Up to 70 hours" },
      { label: "Connection", value: "2.4GHz + Bluetooth" },
    ],
    stock: 32,
    tags: ["wireless", "esports", "lightweight"],
    badge: "Best seller",
    sampleReviews: [
      {
        id: "r1",
        author: "Omar K. (Alexandria)",
        rating: 5,
        date: "2026-07-10",
        comment: "Insane tracking and battery life. Perfect for CS2 and Valorant!",
        commentAr: "أداء خرافي في فالورانت وسرعة استجابة ممتازة!",
      },
      {
        id: "r2",
        author: "Ahmed M. (Cairo)",
        rating: 5,
        date: "2026-07-04",
        comment: "Received it via COD in 24 hours in Cairo. Original quality.",
        commentAr: "وصلني خلال 24 ساعة والدفع عند الاستلام ممتاز.",
      },
    ],
  },
  {
    id: "p02",
    slug: "badzy-honeycomb-58",
    name: "Honeycomb 58 Ultra-Light Mouse",
    nameAr: "فأرة هانيكومب 58 الخفيفة",
    category: "mice",
    price: 2350,
    rating: 4.6,
    reviews: 132,
    image: mouseLightImg,
    shortDesc: "58g honeycomb shell, PMW3389 sensor, paracord cable.",
    shortDescAr: "وزن خفيف جداً 58 جرام، مستشعر احترافي، كابل باراكورد مرن.",
    specs: [
      { label: "Sensor", value: "16,000 DPI PMW3389" },
      { label: "Weight", value: "58g" },
      { label: "Cable", value: "Paracord 1.8m" },
      { label: "Switches", value: "Rated 60M clicks" },
    ],
    stock: 4, // Low stock example
    tags: ["wired", "lightweight"],
    sampleReviews: [
      {
        id: "r3",
        author: "Youssef N.",
        rating: 4.5,
        date: "2026-06-20",
        comment: "Super light and smooth mousepad glide.",
        commentAr: "خفيفة جداً ومريحة لليد.",
      },
    ],
  },
  {
    id: "p03",
    slug: "badzy-ergo-mx",
    name: "Ergo MX Wireless Mouse",
    nameAr: "فأرة إرجو إم إكس المريحة",
    category: "mice",
    price: 3290,
    rating: 4.5,
    reviews: 86,
    image: mouseWirelessImg,
    shortDesc: "Contoured grip, 6 buttons, 100h battery for long gaming sessions.",
    shortDescAr: "تصميم مريح لليد، 6 أزرار قابلة للبرمجة، بطارية تدوم 100 ساعة.",
    specs: [
      { label: "Sensor", value: "20,000 DPI" },
      { label: "Weight", value: "95g" },
      { label: "Battery", value: "100 hours" },
      { label: "Buttons", value: "6 programmable" },
    ],
    stock: 0, // Out of stock example
    tags: ["wireless", "ergonomic"],
  },
  {
    id: "p04",
    slug: "badzy-compact-60",
    name: "Compact 60 Mechanical Keyboard",
    nameAr: "لوحة مفاتيح كومباكت 60 ميكانيكية",
    category: "keyboards",
    price: 6150,
    oldPrice: 7500,
    rating: 4.7,
    reviews: 301,
    image: kb60Img,
    shortDesc: "60% hot-swap board with red backlight and gasket mount.",
    shortDescAr: "حجم 60% سويتشات قابلة للتغيير، إضاءة حمراء، وتثبيت غاسكيت لمنع الضوضاء.",
    specs: [
      { label: "Layout", value: "60% (61 keys)" },
      { label: "Switches", value: "Hot-swap linear" },
      { label: "Backlight", value: "Red LED" },
      { label: "Mount", value: "Gasket" },
    ],
    stock: 25,
    tags: ["mechanical", "60%", "hot-swap"],
    badge: "New",
  },
  {
    id: "p05",
    slug: "badzy-tkl-elite",
    name: "TKL Elite Mechanical Keyboard",
    nameAr: "لوحة مفاتيح تي كي إل إيليت",
    category: "keyboards",
    price: 7100,
    rating: 4.8,
    reviews: 178,
    image: kbTklImg,
    shortDesc: "Tenkeyless aluminium frame, per-key RGB, PBT keycaps.",
    shortDescAr: "هيكل ألومنيوم قوي، إضاءة RGB لكل مفتاح، أزرار PBT غير قابلة للتآكل.",
    specs: [
      { label: "Layout", value: "TKL (87 keys)" },
      { label: "Frame", value: "CNC Aluminium" },
      { label: "Keycaps", value: "PBT Doubleshot" },
      { label: "Lighting", value: "Per-key RGB" },
    ],
    stock: 18,
    tags: ["mechanical", "tkl", "rgb"],
  },
  {
    id: "p06",
    slug: "badzy-arcane-rgb",
    name: "Arcane RGB Keyboard w/ Knob",
    nameAr: "كيبورد أركين RGB مع بكرة تحكم",
    category: "keyboards",
    price: 8550,
    rating: 4.9,
    reviews: 92,
    image: kbKnobImg,
    shortDesc: "Programmable volume knob, south-facing RGB, silent tactiles.",
    shortDescAr: "بكرة تحكم بالصوت قابلة للبرمجة، سويتشات صامتة مريحة للكتابة واللعب.",
    specs: [
      { label: "Layout", value: "75% with knob" },
      { label: "Switches", value: "Silent tactile" },
      { label: "Lighting", value: "South-facing RGB" },
      { label: "Connection", value: "USB-C detachable" },
    ],
    stock: 12,
    tags: ["mechanical", "rgb", "knob"],
  },
  {
    id: "p07",
    slug: "badzy-void-headset",
    name: "Void Pro Wired Headset",
    nameAr: "سماعة فويد برو السلكية",
    category: "headsets",
    price: 4750,
    rating: 4.6,
    reviews: 244,
    image: headsetProImg,
    shortDesc: "50mm neodymium drivers, memory foam earcups, red mood ring.",
    shortDescAr: "محركات صوت 50 مم نقي، وسائد ميموري فوم مريحة، ميكروفون عازل للضوضاء.",
    specs: [
      { label: "Drivers", value: "50mm Neodymium" },
      { label: "Impedance", value: "32 Ω" },
      { label: "Mic", value: "Detachable cardioid" },
      { label: "Connection", value: "3.5mm + USB DAC" },
    ],
    stock: 50,
    tags: ["wired", "surround"],
  },
  {
    id: "p08",
    slug: "badzy-nova-wireless",
    name: "Nova Wireless Headset",
    nameAr: "سماعة نوفا اللاسلكية",
    category: "headsets",
    price: 7100,
    oldPrice: 8500,
    rating: 4.7,
    reviews: 165,
    image: headsetWirelessImg,
    shortDesc: "40h battery, dual-mode wireless, low-latency 2.4GHz.",
    shortDescAr: "بطارية 40 ساعة، اتصال لاسلكي مزدوج بدون تأخير في الصوت.",
    specs: [
      { label: "Battery", value: "40 hours" },
      { label: "Wireless", value: "2.4GHz + Bluetooth" },
      { label: "Mic", value: "Retractable broadcast" },
      { label: "Weight", value: "285g" },
    ],
    stock: 22,
    tags: ["wireless", "long-battery"],
    badge: "-17%",
  },
  {
    id: "p09",
    slug: "badzy-glowdeck-xxl",
    name: "Glowdeck XXL RGB Mousepad",
    nameAr: "ماوس باد جلو دك XXL إضاءة",
    category: "rgb",
    price: 1850,
    rating: 4.5,
    reviews: 410,
    image: mousepadRgbImg,
    shortDesc: "900×400mm stitched surface with 14 RGB edge modes.",
    shortDescAr: "مقاس ضخم 900×400 مم مع حواف مضاءة بـ 14 نمط RGB مختلف.",
    specs: [
      { label: "Size", value: "900 × 400 × 4 mm" },
      { label: "Surface", value: "Micro-textured cloth" },
      { label: "Lighting", value: "14 RGB modes" },
      { label: "Base", value: "Anti-slip rubber" },
    ],
    stock: 120,
    tags: ["rgb", "xxl"],
  },
  {
    id: "p10",
    slug: "badzy-coil-cable",
    name: "Coil Cable — Crimson",
    nameAr: "كابل كويلد احترافي للميكانيكال كيبورد",
    category: "rgb",
    price: 1390,
    rating: 4.4,
    reviews: 58,
    image: cableImg,
    shortDesc: "Handmade double-sleeved USB-C coiled cable, GX16 aviator.",
    shortDescAr: "كابل USB-C حلزوني مضفر يدوياً مع موصل أفياتور المعدني.",
    specs: [
      { label: "Length", value: "1.5m coiled" },
      { label: "Connector", value: "USB-C + GX16" },
      { label: "Sleeve", value: "Double paracord" },
      { label: "Colour", value: "Crimson / Black" },
    ],
    stock: 60,
    tags: ["accessory", "custom"],
  },
  {
    id: "p11",
    slug: "badzy-lumen-strip",
    name: "Lumen 5m RGB LED Strip",
    nameAr: "شريط إضاءة لومن 5 متر RGB",
    category: "rgb",
    price: 1150,
    rating: 4.3,
    reviews: 720,
    image: ledImg,
    shortDesc: "5m addressable RGB strip with music sync and app control.",
    shortDescAr: "شريط إضاءة 5 متر متزامن مع الموسيقى والتحكم من الموبايل.",
    specs: [
      { label: "Length", value: "5 meters" },
      { label: "LEDs", value: "150 addressable" },
      { label: "Control", value: "App + remote" },
      { label: "Modes", value: "Music sync, scenes" },
    ],
    stock: 200,
    tags: ["rgb", "ambient"],
  },
  {
    id: "p12",
    slug: "badzy-throne-chair",
    name: "Throne Ergonomic Gaming Chair",
    nameAr: "كرسي ألعاب ثرون إرجونوميك",
    category: "seating",
    price: 16500,
    rating: 4.6,
    reviews: 88,
    image: chairImg,
    shortDesc: "High-back racing chair, lumbar & neck cushions, 4D armrests.",
    shortDescAr: "كرسي قيمنق طبي مريح مع وسائد للظهر والرقبة ومساند يد 4D.",
    specs: [
      { label: "Recline", value: "90°–160°" },
      { label: "Armrests", value: "4D adjustable" },
      { label: "Max load", value: "150 kg" },
      { label: "Frame", value: "Steel + PU leather" },
    ],
    stock: 3, // Low stock
    tags: ["seating", "ergonomic"],
  },
  {
    id: "p13",
    slug: "badzy-strike-controller",
    name: "Strike Wireless Controller",
    nameAr: "ذراع تحكم سترايك لاسلكي",
    category: "streaming",
    price: 3750,
    rating: 4.5,
    reviews: 154,
    image: controllerImg,
    shortDesc: "Hall-effect sticks, back paddles, 20h battery.",
    shortDescAr: "أنالوج هول إيفكت مقاوم للدريفت، أزرار خلفية، بطارية 20 ساعة.",
    specs: [
      { label: "Sticks", value: "Hall-effect (no drift)" },
      { label: "Paddles", value: "4 rear buttons" },
      { label: "Battery", value: "20 hours" },
      { label: "Platforms", value: "PC / Console" },
    ],
    stock: 30,
    tags: ["controller", "hall-effect"],
  },
  {
    id: "p14",
    slug: "badzy-echo-mic",
    name: "Echo Broadcast USB Mic",
    nameAr: "ميكروفون إيكو احترافي للبث",
    category: "streaming",
    price: 5650,
    rating: 4.7,
    reviews: 202,
    image: micImg,
    shortDesc: "Cardioid condenser, zero-latency monitor, mute button.",
    shortDescAr: "ميكروفون ستريمنج بنقاء صوت عالي، مخرج سماعة بدون تأخير، زر كتم سريع.",
    specs: [
      { label: "Pattern", value: "Cardioid" },
      { label: "Sample rate", value: "96kHz / 24-bit" },
      { label: "Monitor", value: "3.5mm zero-latency" },
      { label: "Body", value: "All-metal on desk stand" },
    ],
    stock: 45,
    tags: ["mic", "streaming"],
  },
  {
    id: "p15",
    slug: "badzy-frame-webcam",
    name: "Frame 1080p Streaming Webcam",
    nameAr: "كاميرا ويب فريم 1080p للبث",
    category: "streaming",
    price: 4250,
    rating: 4.4,
    reviews: 76,
    image: webcamImg,
    shortDesc: "1080p60 auto-focus with soft ring light and privacy shutter.",
    shortDescAr: "كاميرا بدقة 1080p و60 إطار مع إضاءة دائرية مدمجة وغطاء حماية.",
    specs: [
      { label: "Resolution", value: "1080p @ 60fps" },
      { label: "Focus", value: "Auto (10cm–∞)" },
      { label: "Light", value: "Adjustable ring" },
      { label: "Mount", value: "Universal + tripod" },
    ],
    stock: 55,
    tags: ["webcam", "streaming"],
  },
];

export const PRODUCTS = INITIAL_PRODUCTS;

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);

export const getByCategory = (cat: Category | "all") =>
  cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === cat);