export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export interface PageResponse<T> {
  success?: boolean;
  data?: PageData<T>;
}

export interface PageData<T> {
  items: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  size: number;
  totalElement: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  refreshTokenExpiresIn?: number;
  tokenType?: string;
}

export type BackofficeRole = 'ADMIN' | 'BACKOFFICE_USER' | 'CLIENT_USER';

export interface ImageInfo {
  id?: string;
  urls?: Record<string, string>;
}

export interface BackofficeUser {
  id: string;
  name?: string;
  email: string;
  role: BackofficeRole;
  profileImage?: ImageInfo;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  organizationRoles?: OrganizationRoleInfo[];
}

export interface OrganizationRoleInfo {
  organizationId: string;
  organizationName: string;
  role: 'ORG_OWNER' | 'ORG_MANAGER' | 'ORG_VIEWER';
}

export interface BackofficeLoginResponse {
  backofficeUser?: BackofficeUser;
  organizationRoles?: Array<{
    organization?: Organization;
    role?: string;
  }>;
  token?: TokenDto;
}

export interface Organization {
  id: string;
  version?: number;
  name?: string;
  slug?: string;
  url?: string;
  description?: string;
  email?: string;
  handlerEmail?: string;
  handlerPhoneNumber?: string;
  isPublic?: boolean;
  image?: ImageInfo;
  totalAssertionsCount?: number;
  receivedAssertionsCount?: number;
  badgeCount?: number;
  createdAt?: string;
  updatedAt?: string;
  subscriptionInfo?: OrganizationSubscriptionInfo;
}

export interface OrganizationSubscriptionInfo {
  id?: string;
  statusCode?: string;
  statusDescription?: string;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
  trialEndsAt?: string;
  createdAt?: string;
  updatedAt?: string;
  subscription?: {
    id?: string;
    name?: string;
    code?: string;
  };
}
