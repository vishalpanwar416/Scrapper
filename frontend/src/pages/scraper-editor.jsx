import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Modal } from '@/components/ui';
import { Header } from '@/components/Header';
import { Loader, SkeletonCard } from '@/components/ui';
import { Code2, Save, RefreshCw, Copy, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import { toast } from 'sonner';

export default function ScraperEditor() {
  const [scrapers, setScrapers] = useState([]);
  const [selectedScraper, setSelectedScraper] = useState(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState(null);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchScrapers();
  }, []);

  const fetchScrapers = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/api/scrapers/list');
      setScrapers(data.scrapers || []);
      if (data.scrapers && data.scrapers.length > 0) {
        await selectScraper(data.scrapers[0]);
      }
    } catch (error) {
      console.error('Error fetching scrapers:', error);
      toast.error('Failed to load scrapers');
    } finally {
      setLoading(false);
    }
  };

  const selectScraper = async (scraper) => {
    try {
      setSelectedScraper(scraper);
      const data = await apiGet(`/api/scrapers/${scraper.name}`);
      setContent(data.content);
      setOriginalContent(data.content);
      setValidation(null);
    } catch (error) {
      console.error('Error loading scraper:', error);
      toast.error('Failed to load scraper content');
    }
  };

  const validateScraper = async () => {
    try {
      const data = await apiPut(`/api/scrapers/${selectedScraper.name}/validate`, {
        content,
      });

      if (data.isValid) {
        toast.success('Scraper syntax is valid!');
      } else {
        toast.error(`Validation errors: ${data.errors.join(', ')}`);
      }

      setValidation(data);
    } catch (error) {
      console.error('Error validating:', error);
      toast.error('Validation failed');
    }
  };

  const saveScraper = async () => {
    try {
      setSaving(true);

      // Validate first
      const validationResp = await apiPut(
        `/api/scrapers/${selectedScraper.name}/validate`,
        { content }
      );

      if (!validationResp.isValid) {
        toast.error(`Cannot save: ${validationResp.errors.join(', ')}`);
        setValidation(validationResp);
        return;
      }

      // Save
      const data = await apiPut(`/api/scrapers/${selectedScraper.name}`, {
        content,
      });

      setOriginalContent(content);
      toast.success('Scraper saved successfully!');
      toast.info('⚠️ Remember to run: npm run build');

      setValidation(null);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save scraper');
    } finally {
      setSaving(false);
    }
  };

  const copyTemplate = async () => {
    try {
      const data = await apiGet(`/api/scrapers/${selectedScraper.name}/syntax`);
      navigator.clipboard.writeText(JSON.stringify(data.syntax, null, 2));
      toast.success('Syntax help copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const resetChanges = () => {
    if (confirm('Reset to last saved version?')) {
      setContent(originalContent);
      setValidation(null);
      toast.success('Changes reset');
    }
  };

  const hasChanges = content !== originalContent;

  if (loading) {
    return (
      <Layout>
        <Header placeholder="Search scrapers..." />
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header placeholder="Search..." />

      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Scraper Editor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Edit and customize scrapers for your websites
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Scraper List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scrapers</CardTitle>
                <CardDescription>{scrapers.length} available</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {scrapers.map((scraper) => (
                  <button
                    key={scraper.name}
                    onClick={() => selectScraper(scraper)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedScraper?.name === scraper.name
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{scraper.name}</span>
                      {scraper.isCustom && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(scraper.size / 1024)}KB
                    </span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Editor */}
          <div className="lg:col-span-3 space-y-6">
            {selectedScraper && (
              <>
                {/* Editor Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Code2 className="w-6 h-6" />
                        <div>
                          <CardTitle>{selectedScraper.name}.ts</CardTitle>
                          <CardDescription>
                            {selectedScraper.isCustom ? 'Custom Scraper' : 'Built-in Scraper'}
                          </CardDescription>
                        </div>
                      </div>
                      {hasChanges && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded">
                          Unsaved Changes
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Code Editor */}
                <Card>
                  <CardContent className="p-4">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full h-96 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Enter scraper code..."
                    />
                  </CardContent>
                </Card>

                {/* Validation Results */}
                {validation && (
                  <Card className={validation.isValid ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {validation.isValid ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <CardTitle className="text-lg">
                          {validation.isValid ? 'Syntax Valid' : 'Syntax Errors'}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {validation.errors.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-2">
                            Errors ({validation.errors.length}):
                          </h4>
                          <ul className="space-y-1">
                            {validation.errors.map((error, i) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-red-600 dark:text-red-400">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 text-sm mb-2">
                            Warnings ({validation.warnings.length}):
                          </h4>
                          <ul className="space-y-1">
                            {validation.warnings.map((warning, i) => (
                              <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <span className="text-yellow-600 dark:text-yellow-400">⚠</span>
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={validateScraper}
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Validate
                  </Button>

                  <Button
                    onClick={() => setShowSyntaxHelp(true)}
                    variant="secondary"
                    className="flex-1 sm:flex-none"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Syntax Help
                  </Button>

                  {hasChanges && (
                    <Button
                      onClick={resetChanges}
                      variant="secondary"
                      className="flex-1 sm:flex-none"
                    >
                      Reset
                    </Button>
                  )}

                  <Button
                    onClick={saveScraper}
                    disabled={saving || !hasChanges}
                    loading={saving}
                    className="flex-1 sm:flex-none"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>

                {/* Info Box */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-300">
                      💡 After Saving:
                    </h4>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                      <li>Run: <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">npm run build</code></li>
                      <li>The scraper will be automatically compiled and registered</li>
                      <li>Next scrape will use your custom scraper</li>
                    </ol>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Syntax Help Modal */}
      <Modal
        isOpen={showSyntaxHelp}
        onClose={() => setShowSyntaxHelp(false)}
        title="Scraper Syntax Help"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <h4 className="font-semibold mb-2">Common CSS Selectors:</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{'[class*="product"]'}</code> - Find by partial class name</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{'a[href*="/product"]'}</code> - Find links containing /product</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">article, li</code> - Find articles or list items</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">div.card &gt; a</code> - Child combinator</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Extracting Data:</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">el.textContent?.trim()</code> - Get text content</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">el.getAttribute("href")</code> - Get attribute value</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">img?.src</code> - Get image source</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">parseFloat(text.replace(/[^0-9.]/g, ""))</code> - Parse price</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Tips:</h4>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Inspect website with browser DevTools (F12)</li>
              <li>Test selectors in console: <code className="bg-gray-100 dark:bg-gray-700 px-1">document.querySelectorAll()</code></li>
              <li>Use fallback values: <code className="bg-gray-100 dark:bg-gray-700 px-1">title || "Unknown"</code></li>
              <li>Log debug info: <code className="bg-gray-100 dark:bg-gray-700 px-1">console.log()</code></li>
            </ul>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setShowSyntaxHelp(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
