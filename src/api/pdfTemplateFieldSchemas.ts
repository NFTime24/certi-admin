import { apiRequest } from '../lib/apiClient';
import type { PageResponse, PdfTemplateFieldSchema } from '../types/api';

interface ListPdfTemplateFieldSchemasParams {
  page: number;
  size: number;
}

export async function listPdfTemplateFieldSchemas(params: ListPdfTemplateFieldSchemasParams, signal?: AbortSignal) {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    size: String(params.size),
  });

  const response = await apiRequest<PageResponse<PdfTemplateFieldSchema>>(
    `/internal/v1/admin/pdf-template-field-schemas?${searchParams.toString()}`,
    {
      signal,
    },
  );

  if (!response.data) {
    throw new Error('PDF 템플릿 field schema 목록 응답 데이터가 비어 있습니다.');
  }

  return response.data;
}
