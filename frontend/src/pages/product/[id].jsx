import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { Loader, PageLoader } from '@/components/ui';
import { ArrowLeft, ExternalLink, Heart, Share2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await apiGet(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!product) {
    return (
      <Layout>
        <div className="p-4 md:p-8 text-center py-16">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Product not found
          </p>
          <Link href="/products" className="text-blue-500 hover:underline">
              Back to Products
          </Link>
        </div>
      </Layout>
    );
  }

  const discount = product.originalPrice && product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 mb-6 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </Link>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Section */}
          <div className="animate-fade-in">
            <Card variant="glass" className="overflow-hidden sticky top-24">
              <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                    No image available
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
                    -{discount}%
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Header */}
            <div className="mb-6">
              <Link href={`/products?websiteId=${product.websiteId}`} className="text-xs text-blue-500 hover:text-blue-600 mb-2 inline-block">
                {product.website?.name || 'Unknown Source'}
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {product.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ₹{product.price || 'N/A'}
                </p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-lg line-through text-gray-500">
                    ₹{product.originalPrice}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-8">
                {product.url && (
                  <Button size="lg" className="flex-1">
                    <ExternalLink size={20} />
                    View on Website
                  </Button>
                )}
                <Button size="lg" variant="outline">
                  <Heart size={20} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 size={20} />
                </Button>
              </div>
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Colors
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.code || '#ccc' }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Sizes
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      disabled={!size.available}
                      className={`py-3 rounded-lg border-2 font-semibold transition-all ${
                        selectedSize === size.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : size.available
                          ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                          : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Stock: {product.sizes.reduce((acc, s) => acc + (s.stock || 0), 0)} items
                </p>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {product.description}
                </p>
              </Card>
            )}
          </div>
        </div>
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
