import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { turfResearchApi, Treatment, CreateTreatmentData } from '../../api/turf-research';

interface TreatmentFormProps {
  treatment?: Treatment | null;
  defaultPlotId?: number;
  onClose: () => void;
}

export default function TreatmentForm({ treatment, defaultPlotId, onClose }: TreatmentFormProps) {
  const [formData, setFormData] = useState<CreateTreatmentData>({
    plots: defaultPlotId ? [defaultPlotId] : [],
    treatment_type: 'water',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    water_details: { amount_inches: 0 },
  });
  const [selectedPlotIds, setSelectedPlotIds] = useState<number[]>(defaultPlotId ? [defaultPlotId] : []);
  const [expandedPlots, setExpandedPlots] = useState<Set<number>>(new Set());

  const queryClient = useQueryClient();

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await turfResearchApi.getPlots();
      // Handle both paginated and non-paginated responses
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  // Build hierarchy structure
  const buildHierarchy = () => {
    if (!plots || !Array.isArray(plots)) return [];
    
    const plotMap = new Map(plots.map(p => [p.id, { ...p, children: [] as any[] }]));
    const rootPlots: any[] = [];
    
    plots.forEach(plot => {
      const plotNode = plotMap.get(plot.id);
      if (plot.parent_plot) {
        const parent = plotMap.get(plot.parent_plot);
        if (parent) {
          parent.children.push(plotNode);
        }
      } else {
        rootPlots.push(plotNode);
      }
    });
    
    return rootPlots;
  };

  const hierarchy = buildHierarchy();

  // Get all subplot IDs recursively
  const getAllSubplotIds = (plotId: number): number[] => {
    if (!plots) return [];
    const plot = plots.find((p: any) => p.id === plotId);
    if (!plot) return [];
    
    const subplots = plots.filter((p: any) => p.parent_plot === plotId);
    const subplotIds = subplots.map((p: any) => p.id);
    
    // Recursively get sub-subplots
    subplots.forEach((subplot: any) => {
      subplotIds.push(...getAllSubplotIds(subplot.id));
    });
    
    return subplotIds;
  };

  // Handle plot selection with automatic subplot inclusion
  const handlePlotToggle = (plotId: number) => {
    const isSelected = selectedPlotIds.includes(plotId);
    
    if (isSelected) {
      // Deselect this plot and all its subplots
      const subplotIds = getAllSubplotIds(plotId);
      const idsToRemove = [plotId, ...subplotIds];
      setSelectedPlotIds(prev => prev.filter(id => !idsToRemove.includes(id)));
    } else {
      // Select this plot and all its subplots
      const subplotIds = getAllSubplotIds(plotId);
      const idsToAdd = [plotId, ...subplotIds];
      setSelectedPlotIds(prev => [...new Set([...prev, ...idsToAdd])]);
    }
  };

  const toggleExpand = (plotId: number) => {
    setExpandedPlots(prev => {
      const next = new Set(prev);
      if (next.has(plotId)) {
        next.delete(plotId);
      } else {
        next.add(plotId);
      }
      return next;
    });
  };

  // Update formData when selectedPlotIds changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      plots: selectedPlotIds,
    }));
  }, [selectedPlotIds]);

  useEffect(() => {
    if (treatment) {
      setSelectedPlotIds(treatment.plots);
      setFormData({
        plots: treatment.plots,
        treatment_type: treatment.treatment_type,
        date: treatment.date,
        time: treatment.time || '',
        notes: treatment.notes,
        water_details: treatment.water_details,
        fertilizer_details: treatment.fertilizer_details,
        chemical_details: treatment.chemical_details,
        mowing_details: treatment.mowing_details,
      });
    }
  }, [treatment]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTreatmentData) => turfResearchApi.createTreatment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateTreatmentData) => turfResearchApi.updateTreatment(treatment!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['plots'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up data before submission
    const submitData: any = {
      ...formData,
    };
    
    // Remove time if empty
    if (!formData.time || formData.time.trim() === '') {
      delete submitData.time;
    }
    
    // Ensure chemical_type is set if chemical treatment
    if (formData.treatment_type === 'chemical' && submitData.chemical_details) {
      if (!submitData.chemical_details.chemical_type) {
        submitData.chemical_details.chemical_type = 'herbicide';
      }
    }
    
    if (treatment) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    if (name === 'treatment_type') {
      // When treatment type changes, initialize the appropriate details object with defaults
      const newFormData: any = {
        ...formData,
        treatment_type: value,
        // Clear all detail objects
        water_details: undefined,
        fertilizer_details: undefined,
        chemical_details: undefined,
        mowing_details: undefined,
      };

      // Initialize the selected type with defaults
      switch (value) {
        case 'water':
          newFormData.water_details = {};
          break;
        case 'fertilizer':
          newFormData.fertilizer_details = {};
          break;
        case 'chemical':
          newFormData.chemical_details = { chemical_type: 'herbicide' };
          break;
        case 'mowing':
          newFormData.mowing_details = {};
          break;
      }
      
      setFormData(newFormData);
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateTreatmentData] as any),
          [child]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const renderTreatmentFields = () => {
    switch (formData.treatment_type) {
      case 'water':
        return (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amount (inches) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="water_details.amount_inches"
                value={formData.water_details?.amount_inches || ''}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Duration (minutes)</label>
              <input
                type="number"
                name="water_details.duration_minutes"
                value={formData.water_details?.duration_minutes || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Method</label>
              <input
                type="text"
                name="water_details.method"
                value={formData.water_details?.method || ''}
                onChange={handleChange}
                placeholder="e.g., sprinkler, drip"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
          </>
        );

      case 'fertilizer':
        return (
          <>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fertilizer_details.product_name"
                value={formData.fertilizer_details?.product_name || ''}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">NPK Ratio</label>
              <input
                type="text"
                name="fertilizer_details.npk_ratio"
                value={formData.fertilizer_details?.npk_ratio || ''}
                onChange={handleChange}
                placeholder="e.g., 20-10-10"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fertilizer_details.amount"
                value={formData.fertilizer_details?.amount || ''}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unit</label>
              <input
                type="text"
                name="fertilizer_details.amount_unit"
                value={formData.fertilizer_details?.amount_unit || 'lbs'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rate per 1000 sq ft</label>
              <input
                type="number"
                name="fertilizer_details.rate_per_1000sqft"
                value={formData.fertilizer_details?.rate_per_1000sqft || ''}
                onChange={handleChange}
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
          </>
        );

      case 'chemical':
        return (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Chemical Type <span className="text-red-500">*</span>
              </label>
              <select
                name="chemical_details.chemical_type"
                value={formData.chemical_details?.chemical_type || 'herbicide'}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              >
                <option value="herbicide">Herbicide</option>
                <option value="insecticide">Insecticide</option>
                <option value="fungicide">Fungicide</option>
                <option value="growth_regulator">Growth Regulator</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="chemical_details.product_name"
                value={formData.chemical_details?.product_name || ''}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Active Ingredient</label>
              <input
                type="text"
                name="chemical_details.active_ingredient"
                value={formData.chemical_details?.active_ingredient || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="chemical_details.amount"
                value={formData.chemical_details?.amount || ''}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Unit</label>
              <input
                type="text"
                name="chemical_details.amount_unit"
                value={formData.chemical_details?.amount_unit || 'oz'}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Rate per 1000 sq ft</label>
              <input
                type="number"
                name="chemical_details.rate_per_1000sqft"
                value={formData.chemical_details?.rate_per_1000sqft || ''}
                onChange={handleChange}
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">Target Pest</label>
              <input
                type="text"
                name="chemical_details.target_pest"
                value={formData.chemical_details?.target_pest || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
          </>
        );

      case 'mowing':
        return (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Height (inches) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="mowing_details.height_inches"
                value={formData.mowing_details?.height_inches || ''}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Mower Type</label>
              <input
                type="text"
                name="mowing_details.mower_type"
                value={formData.mowing_details?.mower_type || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Pattern</label>
              <input
                type="text"
                name="mowing_details.pattern"
                value={formData.mowing_details?.pattern || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="mowing_details.clippings_removed"
                checked={formData.mowing_details?.clippings_removed || false}
                onChange={handleChange}
                className="mr-2 h-5 w-5"
              />
              <label className="text-gray-700 font-semibold">Clippings Removed</label>
            </div>
          </>
        );
    }
  };

  // Render plot tree recursively
  const renderPlotTree = (plotNode: any, depth: number = 0) => {
    const hasChildren = plotNode.children && plotNode.children.length > 0;
    const isExpanded = expandedPlots.has(plotNode.id);
    const isSelected = selectedPlotIds.includes(plotNode.id);
    const subplotCount = getAllSubplotIds(plotNode.id).length;
    
    return (
      <div key={plotNode.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center gap-2 py-1 hover:bg-gray-50">
          {hasChildren && (
            <button
              type="button"
              onClick={() => toggleExpand(plotNode.id)}
              className="text-gray-500 hover:text-gray-700 w-5 h-5 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handlePlotToggle(plotNode.id)}
              className="w-4 h-4 text-purdue-gold focus:ring-purdue-gold"
            />
            <span className={`${isSelected ? 'font-semibold text-purdue-gold' : 'text-gray-700'}`}>
              {plotNode.name}
              {subplotCount > 0 && (
                <span className="text-xs text-gray-500 ml-1">
                  (+{subplotCount} sub-plot{subplotCount !== 1 ? 's' : ''})
                </span>
              )}
            </span>
          </label>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {plotNode.children.map((child: any) => renderPlotTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {treatment ? 'Edit Treatment' : 'Create New Treatment'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Select Plots <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded p-3 max-h-64 overflow-y-auto bg-white">
            {hierarchy.length > 0 ? (
              hierarchy.map(plotNode => renderPlotTree(plotNode))
            ) : (
              <p className="text-gray-500 text-sm">No plots available</p>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {selectedPlotIds.length > 0 ? (
              <>
                <span className="font-semibold text-purdue-gold">{selectedPlotIds.length} plot{selectedPlotIds.length !== 1 ? 's' : ''} selected</span>
                {' '}(Selecting a parent plot automatically includes all its sub-plots)
              </>
            ) : (
              'Select at least one plot. Selecting a parent plot includes all its sub-plots automatically.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Treatment Type <span className="text-red-500">*</span>
            </label>
            <select
              name="treatment_type"
              value={formData.treatment_type}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            >
              <option value="water">Water</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="chemical">Chemical</option>
              <option value="mowing">Mowing</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Time (optional)</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
            />
          </div>
        </div>

        <div className="border-t pt-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderTreatmentFields()}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purdue-gold"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : treatment ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
