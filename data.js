// Built-in reference data: foods & drinks with tags, symptom lists, body regions,
// stool types. No personal data lives in this file.
'use strict';

/* ---------------- food tags ---------------- */
const TAGS = {
  G: 'Gluten', D: 'Dairy', E: 'Eggs', S: 'Soy', N: 'Nightshades', M: 'Red meat', P: 'Poultry',
  F: 'Fish', H: 'Shellfish', T: 'Tree nuts', K: 'Peanuts', L: 'Beans & legumes', C: 'Corn',
  U: 'Added sugar', A: 'Artificial sweetener', X: 'Alcohol', Y: 'Caffeine', R: 'Fried',
  Q: 'Processed', Z: 'Spicy', O: 'High-FODMAP', I: 'Citrus', W: 'Fermented', V: 'Vegetables',
  B: 'Fruit', J: 'Whole grains', c: 'Carbonated', d: 'Artificial dyes',
};
const TAG_ORDER = 'GDESNMPFHTKLCUAXYRQZOIWVBJcd'.split('');

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

// Brand-name items. Tags reflect the usual US recipe (recipes change, and
// anyone can adjust tags in Settings → My foods). "# Section|emoji" lines set
// the emoji for the items under them; a third "|emoji" field overrides it.
const BRAND_FOOD_LIST = `
# Cereal & breakfast|🥣
Fruity Pebbles|U Q d
Cocoa Pebbles|U Q
Froot Loops|G C U Q d
Lucky Charms|J U Q d
Cheerios|J
Honey Nut Cheerios|J U
Cinnamon Toast Crunch|G J U Q
Frosted Flakes|G C U Q
Corn Flakes (Kellogg's)|G C
Rice Krispies|G U Q
Raisin Bran|G J U B O
Frosted Mini-Wheats|G J U
Cap'n Crunch|G C U Q
Cap'n Crunch's Crunch Berries|G C U Q d
Apple Jacks|G C U Q d
Cocoa Puffs|C J U Q
Trix|C J U Q
Reese's Puffs|C K U Q
Golden Grahams|G J U Q
Honey Bunches of Oats|G J C U Q
Special K|G U Q
Kix|C J
Corn Pops|C U Q
Life cereal|G J U
Rice Chex|
Wheaties|G J
Quaker instant oatmeal (flavored)|J U
Pop-Tarts (frosted strawberry)|G U Q d B|🥐
Pop-Tarts (brown sugar cinnamon)|G U Q|🥐
Eggo waffles|G E D Q|🧇
Kodiak Cakes pancakes|G J D E|🥞
Jimmy Dean breakfast sandwich|G E D M Q|🥪
Toaster Strudel|G D E U Q S|🥐
Pillsbury cinnamon rolls|G U Q S|🥐
# Bars|🍫
Nutri-Grain bar|G J U Q B
Nature Valley granola bar|J U S
Quaker Chewy granola bar|J U Q
Clif Bar|J S U
Kind bar|T U
RXBAR|E T
Larabar|T B
belVita breakfast biscuits|G J U|🍪
Nature's Bakery fig bar|G J B U O
Rice Krispies Treats|G U Q
# Cookies & snack cakes|🍪
Oreo cookies|G U Q S
Golden Oreos|G U Q S
Chips Ahoy!|G U Q S
Nutter Butter|G K U Q
Nilla Wafers|G E U Q
Teddy Grahams|G U Q
Honey Maid graham crackers|G J U
Animal crackers|G U
Fig Newtons|G B U O
Girl Scout Thin Mints|G U Q S
Girl Scout Samoas|G D U Q S
Pepperidge Farm Milano cookies|G D E U
Keebler Fudge Stripes|G D U Q S
Little Debbie Oatmeal Creme Pie|G J E U Q S
Little Debbie Cosmic Brownies|G E U Q S d|🍫
Little Debbie Zebra Cakes|G E U Q S|🍰
Little Debbie Honey Bun|G U Q R S|🍩
Little Debbie Swiss Rolls|G E U Q S|🍰
Hostess Twinkies|G E D U Q S|🍰
Hostess Ding Dongs|G E D U Q S|🍰
Hostess cupcakes|G E D U Q S|🧁
Hostess Donettes|G D E U Q R S|🍩
Krispy Kreme glazed donut|G D E U R S|🍩
Dunkin' donut|G D E U R S|🍩
Dunkin' Munchkins|G D E U R S|🍩
Starbucks cake pop|G D E U Q|🍭
Uncrustables (PB&J)|G K U Q|🥪
# Chips, crackers & popcorn|🥔
Doritos Nacho Cheese|C D N R Q O|🌮
Doritos Cool Ranch|C D N R Q O|🌮
Cheetos|C D R Q|🧀
Flamin' Hot Cheetos|C D N R Q Z d|🌶️
Takis|C N R Q Z I d|🌶️
Lay's potato chips|N R Q
Lay's Sour Cream & Onion|N D R Q O
Lay's Barbecue chips|N R Q U
Pringles|N G R Q
Ruffles|N R Q
Kettle Brand chips|N R
Sun Chips|J C R Q|🌾
Fritos|C R Q|🌽
Tostitos tortilla chips|C R Q|🌽
Funyuns|C R Q O|🧅
Cheez-It crackers|G D Q|🧀
Goldfish crackers|G D Q|🐟
Ritz crackers|G Q S|🍘
Triscuit|G J|🍘
Wheat Thins|G J U|🍘
Club crackers|G Q|🍘
Saltine crackers|G|🍘
Lance peanut butter crackers|G K Q S d|🍘
Annie's Cheddar Bunnies|G D|🐰
Pirate's Booty|C D Q|🍿
SkinnyPop popcorn|C J|🍿
Smartfood white cheddar popcorn|C J D Q|🍿
Microwave popcorn (butter)|C J D Q|🍿
Chex Mix|G C D Q S|🥨
Gardetto's|G D Q S|🥨
Rold Gold pretzels|G Q|🥨
Snyder's pretzels|G Q|🥨
Combos|G D Q|🥨
Veggie Straws|N V Q
Planters peanuts|K|🥜
Planters mixed nuts|T K|🥜
Blue Diamond almonds|T|🥜
# Candy & chocolate|🍬
M&M's|D U S Q d|🍫
Peanut M&M's|D K U S Q d|🍫
Reese's Peanut Butter Cups|D K U S Q|🍫
Reese's Pieces|K U Q d
Snickers|D K E U S Q|🍫
Kit Kat|G D U S Q|🍫
Twix|G D U S Q|🍫
Hershey's milk chocolate bar|D U S Q Y|🍫
Hershey's Kisses|D U S Q Y|🍫
Milky Way|G D E U S Q|🍫
3 Musketeers|D E U S Q|🍫
Butterfinger|K C U S Q|🍫
Almond Joy|T D U S Q|🍫
Mounds|U S Q|🍫
York Peppermint Pattie|C U Q S|🍫
Whoppers|G D U S Q|🍫
Milk Duds|D C U S Q|🍫
Ferrero Rocher|T G D U S|🍫
Lindt Lindor truffles|D U S|🍫
Dove chocolate|D U S Y|🍫
Ghirardelli chocolate|D U S Y|🍫
Cadbury Creme Egg|D U Q|🥚
Kinder Bueno|G D T U S|🍫
Skittles|C U Q d
Starburst|C U Q B d
Sour Patch Kids|C U Q d
Swedish Fish|C U Q d|🐟
Twizzlers|G C U Q d
Haribo Goldbears|C U Q|🧸
Gummy worms|C U Q d|🪱
Jolly Rancher|C U Q d
Airheads|C U Q d
Nerds|C U Q d
Life Savers|C U Q d
Tootsie Roll|D S U Q
Tootsie Pop|C U Q d|🍭
Ring Pop|C U Q d|💍
Peeps|C U Q d|🐣
Candy corn|C U Q d
Hot Tamales|C U Q Z d
Junior Mints|C U Q
Gushers|C U Q d
Fruit by the Foot|C U Q d
Fruit Roll-Ups|C U Q d
Welch's fruit snacks|C U B
Mott's fruit snacks|C U B
# Frozen treats|🍦
Ben & Jerry's ice cream|D E U
Haagen-Dazs ice cream|D E U
Klondike bar|D U S Q
Drumstick ice cream cone|G D K U S Q
Ice cream sandwich|G D U Q S
Dippin' Dots|D U Q d
Bomb Pop|C U Q d|🍭
Freeze pops|U Q d|🍭
Oreo McFlurry (McDonald's)|G D U Q S
Wendy's Frosty|D U Q
# Dairy & lunchbox|🧀
Go-Gurt|D W U Q|🥣
Yoplait yogurt|D W U|🥣
Chobani Greek yogurt|D W|🥣
Danimals yogurt|D W U Q|🥣
Babybel cheese|D
Kraft Singles|D Q
Velveeta|D Q
Sargento string cheese|D
Tillamook cheese|D
Philadelphia cream cheese|D
Lunchables (turkey & cheddar)|G D P Q|🍱
Lunchables pizza|G D N Q|🍕
Jell-O pudding cup|D U Q|🍮
Snack Pack pudding|D U Q|🍮
Jell-O gelatin cup|U Q d|🍮
Mott's applesauce|B O|🍎
GoGo squeeZ applesauce|B O|🍎
# Meals & frozen|🍽️
Kraft Mac & Cheese|G D Q|🧀
Easy Mac|G D Q|🧀
Annie's Mac & Cheese|G D|🧀
Velveeta Shells & Cheese|G D Q|🧀
Stouffer's mac & cheese|G D Q|🧀
Chef Boyardee ravioli|G M N D Q|🥫
SpaghettiOs|G N Q|🥫
Campbell's chicken noodle soup|G P Q|🥫
Campbell's tomato soup|N U Q|🥫
Cup Noodles|G S Q|🍜
Maruchan ramen|G S Q|🍜
Hot Pockets (pepperoni pizza)|G D M N Q|🥟
Bagel Bites|G D N Q|🍕
Totino's Pizza Rolls|G D N M Q|🍕
DiGiorno pizza|G D N Q|🍕
Tombstone pizza|G D N M Q|🍕
Tyson chicken nuggets|P G R Q|🍗
Dino nuggets|P G R Q|🦕
Gorton's fish sticks|F G R Q|🐟
Ore-Ida Tater Tots|N R Q|🍟
Ore-Ida french fries|N R Q|🍟
Hamburger Helper|G D M Q
Lean Cuisine meal|G D Q
Rice-A-Roni|G Q|🍚
Pillsbury crescent rolls|G Q S|🥐
Hormel chili|M L N Q|🍲
Bush's baked beans|L U O|🫘
Old El Paso taco kit|C N Q|🌮
Morningstar veggie burger|S G E D Q|🍔
Beyond Burger|L Q|🍔
Impossible Burger|S Q|🍔
Oscar Mayer hot dogs|M Q|🌭
Ball Park franks|M Q|🌭
Oscar Mayer bologna|M P Q|🥪
Jimmy Dean sausage|M Q|🥓
Spam|M Q|🥫
Slim Jim|M Q Z S|🥩
StarKist tuna|F|🐟
# Bread, spreads & sauces|🍞
Wonder Bread|G U Q S
Nature's Own bread|G U
Dave's Killer Bread|G J U
Thomas' English muffins|G
King's Hawaiian rolls|G D E U
Jif peanut butter|K U|🥜
Skippy peanut butter|K U|🥜
Nutella|T D U S|🍫
Smucker's jelly|U B|🍇
Heinz ketchup|N U|🍅
Hellmann's mayonnaise|E|🥚
Hidden Valley Ranch|D E Q O|🥗
Frank's RedHot|N Z|🌶️
Sriracha|N Z O|🌶️
Tabasco|N Z|🌶️
Sweet Baby Ray's BBQ sauce|U N O Q|🍖
Tostitos salsa|N V|🍅
Tostitos queso|D N Q|🧀
Kraft grated Parmesan|D|🧀
Land O'Lakes butter|D|🧈
I Can't Believe It's Not Butter|D S Q|🧈
Cool Whip|D C U Q|🍦
Reddi-wip|D U|🍦
# Fast food|🍔
McDonald's Big Mac|G D E M S Q
McDonald's cheeseburger|G D M Q U
McDonald's Chicken McNuggets|P G R Q|🍗
McDonald's french fries|N R Q G D|🍟
McDonald's Egg McMuffin|G D E M|🥪
McDonald's hash brown|N R Q|🥔
Chick-fil-A chicken sandwich|P G D E R|🥪
Chick-fil-A nuggets|P G D E R|🍗
Chick-fil-A waffle fries|N R|🍟
Chick-fil-A sauce|E U Q|🥫
Wendy's Baconator|G D M Q
Burger King Whopper|G M N E Q
In-N-Out burger|G D M N E
Five Guys burger|G E M
Taco Bell Crunchwrap Supreme|G C D M N Q|🌯
Taco Bell crunchy taco|C D M N Q|🌮
Taco Bell bean burrito|G L D N Q O|🌯
Chipotle burrito|G L D N M Z|🌯
Chipotle burrito bowl|L D N V|🥗
Subway sandwich|G Q|🥪
Arby's roast beef sandwich|G M Q|🥪
Domino's pizza|G D N Q|🍕
Pizza Hut pizza|G D N Q|🍕
Papa John's pizza|G D N Q|🍕
Little Caesars pizza|G D N Q|🍕
KFC fried chicken|P G D E R Z|🍗
Popeyes fried chicken|P G R Z|🍗
Popeyes biscuit|G D R|🍞
Raising Cane's chicken fingers|P G E D R|🍗
Raising Cane's sauce|E N Q|🥫
Wingstop wings|P R Z|🍗
Buffalo Wild Wings wings|P R Z D|🍗
Panda Express Orange Chicken|P G E S U R I|🍊
Panera mac & cheese|G D|🧀
`;

const BRAND_DRINK_LIST = `
# Soda|🥤
Coca-Cola|U c Y
Diet Coke|A c Y
Coke Zero|A c Y
Pepsi|U c Y
Diet Pepsi|A c Y
Sprite|U c I
Sprite Zero|A c I
Mountain Dew|U c Y I d
Dr Pepper|U c Y
Fanta Orange|U c I d
A&W Root Beer|U c
Canada Dry Ginger Ale|U c
7UP|U c I
Sunkist orange soda|U c Y d
# Sports, juice & kids' drinks|🧃
Gatorade|U d
Gatorade Zero|A d
Powerade|C U d
BodyArmor|U B
Prime Hydration|A B
Liquid I.V.|U|💧
Vitaminwater|U
Pedialyte|A|💧
Capri Sun|U B
Kool-Aid|U d
Hawaiian Punch|C U B d
SunnyD|C U I d
Juicy Juice|B
Minute Maid lemonade|U I|🍋
Simply Orange juice|B I|🍊
Tropicana orange juice|B I|🍊
# Tea & coffee|☕
Arizona Iced Tea|C U Y|🍵
Snapple|U B|🍵
Lipton iced tea|U Y|🍵
Starbucks latte|Y D
Starbucks Frappuccino|Y D U Q
Starbucks bottled Frappuccino|Y D U
Starbucks Pink Drink|Y U B|🍓
Starbucks Refresher|Y U B|🍓
Dunkin' iced coffee|Y D U
Coffee-mate creamer|D Q U|🥛
International Delight creamer|D Q U|🥛
# Energy drinks|⚡
Red Bull|U Y c
Sugar-free Red Bull|A Y c
Monster Energy|U Y c
Celsius|A Y c
Bang Energy|A Y c
# Milk & shakes|🥛
Nesquik chocolate milk|D U Q
Fairlife milk|D
Lactaid milk|D
Silk almond milk|T
Silk soy milk|S
Oatly oat milk|J
Yoo-hoo|D U Q
Ensure|D S U Q
Premier Protein shake|D A Q
Core Power protein shake|D Q
Muscle Milk|D A Q
Carnation Instant Breakfast|D U Q
Swiss Miss hot cocoa|D U Q|☕
# Sparkling water|💧
LaCroix|c
Bubly|c
Spindrift|c B I
Topo Chico|c
Smartwater|
# Alcohol|🍺
White Claw|X c|🍹
Truly hard seltzer|X c|🍹
Bud Light|X G c
Corona|X G c
Michelob Ultra|X G c
Coors Light|X G c
Modelo|X G C c
Mike's Hard Lemonade|X U I c|🍋
Twisted Tea|X Y U c
`;

// "Name|tags" or "Name|tags|emoji"; "# Section|emoji" sets a default emoji.
function parseList(txt, drink) {
  let sectionEmoji = null;
  const out = [];
  for (const l of txt.trim().split('\n')) {
    if (!l.trim()) continue;
    if (l.startsWith('#')) { sectionEmoji = l.split('|')[1]?.trim() || null; continue; }
    const [name, codes = '', emoji] = l.split('|');
    const item = { name: name.trim(), tags: codes.trim() ? codes.trim().split(/\s+/) : [], drink };
    const e = emoji?.trim() || sectionEmoji;
    if (e) item.emoji = e;
    out.push(item);
  }
  return out;
}
const BUILTIN_FOODS = [
  ...parseList(FOOD_LIST, false), ...parseList(DRINK_LIST, true),
  ...parseList(BRAND_FOOD_LIST, false), ...parseList(BRAND_DRINK_LIST, true),
];
const BUILTIN_EMOJI = new Map(BUILTIN_FOODS.filter(f => f.emoji).map(f => [f.name.toLowerCase(), f.emoji]));

/* ---------------- meals ---------------- */
const MEALS = [
  { key: 'breakfast', label: 'Breakfast', emoji: '🥞', time: '08:00' },
  { key: 'snack1', label: 'AM Snack', emoji: '🍎', time: '10:30' },
  { key: 'lunch', label: 'Lunch', emoji: '🥪', time: '12:30' },
  { key: 'snack2', label: 'PM Snack', emoji: '🍪', time: '15:30' },
  { key: 'dinner', label: 'Dinner', emoji: '🍝', time: '18:30' },
  { key: 'snack3', label: 'Evening Snack', emoji: '🌙', time: '20:30' },
];

// A friendly emoji for a food or drink, matched on its name (first match wins).
const FOOD_EMOJI = [
  ['ice cream|frozen yogurt|popsicle|milkshake', '🍦'], ['cupcake', '🧁'], ['cake|brownie|pie', '🍰'], ['cookie', '🍪'],
  ['donut', '🍩'], ['chocolate', '🍫'], ['candy|gumm|gelatin', '🍬'], ['popcorn', '🍿'], ['pretzel', '🥨'],
  ['peanut|almond|cashew|walnut|pecan|pistachio|nuts|trail mix|seeds', '🥜'], ['coffee|espresso|latte', '☕'],
  ['tea|chai', '🍵'], ['beer', '🍺'], ['wine', '🍷'], ['cocktail|liquor|seltzer', '🍹'], ['smoothie|protein shake', '🥤'],
  ['milk', '🥛'], ['juice|lemonade', '🧃'], ['soda|root beer|ginger ale|energy|sports drink|kombucha', '🥤'],
  ['water|electrolyte', '💧'], ['broth|soup|chili|stew', '🍲'], ['pancake', '🥞'], ['waffle', '🧇'], ['bacon', '🥓'],
  ['egg|omelet', '🍳'], ['bagel', '🥯'], ['croissant', '🥐'], ['oat|cereal|granola|grits|cream of wheat|yogurt|pudding', '🥣'],
  ['pizza', '🍕'], ['burger', '🍔'], ['hot dog', '🌭'], ['taco|nacho', '🌮'], ['burrito|quesadilla|enchilada|wrap', '🌯'],
  ['sandwich|sub |blt|grilled cheese|hoagie', '🥪'], ['sushi', '🍣'], ['shrimp|crab|lobster', '🍤'],
  ['salmon|tuna|fish|tilapia', '🐟'], ['chicken|turkey|nugget|wing', '🍗'], ['steak|beef|pork|ribs|lamb|meat|ham|sausage|pepperoni|jerky|gyro|roast', '🥩'],
  ['spaghetti|pasta|lasagna|mac and|alfredo|couscous', '🍝'], ['ramen|noodle|pho|pad thai', '🍜'], ['curry', '🍛'],
  ['fried rice|rice', '🍚'], ['fries|tater|hash brown', '🍟'], ['potato', '🥔'], ['chips', '🥔'], ['salad|lettuce|spinach|kale|coleslaw', '🥗'],
  ['broccoli|cauliflower|brussels|cabbage|asparagus|green bean|zucchini|squash|celery|vegetable|stir fry', '🥦'],
  ['carrot', '🥕'], ['corn', '🌽'], ['tomato|salsa|ketchup', '🍅'], ['pepper|jalap|hot sauce', '🌶️'], ['cucumber|pickle', '🥒'],
  ['mushroom', '🍄'], ['onion', '🧅'], ['garlic', '🧄'], ['avocado|guacamole', '🥑'], ['olive', '🫒'],
  ['apple', '🍎'], ['banana', '🍌'], ['orange|grapefruit', '🍊'], ['strawberr|raspberr|blackberr', '🍓'], ['blueberr', '🫐'],
  ['grape|raisin|dried fruit', '🍇'], ['watermelon|cantaloupe|honeydew', '🍉'], ['pineapple', '🍍'], ['mango', '🥭'],
  ['peach|plum', '🍑'], ['pear', '🍐'], ['cherr', '🍒'], ['kiwi', '🥝'], ['lemon|lime', '🍋'], ['fruit', '🍓'],
  ['bread|toast|roll|muffin|biscuit|tortilla|cracker|rice cake', '🍞'], ['cheese', '🧀'], ['butter', '🧈'], ['honey|syrup|jam|jelly|sugar|sweetener', '🍯'],
  ['bean|lentil|chickpea|hummus|edamame|tofu|tempeh', '🫘'], ['sauerkraut|kimchi', '🥬'],
].map(([k, e]) => [new RegExp(k, 'i'), e]);
function foodEmoji(name, drink) {
  const own = BUILTIN_EMOJI.get(String(name).trim().toLowerCase());
  if (own) return own;
  const hit = FOOD_EMOJI.find(([re]) => re.test(name));
  return hit ? hit[1] : drink ? '🥤' : '🍽️';
}

/* ---------------- stool (Bristol stool scale) ---------------- */
const STOOL_TYPES = [
  { type: 1, label: 'Hard little pebbles', note: 'Very constipated' },
  { type: 2, label: 'Lumpy & hard log', note: 'A bit constipated' },
  { type: 3, label: 'Log with cracks', note: 'Normal 👍' },
  { type: 4, label: 'Smooth & soft snake', note: 'Perfect! ⭐' },
  { type: 5, label: 'Soft blobs', note: 'A little soft' },
  { type: 6, label: 'Mushy pieces', note: 'Kind of runny' },
  { type: 7, label: 'All watery', note: 'Diarrhea' },
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

// Body outline: points down the left half (as you look at it) from the top of
// the head to the crotch; the right half is mirrored. A smooth curve is drawn
// through them. Landmarks line up with the regions below.
const BODY_HALF = [
  [100, 6], [88, 8], [79, 15], [74, 27], [73, 40], [75, 52], [79, 61], [85, 68], [89, 73],
  [89, 82], [82, 87], [70, 90], [58, 94], [49, 101], [44, 112],
  [40, 127], [35, 150], [31, 172], [28, 188], [23, 210], [18, 232], [13, 252],
  [9, 262], [4, 273], [3, 287], [5, 299], [10, 308], [16, 309], [20, 301], [23, 289], [25, 277], [26, 265],
  [29, 245], [35, 222], [41, 199], [46, 177], [50, 156], [54, 138],
  [57, 131], [59, 150], [61, 172], [60, 192], [56, 214], [53, 236], [53, 258],
  [55, 286], [58, 318], [62, 348], [63, 368], [62, 384], [60, 406], [63, 432], [67, 452],
  [68, 464], [64, 476], [64, 487], [72, 493], [86, 494], [93, 488], [93, 474], [91, 458],
  [92, 432], [94, 404], [93, 384], [94, 366], [96, 338], [98, 304], [99, 284], [100, 276],
];
function smoothClosedPath(pts) {
  // Catmull-Rom spline through the points, as cubic Bézier segments.
  const n = pts.length, f = v => +v.toFixed(1);
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]} ${p2[1]}`;
  }
  return d + ' Z';
}
const BODY_PATH = (() => {
  const mid = BODY_HALF.slice(1, -1);
  const right = mid.map(([x, y]) => [200 - x, y]).reverse();
  return smoothClosedPath([BODY_HALF[0], ...mid, BODY_HALF[BODY_HALF.length - 1], ...right]);
})();


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
