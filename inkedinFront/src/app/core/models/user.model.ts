export interface User {
  id: string;
  name?: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  cloudinaryPublicId?: string;
  bio?: string;
  userType: 'user' | 'artist' | 'collector' | 'gallery' | 'admin';
  isVerified: boolean;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  specialties?: string[];
  portfolioImages?: string[];
  pricePerHour?: number | null;
  rating: string;
  reviewsCount: number;
  experience?: string | null;
  businessHours?: Record<string, any>;
  socialLinks?: Record<string, any>;
  studioName?: string | null;
  studioAddress?: string | null;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
