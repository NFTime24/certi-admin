import { apiRequest } from '../lib/apiClient';
import type { Organization, PageResponse } from '../types/api';

interface ListOrganizationsParams {
  search?: string;
  page: number;
  size: number;
}

export async function listOrganizations(params: ListOrganizationsParams, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });

  if (params.search) {
    searchParams.set('search', params.search);
  }

  const response = await apiRequest<PageResponse<Organization>>(
    `/internal/v1/organizations?${searchParams.toString()}`,
    {
      signal,
    },
  );

  if (!response.data) {
    throw new Error('조직 목록 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}
