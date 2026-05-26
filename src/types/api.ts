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

export type BadgeAssetType = 'COMMON' | 'ORGANIZATION' | 'GENERATED' | string;

export type BadgeAssetCategoryCode =
  | 'COMMUNICATION'
  | 'MANAGEMENT'
  | 'ACHIEVEMENT'
  | 'EDUCATION'
  | 'TECHNOLOGY'
  | 'LIBRARY';

export interface BadgeAsset {
  id: string;
  type?: BadgeAssetType;
  name?: string;
  categoryCode?: BadgeAssetCategoryCode | string;
  image?: ImageInfo;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PdfTemplateOrientation = 'HORIZONTAL' | 'VERTICAL';

export interface MediaFile {
  id: string;
  fileTypeCode?: string;
  objectKey?: string;
  sizeInBytes?: number;
  mimeType?: string;
  s3Url?: string;
  variantUrls?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PdfTemplateCoordinateSystem {
  origin: string;
  unit: string;
}

export interface PdfTemplate {
  id: string;
  organizationId?: string;
  name?: string;
  pdf?: {
    id?: string;
    url?: string;
  };
  previewImage?: ImageInfo;
  pageSize?: {
    width?: number;
    height?: number;
  };
  orientation?: PdfTemplateOrientation;
  coordinateSystem?: PdfTemplateCoordinateSystem;
  fieldSchemaVersion?: {
    id?: string;
    version?: string;
  };
  fields?: unknown;
  createdAt?: string;
  updatedAt?: string;
}

export interface PdfTemplateFieldSchema {
  id: string;
  version?: string;
  schema?: unknown;
  description?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePdfTemplatePayload {
  name?: string;
  pdfId: string;
  orientation?: PdfTemplateOrientation;
  coordinateSystem: PdfTemplateCoordinateSystem;
  fields: unknown;
  fieldSchemaVersionId?: string;
}

export type UpdatePdfTemplatePayload = Partial<CreatePdfTemplatePayload>;
