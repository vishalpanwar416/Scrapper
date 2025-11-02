import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '../components/ui';
import { Globe, Package, History, Zap, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { apiGet } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalWebsites: 0,
    totalProducts: 0,
    totalLogs: 0,
    activeWebsites: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [websites, products, logs] = await Promise.all([
          apiGet('/api/websites'),
          apiGet('/api/products?limit=1'),
          apiGet('/api/scrape/logs?limit=1'),
        ]);

        setStats({
          totalWebsites: websites.length,
          activeWebsites: websites.filter((w) => w.enabled).length,
          totalProducts: products.pagination?.total || 0,
          totalLogs: logs.pagination?.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalWebsites: 0,
          totalProducts: 0,
          totalLogs: 0,
          activeWebsites: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      icon: Globe,
      label: 'Manage Websites',
      description: 'Add, edit, or configure scraping targets',
      href: '/websites',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Package,
      label: 'Browse Products',
      description: 'View and filter scraped products',
      href: '/products',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: History,
      label: 'View Logs',
      description: 'Check scraping history and status',
      href: '/logs',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const statCards = [
    {
      icon: Globe,
      label: 'Websites',
      value: stats.totalWebsites,
      subtext: `${stats.activeWebsites} active`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Package,
      label: 'Products',
      value: stats.totalProducts,
      subtext: 'Total scraped',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: History,
      label: 'Scrape Logs',
      value: stats.totalLogs,
      subtext: 'Completed',
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <Layout>
      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your web scraping projects and monitor progress
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${statCards.indexOf(stat) * 0.1}s` }}>
                <Card variant="gradient" className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-r ${stat.color} opacity-10 rounded-full -mr-12 -mt-12`} />
                  <CardContent>
                    <div className="flex items-start justify-between relative">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {stat.subtext}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="block group animate-fade-in" style={{ animationDelay: `${quickActions.indexOf(action) * 0.1}s` }}>
                    <Card hover className="h-full cursor-pointer">
                      <CardContent>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white group-hover:scale-110 transition-transform`}>
                            <Icon size={24} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-500 transition-colors">
                              {action.label}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {action.description}
                            </p>
                          </div>
                          <Zap size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-2xl border border-blue-200 dark:border-blue-800 p-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Zap className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Powerful Features
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <TrendingUp className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Real-time Scraping</p>
                <p className="text-gray-600 dark:text-gray-400">Monitor progress in real-time</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Advanced Filtering</p>
                <p className="text-gray-600 dark:text-gray-400">Filter by price, color, and more</p>
              </div>
            </div>
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
