import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { turfResearchApi, Plot } from '../../api/turf-research';
import PlotForm from '../../components/turf-research/PlotForm';
import MasterListManager from '../../components/turf-research/MasterListManager';

export default function PlotsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [expandedPlots, setExpandedPlots] = useState<Set<number>>(new Set());
  const [showMasterList, setShowMasterList] = useState<'location' | 'grassType' | null>(null);
  const queryClient = useQueryClient();

  const { data: plots, isLoading, error } = useQuery({
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
    
    const plotMap = new Map(plots.map((p: any) => [p.id, { ...p, children: [] as any[] }]));
    const rootPlots: any[] = [];
    
    plots.forEach((plot: any) => {
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => turfResearchApi.deletePlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] });
    },
  });

  const handleEdit = (plot: Plot) => {
    setEditingPlot(plot);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this plot?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlot(null);
  };

  // Render plot card recursively
  const renderPlotCard = (plotNode: any, depth: number = 0): JSX.Element => {
    const hasChildren = plotNode.children && plotNode.children.length > 0;
    const isExpanded = expandedPlots.has(plotNode.id);
    
    return (
      <div key={plotNode.id} style={{ marginLeft: `${depth * 30}px` }}>
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-start gap-2 flex-1">
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(plotNode.id)}
                  className="text-gray-500 hover:text-gray-700 mt-1 flex-shrink-0"
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {plotNode.name}
                </h2>
                {plotNode.parent_plot_name && (
                  <p className="text-sm text-purdue-gold">
                    ↳ Sub-plot of: {plotNode.parent_plot_name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {plotNode.location && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Location:</span> {plotNode.location}
            </p>
          )}
          {plotNode.grass_type && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Grass Type:</span> {plotNode.grass_type}
            </p>
          )}
          {plotNode.size_sqft && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Size:</span> {plotNode.size_sqft} sq ft
            </p>
          )}
          <div className="mb-4 flex gap-3 text-sm text-gray-600">
            <span><span className="font-semibold">Treatments:</span> {plotNode.treatment_count}</span>
            {plotNode.subplot_count > 0 && (
              <span><span className="font-semibold">Sub-plots:</span> {plotNode.subplot_count}</span>
            )}
          </div>
          {plotNode.notes && (
            <p className="text-gray-700 text-sm mb-4 italic">{plotNode.notes}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(plotNode)}
              className="flex-1 bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(plotNode.id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
              Delete
            </button>
            <a
              href={`/turf-research/plots/${plotNode.id}/treatments`}
              className="btn flex-1 bg-purdue-gray hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded text-center"
            >
              Treatments
            </a>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {plotNode.children.map((child: any) => renderPlotCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading plots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading plots: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Research Plots</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMasterList('location')}
            className="bg-purdue-gray hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
          >
            Manage Locations
          </button>
          <button
            onClick={() => setShowMasterList('grassType')}
            className="bg-purdue-gray hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
          >
            Manage Grass Types
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
          >
            Add New Plot
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <PlotForm plot={editingPlot} onClose={handleCloseForm} />
        </div>
      )}

      {showMasterList && (
        <MasterListManager
          type={showMasterList}
          onClose={() => setShowMasterList(null)}
        />
      )}

      <div className="space-y-4">
        {hierarchy.length > 0 ? (
          hierarchy.map((plotNode: any) => renderPlotCard(plotNode, 0))
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No plots yet. Click "Add New Plot" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
