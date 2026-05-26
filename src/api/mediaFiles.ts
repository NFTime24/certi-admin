import { apiRequest } from '../lib/apiClient';
import type { ApiResponse, MediaFile } from '../types/api';

export async function uploadImageFile(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  const response = await apiRequest<ApiResponse<MediaFile>>('/internal/v1/media-files/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.data?.id) {
    throw new Error(response.message || '이미지 업로드 응답에서 파일 ID를 찾을 수 없습니다.');
  }

  return response.data;
}

export async function uploadPdfFile(organizationId: string, pdf: File) {
  const formData = new FormData();
  formData.append('pdf', pdf);

  const response = await apiRequest<ApiResponse<MediaFile>>(
    `/internal/v1/organizations/${organizationId}/media-files/pdf`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.data?.id) {
    throw new Error(response.message || 'PDF 업로드 응답에서 파일 ID를 찾을 수 없습니다.');
  }

  return response.data;
}
