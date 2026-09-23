export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  reviews?: ProductReview[];
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

// DummyJSON returns either string[] or { slug, name, url }[] depending on version.
// We normalize everything to a plain slug string in the service layer.
export type CategoryRaw = string | { slug: string; name: string; url: string };

export type SortableField = "price" | "rating" | "title";
export type SortOrder = "asc" | "desc";

export interface ProductQuery {
  limit: number;
  skip: number;
  sortBy?: SortableField;
  order?: SortOrder;
}

export interface ProductFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
}
