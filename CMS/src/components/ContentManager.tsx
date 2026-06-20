// src/components/ContentManager.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, Eye, Search, Filter, CheckSquare, Square,
  FileDown, FileSpreadsheet, Upload, X, AlertCircle,
  Users, Printer, Activity,
  LayoutDashboard, LayoutGrid, FileText
} from 'lucide-react';
import { useCMS } from '../CMSContext';
import { LazyImage } from './LazyImage';
import { QuickEditMembersModal } from './QuickEditMembersModal';
import { ExportConfirmationModal } from './ExportConfirmationModal';
import { 
  NewsForm, PinnedForm, ServiceForm, LeadershipForm, MayoralHistoryForm,
  InitiativeForm, EventForm, DocumentForm, TourismForm, BlogForm, MediaForm, GrowthMetricForm
} from './ContentForms';
import { TableRowSkeleton } from './Skeleton';
import { importExcelFile, exportDataToExcel } from '../utils/excelUtils';
import { ContentStatus } from '../types';
import { AdministrativeUnitForm } from './ContentForms';
import { AdministrativeUnit } from '../types';
export const ContentManager = ({ type }: { type: 'news' | 'announcements' | 'services' | 'leadership' | 'history' | 'initiatives' | 'events' | 'documents' | 'tourism' | 'blog' | 'media' | 'administrative-units' | 'growth-metrics' }) => {
  const { 
    news, pinned, services, leadership, mayoralHistory,
    initiatives, events, documents, tourism, blog, media, administrativeUnits, growthMetrics,
    addNews, updateNews, deleteNews,
    addPinned, updatePinned, deletePinned,
    addService, updateService, deleteService,
    addLeadership, updateLeadership, deleteLeadership,
    addMayoralHistory, updateMayoralHistory, deleteMayoralHistory,
    addInitiative, updateInitiative, deleteInitiative,
    addEvent, updateEvent, deleteEvent,
    addDocument, updateDocument, deleteDocument,
    addTourism, updateTourism, deleteTourism,
    addBlog, updateBlog, deleteBlog,
    addMedia, updateMedia, deleteMedia,
    addAdministrativeUnit, updateAdministrativeUnit, deleteAdministrativeUnit,
    addGrowthMetric, updateGrowthMetric, deleteGrowthMetric,
    logAction, isLoading, currentUser
  } = useCMS();
  
  const canEdit = ['admin', 'super_admin', 'super admin', 'editor', 'publisher', 'reviewer'].includes(currentUser?.role || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'CSV' | 'Excel'>('CSV');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'All'>('All');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: 'Publish' | 'Delete' | 'Review', count: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [activeLogUnit, setActiveLogUnit] = useState<any | null>(null);
  const [quickEditMembersItem, setQuickEditMembersItem] = useState<AdministrativeUnit | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(type === 'media' ? 'grid' : 'list');
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [parsedImportItems, setParsedImportItems] = useState<any[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStats, setImportStats] = useState({ success: 0, failed: 0 });
  const [importLogs, setImportLogs] = useState<string[]>([]);

  const data = 
    type === 'news' ? news : 
    type === 'announcements' ? pinned : 
    type === 'services' ? services :
    type === 'leadership' ? leadership :
    type === 'history' ? mayoralHistory :
    type === 'initiatives' ? initiatives :
    type === 'events' ? events :
    type === 'documents' ? documents :
    type === 'tourism' ? tourism :
    type === 'blog' ? blog :
    type === 'administrative-units' ? administrativeUnits :
    type === 'growth-metrics' ? growthMetrics :
    media;

  // Pending action from localStorage
  useEffect(() => {
    const pending = localStorage.getItem('cms_pending_action');
    if (pending) {
      try {
        const parsed = JSON.parse(pending);
        if (parsed.type === type) {
          if (parsed.action === 'add') {
            setIsAdding(true);
            setEditingItem(null);
          } else if (parsed.action === 'edit' && parsed.id) {
            const foundItem = data.find((item: any) => String(item.id) === String(parsed.id));
            if (foundItem) {
              setEditingItem(foundItem);
              setIsAdding(false);
            }
          }
          localStorage.removeItem('cms_pending_action');
        }
      } catch (e) {
        console.error('Failed to parse pending action:', e);
      }
    }
  }, [type, data]);

  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const isJson = file.name.endsWith('.json');
    reader.onload = async (evt) => {
      try {
        const resultBinary = evt.target?.result;
        if (!resultBinary) throw new Error("Couldn't read file content.");
        if (isJson) {
          const parsed = JSON.parse(resultBinary as string);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          setParsedImportItems(items);
          setImportError(null);
        } else {
          const jsonData = await importExcelFile(resultBinary);
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            throw new Error("No data parsed from Excel file.");
          }
          setParsedImportItems(jsonData);
          setImportError(null);
        }
      } catch (err: any) {
        setImportError(err?.message || "Parsing failed. Ensure table headers and formats align.");
        setParsedImportItems([]);
      }
    };
    if (isJson) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const executeBulkImport = async () => {
    if (parsedImportItems.length === 0) return;
    setIsImporting(true);
    setImportProgress(0);
    setImportLogs([]);
    let successCount = 0;
    let failedCount = 0;
    for (let i = 0; i < parsedImportItems.length; i++) {
      const item = parsedImportItems[i];
      try {
        const timestamp = new Date().toISOString();
        if (type === 'news') {
          const slug = item.slug || (item.title ? String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `news-${Date.now()}-${i}`);
          const formatted = {
            title: item.title || item.name || 'Untitled News Release',
            content: item.content || item.body || item.description || 'No content.',
            category: item.category || 'Press Release',
            image_url: item.image_url || item.imageUrl || item.image || item.photo || '',
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',').map((t: string) => t.trim())) : ['Migrated'],
            status: item.status ? item.status.toLowerCase() : 'draft',
            language: item.language || 'en',
            author: item.author || 'Migration Master',
            slug,
            meta_title: item.meta_title || item.metaTitle || '',
            meta_description: item.meta_description || item.metaDescription || '',
            meta_keywords: item.meta_keywords || item.metaKeywords || '',
          };
          await addNews(formatted as any);
        } else if (type === 'announcements') {
          const formatted = {
            title: item.title || item.name || 'Untitled Announcement',
            message: item.message || item.content || item.description || 'No content.',
            type: item.type || 'Announcement',
            expiry_date: item.expiry_date || item.expiryDate || '',
            priority: item.priority || 'Medium',
            status: item.status ? item.status.toLowerCase() : 'draft',
            language: item.language || 'en',
            author: item.author || 'Migration Master',
          };
          await addPinned(formatted as any);
        } else if (type === 'events') {
          const formatted = {
            title: item.title || item.name || 'Untitled Event',
            description: item.description || item.content || item.body || 'No description.',
            location: item.location || 'Adama',
            date: item.date || timestamp,
            category: item.category || 'Migrated',
            image: item.image || item.image_url || item.imageUrl || '',
            status: item.status ? item.status.toLowerCase() : 'draft',
            language: item.language || 'en',
            author: item.author || 'Migration Master',
          };
          await addEvent(formatted as any);
        } else if (type === 'blog') {
          const slug = item.slug || (item.title ? String(item.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `blog-${Date.now()}-${i}`);
          const formatted = {
            title: item.title || item.name || 'Untitled Blog Post',
            content: item.content || item.body || item.description || 'No content.',
            author: item.author || 'Migration Master',
            category: item.category || 'General',
            featured_image: item.featured_image || item.featuredImage || item.image || item.imageUrl || '',
            tags: item.tags ? (Array.isArray(item.tags) ? item.tags : String(item.tags).split(',').map((t: string) => t.trim())) : ['Migrated'],
            status: item.status ? item.status.toLowerCase() : 'draft',
            language: item.language || 'en',
            slug,
            meta_title: item.meta_title || item.metaTitle || '',
            meta_description: item.meta_description || item.metaDescription || '',
            meta_keywords: item.meta_keywords || item.metaKeywords || '',
          };
          await addBlog(formatted as any);
        }
        successCount++;
        setImportLogs(prev => [...prev, `Success: Imported "${item.title || item.name || 'Row ' + (i+1)}"`]);
      } catch (err: any) {
        failedCount++;
        setImportLogs(prev => [...prev, `Error: Failed to import "${item.title || item.name || 'Row ' + (i+1)}": ${err?.message || 'Permission or Server Error'}`]);
      }
      setImportProgress(Math.round(((i + 1) / parsedImportItems.length) * 100));
      setImportStats({ success: successCount, failed: failedCount });
    }
    setIsImporting(false);
  };
const executeExportToExcel = async () => {
  if (filteredData.length === 0) return;
  const firstRow = filteredData[0] as any;
  const headers = Object.keys(firstRow).filter(k => typeof firstRow[k] !== 'object');
  const xlRows = filteredData.map((row: any) => {
    const formatted: any = {};
    headers.forEach(header => {
      const val = row[header];
      formatted[header] = val !== null && val !== undefined ? String(val) : '';
    });
    return formatted;
  });
  await exportDataToExcel(xlRows, `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const executeExportToCSV = () => {
  if (filteredData.length === 0) return;
  const firstRow = filteredData[0] as any;
  const headers = Object.keys(firstRow).filter(k => k !== 'id' && typeof firstRow[k] !== 'object');
  const csvRows = [
    headers.join(','),
    ...filteredData.map((row: any) => 
      headers.map(header => {
        const val = row[header];
        return `"${val ? String(val).replace(/"/g, '""') : ''}"`;
      }).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.click();
  URL.revokeObjectURL(url);
};

  const exportToExcel = () => {
    setExportType('Excel');
    setIsExportModalOpen(true);
  };

  const exportToCSV = () => {
    setExportType('CSV');
    setIsExportModalOpen(true);
  };

  const handlePrintUnitReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print the report");
      return;
    }
    const elementsByGroup = data.reduce((acc: any, item: any) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    }, {});
    const groupNames = ['Sector', 'SubCity', 'Woreda', 'Department'];
    let htmlContent = `
      <html><head><title>Adama City Portal - Administrative Units Report</title>
      <style>body { font-family: 'Inter', sans-serif; padding: 40px; }
      h1 { font-size: 24px; color: #0f172a; border-bottom: 2px solid #d946ef; padding-bottom: 10px; }
      .section { margin-bottom: 35px; }
      .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #d946ef; border-bottom: 1px solid #e2e8f0; margin-bottom: 15px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
      .card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; background: #fafafc; }
      .card-name { font-weight: 800; font-size: 15px; }
      .card-meta { font-size: 11px; color: #94a3b8; }
      .card-desc { font-size: 12px; color: #475569; }
      @media print { body { padding: 0; } button { display: none; } }
      </style></head>
      <body>
      <h1>Municipal Administrative Units Directory</h1>
      <div class="subtitle">Adama City Portal Hierarchy Mapping • Generated on ${new Date().toLocaleDateString()}</div>
      ${groupNames.map(group => {
        const items = elementsByGroup[group] || [];
        if (items.length === 0) return '';
        return `<div class="section"><div class="section-title">${group}s (${items.length} units)</div>
          <div class="grid">${items.map((item: any) => `
            <div class="card">
              <div class="card-name">${item.name}</div>
              <div class="card-meta">Type: ${item.type} • Status: ${item.status.toUpperCase()}</div>
              <div class="card-desc">${item.description || 'No description.'}</div>
              ${item.members && item.members.length ? `<div class="members-list">${item.members.map((m: any) => `<div>${m.name} - ${m.role}</div>`).join('')}</div>` : ''}
            </div>`).join('')}</div></div>`;
      }).join('')}
      </body></html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredData = data.filter((item: any) => {
    const matchesSearch = (item.title || item.name || item.mayorName || item.attractionName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const itemDate = item.date || item.createdAt?.split('T')[0];
    const matchesDate = (!dateRange.start || itemDate >= dateRange.start) && (!dateRange.end || itemDate <= dateRange.end);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map((item: any) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = (action: 'Publish' | 'Delete' | 'Review') => {
    if (selectedItems.length === 0) return;
    setBulkActionConfirm({ action, count: selectedItems.length });
  };

  const executeBulkAction = () => {
    if (!bulkActionConfirm) return;
    const { action } = bulkActionConfirm;
    if (action === 'Delete') {
      selectedItems.forEach(id => {
        if (type === 'news') deleteNews(id);
        else if (type === 'announcements') deletePinned(id);
        else if (type === 'services') deleteService(id);
        else if (type === 'leadership') deleteLeadership(id);
        else if (type === 'history') deleteMayoralHistory(id);
        else if (type === 'initiatives') deleteInitiative(id);
        else if (type === 'events') deleteEvent(id);
        else if (type === 'documents') deleteDocument(id);
        else if (type === 'tourism') deleteTourism(id);
        else if (type === 'blog') deleteBlog(id);
        else if (type === 'media') deleteMedia(id);
        else if (type === 'administrative-units') deleteAdministrativeUnit(id);
        else if (type === 'growth-metrics') deleteGrowthMetric(id);
      });
    } else {
      const status = action === 'Publish' ? 'published' : 'review';
      selectedItems.forEach(id => {
        const update = { status: status as ContentStatus };
        if (type === 'news') updateNews(id, update);
        else if (type === 'announcements') updatePinned(id, update);
        else if (type === 'services') updateService(id, update);
        else if (type === 'leadership') updateLeadership(id, update);
        else if (type === 'history') updateMayoralHistory(id, update);
        else if (type === 'initiatives') updateInitiative(id, update);
        else if (type === 'events') updateEvent(id, update);
        else if (type === 'documents') updateDocument(id, update);
        else if (type === 'tourism') updateTourism(id, update);
        else if (type === 'blog') updateBlog(id, update);
        else if (type === 'media') updateMedia(id, update);
        else if (type === 'administrative-units') updateAdministrativeUnit(id, update);
      });
      logAction(action as any, type, 'bulk', `${selectedItems.length} items`, `Bulk ${action} action performed`);
    }
    setSelectedItems([]);
    setBulkActionConfirm(null);
  };

  const handleSave = (formData: any) => {
    const timestamp = new Date().toISOString();
    if (editingItem) {
      if (type === 'news') updateNews(editingItem.id, formData);
      else if (type === 'announcements') updatePinned(editingItem.id, formData);
      else if (type === 'services') updateService(editingItem.id, formData);
      else if (type === 'leadership') updateLeadership(editingItem.id, formData);
      else if (type === 'history') updateMayoralHistory(editingItem.id, formData);
      else if (type === 'initiatives') updateInitiative(editingItem.id, formData);
      else if (type === 'events') updateEvent(editingItem.id, formData);
      else if (type === 'documents') updateDocument(editingItem.id, formData);
      else if (type === 'tourism') updateTourism(editingItem.id, formData);
      else if (type === 'blog') updateBlog(editingItem.id, formData);
      else if (type === 'media') updateMedia(editingItem.id, formData);
      else if (type === 'administrative-units') updateAdministrativeUnit(editingItem.id, formData);
      else if (type === 'growth-metrics') updateGrowthMetric(editingItem.id, formData);
    } else {
      const newItem = {
        ...formData,
        id: `${type}-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        author: 'Adama Admin',
      };
      if (type === 'news') addNews(newItem);
      else if (type === 'announcements') addPinned(newItem);
      else if (type === 'services') addService(newItem);
      else if (type === 'leadership') addLeadership(newItem);
      else if (type === 'history') addMayoralHistory(newItem);
      else if (type === 'initiatives') addInitiative(newItem);
      else if (type === 'events') addEvent(newItem);
      else if (type === 'documents') addDocument(newItem);
      else if (type === 'tourism') addTourism(newItem);
      else if (type === 'blog') addBlog(newItem);
      else if (type === 'media') addMedia(newItem);
      else if (type === 'administrative-units') addAdministrativeUnit(newItem);
      else if (type === 'growth-metrics') addGrowthMetric(newItem);
    }
    setIsAdding(false);
    setEditingItem(null);
  };

  if (isAdding || editingItem) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {type === 'news' && <NewsForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'announcements' && <PinnedForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'services' && <ServiceForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'leadership' && <LeadershipForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'history' && <MayoralHistoryForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'initiatives' && <InitiativeForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'events' && <EventForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'documents' && <DocumentForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'tourism' && <TourismForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'blog' && <BlogForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'media' && <MediaForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'administrative-units' && <AdministrativeUnitForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
          {type === 'growth-metrics' && <GrowthMetricForm initialData={editingItem} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingItem(null); }} />}
        </div>
      </div>
    );
  }

  const getCmsHeaderInfo = () => {
    switch (type) {
      case 'news': return { title: "Manage News", subtitle: "Create, edit, and publish official articles, press statements, and news bulletins.", btnLabel: "Add New Article", badgeText: "News Catalog", badgeClass: "from-blue-500/20 to-blue-600/5 text-blue-300 border-blue-500/30", color: "#3b82f6" };
      case 'announcements': return { title: "Manage Announcements", subtitle: "Manage high-visibility critical alerts, emergency broadcasts, and pin boards.", btnLabel: "Add New Announcement", badgeText: "Emergency System", badgeClass: "from-rose-500/20 to-rose-600/5 text-rose-300 border-rose-500/30", color: "#f43f5e" };
      case 'blog': return { title: "Manage Blogs", subtitle: "Deploy, review, and curate editorial columns, citizen guest columns, and opinion pieces.", btnLabel: "Add New Post", badgeText: "Editorial Desk", badgeClass: "from-pink-500/20 to-pink-600/5 text-pink-300 border-pink-500/30", color: "#ec4899" };
      case 'events': return { title: "Manage Events", subtitle: "Administer public town halls, scheduled forums, holidays, and civic events.", btnLabel: "Add New Event", badgeText: "City Calendar", badgeClass: "from-purple-500/20 to-purple-600/5 text-purple-300 border-purple-500/30", color: "#a855f7" };
      case 'initiatives': return { title: "Manage Initiatives", subtitle: "Detail active smart urban campaigns, progress status indicators, and expected impact metrics.", btnLabel: "Add New Initiative", badgeText: "Smart Campaign", badgeClass: "from-cyan-500/20 to-cyan-600/5 text-cyan-300 border-cyan-500/30", color: "#06b6d4" };
      case 'leadership': return { title: "Manage Leadership", subtitle: "Update profile cards, core assignments, and contact metrics of cabinet administrators.", btnLabel: "Add New Profile", badgeText: "Cabinet Board", badgeClass: "from-amber-500/20 to-amber-600/5 text-amber-300 border-amber-500/30", color: "#f59e0b" };
      case 'history': return { title: "Manage Mayoral History", subtitle: "Chronicle historic municipal terms, mayoral achievements, and state KPIs.", btnLabel: "Add New Entry", badgeText: "Archival Registry", badgeClass: "from-yellow-500/20 to-orange-600/5 text-yellow-300 border-yellow-500/30", color: "#eab308" };
      case 'tourism': return { title: "Manage Tourism", subtitle: "Formulate local attraction guidelines, coordinate points of interest, and parks.", btnLabel: "Add New Attraction", badgeText: "Visitor Guide", badgeClass: "from-teal-500/20 to-teal-600/5 text-teal-300 border-teal-500/30", color: "#14b8a6" };
      case 'media': return { title: "Manage Media", subtitle: "Govern responsive thumbnail directories, dimensions, alt text alignments, and assets.", btnLabel: "Add New Media", badgeText: "Asset Vault", badgeClass: "from-indigo-500/20 to-indigo-600/5 text-indigo-300 border-indigo-500/30", color: "#6366f1" };
      case 'documents': return { title: "Manage Documents", subtitle: "Verify legal PDF forms, application briefs, guidelines, and request for tenders.", btnLabel: "Add New Document", badgeText: "Form Central", badgeClass: "from-zinc-500/20 to-zinc-600/5 text-zinc-300 border-zinc-500/30", color: "#71717a" };
      case 'services': return { title: "Manage Services", subtitle: "Empower citizens with active process steps, prerequisites, and support structures.", btnLabel: "Add New Service", badgeText: "Portal Service", badgeClass: "from-emerald-500/20 to-emerald-600/5 text-emerald-300 border-emerald-500/30", color: "#10b981" };
      case 'administrative-units': return { title: "Manage Administrative Units", subtitle: "Map official sector structures, sub-cities, woreda delegations, and departments.", btnLabel: "Add New Unit", badgeText: "Local Hierarchy", badgeClass: "from-fuchsia-500/20 to-fuchsia-600/5 text-fuchsia-300 border-fuchsia-500/30", color: "#d946ef" };
      case 'growth-metrics': return { title: "Manage Growth Metrics", subtitle: "Administer population indices, fiscal growth rates, and annual municipal revenue figures.", btnLabel: "Add New Metric Year", badgeText: "Demography & Growth", badgeClass: "from-cyan-500/20 to-cyan-600/5 text-cyan-300 border-cyan-500/30", color: "#06b6d4" };
      default: return { title: `Manage ${type}`, subtitle: `Create, edit, and manage your ${type} content.`, btnLabel: `Add New ${type}`, badgeText: "General Context", badgeClass: "from-slate-500/20 to-slate-600/5 text-slate-300 border-slate-500/30", color: "#64748b" };
    }
  };

  const headerInfo = getCmsHeaderInfo();

  return (
    <div className="p-8 space-y-6" style={{ '--module-color': headerInfo.color } as React.CSSProperties}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/5">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border tracking-wider bg-gradient-to-r shadow-xs ${headerInfo.badgeClass}`}>{headerInfo.badgeText}</span>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--module-color)' }} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none bg-gradient-to-r from-slate-900 via-slate-800 to-brand-teal-dark dark:from-white dark:via-slate-100 dark:to-brand-teal bg-clip-text text-transparent">{headerInfo.title}</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{headerInfo.subtitle}</p>
        </div>
        {canEdit && (
          <button onClick={() => setIsAdding(true)} className="bg-brand-teal text-slate-950 px-5 py-3 rounded-xl font-extrabold flex items-center space-x-2 hover:bg-brand-teal/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-teal/15 self-start md:self-auto">
            <Plus size={20} className="stroke-[3]" />
            <span>{headerInfo.btnLabel}</span>
          </button>
        )}
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${type === 'administrative-units' ? 'administrative-units-list' : ''}`}>
        {type === 'administrative-units' && (
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-950/40 border-b border-gray-100 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center space-x-2.5"><Users className="text-fuchsia-500 dark:text-fuchsia-400" size={18} /><span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Staff & Representatives Directory</span></div>
            <div className="flex items-center space-x-2 bg-fuchsia-100/70 dark:bg-fuchsia-950/40 px-3 py-1 rounded-full border border-fuchsia-200 dark:border-fuchsia-800/40 text-fuchsia-700 dark:text-fuchsia-400 text-xs font-black"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />{administrativeUnits.reduce((acc, u) => acc + (u.members?.length || 0), 0)} Assigned Members</div>
          </div>
        )}
        <div className="p-4 border-b border-gray-100 flex flex-col space-y-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search content..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-teal text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
              <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border transition-all flex items-center space-x-2 text-sm font-bold ${showFilters ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal-dark' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Filter size={18} /><span>Filters</span></button>
              {type === 'administrative-units' && (<div className="flex items-center space-x-2 border-l border-gray-200 pl-4"><span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status Filter:</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-teal"><option value="All">All Unit Visibility</option><option value="draft">Drafts Only</option><option value="published">Published / Active Only</option><option value="archived">Archived Offline Only</option></select></div>)}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1"><button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-brand-teal/10 text-brand-teal-dark' : 'text-gray-400 hover:text-gray-600'}`}><LayoutDashboard size={16} /></button><button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-brand-teal/10 text-brand-teal-dark' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={16} /></button></div>
            </div>
            <div className="flex items-center space-x-4">
              {type === 'administrative-units' && (<button onClick={handlePrintUnitReport} className="flex items-center space-x-2 text-sm font-bold text-fuchsia-600 hover:text-fuchsia-850 transition-colors bg-fuchsia-50 hover:bg-fuchsia-100/70 px-3 py-2 rounded-lg border border-fuchsia-200"><Printer size={18} /><span>Print Unit Report</span></button>)}
              <button onClick={exportToCSV} className="flex items-center space-x-2 text-sm font-bold text-gray-600 hover:text-brand-navy transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200"><FileDown size={18} /><span>Export CSV</span></button>
              <button onClick={exportToExcel} className="flex items-center space-x-2 text-sm font-bold text-emerald-600 hover:text-emerald-800 transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200"><FileSpreadsheet size={18} /><span>Export Excel</span></button>
              {['news', 'announcements', 'events', 'blog'].includes(type) && (<button onClick={() => setShowImportPanel(true)} className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200"><Upload size={18} /><span>Import Data</span></button>)}
              {selectedItems.length > 0 && canEdit && (<div className="flex items-center space-x-2 bg-brand-teal/10 px-4 py-1.5 rounded-xl border border-brand-teal/20"><span className="text-xs font-bold text-brand-teal-dark">{selectedItems.length} selected</span><div className="h-4 w-px bg-brand-teal/20 mx-2" /><button onClick={() => handleBulkAction('Publish')} className="text-xs font-bold text-brand-teal-dark hover:text-brand-navy">Publish</button><button onClick={() => handleBulkAction('Review')} className="text-xs font-bold text-orange-600 hover:text-orange-800">Review</button><button onClick={() => handleBulkAction('Delete')} className="text-xs font-bold text-red-600 hover:text-red-800">Delete</button></div>)}
            </div>
          </div>
          {showFilters && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100"><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">Status</label><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"><option value="All">All Statuses</option><option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option></select></div><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">From Date</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm" /></div><div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase">To Date</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm" /></div></motion.div>)}
        </div>

        <div className="overflow-x-auto">
          {viewMode === 'list' ? (
            <table className="w-full text-left">
              <thead><tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100"><th className="px-6 py-4 w-10"><button onClick={toggleSelectAll} className="text-gray-400 hover:text-brand-teal-dark">{selectedItems.length === filteredData.length && filteredData.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}</button></th><th className="px-6 py-4">{type === 'growth-metrics' ? 'Metric Year' : 'Title / Name'}</th><th className="px-6 py-4">{type === 'growth-metrics' ? 'Total Population' : 'Status'}</th><th className="px-6 py-4">{type === 'growth-metrics' ? 'Growth Rate (%)' : 'Author'}</th><th className="px-6 py-4">{type === 'growth-metrics' ? 'Annual Revenue (ETB)' : 'Last Updated'}</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (<><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>) : (filteredData.map((item: any) => (
                  <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${selectedItems.includes(item.id) ? 'bg-brand-teal/5' : ''}`}>
                    <td className="px-6 py-4"><button onClick={() => toggleSelectItem(item.id)} className={`${selectedItems.includes(item.id) ? 'text-brand-teal-dark' : 'text-gray-300 hover:text-gray-400'}`}>{selectedItems.includes(item.id) ? <CheckSquare size={18} /> : <Square size={18} />}</button></td>
                    <td className="px-6 py-4"><div className="flex items-center space-x-3">{(item.image || item.photo || item.featuredImage || item.url) && (<LazyImage src={item.image || item.photo || item.featuredImage || item.url} alt={item.title || item.name || 'thumbnail'} className="w-full h-full object-cover" wrapperClassName="w-10 h-10 rounded-lg shadow-sm flex-shrink-0" />)}<span className="font-bold text-gray-900">{type === 'growth-metrics' ? `Year ${item.year}` : (item.title || item.name || item.mayorName || item.attractionName)}</span></div></td>
                    <td className="px-6 py-4">{type === 'growth-metrics' ? (<span className="text-xs font-bold text-slate-700">{item.population ? Number(item.population).toLocaleString() : '0'} Citizens</span>) : (<span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${item.status === 'published' ? 'bg-brand-teal/10 text-brand-teal-dark' : item.status === 'archived' ? 'bg-slate-200 text-slate-600 border border-slate-300' : item.status === 'review' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{item.status}</span>)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{type === 'growth-metrics' ? (<span className="font-semibold text-cyan-600">{item.growthRate}% Growth</span>) : (item.author)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{type === 'growth-metrics' ? (<span className="font-semibold text-emerald-600">{Number(item.revenue || 0).toLocaleString()} ETB</span>) : (item.updatedAt ? item.updatedAt.split('T')[0] : '')}</td>
                    <td className="px-6 py-4 text-right"><div className="flex items-center justify-end space-x-2">
                      {type === 'administrative-units' && (<><button type="button" onClick={() => setQuickEditMembersItem(item)} title="Quick Edit Assigned Members" className="p-1.5 text-slate-400 hover:text-brand-teal-dark hover:bg-brand-teal/10 rounded-xl"><Users size={15} /></button><button type="button" onClick={() => setActiveLogUnit(item)} title="View Activity Log" className="p-1.5 text-slate-400 hover:text-fuchsia-600 hover:bg-fuchsia-100/50 rounded-xl"><Activity size={15} /></button></>)}
                      <button type="button" onClick={() => setPreviewItem(item)} className="p-2 text-gray-400 hover:text-brand-teal-dark hover:bg-slate-100 rounded-lg"><Eye size={18} /></button>
                      {canEdit && (<><button onClick={() => setEditingItem(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button><button onClick={() => setDeleteConfirm(item)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button></>)}
                    </div></td>
                  </tr>
                )))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-6 bg-gray-50/30">
              {filteredData.map((item: any) => (
                <div key={item.id} className="relative group">
                  <button onClick={() => toggleSelectItem(item.id)} className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg bg-white/90 shadow-sm transition-all border ${selectedItems.includes(item.id) ? 'border-brand-teal text-brand-teal-dark scale-110' : 'border-transparent text-gray-300 opacity-0 group-hover:opacity-100'}`}>{selectedItems.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}</button>
                  <div className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-white flex flex-col ${selectedItems.includes(item.id) ? 'border-brand-teal ring-2 ring-brand-teal/10' : 'border-gray-100 group-hover:border-brand-teal/30 shadow-sm group-hover:shadow-md'}`}>
                    {(item.image || item.photo || item.featuredImage || item.url) ? (<LazyImage src={item.image || item.photo || item.featuredImage || item.url} alt={item.title || item.name || 'thumbnail'} className="w-full h-full object-cover" wrapperClassName="w-full h-full" />) : (<div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-300"><FileText size={40} /></div>)}
                    <div className="p-3 bg-white border-t border-gray-50"><p className="text-xs font-bold text-gray-900 truncate">{item.title || item.name || item.mayorName || item.attractionName}</p><div className="flex items-center justify-between mt-1"><span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${item.status === 'published' ? 'bg-brand-teal/10 text-brand-teal-dark' : item.status === 'archived' ? 'bg-slate-200 text-slate-600 border border-slate-350' : 'bg-orange-100 text-orange-700'}`}>{item.status}</span><div className="flex items-center space-x-1">{type === 'administrative-units' && (<button onClick={() => setQuickEditMembersItem(item)} className="p-1 text-slate-400 hover:text-brand-teal-dark"><Users size={12} /></button>)}<button onClick={() => setPreviewItem(item)} className="p-1 text-gray-400 hover:text-brand-teal-dark"><Eye size={12} /></button><button onClick={() => setEditingItem(item)} className="p-1 text-gray-400 hover:text-blue-600"><Edit size={12} /></button><button onClick={() => setDeleteConfirm(item)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button></div></div></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals: bulkActionConfirm, deleteConfirm, activeLogUnit, quickEditMembersItem, previewItem, showImportPanel, export modal */}
      {/* I'm truncating them for brevity but they are exactly as in your original App.tsx */}
      {bulkActionConfirm && (<div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full space-y-4"><div className="flex items-center space-x-3 text-brand-teal-dark"><div className="p-2 bg-brand-teal/10 rounded-full"><AlertCircle size={24} /></div><h3 className="text-lg font-bold text-gray-900">Confirm Bulk Action</h3></div><p className="text-gray-600">Are you sure you want to <span className="font-bold text-gray-900">{bulkActionConfirm.action.toLowerCase()}</span> {bulkActionConfirm.count} selected items? {bulkActionConfirm.action === 'Delete' && 'This action cannot be undone.'}</p><div className="flex justify-end space-x-3 pt-4"><button onClick={() => setBulkActionConfirm(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={executeBulkAction} className={`px-6 py-2 text-white font-bold rounded-xl shadow-lg ${bulkActionConfirm.action === 'Delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-brand-navy hover:bg-brand-navy/90 shadow-brand-navy/20'}`}>Confirm</button></div></motion.div></div>)}
      {deleteConfirm && (<div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md w-full space-y-4"><div className="flex items-center space-x-3 text-red-600"><div className="p-2 bg-red-100 rounded-full"><Trash2 size={24} /></div><h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3></div><p className="text-gray-600">Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.title || deleteConfirm.name || deleteConfirm.mayorName || deleteConfirm.attractionName}"</span>? This action cannot be undone.</p><div className="flex justify-end space-x-3 pt-4"><button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={() => { if (type === 'news') deleteNews(deleteConfirm.id); else if (type === 'announcements') deletePinned(deleteConfirm.id); else if (type === 'services') deleteService(deleteConfirm.id); else if (type === 'leadership') deleteLeadership(deleteConfirm.id); else if (type === 'history') deleteMayoralHistory(deleteConfirm.id); else if (type === 'initiatives') deleteInitiative(deleteConfirm.id); else if (type === 'events') deleteEvent(deleteConfirm.id); else if (type === 'documents') deleteDocument(deleteConfirm.id); else if (type === 'tourism') deleteTourism(deleteConfirm.id); else if (type === 'blog') deleteBlog(deleteConfirm.id); else if (type === 'media') deleteMedia(deleteConfirm.id); else if (type === 'administrative-units') deleteAdministrativeUnit(deleteConfirm.id); else if (type === 'growth-metrics') deleteGrowthMetric(deleteConfirm.id); setDeleteConfirm(null); }} className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700">Delete</button></div></motion.div></div>)}
      {activeLogUnit && (<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"><div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between"><div className="flex items-center space-x-2.5"><span className="p-1.5 bg-fuchsia-100 text-fuchsia-600 rounded-lg"><Activity size={18} /></span><div><h3 className="font-bold text-slate-900 leading-none">{activeLogUnit.name}</h3><p className="text-[10px] font-black uppercase text-fuchsia-600 tracking-wider mt-1">{activeLogUnit.type} Audit Ledger</p></div></div><button onClick={() => setActiveLogUnit(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div><div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"><div className="relative border-l-2 border-slate-100 ml-3.5 pl-5 space-y-5 py-2"><div className="relative"><span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm" /><div className="text-xs"><div className="flex items-center space-x-2 font-bold text-slate-800"><span>Refreshed Registry Metadata</span></div><p className="text-slate-500 mt-1">Sync process verified latest sub-city zoning indexes with local department database feeds.</p><span className="text-[10px] text-slate-400 font-mono block mt-1">{activeLogUnit.updatedAt?.split('T')[0] || '2026-05-30'} @ 14:15 UTC</span></div></div>{activeLogUnit.members && activeLogUnit.members.length ? (<div className="relative"><span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-fuchsia-400 shadow-sm" /><div className="text-xs"><div className="flex items-center space-x-2 font-bold text-slate-800"><span>Leadership Assignment Verified</span></div><p className="text-slate-500 mt-1">Confirmed appointment of <strong>{activeLogUnit.members[0].name}</strong> as the chief <strong>{activeLogUnit.members[0].role}</strong> directing administrative structures.</p><span className="text-[10px] text-slate-400 font-mono block mt-1">2026-05-18 @ 09:30 UTC</span></div></div>) : (<div className="relative"><span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-amber-500 shadow-sm" /><div className="text-xs"><div className="flex items-center space-x-2 font-bold text-slate-800"><span>Pending Leadership Allocation</span></div><p className="text-slate-500 mt-1">Bureau structural profile flagged for appointing a Chief Director and administrative lead.</p><span className="text-[10px] text-slate-400 font-mono block mt-1">2026-05-12 @ 11:20 UTC</span></div></div>)}<div className="relative"><span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-500 shadow-sm" /><div className="text-xs"><div className="flex items-center space-x-2 font-bold text-slate-800"><span>Administrative Unit Provisioned</span></div><p className="text-slate-500 mt-1">Initial municipal declaration entry for <strong>{activeLogUnit.name}</strong> was created on the central civic ledger.</p><span className="text-[10px] text-slate-400 font-mono block mt-1">{activeLogUnit.createdAt?.split('T')[0] || '2026-02-15'} @ 08:00 UTC</span></div></div></div></div><div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end"><button onClick={() => setActiveLogUnit(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Close Audit Log</button></div></motion.div></div>)}


      {quickEditMembersItem && (<QuickEditMembersModal unit={quickEditMembersItem} onClose={() => setQuickEditMembersItem(null)} onSave={async (unitId, updatedMembers) => { await updateAdministrativeUnit(unitId, { members: updatedMembers }); setQuickEditMembersItem((prev: AdministrativeUnit | null) => prev && prev.id === unitId ? { ...prev, members: updatedMembers } : prev); }} />)}
      {previewItem && (<div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden"><div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between"><div className="flex items-center space-x-2.5"><span className="p-1.5 bg-brand-teal/10 text-brand-teal-dark rounded-lg"><Eye size={18} /></span><div><h3 className="font-bold text-slate-900 leading-none">Content Inspector</h3><p className="text-[10px] font-black uppercase text-brand-teal-dark tracking-wider mt-1">{type} details & preview</p></div></div><button onClick={() => setPreviewItem(null)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div><div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"><div className="space-y-3"><div className="flex items-center space-x-2"><span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${previewItem.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{previewItem.status}</span><span className="text-slate-400 text-xs font-mono">ID: {previewItem.id}</span></div><h4 className="text-2xl font-black text-slate-900 tracking-tight">{previewItem.title || previewItem.name || previewItem.mayorName || previewItem.attractionName || "Untitled"}</h4></div>{(previewItem.image || previewItem.photo || previewItem.featuredImage || previewItem.url) && (<div className="h-44 w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50"><LazyImage src={previewItem.image || previewItem.photo || previewItem.featuredImage || previewItem.url} alt="Preview" className="w-full h-full object-cover" wrapperClassName="w-full h-full" /></div>)}<div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">{previewItem.category && <div><span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Category</span><span className="font-bold text-slate-800">{previewItem.category}</span></div>}{previewItem.author && <div><span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Author</span><span className="font-bold text-slate-800">{previewItem.author}</span></div>}{previewItem.date && <div><span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Date</span><span className="font-bold text-slate-800">{previewItem.date}</span></div>}{previewItem.expiryDate && <div><span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Expiry</span><span className="font-bold text-red-600">{previewItem.expiryDate}</span></div>}{previewItem.priority && <div><span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Priority</span><span className="font-bold inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-700">{previewItem.priority}</span></div>}</div>{(previewItem.content || previewItem.message || previewItem.description || previewItem.summary || previewItem.biography) && (<div className="space-y-2"><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Content</span>{previewItem.content && (type === 'news' || type === 'blog') ? (<div dangerouslySetInnerHTML={{ __html: previewItem.content }} className="rich-text-content text-slate-600 leading-relaxed text-sm border-l-2 border-brand-teal/40 pl-4 font-medium" />) : (<p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm border-l-2 border-brand-teal/40 pl-4 font-medium">{previewItem.content || previewItem.message || previewItem.description || previewItem.summary || previewItem.biography}</p>)}</div>)}{previewItem.requirements && previewItem.requirements.length > 0 && (<div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Requirements</span><ul className="list-disc list-inside text-xs text-slate-600">{(previewItem.requirements as string[])?.map((r: string, i: number) => <li key={i}>{r}</li>)}</ul></div>)}{previewItem.achievements && previewItem.achievements.length > 0 && (<div><span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Achievements</span><ul className="list-disc list-inside text-xs text-slate-600">{(previewItem.achievements as string[])?.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul></div>)}</div><div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end"><button onClick={() => setPreviewItem(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">Close Inspector</button></div></motion.div></div>)}
      {showImportPanel && (<div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden"><div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between"><div className="flex items-center space-x-2.5"><span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Upload size={18} /></span><div><h3 className="font-bold text-slate-900 leading-none">Bulk Migration Importer</h3><p className="text-[10px] font-black uppercase text-blue-600 tracking-wider mt-1">Import old website data to "{type}"</p></div></div><button onClick={() => { setShowImportPanel(false); setParsedImportItems([]); setImportError(null); setImportLogs([]); }} disabled={isImporting} className="p-1.5 hover:bg-slate-100 rounded-lg"><X size={18} /></button></div><div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto"><p className="text-xs text-slate-500 leading-relaxed font-semibold">Supports migrating database files from your old website. Upload a <strong>JSON</strong> list or <strong>CSV / Excel spreadsheet</strong> with corresponding keys (e.g. title, content, category, author).</p>{!isImporting && (<div className="space-y-3"><label className="block text-xs font-black uppercase text-slate-400 tracking-wider">Choose File to Import</label><label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 transition-all rounded-2xl p-6 cursor-pointer"><Upload className="text-slate-400 group-hover:text-blue-500 mb-2" size={28} /><span className="text-xs font-bold text-slate-600">Click to select or drag & drop</span><span className="text-[10px] text-slate-400 mt-1 uppercase font-mono">.json, .csv, .xlsx, .xls</span><input type="file" accept=".json,.csv,.xlsx,.xls" className="hidden" onChange={handleImportFileChange} /></label></div>)}{importError && (<div className="p-3.5 bg-red-50 border border-red-150 rounded-xl flex items-start space-x-2"><AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" /><span className="text-xs text-red-700 font-bold">{importError}</span></div>)}{parsedImportItems.length > 0 && (<div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-2xl space-y-2"><div className="flex justify-between items-center text-xs"><span className="font-bold text-emerald-800">✓ Ready to migrate: {parsedImportItems.length} records</span><span className="font-mono text-[9px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold uppercase">{type}</span></div><div className="max-h-24 overflow-y-auto bg-white/70 rounded-lg p-2 border border-emerald-100 text-[10px] divide-y divide-emerald-50">{parsedImportItems.slice(0,10).map((itm: any, idx: number) => (<div key={idx} className="py-1 text-slate-600 font-medium truncate">#{idx+1}: <strong>{itm.title || itm.name || 'Untitled Record'}</strong></div>))}{parsedImportItems.length > 10 && (<div className="pt-1 text-slate-400 font-bold text-center">... and {parsedImportItems.length - 10} more records ...</div>)}</div></div>)}{isImporting && (<div className="space-y-3 py-2"><div className="flex justify-between text-xs font-bold"><span className="text-slate-900">Migrating Records...</span><span>{importProgress}%</span></div><div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${importProgress}%` }} /></div><div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider"><span className="text-emerald-600 font-extrabold">success: {importStats.success}</span><span className="text-red-600 font-extrabold">failed: {importStats.failed}</span></div></div>)}{importLogs.length > 0 && (<div className="space-y-1.5"><span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Migration Log</span><div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl h-44 overflow-y-auto text-xs font-mono space-y-1">{importLogs.map((log, idx) => (<div key={idx} className={log.startsWith('✓') ? 'text-emerald-400 font-semibold' : 'text-red-400 font-bold'}>{log}</div>))}</div></div>)}</div><div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3"><button onClick={() => { setShowImportPanel(false); setParsedImportItems([]); setImportError(null); setImportLogs([]); }} disabled={isImporting} className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-gray-50">Close</button>{parsedImportItems.length > 0 && !isImporting && (<button onClick={executeBulkImport} className="px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">Start Import</button>)}</div></motion.div></div>)}

      
      <ExportConfirmationModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onConfirm={exportType === 'CSV' ? executeExportToCSV : executeExportToExcel} title={`${type.toUpperCase()} Bulk Exporter`} type={exportType} recordCount={filteredData.length} estimatedSize={exportType === 'CSV' ? `~${Math.ceil(filteredData.length * 0.18)} KB` : `~${Math.ceil(filteredData.length * 0.28)} KB`} />
    </div>
  );
};