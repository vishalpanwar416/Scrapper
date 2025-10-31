import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Modal } from '@/components/ui';
import { Header } from '@/components/Header';
import { Loader, SkeletonCard } from '@/components/ui';
import { Plus, Edit, Trash2, Play, Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

export default function Websites() {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState(null);
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [scraping, setScraing] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/websites');
      setWebsites(data);
    } catch (error) {
      toast.error('Failed to fetch websites');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await apiPost('/api/websites', formData);
      toast.success('Website added successfully');
      setFormData({ name: '', url: '' });
      setIsAddModalOpen(false);
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to add website');
    }
  };

  const handleEditWebsite = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await apiPut(`/api/websites/${editingWebsite.id}`, formData);
      toast.success('Website updated successfully');
      setFormData({ name: '', url: '' });
      setIsEditModalOpen(false);
      setEditingWebsite(null);
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to update website');
    }
  };

  const handleDeleteWebsite = async (id) => {
    if (!window.confirm('Are you sure you want to delete this website?')) return;

    try {
      await apiDelete(`/api/websites/${id}`);
      toast.success('Website deleted successfully');
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to delete website');
    }
  };

  const handleToggleWebsite = async (id, enabled) => {
    try {
      const website = websites.find((w) => w.id === id);
      await apiPut(`/api/websites/${id}`, { ...website, enabled: !enabled });
      toast.success(`Website ${!enabled ? 'enabled' : 'disabled'}`);
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to update website');
    }
  };

  const handleScrape = async (name) => {
    try {
      setScraing((prev) => ({ ...prev, [name]: true }));
      const toastId = toast.loading(`Scraping ${name}...`);
      const response = await apiPost(`/api/scrape/start/${name}`, {});

      const { itemsScraped, itemsUpdated, status } = response.data || response;
      toast.success(`✅ Scraped ${itemsScraped} items, Updated ${itemsUpdated}`, { id: toastId });
      fetchWebsites();
    } catch (error) {
      toast.error('Failed to start scraping');
    } finally {
      setScraing((prev) => ({ ...prev, [name]: false }));
    }
  };

  const openEditModal = (website) => {
    setEditingWebsite(website);
    setFormData({ name: website.name, url: website.url });
    setIsEditModalOpen(true);
  };

  const filteredWebsites = websites.filter(
    (w) => w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           w.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <Header onSearch={setSearchQuery} placeholder="Search websites..." />

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Websites Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your scraping targets and monitor their status
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} size="lg">
            <Plus size={20} />
            Add Website
          </Button>
        </div>

        {/* Add Website Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Website"
          size="lg"
        >
          <form onSubmit={handleAddWebsite} className="space-y-4">
            <Input
              label="Website Name"
              placeholder="e.g., Fashion Store"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Website URL"
              placeholder="e.g., https://example.com"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Website
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Website Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingWebsite(null);
            setFormData({ name: '', url: '' });
          }}
          title="Edit Website"
          size="lg"
        >
          <form onSubmit={handleEditWebsite} className="space-y-4">
            <Input
              label="Website Name"
              placeholder="e.g., Fashion Store"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Website URL"
              placeholder="e.g., https://example.com"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Websites Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredWebsites.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {searchQuery ? 'No websites found matching your search' : 'No websites yet. Add one to get started!'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWebsites.map((website, index) => (
              <Card
                key={website.id}
                variant="elevated"
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{website.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {website.productCount} products
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => handleToggleWebsite(website.id, website.enabled)}
                      className={`p-2 rounded-lg transition-colors ${
                        website.enabled
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {website.enabled ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    {website.url}
                  </p>
                  {website.lastScrapedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Last scraped: {new Date(website.lastScrapedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleScrape(website.name)}
                    loading={scraping[website.name]}
                    disabled={!website.enabled}
                    className="flex-1"
                  >
                    <Play size={16} />
                    Scrape
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(website)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteWebsite(website.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
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
