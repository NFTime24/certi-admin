import { apiRequest } from '../lib/apiClient';
import type { ApiResponse, CreatePdfTemplatePayload, PageResponse, PdfTemplate, UpdatePdfTemplatePayload } from '../types/api';

interface ListPdfTemplatesParams {
  page: number;
  size: number;
}

export async function listPdfTemplates(organizationId: string, params: ListPdfTemplatesParams, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });

  const response = await apiRequest<PageResponse<PdfTemplate>>(
    `/internal/v1/organizations/${organizationId}/pdf-templates?${searchParams.toString()}`,
    {
      signal,
    },
  );

  if (!response.data) {
    throw new Error('PDF 템플릿 목록 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}

export async function createPdfTemplate(organizationId: string, payload: CreatePdfTemplatePayload) {
  const response = await apiRequest<ApiResponse<PdfTemplate>>(
    `/internal/v1/organizations/${organizationId}/pdf-templates`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  if (!response.data) {
    throw new Error(response.message || 'PDF 템플릿 생성 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}

export async function updatePdfTemplate(organizationId: string, templateId: string, payload: UpdatePdfTemplatePayload) {
  const response = await apiRequest<ApiResponse<PdfTemplate>>(
    `/internal/v1/organizations/${organizationId}/pdf-templates/${templateId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  if (!response.data) {
    throw new Error(response.message || 'PDF 템플릿 수정 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}

export async function deletePdfTemplate(organizationId: string, templateId: string) {
  await apiRequest<ApiResponse<void>>(`/internal/v1/organizations/${organizationId}/pdf-templates/${templateId}`, {
    method: 'DELETE',
  });
}
