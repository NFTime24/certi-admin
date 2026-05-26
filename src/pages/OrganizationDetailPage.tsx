import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { createOrganizationBadgeAsset, deleteOrganizationBadgeAsset, listOrganizationBadgeAssets } from '../api/badgeAssets';
import { uploadImageFile, uploadPdfFile } from '../api/mediaFiles';
import { getOrganization } from '../api/organizations';
import { listPdfTemplateFieldSchemas } from '../api/pdfTemplateFieldSchemas';
import { createPdfTemplate, deletePdfTemplate, listPdfTemplates, updatePdfTemplate } from '../api/pdfTemplates';
import { useAuth } from '../auth/AuthContext';
import type {
  BadgeAsset,
  Organization,
  PageData,
  Pagination,
  PdfTemplate,
  PdfTemplateFieldSchema,
  PdfTemplateOrientation,
} from '../types/api';
import { formatDateTime, formatNumber } from '../utils/format';

const defaultPagination: Pagination = {
  page: 1,
  size: 20,
  totalElement: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

const defaultBadgeAssetPageData: PageData<BadgeAsset> = {
  items: [],
  pagination: defaultPagination,
};

const defaultPdfTemplatePageData: PageData<PdfTemplate> = {
  items: [],
  pagination: defaultPagination,
};

const badgeAssetCategories = [
  'COMMUNICATION',
  'MANAGEMENT',
  'ACHIEVEMENT',
  'EDUCATION',
  'TECHNOLOGY',
  'LIBRARY',
];

const orientationOptions: PdfTemplateOrientation[] = ['HORIZONTAL', 'VERTICAL'];
const coordinateOriginOptions = ['bottom-left', 'top-left'] as const;
const coordinateUnitOptions = ['pt', 'px'] as const;

interface BadgeAssetFormState {
  name: string;
  imageFile: File | null;
}

interface PdfTemplateFormState {
  mode: 'create' | 'edit';
  templateId?: string;
  name: string;
  orientation: PdfTemplateOrientation;
  origin: string;
  unit: string;
  fieldSchemaVersionId: string;
  fieldsJson: string;
  pdfFile: File | null;
}

const initialBadgeAssetForm: BadgeAssetFormState = {
  name: '',
  imageFile: null,
};

const initialPdfTemplateForm: PdfTemplateFormState = {
  mode: 'create',
  name: '',
  orientation: 'HORIZONTAL',
  origin: 'top-left',
  unit: 'pt',
  fieldSchemaVersionId: '',
  fieldsJson: '{}',
  pdfFile: null,
};

export function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const currentOrganizationId = organizationId ?? '';
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationError, setOrganizationError] = useState('');
  const [isOrganizationLoading, setIsOrganizationLoading] = useState(false);

  useEffect(() => {
    if (!currentOrganizationId) {
      return;
    }

    const controller = new AbortController();

    async function loadOrganization() {
      setIsOrganizationLoading(true);
      setOrganizationError('');

      try {
        setOrganization(await getOrganization(currentOrganizationId, controller.signal));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setOrganizationError(error instanceof Error ? error.message : '조직 정보를 불러올 수 없습니다.');
      } finally {
        if (!controller.signal.aborted) {
          setIsOrganizationLoading(false);
        }
      }
    }

    loadOrganization();

    return () => {
      controller.abort();
    };
  }, [currentOrganizationId]);

  if (!currentOrganizationId) {
    return <Navigate to="/organizations" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Tooltip title="목록으로">
            <IconButton color="inherit" onClick={() => navigate('/organizations')} aria-label="back to organizations">
              <ArrowBackRoundedIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 800 }}>
            Certi Admin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.email}
          </Typography>
          <Tooltip title="로그아웃">
            <IconButton color="inherit" edge="end" onClick={logout} aria-label="logout">
              <LogoutRoundedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Stack spacing={2.5}>
          {organizationError ? <Alert severity="error">{organizationError}</Alert> : null}

          <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: { xs: 2, md: 3 } }}>
            {isOrganizationLoading ? <LinearProgress sx={{ mb: 2 }} /> : null}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}>
              <Avatar src={getImageUrl(organization?.image)} sx={{ width: 56, height: 56 }}>
                {organization?.name?.slice(0, 1) || 'O'}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="h5" component="h1">
                  {organization?.name || 'Organization'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, wordBreak: 'break-all' }}>
                  {currentOrganizationId}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip size="small" label={organization?.slug || 'slug 없음'} />
                <Chip
                  size="small"
                  label={organization?.isPublic ? 'Public' : 'Private'}
                  color={organization?.isPublic ? 'success' : 'default'}
                  variant={organization?.isPublic ? 'filled' : 'outlined'}
                />
              </Stack>
            </Stack>
          </Paper>

          <BadgeAssetSection organizationId={currentOrganizationId} />
          <PdfTemplateSection organizationId={currentOrganizationId} />
        </Stack>
      </Container>
    </Box>
  );
}

function BadgeAssetSection({ organizationId }: { organizationId: string }) {
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageData, setPageData] = useState<PageData<BadgeAsset>>(defaultBadgeAssetPageData);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<BadgeAssetFormState>(initialBadgeAssetForm);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBadgeAssets() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await listOrganizationBadgeAssets(
          organizationId,
          {
            category: category || undefined,
            page: page + 1,
            size: rowsPerPage,
          },
          controller.signal,
        );

        setPageData(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : '배지 에셋 목록을 불러올 수 없습니다.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadBadgeAssets();

    return () => {
      controller.abort();
    };
  }, [category, organizationId, page, reloadKey, rowsPerPage]);

  const organizationAssets = useMemo(
    () => pageData.items.filter((asset) => asset.type === 'ORGANIZATION'),
    [pageData.items],
  );

  const handleOpenDialog = () => {
    setForm(initialBadgeAssetForm);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('에셋 이름을 입력하세요.');
      return;
    }

    if (!form.imageFile) {
      setFormError('이미지 파일을 선택하세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const image = await uploadImageFile(form.imageFile);
      await createOrganizationBadgeAsset(organizationId, {
        name: form.name.trim(),
        imageId: image.id,
      });
      setIsDialogOpen(false);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '배지 에셋을 생성할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (asset: BadgeAsset) => {
    if (!window.confirm(`${asset.name || '이 배지 에셋'}을 삭제할까요?`)) {
      return;
    }

    try {
      await deleteOrganizationBadgeAsset(organizationId, asset.id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '배지 에셋을 삭제할 수 없습니다.');
    }
  };

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <SectionHeader
        title="Organization BadgeAsset"
        description={`현재 페이지 ORGANIZATION 타입 ${formatNumber(organizationAssets.length)}개`}
        actions={
          <>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="badge-category-label">Category</InputLabel>
              <Select
                labelId="badge-category-label"
                label="Category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">전체</MenuItem>
                {badgeAssetCategories.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="새로고침">
              <IconButton
                color="primary"
                onClick={() => setReloadKey((key) => key + 1)}
                aria-label="refresh badge assets"
                sx={{ border: 1, borderColor: 'divider' }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenDialog}>
              추가
            </Button>
          </>
        }
      />

      {isLoading ? <LinearProgress /> : <Box sx={{ height: 4 }} />}
      {errorMessage ? <Alert severity="error" sx={{ m: 2 }}>{errorMessage}</Alert> : null}

      <TableContainer sx={{ minHeight: 260 }}>
        <Table size="small" aria-label="organization badge assets">
          <TableHead>
            <TableRow>
              <TableCell>이미지</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell align="right">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizationAssets.map((asset) => (
              <TableRow hover key={asset.id}>
                <TableCell>
                  <Avatar src={getImageUrl(asset.image)} variant="rounded" sx={{ width: 44, height: 44 }} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {asset.name || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {asset.id}
                  </Typography>
                </TableCell>
                <TableCell>{asset.categoryCode || '-'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(asset.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="삭제">
                    <IconButton color="error" onClick={() => handleDelete(asset)} aria-label="delete badge asset">
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && organizationAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">ORGANIZATION 타입 BadgeAsset이 없습니다.</Typography>
                </TableCell>
              </TableRow>
            ) : null}

            {isLoading && organizationAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} aria-label="loading badge assets" />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pageData.pagination.totalElement}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        labelRowsPerPage="페이지 크기"
      />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>Organization BadgeAsset 추가</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <TextField
                label="이름"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="이미지"
                type="file"
                required
                fullWidth
                slotProps={{ htmlInput: { accept: 'image/*' }, inputLabel: { shrink: true } }}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setForm((current) => ({ ...current, imageFile: event.target.files?.[0] ?? null }))
                }
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? '저장 중' : '저장'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Paper>
  );
}

function PdfTemplateSection({ organizationId }: { organizationId: string }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageData, setPageData] = useState<PageData<PdfTemplate>>(defaultPdfTemplatePageData);
  const [fieldSchemas, setFieldSchemas] = useState<PdfTemplateFieldSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFieldSchemaLoading, setIsFieldSchemaLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldSchemaErrorMessage, setFieldSchemaErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<PdfTemplateFormState>(initialPdfTemplateForm);
  const [previewTemplate, setPreviewTemplate] = useState<PdfTemplate | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const schemaById = useMemo(() => new Map(fieldSchemas.map((schema) => [schema.id, schema])), [fieldSchemas]);
  const defaultFieldSchema = useMemo(() => fieldSchemas.find((schema) => schema.isDefault), [fieldSchemas]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPdfTemplates() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await listPdfTemplates(
          organizationId,
          {
            page: page + 1,
            size: rowsPerPage,
          },
          controller.signal,
        );

        setPageData(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'PDF 템플릿 목록을 불러올 수 없습니다.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadPdfTemplates();

    return () => {
      controller.abort();
    };
  }, [organizationId, page, reloadKey, rowsPerPage]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFieldSchemas() {
      setIsFieldSchemaLoading(true);
      setFieldSchemaErrorMessage('');

      try {
        const data = await listPdfTemplateFieldSchemas(
          {
            page: 1,
            size: 100,
          },
          controller.signal,
        );

        setFieldSchemas(data.items);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        setFieldSchemaErrorMessage(error instanceof Error ? error.message : 'Field schema 목록을 불러올 수 없습니다.');
      } finally {
        if (!controller.signal.aborted) {
          setIsFieldSchemaLoading(false);
        }
      }
    }

    loadFieldSchemas();

    return () => {
      controller.abort();
    };
  }, [reloadKey]);

  const handleCreateOpen = () => {
    setForm({
      ...initialPdfTemplateForm,
      fieldSchemaVersionId: defaultFieldSchema?.id || '',
    });
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleEditOpen = (template: PdfTemplate) => {
    setForm({
      mode: 'edit',
      templateId: template.id,
      name: template.name || '',
      orientation: template.orientation || 'HORIZONTAL',
      origin: normalizeCoordinateOrigin(template.coordinateSystem?.origin),
      unit: normalizeCoordinateUnit(template.coordinateSystem?.unit),
      fieldSchemaVersionId: template.fieldSchemaVersion?.id || '',
      fieldsJson: JSON.stringify(template.fields ?? {}, null, 2),
      pdfFile: null,
    });
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim()) {
      setFormError('템플릿 이름을 입력하세요.');
      return;
    }

    if (form.mode === 'create' && !form.pdfFile) {
      setFormError('PDF 파일을 선택하세요.');
      return;
    }

    let parsedFields: unknown;

    try {
      parsedFields = JSON.parse(form.fieldsJson);
    } catch {
      setFormError('Fields JSON 형식이 올바르지 않습니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedPdf = form.pdfFile ? await uploadPdfFile(organizationId, form.pdfFile) : null;
      const payload = {
        name: form.name.trim(),
        orientation: form.orientation,
        coordinateSystem: {
          origin: form.origin.trim(),
          unit: form.unit.trim(),
        },
        fields: parsedFields,
        ...(form.fieldSchemaVersionId.trim()
          ? {
              fieldSchemaVersionId: form.fieldSchemaVersionId.trim(),
            }
          : {}),
        ...(uploadedPdf
          ? {
              pdfId: uploadedPdf.id,
            }
          : {}),
      };

      if (form.mode === 'create') {
        if (!uploadedPdf) {
          throw new Error('PDF 업로드 응답을 확인할 수 없습니다.');
        }

        await createPdfTemplate(organizationId, {
          ...payload,
          pdfId: uploadedPdf.id,
        });
      } else if (form.templateId) {
        await updatePdfTemplate(organizationId, form.templateId, payload);
      }

      setIsDialogOpen(false);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'PDF 템플릿을 저장할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (template: PdfTemplate) => {
    if (!window.confirm(`${template.name || '이 PDF 템플릿'}을 삭제할까요?`)) {
      return;
    }

    try {
      await deletePdfTemplate(organizationId, template.id);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'PDF 템플릿을 삭제할 수 없습니다.');
    }
  };

  return (
    <Paper elevation={0} sx={{ overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <SectionHeader
        title="PDFTemplate"
        description={`총 ${formatNumber(pageData.pagination.totalElement)}개 · Field schema ${formatNumber(fieldSchemas.length)}개`}
        actions={
          <>
            <Tooltip title="새로고침">
              <IconButton
                color="primary"
                onClick={() => setReloadKey((key) => key + 1)}
                aria-label="refresh pdf templates"
                sx={{ border: 1, borderColor: 'divider' }}
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleCreateOpen}>
              추가
            </Button>
          </>
        }
      />

      {isLoading ? <LinearProgress /> : <Box sx={{ height: 4 }} />}
      {errorMessage ? <Alert severity="error" sx={{ m: 2 }}>{errorMessage}</Alert> : null}
      {fieldSchemaErrorMessage ? (
        <Alert severity="warning" sx={{ m: 2 }}>
          {fieldSchemaErrorMessage}
        </Alert>
      ) : null}

      <TableContainer sx={{ minHeight: 260 }}>
        <Table size="small" aria-label="pdf templates">
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>방향</TableCell>
              <TableCell>좌표계</TableCell>
              <TableCell>Page Size</TableCell>
              <TableCell>Schema</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell align="right">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pageData.items.map((template) => (
              <TableRow
                hover
                key={template.id}
                tabIndex={0}
                onClick={() => setPreviewTemplate(template)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setPreviewTemplate(template);
                  }
                }}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell sx={{ minWidth: 220 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {template.name || '-'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {template.id}
                  </Typography>
                </TableCell>
                <TableCell>{template.orientation || '-'}</TableCell>
                <TableCell>
                  {template.coordinateSystem
                    ? `${template.coordinateSystem.origin} / ${template.coordinateSystem.unit}`
                    : '-'}
                </TableCell>
                <TableCell>{formatPageSize(template)}</TableCell>
                <TableCell>{renderTemplateSchema(template, schemaById)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(template.createdAt)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="수정">
                    <IconButton
                      color="primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditOpen(template);
                      }}
                      aria-label="edit pdf template"
                    >
                      <EditRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton
                      color="error"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(template);
                      }}
                      aria-label="delete pdf template"
                    >
                      <DeleteRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && pageData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">PDFTemplate이 없습니다.</Typography>
                </TableCell>
              </TableRow>
            ) : null}

            {isLoading && pageData.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} aria-label="loading pdf templates" />
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={pageData.pagination.totalElement}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 20, 50]}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(Number(event.target.value));
          setPage(0);
        }}
        labelRowsPerPage="페이지 크기"
      />

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="md">
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>{form.mode === 'create' ? 'PDFTemplate 추가' : 'PDFTemplate 수정'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError ? <Alert severity="error">{formError}</Alert> : null}
              <TextField
                label="이름"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
                fullWidth
              />
              <TextField
                label={form.mode === 'create' ? 'PDF 파일' : 'PDF 파일 교체'}
                type="file"
                required={form.mode === 'create'}
                fullWidth
                slotProps={{ htmlInput: { accept: 'application/pdf' }, inputLabel: { shrink: true } }}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setForm((current) => ({ ...current, pdfFile: event.target.files?.[0] ?? null }))
                }
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="pdf-orientation-label">Orientation</InputLabel>
                  <Select
                    labelId="pdf-orientation-label"
                    label="Orientation"
                    value={form.orientation}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        orientation: event.target.value as PdfTemplateOrientation,
                      }))
                    }
                  >
                    {orientationOptions.map((orientation) => (
                      <MenuItem key={orientation} value={orientation}>
                        {orientation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="pdf-origin-label">좌표 원점</InputLabel>
                  <Select
                    labelId="pdf-origin-label"
                    label="좌표 원점"
                    value={form.origin}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        origin: event.target.value,
                      }))
                    }
                  >
                    {coordinateOriginOptions.map((origin) => (
                      <MenuItem key={origin} value={origin}>
                        {origin}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="pdf-unit-label">좌표 단위</InputLabel>
                  <Select
                    labelId="pdf-unit-label"
                    label="좌표 단위"
                    value={form.unit}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        unit: event.target.value,
                      }))
                    }
                  >
                    {coordinateUnitOptions.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <FormControl size="small" fullWidth disabled={isFieldSchemaLoading || fieldSchemas.length === 0}>
                <InputLabel id="field-schema-label">Field Schema</InputLabel>
                <Select
                  labelId="field-schema-label"
                  label="Field Schema"
                  value={form.fieldSchemaVersionId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fieldSchemaVersionId: event.target.value,
                    }))
                  }
                >
                  <MenuItem value="">선택 안 함</MenuItem>
                  {form.fieldSchemaVersionId && !schemaById.has(form.fieldSchemaVersionId) ? (
                    <MenuItem value={form.fieldSchemaVersionId}>
                      현재 스키마 ({form.fieldSchemaVersionId})
                    </MenuItem>
                  ) : null}
                  {fieldSchemas.map((schema) => (
                    <MenuItem key={schema.id} value={schema.id}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {formatFieldSchemaName(schema)}
                        </Typography>
                        {schema.isDefault ? <Chip size="small" color="primary" label="Default" /> : null}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Fields JSON"
                value={form.fieldsJson}
                onChange={(event) => setForm((current) => ({ ...current, fieldsJson: event.target.value }))}
                multiline
                minRows={8}
                required
                fullWidth
                sx={{ '& textarea': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? '저장 중' : '저장'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(previewTemplate)} onClose={() => setPreviewTemplate(null)} fullWidth maxWidth="md">
        <DialogTitle>{previewTemplate?.name || 'PDFTemplate 미리보기'}</DialogTitle>
        <DialogContent>
          {previewTemplate ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {getImageUrl(previewTemplate.previewImage) ? (
                <Box
                  component="img"
                  src={getImageUrl(previewTemplate.previewImage)}
                  alt={`${previewTemplate.name || 'PDFTemplate'} preview`}
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.default',
                  }}
                />
              ) : (
                <Alert severity="info">미리보기 이미지가 없습니다.</Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {previewTemplate.id}
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTemplate(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function SectionHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions: ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        p: 2,
      }}
    >
      <Box>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
        {actions}
      </Stack>
    </Stack>
  );
}

function getImageUrl(image?: { urls?: Record<string, string> }) {
  if (!image?.urls) {
    return undefined;
  }

  return image.urls.MEDIUM || image.urls.SMALL || image.urls.ORIGINAL || Object.values(image.urls)[0];
}

function formatPageSize(template: PdfTemplate) {
  if (!template.pageSize?.width || !template.pageSize.height) {
    return '-';
  }

  return `${template.pageSize.width} x ${template.pageSize.height}`;
}

function renderTemplateSchema(template: PdfTemplate, schemaById: Map<string, PdfTemplateFieldSchema>) {
  const schemaId = template.fieldSchemaVersion?.id;

  if (!schemaId) {
    return '-';
  }

  const schema = schemaById.get(schemaId);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2">{schema ? formatFieldSchemaName(schema) : template.fieldSchemaVersion?.version || schemaId}</Typography>
      {schema?.isDefault ? <Chip size="small" color="primary" label="Default" /> : null}
    </Stack>
  );
}

function formatFieldSchemaName(schema: PdfTemplateFieldSchema) {
  return schema.version || schema.id;
}

function normalizeCoordinateOrigin(origin?: string) {
  return coordinateOriginOptions.find((option) => option === origin) || 'top-left';
}

function normalizeCoordinateUnit(unit?: string) {
  return coordinateUnitOptions.find((option) => option === unit) || 'pt';
}
