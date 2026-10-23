export interface SampleScene {
  id: string;
  title: string;
  category: 'Movie' | 'Series' | 'Anime';
  description: string;
  quote: string;
  imageUrl: string;
  clues?: string;
}

export const SAMPLE_SCENES: SampleScene[] = [
  {
    id: 'interstellar',
    title: 'Interstellar (2014)',
    category: 'Movie',
    description: 'Cooper attempting the high-speed spin synchronization docking with the Endurance near Gargantua.',
    quote: '"It\'s not possible." — "No, it\'s necessary."',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    clues: 'Astronaut in cockpit spinning rapidly to match a rotating spacecraft near an immense accretion disk.',
  },
  {
    id: 'stranger-things',
    title: 'Stranger Things (Season 4)',
    category: 'Series',
    description: 'Max Mayfield suspended in mid-air in the eerie red fog of the Upside Down surrounded by floating stone ruins.',
    quote: '"And if I only could, I\'d make a deal with God..."',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    clues: 'Red storm clouds, cracked stone ruins, mysterious dark entity watching over a levitating girl with a cassette player.',
  },
  {
    id: 'spider-verse',
    title: 'Spider-Man: Into the Spider-Verse (2018)',
    category: 'Movie',
    description: 'Miles Morales in a black hooded suit executing the iconic upside-down skyscraper dive into neon city reflections.',
    quote: '"When do I know I\'m ready?" — "You won\'t. It\'s a leap of faith."',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    clues: 'Vibrant comic-book halftones, neon skyscraper skyline reflecting in rain, hooded figure falling upwards.',
  },
  {
    id: 'inception',
    title: 'Inception (2010)',
    category: 'Movie',
    description: 'Arthur engaged in zero-gravity combat in a luxury hotel corridor as the van rolls on the bridge in the layer above.',
    quote: '"You mustn\'t be afraid to dream a little bigger, darling."',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    clues: 'Rotating luxury hotel hallway with golden sconces, man floating sideways fighting security guards.',
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away (2001)',
    category: 'Anime',
    description: 'Chihiro, No-Face, and Boh as a mouse sitting quietly together on the vintage water train at pastel twilight.',
    quote: '"Once you\'ve met someone you never really forget them."',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    clues: 'Ghibli animation style, red-roofed train tracks submerged beneath a tranquil ocean at sunset, black shadow spirit with white mask.',
  },
  {
    id: 'blade-runner',
    title: 'Blade Runner 2049 (2017)',
    category: 'Movie',
    description: 'Officer K standing in the hazy radioactive sepia ruins of Las Vegas against colossal terracotta statues.',
    quote: '"I have memories, but they\'re not real. They\'re just memories."',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    clues: 'Orange radioactive dust haze, colossal female statue head emerging from sand, trench-coated detective.',
  },
];
