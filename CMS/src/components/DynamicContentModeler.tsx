import { dynamicSchemasService, dynamicContentService } from '../services/api';
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Save, 
  PlusCircle, 
  Eye, 
  FileCode, 
  Settings2, 
  Activity, 
  Sparkles,
  ClipboardList,
  Edit,
  X,
  AlertCircle,
  Clock,
  User,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces for Dynamic Schema definition
export interface SchemaField {
  name: string;
  title: string;
  type: 'string' | 'number' | 'boolean' | 'textarea' | 'array';
  required: boolean;
  options?: string[]; // for selectable lists if needed
}

export interface DynamicSchema {
  id?: number;
  name: string;
  title: string;
  description: string;
  schema_definition: {
    type: 'object';
    properties: Record<string, {
      type: 'string' | 'number' | 'boolean' | 'array';
      title: string;
      fieldType?: 'string' | 'number' | 'boolean' | 'textarea' | 'array';
      description?: string;
    }>;
    required: string[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface DynamicContent {
  id?: number;
  schema_name: string;
  data: Record<string, any>;
  status: 'draft' | 'published';
  language: string;
  author: string;
  created_at?: string;
  updated_at?: string;
}

export const DynamicContentModeler: React.FC = () => {
  // Navigation states
  const [schemas, setSchemas] = useState<DynamicSchema[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<DynamicSchema | null>(null);
  const [contentList, setContentList] = useState<DynamicContent[]>([]);
  
  // Builder / Modeler Panel
  const [isCreatingSchema, setIsCreatingSchema] = useState(false);
  const [schemaName, setSchemaName] = useState('');
  const [schemaTitle, setSchemaTitle] = useState('');
  const [schemaDesc, setSchemaDesc] = useState('');
  const [builderFields, setBuilderFields] = useState<SchemaField[]>([
    { name: 'title', title: 'Content Title', type: 'string', required: true },
    { name: 'subtitle', title: 'Subtitle', type: 'string', required: false }
  ]);

  // Form Entry Panel (Schema Instance)
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [editingContent, setEditingContent] = useState<DynamicContent | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formStatus, setFormStatus] = useState<'draft' | 'published'>('draft');
  const [formLanguage, setFormLanguage] = useState('en');

  // Diagnostic Logs & UI states
  const [logs, setLogs] = useState<string[]>(['System initialized. Listening for dynamic CMS registrations...']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  

// ========== Load schemas ==========
const fetchSchemas = async () => {
  setIsLoading(true);
  try {
    const data = await dynamicSchemasService.getAll();
    // data is directly the array of schemas
    setSchemas(data);
    addLog(`Successfully loaded ${data.length} dynamic content schemas from registry.`);
  } catch (err: any) {
    setError(err?.message || 'Failed fetching schemas');
  } finally {
    setIsLoading(false);
  }
};

// ========== Load content for selected schema ==========
const handleSelectSchema = async (schema: DynamicSchema) => {
  setSelectedSchema(schema);
  setIsAddingContent(false);
  setEditingContent(null);
  setIsCreatingSchema(false);
  setError(null);

  setIsLoading(true);
  try {
    const contentService = dynamicContentService(schema.name);
    const data = await contentService.getAll(); // returns array of content items
    // Normalise data (in case it's stringified)
    const items = data.map((it: any) => ({
      ...it,
      data: typeof it.data === 'string' ? JSON.parse(it.data) : it.data
    }));
    setContentList(items);
    addLog(`Loaded ${items.length} records for dynamic model: ${schema.title} (${schema.name})`);
  } catch (err: any) {
    setError(err?.message || 'Error pulling dynamic content');
    setContentList([]);
  } finally {
    setIsLoading(false);
  }
};

// ========== Create new schema ==========
const handlePublishSchema = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!schemaName.trim() || !schemaTitle.trim()) {
    showToast('Schema identifier name and title label is mandatory.');
    return;
  }

  // Build JSON Schema properties from builder fields
  const properties: Record<string, any> = {};
  const required: string[] = [];

  builderFields.forEach(f => {
    const fieldTypeMapping = f.type === 'textarea' ? 'string' : f.type;
    properties[f.name] = {
      type: fieldTypeMapping,
      title: f.title,
      fieldType: f.type,
      description: `Custom model dynamic property: ${f.title}`
    };
    if (f.required) {
      required.push(f.name);
    }
  });

  const schema_definition = {
    type: 'object' as const,
    properties,
    required
  };

  const payload = {
    name: schemaName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    title: schemaTitle.trim(),
    description: schemaDesc.trim(),
    schema_definition
  };

  setIsLoading(true);
  setError(null);
  try {
    const newSchema = await dynamicSchemasService.create(payload);
    // Normalise schema definition if returned as string
    if (typeof newSchema.schema_definition === 'string') {
      newSchema.schema_definition = JSON.parse(newSchema.schema_definition);
    }
    setSchemas(prev => [newSchema, ...prev]);
    setIsCreatingSchema(false);
    setSchemaName('');
    setSchemaTitle('');
    setSchemaDesc('');
    setBuilderFields([
      { name: 'title', title: 'Content Title', type: 'string', required: true },
      { name: 'subtitle', title: 'Subtitle', type: 'string', required: false }
    ]);
    showToast(`Schema '${payload.title}' initialized successfully!`);
    addLog(`Registered new dynamic JSON Schema: ${payload.name} conforms to system structure.`);
    handleSelectSchema(newSchema);
  } catch (err: any) {
    setError(err?.message || 'Fail during schema generation');
  } finally {
    setIsLoading(false);
  }
};

// ========== Delete schema ==========
const handleDeleteSchema = async (schema: DynamicSchema) => {
  if (!confirm(`Are you absolutely sure you want to delete schema '${schema.title}'?\nThis will purge ALL dynamic content matching this model!`)) return;

  setIsLoading(true);
  setError(null);
  try {
    await dynamicSchemasService.delete(schema.name);
    setSchemas(prev => prev.filter(s => s.name !== schema.name));
    setSelectedSchema(null);
    setContentList([]);
    showToast(`Schema '${schema.title}' removed from active registry.`);
    addLog(`Purged dynamic schema structure and associated indexes: ${schema.name}`);
  } catch (err: any) {
    setError(err?.message || 'Error deleting schema');
  } finally {
    setIsLoading(false);
  }
};

// ========== Save content (create or update) ==========
const handleSaveContent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedSchema) return;

  // Validate required fields
  const props = selectedSchema.schema_definition.properties || {};
  const required = selectedSchema.schema_definition.required || [];
  const missing: string[] = [];

  required.forEach(k => {
    const val = formData[k];
    if (val === undefined || val === null || val === '') {
      missing.push(props[k]?.title || k);
    }
  });

  if (missing.length > 0) {
    showToast(`Missing required values: ${missing.join(', ')}`);
    return;
  }

  const payload = {
    data: formData,
    status: formStatus,
    language: formLanguage
  };

  setIsLoading(true);
  setError(null);
  try {
    const contentService = dynamicContentService(selectedSchema.name);
    let saved;
    if (editingContent) {
      saved = await contentService.update(editingContent.id, payload);
    } else {
      saved = await contentService.create(payload);
    }
    // Normalise saved data
    const normalizedSaved = {
      ...saved,
      data: typeof saved.data === 'string' ? JSON.parse(saved.data) : saved.data
    };

    if (editingContent) {
      setContentList(prev => prev.map(item => item.id === normalizedSaved.id ? normalizedSaved : item));
      showToast('Dynamic custom record updated.');
      addLog(`Updated content row in '${selectedSchema.name}' [ID: ${normalizedSaved.id}]`);
    } else {
      setContentList(prev => [normalizedSaved, ...prev]);
      showToast('Dynamic custom record saved successfully.');
      addLog(`Injected new content row in '${selectedSchema.name}' [ID: ${normalizedSaved.id}]`);
    }
    setIsAddingContent(false);
    setEditingContent(null);
  } catch (err: any) {
    setError(err?.message || 'Error processing dynamic content transaction');
  } finally {
    setIsLoading(false);
  }
};

// ========== Delete content item ==========
const handleDeleteContent = async (id: number) => {
  if (!selectedSchema || !confirm('Are you sure you want to delete this content item?')) return;

  setIsLoading(true);
  setError(null);
  try {
    const contentService = dynamicContentService(selectedSchema.name);
    await contentService.delete(id);
    setContentList(prev => prev.filter(item => item.id !== id));
    showToast('Dynamic custom record purged.');
    addLog(`Deleted content item row under schema '${selectedSchema.name}' [ID: ${id}]`);
  } catch (err: any) {
    setError(err?.message || 'Error deleting dynamic record');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 p-2 select-none" id="dynamic-content-modeler">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-8 z-[100] bg-brand-navy border border-brand-teal/30 hover:border-brand-teal shadow-2xl p-4 rounded-2xl flex items-center space-x-3 text-xs"
          >
            <CheckCircle2 size={16} className="text-brand-teal animate-bounce" />
            <span className="font-extrabold font-mono text-white tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-left select-none">
          <div className="flex items-center space-x-2">
            <span className="p-2.5 bg-brand-teal/10 rounded-2xl text-brand-teal inline-block">
              <Database size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Headless CMS Content Modeler</span>
                <span className="text-[10px] bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Dynamic JSON-Schema</span>
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Design custom schemas on the fly using standard JSON-Schema properties. Instantly render high-fidelity, validated forms decoupled from rigid physical tables.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsCreatingSchema(true);
              setSelectedSchema(null);
              setIsAddingContent(false);
              setEditingContent(null);
            }}
            className="px-4 py-2.5 bg-brand-teal hover:bg-teal-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs transition duration-200 flex items-center space-x-2 shadow-lg shadow-brand-teal/10"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Create Custom Schema</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SIDE ARCHITECTURE: Registered schemas */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Schema Registry</span>
              <span className="text-brand-teal font-mono bg-brand-teal/10 px-2 py-0.5 rounded-lg text-[10px]">{schemas.length} Loaded</span>
            </h3>

            {isLoading && schemas.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">Loading registry...</div>
            ) : schemas.length === 0 ? (
              <div className="py-8 text-center text-xs font-semibold text-slate-400 text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                No custom schemas created. Use the button above to spawn a new modeling schema.
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {schemas.map((s) => {
                  const isSelected = selectedSchema?.name === s.name;
                  return (
                    <div 
                      key={s.name}
                      onClick={() => handleSelectSchema(s)}
                      className={`group p-3.5 rounded-2xl cursor-pointer transition border text-left flex items-start space-x-3 select-none ${
                        isSelected 
                          ? 'bg-brand-teal/10 border-brand-teal text-brand-teal hover:bg-brand-teal/15 font-black' 
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl mt-0.5 shrink-0">
                        <FileCode size={13} className={isSelected ? 'text-brand-teal' : 'text-slate-400'} />
                      </div>
                      <div className="min-w-0 pr-1 flex-1">
                        <p className="text-xs font-bold truncate leading-none text-slate-800 dark:text-white capitalize">{s.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 font-bold">fields: {Object.keys(s.schema_definition.properties || {}).length}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSchema(s);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition shrink-0"
                        title="Delete this schema model"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Diagnostic telemetry */}
          <div className="bg-slate-50 dark:bg-[#030a1c] border border-slate-200 dark:border-slate-800/40 rounded-3xl p-5 shadow-inner text-left">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center space-x-2">
              <Activity size={12} className="text-brand-teal animate-pulse" />
              <span>Telemetry Schema Logs</span>
            </h3>
            <div className="h-[120px] overflow-y-auto text-[10px] font-mono text-slate-400 dark:text-slate-400 space-y-2 custom-scrollbar">
              {logs.map((log, idx) => (
                <p key={idx} className="leading-relaxed border-b border-slate-150 dark:border-slate-900 pb-1 truncate">{log}</p>
              ))}
            </div>
          </div>
        </div>

        {/* WORKSTAGE: Main Display Panel */}
        <div className="lg:col-span-9">
          
          {/* STATE 1: Creating/Building custom Schema */}
          {isCreatingSchema && (
            <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-md text-left">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <Sparkles className="text-brand-magenta animate-pulse" size={16} />
                    <span>Design Dynamic Content Model Schema</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Provide model settings and parameters to construct the editable JSON layout.</p>
                </div>
                <button 
                  onClick={() => setIsCreatingSchema(false)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handlePublishSchema} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Schema Name (System key)</label>
                    <input 
                      type="text"
                      placeholder="e.g. press-releases"
                      required
                      value={schemaName}
                      onChange={(e) => setSchemaName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal font-mono transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Display Title (User Friendly)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Official Press Releases"
                      required
                      value={schemaTitle}
                      onChange={(e) => setSchemaTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Description</label>
                    <textarea 
                      placeholder="Describe what content is modeled inside this dynamic module catalog..."
                      rows={2}
                      value={schemaDesc}
                      onChange={(e) => setSchemaDesc(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-850 pt-5">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Settings2 size={14} className="text-brand-teal" />
                      <span>Schema Fields Definition Registry</span>
                    </h4>
                    <button
                      type="button"
                      onClick={addBuilderField}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-[11px] font-bold text-slate-600 dark:text-slate-300 transition flex items-center space-x-1"
                    >
                      <PlusCircle size={12} strokeWidth={2.5} />
                      <span>Add New Attribute field</span>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto p-1 custom-scrollbar">
                    {builderFields.map((field, index) => (
                      <div 
                        key={index}
                        className="bg-slate-50 dark:bg-slate-905 p-3.5 border border-slate-150 dark:border-slate-850 rounded-2xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <div className="md:col-span-3">
                          <input 
                            type="text"
                            placeholder="field_key"
                            required
                            value={field.name}
                            onChange={(e) => updateBuilderField(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-white focus:outline-none placeholder-slate-400"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <input 
                            type="text"
                            placeholder="Display Label"
                            required
                            value={field.title}
                            onChange={(e) => updateBuilderField(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-teal placeholder-slate-400"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <select
                            value={field.type}
                            onChange={(e) => updateBuilderField(index, 'type', e.target.value as any)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-teal"
                          >
                            <option value="string">Text String</option>
                            <option value="textarea">Rich Textarea</option>
                            <option value="number">Numeric Weight</option>
                            <option value="boolean">Toggle Boolean</option>
                          </select>
                        </div>

                        <div className="md:col-span-1.5 flex items-center justify-center">
                          <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-slate-400 dark:text-slate-500">
                            <input 
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateBuilderField(index, 'required', e.target.checked)}
                              className="w-3.5 h-3.5 text-brand-teal dark:bg-slate-900 border-slate-300 rounded focus:ring-brand-teal/20"
                            />
                            <span>Required</span>
                          </label>
                        </div>

                        <div className="md:col-span-0.5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeBuilderField(index)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition"
                            title="Remove field"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2 text-xs text-rose-500">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingSchema(false)}
                    className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-brand-teal text-slate-950 rounded-xl text-xs font-black transition active:scale-95 shadow-lg shadow-brand-teal/10"
                  >
                    {isLoading ? 'Configuring Schema...' : 'Register content model schema'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STATE 2: Viewing custom schema dynamic content rows */}
          {selectedSchema && !isCreatingSchema && (
            <div className="space-y-6">
              
              {/* Add or edit content box */}
              {isAddingContent ? (
                <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-md text-left">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                        <PlusCircle className="text-brand-teal" size={16} />
                        <span>{editingContent ? 'Edit Custom Content Record' : 'Inject Custom Content Record'}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Conforms dynamically to schema: <span className="font-mono text-brand-teal">{selectedSchema.name}</span></p>
                    </div>
                    <button 
                      onClick={() => setIsAddingContent(false)}
                      className="p-1.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-400 hover:text-slate-700"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveContent} className="space-y-5">
                    
                    {/* Render fields from schema definition dynamically */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedSchema.schema_definition.properties || {}).map(([key, config]: [string, any]) => {
                        const isRequired = selectedSchema.schema_definition.required?.includes(key);
                        const label = config.title || key;
                        const fieldType = config.fieldType || config.type || 'string';

                        return (
                          <div 
                            key={key} 
                            className={`space-y-2 ${fieldType === 'textarea' ? 'md:col-span-2' : ''}`}
                          >
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                              <span>{label}</span>
                              {isRequired && <span className="text-rose-500 font-bold">&#10033; required</span>}
                            </label>

                            {fieldType === 'textarea' ? (
                              <textarea
                                value={formData[key] || ''}
                                required={isRequired}
                                rows={4}
                                onChange={(e) => handleFormChange(key, e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition"
                                placeholder={`Enter rich body text for ${label}...`}
                              />
                            ) : fieldType === 'boolean' ? (
                              <div className="flex items-center space-x-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl">
                                <input
                                  type="checkbox"
                                  id={key}
                                  checked={!!formData[key]}
                                  onChange={(e) => handleFormChange(key, e.target.checked)}
                                  className="w-4 h-4 text-brand-teal dark:bg-slate-950 border-slate-300 rounded focus:ring-brand-teal/20 focus:border-brand-teal"
                                />
                                <label htmlFor={key} className="text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                                  Enable / Authorize state
                                </label>
                              </div>
                            ) : fieldType === 'number' ? (
                              <input
                                type="number"
                                value={formData[key] || ''}
                                required={isRequired}
                                onChange={(e) => handleFormChange(key, e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition font-mono"
                                placeholder="0"
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData[key] || ''}
                                required={isRequired}
                                onChange={(e) => handleFormChange(key, e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal transition"
                                placeholder={`Enter metadata values for ${label}...`}
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Language and status */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Language translation</label>
                        <select
                          value={formLanguage}
                          onChange={(e) => setFormLanguage(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                        >
                          <option value="en">English (en)</option>
                          <option value="om">Afaan Oromoo (om)</option>
                          <option value="am">Amharic (am)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Workflow Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                        >
                          <option value="draft">Draft mode</option>
                          <option value="published">Ready to Publish</option>
                        </select>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2 text-xs text-rose-500">
                        <AlertCircle size={14} />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex justify-end space-x-2 font-black">
                      <button
                        type="button"
                        onClick={() => setIsAddingContent(false)}
                        className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-brand-teal text-slate-950 text-xs font-black rounded-xl hover:scale-101 active:scale-95 shadow-md shadow-brand-teal/10 transition"
                      >
                        {isLoading ? 'Saving Content...' : editingContent ? 'Update Custom Item' : 'Publish Custom Item'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                
                // Existing Records Table conforming dynamically to the current schema properties
                <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden">
                  
                  {/* Decorative background logo */}
                  <div className="absolute right-0 bottom-0 pointer-events-none translate-x-12 translate-y-12 opacity-[0.015] dark:opacity-[0.03] text-brand-teal">
                    <Database size={300} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-800 pb-4 mb-4 select-none">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white capitalize flex items-center space-x-1.5">
                        <ClipboardList className="text-brand-teal" size={18} />
                        <span>{selectedSchema.title} Records Ledger</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {selectedSchema.description || `Viewing dynamic content rows under active schema model: ${selectedSchema.name}`}
                      </p>
                    </div>

                    <button
                      onClick={handleStartAddContent}
                      className="px-4 py-2 bg-brand-teal hover:bg-teal-600 font-extrabold text-xs text-slate-950 rounded-xl active:scale-95 transition flex items-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>Insert custom Row</span>
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-bold">Querying DB repository tables...</div>
                  ) : contentList.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-905 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl select-none">
                      <Database className="mx-auto mb-3 opacity-30 text-brand-teal animate-pulse" size={28} />
                      <p className="text-xs font-black">No content rows registered under: {selectedSchema.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[255px] mx-auto leading-relaxed">
                        Insert a custom row leveraging the automatically compiled UI form to persist dynamic data keys.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-450 dark:text-slate-500 font-black">
                            <th className="py-3 px-3">Entry ID</th>
                            
                            {/* Render up to 3 field columns dynamically */}
                            {Object.entries(selectedSchema.schema_definition.properties || {}).slice(0, 3).map(([key, config]: [string, any]) => (
                              <th key={key} className="py-3 px-3 capitalize">{config.title || key}</th>
                            ))}

                            <th className="py-3 px-3">State</th>
                            <th className="py-3 px-3">Lang</th>
                            <th className="py-3 px-3">Responsible</th>
                            <th className="py-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                          {contentList.map((item) => {
                            const dataPayload = item.data || {};
                            return (
                              <tr 
                                key={item.id}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-900/30 transition text-slate-750 dark:text-slate-350"
                              >
                                <td className="py-3 px-3 font-mono font-bold text-slate-400 dark:text-slate-500">#{item.id}</td>
                                
                                {/* Dynamically read payload matching table headers */}
                                {Object.entries(selectedSchema.schema_definition.properties || {}).slice(0, 3).map(([key, config]: [string, any]) => {
                                  const cellVal = dataPayload[key];
                                  const ft = config.fieldType || config.type;

                                  let renderText = '-';
                                  if (cellVal !== undefined && cellVal !== null) {
                                    if (typeof cellVal === 'boolean') {
                                      renderText = cellVal ? 'Yes' : 'No';
                                    } else {
                                      renderText = cellVal.toString();
                                    }
                                  }

                                  return (
                                    <td key={key} className="py-3 px-3 truncate max-w-[120px] font-medium text-slate-800 dark:text-slate-200">
                                      {ft === 'textarea' ? (
                                        <span className="text-[10px] text-slate-400 italic">Body Content ({renderText.length} chars)</span>
                                      ) : renderText}
                                    </td>
                                  );
                                })}

                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                                    item.status === 'published' 
                                      ? 'bg-emerald-500/15 text-emerald-500' 
                                      : 'bg-amber-500/15 text-amber-500'
                                  }`}>
                                    {item.status}
                                  </span>
                                </td>

                                <td className="py-3 px-3 font-mono text-[10px] uppercase font-bold text-brand-teal">{item.language}</td>
                                <td className="py-3 px-3 flex items-center space-x-1.5 pt-4 text-[11px]">
                                  <div className="w-5 h-5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] text-slate-500 uppercase font-black shrink-0">
                                    {(item.author || 'c')[0]}
                                  </div>
                                  <span className="truncate">{item.author || 'Desk Operator'}</span>
                                </td>

                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => handleStartEditContent(item)}
                                      className="p-1 px-2 border border-slate-150 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-brand-teal transition-all flex items-center space-x-1"
                                      title="Edit details"
                                    >
                                      <Edit size={10} />
                                      <span className="text-[9px]">Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteContent(item.id!)}
                                      className="p-1 text-slate-400 hover:text-rose-500 bg-rose-500/0 hover:bg-rose-500/10 rounded-lg transition"
                                      title="Delete record"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STATE 3: Workspace instructions if nothing is selected or creating */}
          {!selectedSchema && !isCreatingSchema && (
            <div className="bg-white dark:bg-[#09152C] border border-slate-200 dark:border-slate-800/60 rounded-3xl p-10 text-center shadow-sm select-none">
              <Database className="mx-auto mb-4 text-brand-teal animate-pulse opacity-40" size={40} />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Active JSON Schema Workshop</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Configure meta-data parameters and models dynamically. Once compiled, standard admin clients will register customizable entry forms directly mapping to the database JSONB formats.
              </p>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                <div 
                  onClick={() => setIsCreatingSchema(true)}
                  className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-850 hover:border-brand-teal rounded-2xl cursor-pointer group transition duration-300"
                >
                  <Sparkles size={16} className="text-brand-teal mb-2 group-hover:scale-110 transition duration-300" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">Create Custom Field Models</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Register completely custom schema definitions without compile-time restrictions.</p>
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-850 cursor-default rounded-2xl">
                  <Globe size={16} className="text-emerald-400 mb-2" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight">Fully Localized fallbacks</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Supports Oromo (om) and Amharic (am) multi-language catalog structures seamlessly.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
