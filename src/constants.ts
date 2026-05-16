import { FarmingGuide, Crop } from './types';

export const FARMING_GUIDES: FarmingGuide[] = [
/* ... keeping existing guides ... */
];

export const CROP_DATA: Crop[] = [
  {
    id: 'carrot',
    name: 'Carrot',
    description: 'A root vegetable, usually orange in color, though purple, black, red, white, and yellow cultivars exist.',
    category: 'Root Vegetable',
    soilType: 'Loose, sandy, and well-draining soil',
    sunlight: 'Full sun (at least 6-8 hours)',
    watering: 'Consistent moisture; about 1 inch per week',
    pestsAndDiseases: ['Carrot rust fly', 'Wireworms', 'Leaf blight'],
    harvestSeason: 'Late summer to late autumn',
    imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'potato',
    name: 'Potato',
    description: 'A starchy terminal tuber of the perennial nightshade Solanum tuberosum.',
    category: 'Tuber',
    soilType: 'Loose, fertile, slightly acidic soil (pH 5.0 to 6.0)',
    sunlight: 'Full sun',
    watering: '1-2 inches per week; keep soil consistently moist but not soggy',
    pestsAndDiseases: ['Colorado potato beetle', 'Late blight', 'Scab'],
    harvestSeason: 'Summer to autumn, once vines have died back',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f02bad67b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'spinach',
    name: 'Spinach',
    description: 'A leafy green flowering plant native to central and western Asia.',
    category: 'Leafy Green',
    soilType: 'Well-draining, rich in organic matter (pH 6.5 to 7.0)',
    sunlight: 'Full sun to partial shade',
    watering: 'Keep soil moist but not waterlogged',
    pestsAndDiseases: ['Leaf miners', 'Aphids', 'Downy mildew'],
    harvestSeason: 'Spring and Autumn (cool season crop)',
    imageUrl: 'https://images.unsplash.com/photo-1523413555809-0fb1d4da238d?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'kale',
    name: 'Kale',
    description: 'A hardy, leafy vegetable that belongs to the cabbage family.',
    category: 'Leafy Green',
    soilType: 'Loamy, well-drained soil rich in organic matter',
    sunlight: 'Full sun to partial shade',
    watering: '1-1.5 inches per week',
    pestsAndDiseases: ['Cabbage worms', 'Aphids', 'Clubroot'],
    harvestSeason: 'Late summer through winter (tastes sweeter after frost)',
    imageUrl: 'https://images.unsplash.com/photo-1524179532782-bb3437c56919?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'bell-pepper',
    name: 'Bell Pepper',
    description: 'A cultivar group of the species Capsicum annuum, producing fruits in various colors.',
    category: 'Fruit Vegetable',
    soilType: 'Well-drained, sandy loam soil',
    sunlight: 'Full sun',
    watering: '1-2 inches per week; soil should be kept consistently moist',
    pestsAndDiseases: ['Aphids', 'Pepper maggots', 'Bacterial leaf spot'],
    harvestSeason: 'Summer to early autumn',
    imageUrl: 'https://images.unsplash.com/photo-1566275529824-cca6d008f3da?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'onion',
    name: 'Onion',
    description: 'A vegetable that is the most widely cultivated species of the genus Allium.',
    category: 'Bulb',
    soilType: 'Loose, well-drained soil rich in nitrogen',
    sunlight: 'Full sun',
    watering: 'About 1 inch per week; do not overwater',
    pestsAndDiseases: ['Onion maggots', 'Thrips', 'Downy mildew'],
    harvestSeason: 'Late summer to autumn, when tops turn yellow and fall over',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'garlic',
    name: 'Garlic',
    description: 'A species of bulbous flowering plant in the genus Allium.',
    category: 'Bulb',
    soilType: 'Well-draining, loamy soil with high organic matter',
    sunlight: 'Full sun',
    watering: 'Moderate; keep soil moist but not wet during spring growth',
    pestsAndDiseases: ['Onion maggots', 'Bulb mites', 'White rot'],
    harvestSeason: 'Mid-summer, when the lower leaves begin to turn brown',
    imageUrl: 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    description: 'A widely grown hybrid species of the genus Fragaria.',
    category: 'Berry',
    soilType: 'Well-drained, sandy loam (pH 5.5 to 6.8)',
    sunlight: 'Full sun (8+ hours preferred)',
    watering: '1 inch per week; more during fruit development',
    pestsAndDiseases: ['Slugs', 'Birds', 'Gray mold (Botrytis)'],
    harvestSeason: 'Late spring to early summer',
    imageUrl: 'https://images.unsplash.com/photo-1464960350423-93cf6b9208f6?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    description: 'Perennial flowering plants with blue or purple berries.',
    category: 'Berry',
    soilType: 'Acidic soil (pH 4.5 to 5.5), well-drained and high in organic matter',
    sunlight: 'Full sun',
    watering: '1-2 inches per week; keep roots moist but not soggy',
    pestsAndDiseases: ['Blueberry maggots', 'Birds', 'Mummy berry'],
    harvestSeason: 'Summer',
    imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    description: 'A widely-cultivated creeping vine plant in the Cucurbitaceae gourd family.',
    category: 'Fruit Vegetable',
    soilType: 'Loose, well-drained soil rich in organic matter',
    sunlight: 'Full sun',
    watering: '1-2 inches per week; frequent watering is essential for crisp fruit',
    pestsAndDiseases: ['Cucumber beetles', 'Aphids', 'Powdery mildew'],
    harvestSeason: 'Summer to early autumn',
    imageUrl: 'https://images.unsplash.com/photo-1449339043594-7f3944638300?q=80&w=800&auto=format&fit=crop'
  }
];
