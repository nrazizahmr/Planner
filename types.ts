
export enum PlaceCategory {
  RESTAURANT = 'Restaurant',
  CAFE = 'Cafe',
  SIGHTSEEING = 'Sightseeing',
  HOTEL = 'Hotel',
  SHOPPING = 'Shopping',
  ACTIVITY = 'Activity',
  OTHER = 'Other'
}

export interface ReferenceLink {
  title: string;
  url: string;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  description: string;
  references: ReferenceLink[];
  placePhotoUrl?: string;
  menuPhotoUrl?: string;
  rating?: number;
  tags: string[];
  createdAt: number;
}

export interface GeminiPlaceInfo {
  name: string;
  category: PlaceCategory;
  address: string;
  description: string;
  tags: string[];
  rating?: number;
}
