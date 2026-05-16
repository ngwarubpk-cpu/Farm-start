export interface FarmingGuide {
  id: string;
  title: string;
  description: string;
  category: 'vegetables' | 'herb' | 'livestock' | 'sustainability';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  imageUrl: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Crop {
  id: string;
  name: string;
  description: string;
  category: string;
  soilType: string;
  sunlight: string;
  watering: string;
  pestsAndDiseases: string[];
  harvestSeason: string;
  imageUrl: string;
}
