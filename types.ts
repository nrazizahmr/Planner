
export enum PlaceCategory {
  RESTAURANT = 'Restaurant',
  CAFE = 'Cafe',
  SIGHTSEEING = 'Sightseeing',
  HOTEL = 'Hotel',
  SHOPPING = 'Shopping',
  ACTIVITY = 'Activity',
  OTHER = 'Other'
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  description: string;
  referenceUrl: string;      // maps to reference_url in SQL
  reference_url?: string;    // support direct mapping from Supabase
  placePhotoUrl?: string;    // maps to place_photo_url in SQL
  place_photo_url?: string;  // support direct mapping
  menuPhotoUrl?: string;     // maps to menu_photo_url in SQL
  menu_photo_url?: string;   // support direct mapping
  rating?: number;
  tags: string[];
  created_at?: string;
  createdAt?: number;
}

export interface GeminiPlaceInfo {
  name: string;
  category: PlaceCategory;
  address: string;
  description: string;
  tags: string[];
  rating?: number;
}