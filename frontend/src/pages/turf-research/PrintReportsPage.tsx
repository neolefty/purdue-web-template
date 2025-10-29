import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { turfResearchApi, Treatment } from '../../api/turf-research';

export default function PrintReportsPage() {
  const [selectedPlotIds, setSelectedPlotIds] = useState<number[]>([]);
  const [expandedPlots, setExpandedPlots] = useState<Set<number>>(new Set());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [treatmentTypeFilter, setTreatmentTypeFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(true);

  const { data: plots } = useQuery({
    queryKey: ['plots'],
    queryFn: async () => {
      const response = await turfResearchApi.getPlots();
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  const { data: treatments } = useQuery({
    queryKey: ['treatments'],
    queryFn: async () => {
      const response = await turfResearchApi.getTreatments();
      return Array.isArray(response) ? response : (response as any).results || [];
    },
  });

  // Build hierarchy
  const buildHierarchy = () => {
    if (!plots || !Array.isArray(plots)) return [];
    const plotMap = new Map(plots.map((p: any) => [p.id, { ...p, children: [] as any[] }]));
    const rootPlots: any[] = [];
    plots.forEach((plot: any) => {
      const plotNode = plotMap.get(plot.id);
      if (plot.parent_plot) {
        const parent = plotMap.get(plot.parent_plot);
        if (parent) parent.children.push(plotNode);
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
      if (next.has(plotId)) next.delete(plotId);
      else next.add(plotId);
      return next;
    });
  };

  const handlePlotToggle = (plotId: number) => {
    setSelectedPlotIds(prev =>
      prev.includes(plotId) ? prev.filter(id => id !== plotId) : [...prev, plotId]
    );
  };

  const renderPlotNode = (plotNode: any, depth: number = 0): JSX.Element => {
    const hasChildren = plotNode.children && plotNode.children.length > 0;
    const isExpanded = expandedPlots.has(plotNode.id);
    const isSelected = selectedPlotIds.includes(plotNode.id);
    
    return (
      <div key={plotNode.id} style={{ marginLeft: `${depth * 20}px` }}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren && (
            <button
              onClick={() => toggleExpand(plotNode.id)}
              className="text-gray-500 hover:text-gray-700 w-5 h-5"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handlePlotToggle(plotNode.id)}
              className="w-4 h-4"
            />
            <span>{plotNode.name}</span>
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div>{plotNode.children.map((child: any) => renderPlotNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  // Filter treatments
  const filteredTreatments = treatments?.filter((t: Treatment) => {
    if (selectedPlotIds.length > 0 && !t.plots.some(p => selectedPlotIds.includes(p))) return false;
    if (dateFrom && t.date < dateFrom) return false;
    if (dateTo && t.date > dateTo) return false;
    if (treatmentTypeFilter && t.treatment_type !== treatmentTypeFilter) return false;
    return true;
  }) || [];

  const handlePrint = () => {
    setShowFilters(false);
    setTimeout(() => {
      window.print();
      setShowFilters(true);
    }, 100);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Plot(s)', 'Treatment Type', 'Details', 'Applied By', 'Notes'];
    const rows = filteredTreatments.map((t: Treatment) => {
      let details = '';
      if (t.water_details) details = `${t.water_details.amount_inches} inches`;
      if (t.fertilizer_details) details = `${t.fertilizer_details.product_name}`;
      if (t.chemical_details) details = `${t.chemical_details.product_name} (${t.chemical_details.chemical_type})`;
      if (t.mowing_details) details = `${t.mowing_details.height_inches} inches`;
      
      return [
        t.date,
        t.time || '',
        t.plot_names.join(', '),
        t.treatment_type,
        details,
        t.applied_by_name || '',
        t.notes || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treatment-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {showFilters && (
        <div className="mb-6 print:hidden">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Treatment Reports</h1>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredTreatments.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
              >
                Export CSV
              </button>
              <button
                onClick={handlePrint}
                disabled={filteredTreatments.length === 0}
                className="bg-purdue-gold hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded disabled:opacity-50"
              >
                Print Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold mb-2">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Treatment Type</label>
                <select
                  value={treatmentTypeFilter}
                  onChange={(e) => setTreatmentTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="water">Water</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="chemical">Chemical</option>
                  <option value="mowing">Mowing</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Select Plots (optional - leave empty for all)</label>
              <div className="border border-gray-300 rounded p-3 max-h-64 overflow-y-auto bg-white">
                {hierarchy.length > 0 ? (
                  hierarchy.map(plotNode => renderPlotNode(plotNode))
                ) : (
                  <p className="text-gray-500 text-sm">No plots available</p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {selectedPlotIds.length > 0 ? `${selectedPlotIds.length} plot(s) selected` : 'All plots'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="print:block">
        <h1 className="text-3xl font-bold text-center mb-2 hidden print:block">Treatment Report</h1>
        <p className="text-center text-sm text-gray-600 mb-6 hidden print:block">
          Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>

        {filteredTreatments.length > 0 ? (
          <div className="space-y-4">
            {filteredTreatments.map((treatment: Treatment) => (
                <div key={treatment.id} className="bg-white border border-gray-300 p-4 print:break-inside-avoid">
                  <div className="mb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">
                          {treatment.treatment_type.charAt(0).toUpperCase() + treatment.treatment_type.slice(1)}
                        </h3>
                        <p className="text-sm text-gray-700">
                          <strong>Date:</strong> {new Date(treatment.date).toLocaleDateString()}
                          {treatment.time && ` at ${treatment.time}`}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Plot(s):</strong> {treatment.plot_names.join(', ')}
                        </p>
                        {treatment.applied_by_name && (
                          <p className="text-sm text-gray-700">
                            <strong>Applied by:</strong> {treatment.applied_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm space-y-1">
                    {treatment.water_details && (
                      <>
                        <p><strong>Amount:</strong> {treatment.water_details.amount_inches} inches</p>
                        {treatment.water_details.duration_minutes && (
                          <p><strong>Duration:</strong> {treatment.water_details.duration_minutes} minutes</p>
                        )}
                        {treatment.water_details.method && (
                          <p><strong>Method:</strong> {treatment.water_details.method}</p>
                        )}
                      </>
                    )}
                    {treatment.fertilizer_details && (
                      <>
                        <p><strong>Product:</strong> {treatment.fertilizer_details.product_name}</p>
                        {treatment.fertilizer_details.npk_ratio && (
                          <p><strong>NPK Ratio:</strong> {treatment.fertilizer_details.npk_ratio}</p>
                        )}
                        <p><strong>Amount:</strong> {treatment.fertilizer_details.amount} {treatment.fertilizer_details.amount_unit}</p>
                        {treatment.fertilizer_details.rate_per_1000sqft && (
                          <p><strong>Rate:</strong> {treatment.fertilizer_details.rate_per_1000sqft} per 1000 sq ft</p>
                        )}
                      </>
                    )}
                    {treatment.chemical_details && (
                      <>
                        <p><strong>Type:</strong> {treatment.chemical_details.chemical_type}</p>
                        <p><strong>Product:</strong> {treatment.chemical_details.product_name}</p>
                        {treatment.chemical_details.active_ingredient && (
                          <p><strong>Active Ingredient:</strong> {treatment.chemical_details.active_ingredient}</p>
                        )}
                        <p><strong>Amount:</strong> {treatment.chemical_details.amount} {treatment.chemical_details.amount_unit}</p>
                        {treatment.chemical_details.target_pest && (
                          <p><strong>Target:</strong> {treatment.chemical_details.target_pest}</p>
                        )}
                      </>
                    )}
                    {treatment.mowing_details && (
                      <>
                        <p><strong>Height:</strong> {treatment.mowing_details.height_inches} inches</p>
                        <p><strong>Clippings Removed:</strong> {treatment.mowing_details.clippings_removed ? 'Yes' : 'No'}</p>
                        {treatment.mowing_details.mower_type && (
                          <p><strong>Mower Type:</strong> {treatment.mowing_details.mower_type}</p>
                        )}
                        {treatment.mowing_details.pattern && (
                          <p><strong>Pattern:</strong> {treatment.mowing_details.pattern}</p>
                        )}
                      </>
                    )}
                  </div>

                  {treatment.notes && (
                    <p className="mt-2 text-sm italic text-gray-700">
                      <strong>Notes:</strong> {treatment.notes}
                    </p>
                  )}
                </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No treatments match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}
