import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { listOrganizations } from '../api/organizations';
import type { Organization, PageData, Pagination } from '../types/api';
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

const defaultPageData: PageData<Organization> = {
  items: [],
  pagination: defaultPagination,
};

export function OrganizationsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pageData, setPageData] = useState<PageData<Organization>>(defaultPageData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrganizations() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await listOrganizations(
          {
            search: appliedSearch,
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

        setErrorMessage(error instanceof Error ? error.message : '조직 목록을 불러올 수 없습니다.');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadOrganizations();

    return () => {
      controller.abort();
    };
  }, [appliedSearch, page, rowsPerPage, reloadKey]);

  const visibleRows = pageData.items;
  const totalCount = pageData.pagination.totalElement;
  const heading = useMemo(() => {
    if (appliedSearch) {
      return `"${appliedSearch}" 검색 결과`;
    }

    return 'Organization 목록';
  }, [appliedSearch]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(0);
    setAppliedSearch(searchInput.trim());
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 2 }}>
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
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'stretch', md: 'flex-end' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="h5" component="h1">
                {heading}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                총 {formatNumber(totalCount)}개
              </Typography>
            </Box>

            <Stack
              component="form"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              onSubmit={handleSearchSubmit}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <TextField
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="조직명 또는 slug 검색"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ minWidth: { xs: '100%', sm: 320 } }}
              />
              <Button type="submit" variant="contained" startIcon={<SearchRoundedIcon />}>
                검색
              </Button>
              <Tooltip title="새로고침">
                <IconButton
                  color="primary"
                  onClick={() => setReloadKey((key) => key + 1)}
                  aria-label="refresh"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <RefreshRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <Paper elevation={0} sx={{ overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2 }}>
            {isLoading ? <LinearProgress /> : <Box sx={{ height: 4 }} />}
            <TableContainer sx={{ minHeight: 360 }}>
              <Table stickyHeader size="small" aria-label="organization list table">
                <TableHead>
                  <TableRow>
                    <TableCell>조직명</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>공개</TableCell>
                    <TableCell align="right">Badge</TableCell>
                    <TableCell align="right">발급</TableCell>
                    <TableCell align="right">수령</TableCell>
                    <TableCell>구독 상태</TableCell>
                    <TableCell>생성일</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleRows.map((organization) => (
                    <TableRow
                      hover
                      key={organization.id}
                      tabIndex={0}
                      onClick={() => navigate(`/organizations/${organization.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          navigate(`/organizations/${organization.id}`);
                        }
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {organization.name || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {organization.id}
                        </Typography>
                      </TableCell>
                      <TableCell>{organization.slug || '-'}</TableCell>
                      <TableCell>{organization.email || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={organization.isPublic ? 'Public' : 'Private'}
                          color={organization.isPublic ? 'success' : 'default'}
                          variant={organization.isPublic ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="right">{formatNumber(organization.badgeCount)}</TableCell>
                      <TableCell align="right">{formatNumber(organization.totalAssertionsCount)}</TableCell>
                      <TableCell align="right">{formatNumber(organization.receivedAssertionsCount)}</TableCell>
                      <TableCell>{getSubscriptionStatus(organization)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(organization.createdAt)}</TableCell>
                    </TableRow>
                  ))}

                  {!isLoading && visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">조회된 organization이 없습니다.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {isLoading && visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <CircularProgress size={28} aria-label="loading organizations" />
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              rowsPerPage={rowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              onPageChange={(_, nextPage) => setPage(nextPage)}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="페이지 크기"
            />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

function getSubscriptionStatus(organization: Organization) {
  return (
    organization.subscriptionInfo?.statusDescription ||
    organization.subscriptionInfo?.statusCode ||
    organization.subscriptionInfo?.subscription?.name ||
    '-'
  );
}
