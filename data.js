// Built-in reference data: foods & drinks with tags, symptom lists, body regions,
// stool types. No personal data lives in this file.
'use strict';

/* ---------------- food tags ---------------- */
const TAGS = {
  G: 'Gluten', D: 'Dairy', E: 'Eggs', S: 'Soy', N: 'Nightshades', M: 'Red meat', P: 'Poultry',
  F: 'Fish', H: 'Shellfish', T: 'Tree nuts', K: 'Peanuts', L: 'Beans & legumes', C: 'Corn',
  U: 'Added sugar', A: 'Artificial sweetener', X: 'Alcohol', Y: 'Caffeine', R: 'Fried',
  Q: 'Processed', Z: 'Spicy', O: 'High-FODMAP', I: 'Citrus', W: 'Fermented', V: 'Vegetables',
  B: 'Fruit', J: 'Whole grains', c: 'Carbonated',
};
const TAG_ORDER = 'GDESNMPFHTKLCUAXYRQZOIWVBJc'.split('');

// "Name|tag codes". Tags are a best guess for a typical version of the item;
// each person can change the tags on any food from Settings → My foods.
const FOOD_LIST = `
Oatmeal|J
Steel-cut oats|J
Overnight oats|J D
Granola|J U T
Cereal (sugary)|G U Q C
Cereal (bran / whole grain)|G J
Cereal (gluten-free)|C
Cream of wheat|G
Grits|C
Pancakes|G D E U
Waffles|G D E U
French toast|G D E
Bagel|G
Bagel with cream cheese|G D
English muffin|G
Croissant|G D
Muffin|G D E U
Donut|G D E U R Q
Toast (white)|G
Toast (whole wheat)|G J
Toast (gluten-free)|
Avocado toast|G V
Butter|D
Peanut butter|K
Almond butter|T
Jam / jelly|U B
Honey|U O
Maple syrup|U
Eggs (scrambled)|E
Eggs (fried)|E
Eggs (boiled)|E
Omelet|E D
Egg white omelet|E
Bacon|M Q
Turkey bacon|P Q
Sausage (pork)|M Q
Sausage (turkey)|P Q
Ham|M Q
Hash browns|N R
Breakfast burrito|G E D N Q
Breakfast sandwich|G E D M Q
Biscuits and gravy|G D M R Q
Yogurt (plain)|D W
Yogurt (flavored)|D W U
Greek yogurt|D W
Coconut yogurt|W
Cottage cheese|D
Chia pudding|
Apple|B O
Applesauce|B O
Banana|B
Orange|B I
Grapefruit|B I
Strawberries|B
Blueberries|B
Raspberries|B
Blackberries|B O
Grapes|B
Watermelon|B O
Cantaloupe|B
Honeydew|B
Pineapple|B
Mango|B O
Peach|B O
Pear|B O
Plum|B O
Cherries|B O
Kiwi|B
Lemon / lime|B I
Dried fruit / raisins|B U O
Fruit salad|B
Avocado|V O
Salad (green)|V
Caesar salad|V D E G
Spinach|V
Kale|V
Lettuce|V
Broccoli|V O
Cauliflower|V O
Cabbage|V O
Brussels sprouts|V O
Carrots|V
Celery|V O
Cucumber|V
Bell peppers|N V
Hot peppers / jalapeño|N V Z
Tomatoes|N V
Eggplant|N V
Potatoes (baked)|N
Mashed potatoes|N D
French fries|N R Q
Tater tots|N R Q
Sweet potato|V
Onions|V O
Garlic|V O
Mushrooms|V O
Zucchini|V
Green beans|V
Peas|L V O
Corn on the cob|C V
Asparagus|V O
Beets|V
Squash|V
Coleslaw|V E O
Sauerkraut|V W
Kimchi|V W Z
Pickles|V W
Olives|V
White rice|
Brown rice|J
Quinoa|J
Pasta|G
Whole wheat pasta|G J
Gluten-free pasta|C
Bread (white)|G
Bread (whole wheat)|G J
Sourdough bread|G W
Gluten-free bread|
Rye bread|G J O
Dinner roll|G
Tortilla (flour)|G
Tortilla (corn)|C
Crackers|G Q
Rice cakes|
Couscous|G
Instant ramen|G Q S
Rice noodles|
Egg noodles|G E
Popcorn|C J
Pretzels|G Q
Potato chips|N R Q
Tortilla chips|C R Q
Chicken breast|P
Grilled chicken|P
Roast chicken|P
Fried chicken|P G R
Chicken nuggets|P G R Q
Chicken wings|P R Z
Turkey|P
Deli turkey|P Q
Deli ham|M Q
Steak|M
Ground beef|M
Hamburger|M G
Cheeseburger|M G D
Hot dog|M G Q
Pork chop|M
Pulled pork|M U
Ribs|M U
Lamb|M
Meatballs|M G E
Meatloaf|M G E
Pepperoni / salami|M Q Z
Beef jerky|M Q
Salmon|F
Tuna|F
Canned tuna|F
White fish / tilapia|F
Fish sticks|F G R Q
Sushi|F S
Shrimp|H
Crab|H
Lobster|H
Tofu|S
Tempeh|S W
Black beans|L O
Pinto beans|L O
Refried beans|L O
Chickpeas|L O
Hummus|L O
Lentils|L O
Edamame|S L
Cheese (cheddar)|D
Mozzarella|D
Parmesan|D
Cream cheese|D
Sour cream|D
String cheese|D
Heavy cream|D
Ice cream|D U
Frozen yogurt|D U
Whipped cream|D U
Almonds|T
Cashews|T O
Walnuts|T
Pecans|T
Pistachios|T O
Mixed nuts|T K
Peanuts|K
Sunflower seeds|
Pumpkin seeds|
Trail mix|T K U
Pizza|G D N Q
Pepperoni pizza|G D N M Q
Spaghetti with tomato sauce|G N
Spaghetti with meat sauce|G N M
Mac and cheese|G D
Lasagna|G D N M
Alfredo pasta|G D
Tacos (beef)|M C N Z
Tacos (chicken)|P C N
Burrito|G L D N M
Burrito bowl|L N V
Quesadilla|G D
Nachos|C D N R Q Z
Enchiladas|C D N
Chili|M L N Z
Stir fry|V S
Fried rice|E S R
Pad thai|E K S
Curry|Z D N
Ramen (restaurant)|G S M
Pho|M
Chicken noodle soup|P G Q
Tomato soup|N D
Vegetable soup|V
Turkey sandwich|G P Q
Ham and cheese sandwich|G M D Q
Grilled cheese|G D
Peanut butter & jelly|G K U
BLT|G M N Q
Sub / hoagie|G M D Q
Wrap|G
Salad with chicken|P V
Burger and fries|M G N R Q
Fish and chips|F G R N
Gyro|G M D
Casserole|G D
Pot roast|M V
Shepherd's pie|M N D
Frozen dinner|Q
Fast food meal|G R Q
Chinese takeout|S G R Q
Indian takeout|D Z N
Mexican takeout|C D N Z
Italian takeout|G D N
Granola bar|J U T
Protein bar|D S Q U
Cookies|G D E U
Cake|G D E U
Cupcake|G D E U
Brownie|G D E U
Pie|G D U
Milk chocolate|D U Y
Dark chocolate|Y
Candy|U Q
Gummy candy|U Q
Pudding|D U
Gelatin dessert|U Q
Popsicle|U
Cheese crackers|G D Q
Salsa|N V Z
Guacamole|V O
Ranch dressing|D E Q
Salad dressing (vinaigrette)|
Ketchup|N U
Mustard|
Mayonnaise|E
Hot sauce|N Z
Soy sauce|S G W
BBQ sauce|U N
Gravy|G Q
Olive oil|
Added sugar|U
Sweetener packet|A
`;

const DRINK_LIST = `
Water|
Sparkling water|c
Coffee|Y
Coffee with milk / cream|Y D
Latte|Y D
Iced coffee|Y D U
Espresso|Y
Decaf coffee|
Black tea|Y
Green tea|Y
Herbal tea|
Iced tea (sweet)|Y U
Chai latte|Y D U
Milk|D
Lactose-free milk|D
Almond milk|T
Oat milk|J
Soy milk|S
Coconut milk|
Orange juice|B I
Apple juice|B U O
Juice (other)|B U
Lemonade|I U
Soda|U c Y
Diet soda|A c Y
Root beer|U c
Ginger ale|U c
Energy drink|Y U c
Sports drink|U
Electrolyte drink|
Coconut water|
Kombucha|W c Y
Fruit smoothie|B
Protein shake (whey)|D Q
Protein shake (plant)|S Q
Hot chocolate|D U
Milkshake|D U
Bone broth|
Beer|X G c
Red wine|X
White wine|X
Cocktail|X U
Liquor / spirits|X
Hard seltzer|X c
`;

function parseList(txt, drink) {
  return txt.trim().split('\n').map(l => {
    const [name, codes = ''] = l.split('|');
    return { name: name.trim(), tags: codes.trim() ? codes.trim().split(/\s+/) : [], drink };
  });
}
const BUILTIN_FOODS = [...parseList(FOOD_LIST, false), ...parseList(DRINK_LIST, true)];

/* ---------------- meals ---------------- */
const MEALS = [
  { key: 'breakfast', label: 'Breakfast', time: '08:00' },
  { key: 'snack1', label: 'AM Snack', time: '10:30' },
  { key: 'lunch', label: 'Lunch', time: '12:30' },
  { key: 'snack2', label: 'PM Snack', time: '15:30' },
  { key: 'dinner', label: 'Dinner', time: '18:30' },
  { key: 'snack3', label: 'Evening Snack', time: '20:30' },
];

/* ---------------- stool (Bristol stool scale) ---------------- */
const STOOL_TYPES = [
  { type: 1, label: 'Separate hard lumps', note: 'Severe constipation' },
  { type: 2, label: 'Lumpy, sausage-shaped', note: 'Mild constipation' },
  { type: 3, label: 'Sausage with cracks', note: 'Normal' },
  { type: 4, label: 'Smooth, soft snake', note: 'Normal' },
  { type: 5, label: 'Soft blobs, clear edges', note: 'Lacking fiber' },
  { type: 6, label: 'Mushy, ragged pieces', note: 'Mild diarrhea' },
  { type: 7, label: 'Watery, no solid pieces', note: 'Diarrhea' },
];
const STOOL_AMOUNTS = [
  { key: 'light', label: 'Light' }, { key: 'medium', label: 'Medium' }, { key: 'heavy', label: 'Heavy' },
];
const STOOL_FLAGS = [
  { key: 'blood', label: 'Blood' }, { key: 'mucus', label: 'Mucus' }, { key: 'urgency', label: 'Urgency' },
  { key: 'pain', label: 'Pain / straining' }, { key: 'incomplete', label: 'Incomplete emptying' },
];

/* ---------------- symptoms by category ---------------- */
const SYMPTOMS = {
  joint: { label: 'Joint', items: ['Pain', 'Aching', 'Swelling', 'Stiffness', 'Morning stiffness', 'Warmth / heat', 'Redness', 'Tender to touch', 'Reduced movement', 'Clicking / grinding', 'Locking', 'Giving way'] },
  muscle: { label: 'Muscle', items: ['Ache', 'Sharp pain', 'Cramp / spasm', 'Tightness', 'Weakness', 'Tenderness', 'Twitching', 'Soreness'] },
  bone: { label: 'Bone', items: ['Deep bone ache', 'Tender on the bone', 'Sharp pain'] },
  nerve: { label: 'Nerve', items: ['Numbness', 'Tingling / pins & needles', 'Burning', 'Shooting pain', 'Electric feeling', 'Sensitive to touch'] },
  circulation: { label: 'Circulation', items: ['Cold', 'Color change (white / blue / red)', 'Swelling', 'Puffiness'] },
  skin: { label: 'Skin', items: ['Rash', 'Itching', 'Hives', 'Redness', 'Dry / flaking', 'Burning', 'Blisters', 'Bruising', 'Sores / ulcers', 'Discoloration', 'Sun sensitivity', 'Swelling'] },
  digestive: { label: 'Stomach', items: ['Pain', 'Cramping', 'Bloating', 'Gas', 'Nausea', 'Vomiting', 'Heartburn / reflux', 'Burning', 'Feeling too full', 'Loss of appetite', 'Sharp / stabbing pain', 'Dull ache', 'Tenderness'] },
  bowel: { label: 'Bowel', items: ['Pain', 'Cramping', 'Bloating', 'Gas', 'Urgency', 'Gurgling', 'Tenderness', 'Rectal pain', 'Rectal bleeding', 'Itching'] },
  organ: { label: 'Organ area', items: ['Pain', 'Dull ache', 'Sharp pain', 'Tenderness', 'Fullness / pressure', 'Swelling'] },
  pelvic: { label: 'Pelvic & urinary', items: ['Pain', 'Cramping', 'Pressure', 'Burning when urinating', 'Frequent urination', 'Urgency to urinate', 'Groin pain'] },
  chest: { label: 'Chest', items: ['Tightness', 'Pain', 'Pain when breathing', 'Shortness of breath', 'Racing / pounding heart', 'Heartburn', 'Cough', 'Wheezing'] },
  head: { label: 'Head', items: ['Headache', 'Migraine', 'Pressure', 'Dizziness', 'Scalp tenderness', 'Hair loss', 'Facial pain', 'Facial swelling'] },
  eyes: { label: 'Eyes', items: ['Dryness', 'Grittiness', 'Redness', 'Pain', 'Blurred vision', 'Light sensitivity', 'Itching', 'Swelling', 'Watery eyes'] },
  ears: { label: 'Ears', items: ['Ringing', 'Pain', 'Fullness', 'Hearing change', 'Itching'] },
  nose: { label: 'Nose & sinuses', items: ['Congestion', 'Sinus pressure', 'Runny nose', 'Nosebleed', 'Sores inside nose', 'Loss of smell'] },
  mouth: { label: 'Mouth & jaw', items: ['Mouth sores / ulcers', 'Dry mouth', 'Jaw pain', 'Swollen gums', 'Taste change', 'Burning tongue', 'Lip swelling'] },
  throat: { label: 'Throat & neck', items: ['Sore throat', 'Swollen glands', 'Difficulty swallowing', 'Hoarseness', 'Neck pain', 'Neck stiffness', 'Lump feeling'] },
  back: { label: 'Back & spine', items: ['Pain', 'Aching', 'Stiffness', 'Morning stiffness', 'Spasm', 'Radiating pain', 'Pain at rest / night'] },
  general: { label: 'Whole body', items: ['Fatigue', 'Chills', 'Fever', 'Night sweats', 'Brain fog', 'Dizziness', 'Lightheaded', 'Headache', 'Body aches', 'Weakness', 'General malaise', 'Low mood', 'Anxiety', 'Irritability', 'Poor sleep', 'High stress', 'Loss of appetite', 'Swollen glands'] },
};

// Groups used to summarize symptoms in analysis.
const SYMPTOM_GROUPS = {
  joint: 'Joints & bones', bone: 'Joints & bones', muscle: 'Muscles & nerves', nerve: 'Muscles & nerves',
  back: 'Back & spine', skin: 'Skin', digestive: 'Digestive', bowel: 'Digestive', organ: 'Digestive',
  pelvic: 'Pelvic & urinary', chest: 'Chest & breathing', head: 'Head & senses', eyes: 'Head & senses',
  ears: 'Head & senses', nose: 'Head & senses', mouth: 'Head & senses', throat: 'Head & senses',
  circulation: 'Circulation', general: 'Whole body',
};

/* ---------------- body map ----------------
 * Each figure is drawn in a 200 × 500 box. Front and back share one silhouette.
 * Shapes: e = ellipse [cx, cy, rx, ry], r = rect [x, y, w, h],
 *         c = capsule [x1, y1, x2, y2, radius].
 * Regions marked side:true are defined for the figure's left half (as you
 * look at it) and mirrored automatically. Order matters: first match wins.
 */
const FIG_W = 200, FIG_H = 500;

const BODY_SHAPES = {
  head: [100, 40, 26, 32],
  neck: [88, 66, 24, 24],
  torso: 'M62 90 C80 84 120 84 138 90 C150 94 156 104 154 120 L148 175 C146 195 148 210 152 235 L150 262 C130 274 70 274 50 262 L48 235 C52 210 54 195 52 175 L46 120 C44 104 50 94 62 90 Z',
  // limbs as stroked polylines: [points, width]
  limbs: [
    ['56,100 30,188', 26], ['30,188 16,258', 21],
    ['144,100 170,188', 26], ['170,188 184,258', 21],
    ['77,250 78,370', 42], ['78,370 80,458', 30],
    ['123,250 122,370', 42], ['122,370 120,458', 30],
  ],
  hands: [[12, 282, 11, 19], [188, 282, 11, 19]],
  feet: [[80, 478, 15, 11], [120, 478, 15, 11]],
};

const sideName = (view, isLeftHalf) => (view === 'front' ? (isLeftHalf ? 'Right' : 'Left') : (isLeftHalf ? 'Left' : 'Right'));

const REGIONS_FRONT = [
  { key: 'eyes', name: 'Eyes', e: [100, 40, 20, 7], cats: ['eyes'] },
  { key: 'ear', name: 'ear', side: true, e: [72, 42, 6, 11], cats: ['ears', 'skin'] },
  { key: 'nose', name: 'Nose & sinuses', e: [100, 52, 7, 6], cats: ['nose', 'skin'] },
  { key: 'mouth', name: 'Mouth & jaw', e: [100, 62, 16, 7], cats: ['mouth', 'skin'] },
  { key: 'head', name: 'Head & face', e: [100, 38, 28, 34], cats: ['head', 'skin'] },
  { key: 'neck', name: 'Neck & throat', r: [82, 66, 36, 24], cats: ['throat', 'muscle', 'skin'] },
  { key: 'shoulder', name: 'shoulder', side: true, e: [56, 102, 16, 15], cats: ['joint', 'muscle', 'bone', 'skin'] },
  { key: 'elbow', name: 'elbow', side: true, e: [30, 188, 13, 13], cats: ['joint', 'bone', 'nerve', 'skin'] },
  { key: 'upperarm', name: 'upper arm', side: true, c: [50, 110, 30, 188, 15], cats: ['muscle', 'bone', 'nerve', 'skin'] },
  { key: 'wrist', name: 'wrist', side: true, e: [16, 258, 11, 10], cats: ['joint', 'nerve', 'skin'] },
  { key: 'forearm', name: 'forearm', side: true, c: [30, 188, 16, 258, 13], cats: ['muscle', 'nerve', 'skin'] },
  { key: 'hand', name: 'hand & fingers', side: true, e: [12, 284, 13, 21], cats: ['joint', 'nerve', 'circulation', 'skin'] },
  { key: 'chest', name: 'Chest', r: [56, 88, 88, 62], cats: ['chest', 'muscle', 'bone', 'skin'] },
  { key: 'abd_upper_side', name: s => (s === 'Right' ? 'Upper right abdomen (liver & gallbladder area)' : 'Upper left abdomen (stomach & spleen area)'), side: true, r: [46, 150, 40, 40], cats: ['organ', 'digestive', 'skin'] },
  { key: 'abd_upper', name: 'Upper abdomen (stomach area)', r: [86, 150, 28, 40], cats: ['digestive', 'organ', 'skin'] },
  { key: 'abd_lower_side', name: s => (s === 'Right' ? 'Lower right abdomen (appendix area)' : 'Lower left abdomen (colon area)'), side: true, r: [46, 190, 40, 40], cats: ['bowel', 'organ', 'skin'] },
  { key: 'abd_lower', name: 'Lower abdomen (bladder & bowel)', r: [86, 190, 28, 40], cats: ['bowel', 'pelvic', 'skin'] },
  { key: 'hip', name: 'hip', side: true, e: [62, 250, 15, 16], cats: ['joint', 'muscle', 'bone', 'skin'] },
  { key: 'pelvis', name: 'Pelvis & groin', r: [76, 230, 48, 40], cats: ['pelvic', 'joint', 'skin'] },
  { key: 'knee', name: 'knee', side: true, e: [78, 370, 18, 16], cats: ['joint', 'bone', 'skin'] },
  { key: 'thigh', name: 'thigh', side: true, c: [77, 266, 78, 360, 23], cats: ['muscle', 'nerve', 'skin'] },
  { key: 'ankle', name: 'ankle', side: true, e: [80, 458, 14, 10], cats: ['joint', 'circulation', 'skin'] },
  { key: 'shin', name: 'shin & lower leg', side: true, c: [78, 382, 80, 450, 18], cats: ['muscle', 'bone', 'nerve', 'circulation', 'skin'] },
  { key: 'foot', name: 'foot & toes', side: true, e: [80, 480, 17, 13], cats: ['joint', 'nerve', 'circulation', 'skin'] },
];

const REGIONS_BACK = [
  { key: 'head_back', name: 'Back of head & scalp', e: [100, 38, 28, 34], cats: ['head', 'skin'] },
  { key: 'neck_back', name: 'Back of neck', r: [82, 66, 36, 24], cats: ['back', 'muscle', 'skin'] },
  { key: 'shoulder', name: 'shoulder', side: true, e: [56, 102, 16, 15], cats: ['joint', 'muscle', 'bone', 'skin'] },
  { key: 'elbow', name: 'elbow', side: true, e: [30, 188, 13, 13], cats: ['joint', 'bone', 'nerve', 'skin'] },
  { key: 'upperarm_back', name: 'back of upper arm', side: true, c: [50, 110, 30, 188, 15], cats: ['muscle', 'nerve', 'skin'] },
  { key: 'wrist', name: 'wrist', side: true, e: [16, 258, 11, 10], cats: ['joint', 'nerve', 'skin'] },
  { key: 'forearm', name: 'forearm', side: true, c: [30, 188, 16, 258, 13], cats: ['muscle', 'nerve', 'skin'] },
  { key: 'hand_back', name: 'back of hand & fingers', side: true, e: [12, 284, 13, 21], cats: ['joint', 'nerve', 'circulation', 'skin'] },
  { key: 'tailbone', name: 'Tailbone & rectal area', r: [88, 236, 24, 34], cats: ['bowel', 'bone', 'skin'] },
  { key: 'spine', name: 'Spine', r: [93, 88, 14, 148], cats: ['back', 'bone'] },
  { key: 'upperback', name: 'upper back & shoulder blade', side: true, r: [46, 88, 47, 62], cats: ['back', 'muscle', 'skin'] },
  { key: 'midback', name: 'mid back', side: true, r: [46, 150, 47, 36], cats: ['back', 'muscle', 'skin'] },
  { key: 'lowerback', name: 'lower back (kidney area)', side: true, r: [46, 186, 47, 44], cats: ['back', 'muscle', 'organ', 'skin'] },
  { key: 'buttock', name: 'buttock & hip', side: true, r: [46, 230, 47, 44], cats: ['muscle', 'joint', 'nerve', 'skin'] },
  { key: 'knee_back', name: 'back of knee', side: true, e: [78, 370, 18, 16], cats: ['joint', 'muscle', 'skin'] },
  { key: 'hamstring', name: 'back of thigh (hamstring)', side: true, c: [77, 266, 78, 360, 23], cats: ['muscle', 'nerve', 'skin'] },
  { key: 'heel', name: 'heel & Achilles', side: true, e: [80, 460, 14, 12], cats: ['joint', 'muscle', 'skin'] },
  { key: 'calf', name: 'calf', side: true, c: [78, 382, 80, 450, 18], cats: ['muscle', 'nerve', 'circulation', 'skin'] },
  { key: 'sole', name: 'sole of foot', side: true, e: [80, 480, 17, 13], cats: ['joint', 'nerve', 'circulation', 'skin'] },
];

function mirrorShape(rg) {
  const m = { ...rg };
  if (rg.e) m.e = [FIG_W - rg.e[0], rg.e[1], rg.e[2], rg.e[3]];
  if (rg.r) m.r = [FIG_W - rg.r[0] - rg.r[2], rg.r[1], rg.r[2], rg.r[3]];
  if (rg.c) m.c = [FIG_W - rg.c[0], rg.c[1], FIG_W - rg.c[2], rg.c[3], rg.c[4]];
  return m;
}

// Expand side regions into explicit left/right regions with names.
function buildRegions(defs, view) {
  const out = [];
  for (const d of defs) {
    if (!d.side) { out.push({ ...d, label: d.name, view }); continue; }
    for (const leftHalf of [true, false]) {
      const s = sideName(view, leftHalf);
      const rg = leftHalf ? { ...d } : mirrorShape(d);
      const label = typeof d.name === 'function' ? d.name(s) : `${s} ${d.name}`;
      out.push({ ...rg, key: `${d.key}_${s[0]}`, base: d.key, sideLabel: s, label, view });
    }
  }
  return out;
}
const REGIONS = { front: buildRegions(REGIONS_FRONT, 'front'), back: buildRegions(REGIONS_BACK, 'back') };

function shapeDist(rg, x, y) {
  // 0 or less = inside; otherwise a rough normalized distance.
  if (rg.e) { const [cx, cy, rx, ry] = rg.e; return Math.hypot((x - cx) / rx, (y - cy) / ry) - 1; }
  if (rg.r) {
    const [rx, ry, w, h] = rg.r;
    const dx = Math.max(rx - x, 0, x - rx - w), dy = Math.max(ry - y, 0, y - ry - h);
    return dx || dy ? Math.hypot(dx, dy) / 15 : -0.01;
  }
  const [x1, y1, x2, y2, r] = rg.c;
  const vx = x2 - x1, vy = y2 - y1, t = Math.max(0, Math.min(1, ((x - x1) * vx + (y - y1) * vy) / (vx * vx + vy * vy)));
  return Math.hypot(x - (x1 + t * vx), y - (y1 + t * vy)) / r - 1;
}

function regionAt(view, x, y) {
  const list = REGIONS[view];
  const inside = list.find(rg => shapeDist(rg, x, y) <= 0);
  if (inside) return inside;
  return list.reduce((best, rg) => (shapeDist(rg, x, y) < shapeDist(best, x, y) ? rg : best), list[0]);
}
