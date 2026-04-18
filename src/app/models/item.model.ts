export interface Location {
  id?: number;
  aisle: string;
  rack: string;
  shelf: string;
  notes?: string;
  display?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Item {
  id?: number;
  name: string;
  description?: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  location?: Location;
  locationDisplay?: string;
  categoryName?: string;
  category?: Category;
  photoUrl?: string;       // direct Cloudinary HTTPS URL
  photoPublicId?: string;  // for reference  
  locationId?: number;      // ← ADD      
  categoryId?: number;      // ← ADD
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemRequest {
  name: string;
  description?: string;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  locationId?: number;
  categoryId?: number;
}


export interface PriceHistory {
  id: number;
  buyingPrice: number;
  sellingPrice: number;
  changedBy: string;
  changedAt: string;
}