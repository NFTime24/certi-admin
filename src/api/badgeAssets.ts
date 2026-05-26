import { apiRequest } from '../lib/apiClient';
import type { ApiResponse, BadgeAsset, PageResponse } from '../types/api';

interface ListOrganizationBadgeAssetsParams {
  category?: string;
  page: number;
  size: number;
}

export async function listOrganizationBadgeAssets(
  organizationId: string,
  params: ListOrganizationBadgeAssetsParams,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });

  if (params.category) {
    searchParams.set('category', params.category);
  }

  const response = await apiRequest<PageResponse<BadgeAsset>>(
    `/internal/v1/organizations/${organizationId}/badge-assets?${searchParams.toString()}`,
    {
      signal,
    },
  );

  if (!response.data) {
    throw new Error('배지 에셋 목록 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}

export async function createOrganizationBadgeAsset(organizationId: string, payload: { name: string; imageId: string }) {
  const response = await apiRequest<ApiResponse<BadgeAsset>>(
    `/internal/v1/organizations/${organizationId}/badge-assets`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!response.data) {
    throw new Error(response.message || '배지 에셋 생성 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}

export async function deleteOrganizationBadgeAsset(organizationId: string, badgeAssetId: string) {
  await apiRequest<ApiResponse<void>>(`/internal/v1/organizations/${organizationId}/badge-assets/${badgeAssetId}`, {
    method: 'DELETE',
  });
}
