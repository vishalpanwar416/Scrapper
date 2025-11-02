import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Header } from '@/components/Header';
import { SkeletonCard } from '@/components/ui';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { apiGet } from '@/lib/api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });

  useEffect(() => {
    loadLogs();
  }, [page, limit]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('📋 LOADING SCRAPING LOGS');
      console.log('═══════════════════════════════════════════════════════');

      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const query = `/api/scrape/logs?${params.toString()}`;

      console.log('Query:', query);
      console.log('Pagination:', { page, limit });

      const res = await apiGet(query);

      const logsData = res.data || [];
      const paginationData = res.pagination || { page: 1, pages: 1, total: 0, limit };

      console.log('\n✅ SUCCESS: Logs loaded');
      console.log('Logs:', {
        itemsReturned: logsData.length,
        totalCount: paginationData.total,
        currentPage: paginationData.page,
        totalPages: paginationData.pages,
        pageSize: paginationData.limit,
      });

      // Breakdown by status
      if (logsData.length > 0) {
        const statusBreakdown = {};
        logsData.forEach(log => {
          statusBreakdown[log.status] = (statusBreakdown[log.status] || 0) + 1;
        });
        console.log('Status Breakdown:', statusBreakdown);
      }

      setLogs(logsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('\n❌ LOAD LOGS FAILED');
      console.error('Query:', `/api/scrape/logs?page=${page}&limit=${limit}`);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        console.error('DIAGNOSIS: Network connectivity issue');
        console.error('Possible causes:');
        console.error('- Backend server is not running');
        console.error('- Server is not accessible');
        console.error('- Network connection issue');
      } else if (error.message.includes('400')) {
        console.error('DIAGNOSIS: Invalid query parameters');
        console.error('The page or limit parameters may be invalid');
      } else if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Endpoint not found');
      } else if (error.message.includes('500')) {
        console.error('DIAGNOSIS: Server error');
        console.error('The backend encountered an internal error');
      } else {
        console.error('DIAGNOSIS: Unknown error');
      }

      setLogs([]);
      setPagination({ page: 1, pages: 1, total: 0, limit });
    } finally {
      setLoading(false);
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <AlertCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      completed: 'success',
      failed: 'danger',
      pending: 'warning',
      'in-progress': 'primary',
    };
    return variants[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <Header placeholder="Search logs..." />

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Scraping Logs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your scraping history and status
          </p>
        </div>

        {/* Limit Selector */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Items per page:
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value) || 20);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} items
              </option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No scraping logs available yet
            </p>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {logs.map((log, index) => (
                <Card
                  key={log.id}
                  variant="elevated"
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index % 10) * 0.05}s` }}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
                      {/* Website Name */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          Website
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {log.website?.name || 'Unknown'}
                        </p>
                      </div>

                      {/* Items Scraped */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          Items Scraped
                        </p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {log.itemsScraped}
                        </p>
                      </div>

                      {/* Items Updated */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          Items Updated
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {log.itemsUpdated}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          Status
                        </p>
                        <Badge variant={getStatusBadge(log.status)} className="capitalize">
                          {log.status}
                        </Badge>
                      </div>

                      {/* When */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          When
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(log.scrapedAt)}
                        </p>
                      </div>

                      {/* Error or Icon */}
                      <div className="lg:col-span-1 flex items-center justify-end">
                        {log.errorMessage ? (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="text-red-500" size={20} />
                            <span className="text-xs text-red-600 dark:text-red-400 line-clamp-1">
                              {log.errorMessage}
                            </span>
                          </div>
                        ) : (
                          getStatusIcon(log.status)
                        )}
                      </div>
                    </div>

                    {/* Error Details */}
                    {log.errorMessage && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <p className="text-xs text-red-700 dark:text-red-300">
                          <span className="font-semibold">Error:</span> {log.errorMessage}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={pagination.page === 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Layout>
  );
}
