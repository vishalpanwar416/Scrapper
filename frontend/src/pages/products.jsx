import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, Button, Input, Select, Badge } from '@/components/ui';
import { Header } from '@/components/Header';
import { SkeletonCard } from '@/components/ui';
import { Filter, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function Products() {
  const [items, setItems] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [websiteId, setWebsiteId] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 20 });
  const [showFilters, setShowFilters] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (websiteId) params.set('websiteId', websiteId);
    if (search) params.set('search', search);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (color) params.set('color', color);
    if (size) params.set('size', size);
    return `/api/products?${params.toString()}`;
  }, [page, limit, websiteId, search, minPrice, maxPrice, color, size]);

  useEffect(() => {
    loadProducts();
  }, [query]);

  const loadProducts = async () => {
    try {
      setLoading(true);

      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔄 LOADING PRODUCTS');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Query:', query);
      console.log('Filters:', {
        page,
        limit,
        websiteId: websiteId || 'all',
        search: search || 'none',
        priceRange: minPrice || maxPrice ? `$${minPrice}-$${maxPrice}` : 'all',
        color: color || 'all',
        size: size || 'all',
      });

      const [productsResponse, sites] = await Promise.all([
        apiGet(query),
        apiGet('/api/websites'),
      ]);

      const productsData = productsResponse.data || [];
      const paginationData = productsResponse.pagination || { page: 1, pages: 1, total: 0, limit };

      console.log('\n✅ SUCCESS: Data loaded');
      console.log('Products:', {
        itemsReturned: productsData.length,
        totalCount: paginationData.total,
        currentPage: paginationData.page,
        totalPages: paginationData.pages,
        pageSize: paginationData.limit,
      });
      console.log('Websites:', {
        count: sites.length,
        enabled: sites.filter(w => w.enabled).length,
      });

      setItems(productsData);
      setPagination(paginationData);
      setWebsites(sites);
    } catch (error) {
      console.error('\n❌ LOAD PRODUCTS FAILED');
      console.error('Query:', query);
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
        console.error('One or more filter parameters are invalid');
      } else if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Endpoint not found');
      } else if (error.message.includes('500')) {
        console.error('DIAGNOSIS: Server error');
        console.error('The backend encountered an internal error while processing the request');
      } else {
        console.error('DIAGNOSIS: Unknown error');
      }

      setItems([]);
      setPagination({ page: 1, pages: 1, total: 0, limit });
      setWebsites([]);
    } finally {
      setLoading(false);
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setWebsiteId('');
    setMinPrice('');
    setMaxPrice('');
    setColor('');
    setSize('');
    setPage(1);
  };

  const hasActiveFilters = search || websiteId || minPrice || maxPrice || color || size;

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <Header onSearch={setSearch} placeholder="Search products..." />

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {pagination.total} products available
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mb-4"
          >
            <Filter size={20} />
            <span className="font-medium">Filters {hasActiveFilters && `(${[search, websiteId, minPrice, maxPrice, color, size].filter(Boolean).length})`}</span>
          </button>

          {showFilters && (
            <Card className="mb-6 animate-fade-in">
              <CardContent className="space-y-4">
                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    label="Website"
                    value={websiteId}
                    onChange={(e) => {
                      setWebsiteId(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { label: 'All Websites', value: '' },
                      ...websites.map((w) => ({ label: w.name, value: w.id })),
                    ]}
                  />
                  <Input
                    label="Min Price"
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="0"
                  />
                  <Input
                    label="Max Price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    placeholder="999999"
                  />
                  <Input
                    label="Color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                      setPage(1);
                    }}
                    placeholder="e.g., Red"
                  />
                </div>

                {/* Size and Reset */}
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <Input
                      label="Size"
                      value={size}
                      onChange={(e) => {
                        setSize(e.target.value);
                        setPage(1);
                      }}
                      placeholder="e.g., M, L, XL"
                    />
                  </div>
                  {hasActiveFilters && (
                    <Button variant="secondary" onClick={handleResetFilters}>
                      <X size={16} />
                      Reset
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {hasActiveFilters ? 'No products match your filters' : 'No products available'}
            </p>
            {hasActiveFilters && (
              <Button variant="primary" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((product, index) => (
                <Link key={product.id} href={`/product/${product.id}`} className="group animate-fade-in block" style={{ animationDelay: `${(index % 8) * 0.05}s` }}>
                    <Card hover className="h-full overflow-hidden">
                      {/* Image */}
                      <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>

                      <CardContent className="p-4">
                        {/* Title */}
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2 mb-2">
                          {product.title}
                        </h3>

                        {/* Website */}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          {product.website?.name || 'Unknown'}
                        </p>

                        {/* Prices */}
                        <div className="flex items-end gap-2 mb-3">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{product.price || 'N/A'}
                          </p>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <p className="text-sm line-through text-gray-500">
                              ₹{product.originalPrice}
                            </p>
                          )}
                        </div>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Colors:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.colors.slice(0, 4).map((c) => (
                                <div
                                  key={c.id}
                                  className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                  style={{ backgroundColor: c.code || '#ccc' }}
                                  title={c.name}
                                />
                              ))}
                              {product.colors.length > 4 && (
                                <Badge size="sm" variant="default">
                                  +{product.colors.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Sizes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.sizes.slice(0, 3).map((s) => (
                                <Badge
                                  key={s.id}
                                  variant={s.available ? 'success' : 'default'}
                                  size="sm"
                                >
                                  {s.size}
                                </Badge>
                              ))}
                              {product.sizes.length > 3 && (
                                <Badge size="sm" variant="default">
                                  +{product.sizes.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* View Button */}
                        <Button size="sm" className="w-full" variant="primary">
                          <Eye size={16} />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                </Link>
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
