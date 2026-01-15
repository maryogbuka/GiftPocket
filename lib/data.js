import { Gift, Calendar, Star } from "lucide-react";

// Example Categories
export const categories = [
  { id: 'all', name: 'All', icon: Gift },
  { id: 'birthday', name: 'Birthday', icon: Calendar },
  { id: 'anniversary', name: 'Anniversary', icon: Star },
];

// Example Nigerian Gifts
export const nigerianGifts = [
  {
    id: 1,
    name: 'Suya Spice Box',
    description: 'Authentic Nigerian suya spices to spice up any meal.',
    category: 'birthday',
    price: 2500,
    popular: true,
    rating: 4.7,
  },
  {
    id: 2,
    name: 'Aso Ebi Fabric',
    description: 'High-quality traditional Nigerian fabric for special occasions.',
    category: 'anniversary',
    price: 12000,
    popular: false,
    rating: 4.3,
  },
  {
    id: 3,
    name: 'Palm Wine Pack',
    description: 'Freshly bottled Nigerian palm wine, perfect for celebrations.',
    category: 'birthday',
    price: 5000,
    popular: true,
    rating: 4.8,
  },
  {
    id: 4,
    name: 'Custom Gift Card',
    description: 'Let your loved one choose their own gift with a gift card.',
    category: 'all',
    price: 0, // custom amount
    popular: false,
    rating: 4.5,
  },
];
