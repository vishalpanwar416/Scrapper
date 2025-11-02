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
  const [scraping, setScraping] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      setLoading(true);
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('🔄 FETCHING WEBSITES');
      console.log('═══════════════════════════════════════════════════════');
      console.log('Endpoint: /api/websites');
      console.log('Method: GET');

      const data = await apiGet('/api/websites');

      console.log('\n✅ SUCCESS: Websites data received');
      if (Array.isArray(data)) {
        console.log(`📊 Total websites: ${data.length}`);
        console.log('Websites:', data.map(w => ({ id: w.id, name: w.name, url: w.url, enabled: w.enabled, productCount: w.productCount })));
        setWebsites(data);
        toast.success(`Loaded ${data.length} websites`);
      } else {
        console.error('⚠️ VALIDATION ERROR: Expected array but got:', typeof data);
        console.error('Received data:', data);
        setWebsites([]);
        toast.error('Invalid response format: expected array of websites');
      }
    } catch (error) {
      console.error('\n❌ FETCH FAILED');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      // Provide helpful error messages based on error type
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        console.error('DIAGNOSIS: Network connectivity issue');
        console.error('Possible causes:');
        console.error('- Backend server is not running');
        console.error('- Server is not accessible at the configured URL');
        console.error('- Network connection is unstable');
        toast.error('Cannot connect to server. Is the backend running?');
      } else if (error.message.includes('CORS')) {
        console.error('DIAGNOSIS: CORS policy violation');
        console.error('The frontend origin is not allowed by backend CORS configuration');
        toast.error('CORS error: Frontend origin not allowed by backend');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        console.error('DIAGNOSIS: Authentication/Authorization issue');
        toast.error('Authentication failed. Please check your credentials.');
      } else if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Endpoint not found');
        console.error('The requested endpoint does not exist on the server');
        toast.error('API endpoint not found');
      } else if (error.message.includes('500')) {
        console.error('DIAGNOSIS: Server error');
        console.error('The backend server encountered an internal error');
        toast.error('Server error. Please check backend logs.');
      } else {
        console.error('DIAGNOSIS: Unknown error');
        toast.error('Failed to fetch websites: ' + error.message);
      }

      setWebsites([]);
    } finally {
      setLoading(false);
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('➕ ADDING NEW WEBSITE');
    console.log('═══════════════════════════════════════════════════════');

    // Validation
    if (!formData.name || !formData.url) {
      console.error('❌ VALIDATION FAILED: Missing required fields');
      console.error('Name provided:', !!formData.name, '(' + formData.name + ')');
      console.error('URL provided:', !!formData.url, '(' + formData.url + ')');
      toast.error('Please fill all fields (Name and URL are required)');
      return;
    }

    // Additional validation
    try {
      new URL(formData.url);
    } catch {
      console.error('❌ VALIDATION FAILED: Invalid URL format');
      console.error('URL provided:', formData.url);
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      console.log('Form Data:', {
        name: formData.name,
        url: formData.url,
        nameLength: formData.name.length,
        urlLength: formData.url.length,
      });

      const response = await apiPost('/api/websites', formData);

      console.log('\n✅ SUCCESS: Website created');
      console.log('Created Website:', {
        id: response.id,
        name: response.name,
        url: response.url,
        enabled: response.enabled,
        createdAt: response.createdAt,
      });

      toast.success(`Website "${response.name}" added successfully`);
      setFormData({ name: '', url: '' });
      setIsAddModalOpen(false);

      // Refresh the websites list
      console.log('Refreshing websites list...');
      await fetchWebsites();
    } catch (error) {
      console.error('\n❌ ADD WEBSITE FAILED');
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);

      // Detailed error diagnosis
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        console.error('DIAGNOSIS: Network connectivity issue');
        console.error('Possible causes:');
        console.error('- Backend server is not running on port 5000');
        console.error('- Server URL is incorrect');
        console.error('- Network connection is unstable');
        toast.error('Cannot connect to server. Is the backend running?');
      } else if (error.message.includes('400')) {
        console.error('DIAGNOSIS: Bad Request - Invalid data');
        console.error('The submitted data does not meet the server requirements');
        toast.error('Invalid data. Please check your input.');
      } else if (error.message.includes('409')) {
        console.error('DIAGNOSIS: Conflict - Website already exists');
        console.error('A website with this name may already exist');
        toast.error('Website already exists. Please use a different name.');
      } else if (error.message.includes('413')) {
        console.error('DIAGNOSIS: Payload too large');
        console.error('The submitted data is too large');
        toast.error('Payload too large. Please enter shorter values.');
      } else if (error.message.includes('422')) {
        console.error('DIAGNOSIS: Unprocessable Entity - Validation error');
        toast.error('Data validation failed. Check the format of your inputs.');
      } else if (error.message.includes('500')) {
        console.error('DIAGNOSIS: Server error');
        console.error('The backend server encountered an internal error');
        toast.error('Server error. Please check backend logs.');
      } else if (error.message.includes('CORS')) {
        console.error('DIAGNOSIS: CORS policy violation');
        toast.error('CORS error: Frontend origin not allowed by backend');
      } else {
        console.error('DIAGNOSIS: Unknown error');
        toast.error('Failed to add website: ' + error.message);
      }
    } finally {
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleEditWebsite = async (e) => {
    e.preventDefault();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✏️  EDITING WEBSITE');
    console.log('═══════════════════════════════════════════════════════');

    if (!formData.name || !formData.url) {
      console.error('❌ VALIDATION FAILED: Missing required fields');
      console.error('Website ID:', editingWebsite.id);
      console.error('Name provided:', !!formData.name);
      console.error('URL provided:', !!formData.url);
      toast.error('Please fill all fields');
      return;
    }

    try {
      console.log('Update Payload:', {
        id: editingWebsite.id,
        name: formData.name,
        url: formData.url,
      });

      const response = await apiPut(`/api/websites/${editingWebsite.id}`, formData);

      console.log('\n✅ SUCCESS: Website updated');
      console.log('Updated Website:', {
        id: response.id,
        name: response.name,
        url: response.url,
        updatedAt: response.updatedAt,
      });

      toast.success('Website updated successfully');
      setFormData({ name: '', url: '' });
      setIsEditModalOpen(false);
      setEditingWebsite(null);

      console.log('Refreshing websites list...');
      await fetchWebsites();
    } catch (error) {
      console.error('\n❌ EDIT WEBSITE FAILED');
      console.error('Website ID:', editingWebsite.id);
      console.error('Error Message:', error.message);

      if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Website not found');
        toast.error('Website not found. It may have been deleted.');
      } else if (error.message.includes('409')) {
        console.error('DIAGNOSIS: Conflict - Website name already exists');
        toast.error('Website with this name already exists.');
      } else {
        toast.error('Failed to update website: ' + error.message);
      }
    } finally {
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleDeleteWebsite = async (id) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🗑️  DELETING WEBSITE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Website ID:', id);

    const website = websites.find(w => w.id === id);
    console.log('Website to delete:', {
      id: website?.id,
      name: website?.name,
      url: website?.url,
    });

    if (!window.confirm(`Are you sure you want to delete "${website?.name || 'this website'}"? This action cannot be undone.`)) {
      console.log('❌ DELETION CANCELLED by user');
      return;
    }

    try {
      console.log('Sending DELETE request...');
      const response = await apiDelete(`/api/websites/${id}`);

      console.log('\n✅ SUCCESS: Website deleted');
      console.log('Deleted website ID:', id);

      toast.success('Website deleted successfully');

      console.log('Refreshing websites list...');
      await fetchWebsites();
    } catch (error) {
      console.error('\n❌ DELETE WEBSITE FAILED');
      console.error('Website ID:', id);
      console.error('Error Message:', error.message);

      if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Website not found');
        toast.error('Website not found. It may have already been deleted.');
      } else if (error.message.includes('409')) {
        console.error('DIAGNOSIS: Cannot delete - website has dependencies');
        toast.error('Cannot delete website. It may have active scraping or products.');
      } else {
        toast.error('Failed to delete website: ' + error.message);
      }
    } finally {
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleToggleWebsite = async (id, enabled) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔄 TOGGLING WEBSITE STATUS');
    console.log('═══════════════════════════════════════════════════════');

    try {
      const website = websites.find((w) => w.id === id);
      const newStatus = !enabled;

      console.log('Website ID:', id);
      console.log('Current status:', enabled ? 'Enabled' : 'Disabled');
      console.log('New status:', newStatus ? 'Enabled' : 'Disabled');

      const response = await apiPut(`/api/websites/${id}`, { ...website, enabled: newStatus });

      console.log('\n✅ SUCCESS: Website status toggled');
      console.log('Updated Website:', {
        id: response.id,
        name: response.name,
        enabled: response.enabled,
      });

      toast.success(`Website ${newStatus ? 'enabled' : 'disabled'}`);
      fetchWebsites();
    } catch (error) {
      console.error('\n❌ TOGGLE FAILED');
      console.error('Error Message:', error.message);
      toast.error('Failed to update website status: ' + error.message);
    } finally {
      console.log('═══════════════════════════════════════════════════════\n');
    }
  };

  const handleScrape = async (name) => {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔄 STARTING SCRAPE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Website:', name);

    try {
      setScraping((prev) => ({ ...prev, [name]: true }));
      const toastId = toast.loading(`Scraping ${name}...`);

      console.log('Sending scrape start request...');
      const response = await apiPost(`/api/scrape/start/${name}`, {});

      const { itemsScraped, itemsUpdated, status } = response.data || response;

      console.log('\n✅ SUCCESS: Scrape completed');
      console.log('Scrape Results:', {
        website: name,
        itemsScraped: itemsScraped || 0,
        itemsUpdated: itemsUpdated || 0,
        status: status || 'completed',
      });

      toast.success(`✅ Scraped ${itemsScraped} items, Updated ${itemsUpdated}`, { id: toastId });

      console.log('Refreshing websites list...');
      await fetchWebsites();
    } catch (error) {
      console.error('\n❌ SCRAPE FAILED');
      console.error('Website:', name);
      console.error('Error Message:', error.message);

      if (error.message.includes('404')) {
        console.error('DIAGNOSIS: Website not found');
        toast.error('Website not found. It may have been deleted.');
      } else if (error.message.includes('429')) {
        console.error('DIAGNOSIS: Rate limit exceeded');
        console.error('Too many scraping requests. Please wait before trying again.');
        toast.error('Rate limit exceeded. Please wait before scraping again.');
      } else if (error.message.includes('503')) {
        console.error('DIAGNOSIS: Service unavailable');
        console.error('Scraping service is currently unavailable');
        toast.error('Scraping service unavailable. Please try again later.');
      } else {
        toast.error('Failed to start scraping: ' + error.message);
      }
    } finally {
      setScraping((prev) => ({ ...prev, [name]: false }));
      console.log('═══════════════════════════════════════════════════════\n');
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
