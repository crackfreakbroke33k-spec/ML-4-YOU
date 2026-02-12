import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, FileText, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DatasetViewer({ dataset, onClose }) {
  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadAndAnalyzeCSV();
  }, [dataset]);

  const loadAndAnalyzeCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch(dataset.file_url);
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1, 50).map(line => line.split(','));

      // AI analysis for anomalies
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this CSV data and identify specific anomalies with row and column indices.

Headers: ${headers.join(', ')}
Sample Data (first 10 rows):
${lines.slice(0, 11).join('\n')}

Identify:
- Missing/null values (specify row, column)
- Outliers (specify row, column, value)
- Type inconsistencies (specify column)
Return anomalies as array with row_index, col_index, and type.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  row_index: { type: "number" },
                  col_index: { type: "number" },
                  type: { type: "string" },
                  reason: { type: "string" }
                }
              }
            }
          }
        }
      });

      setCsvData({ headers, rows });
      setAnalysis(aiResponse.anomalies || []);
    } catch (error) {
      console.error("Error loading CSV:", error);
    }
    setLoading(false);
  };

  const isAnomaly = (rowIdx, colIdx) => {
    return analysis?.some(a => a.row_index === rowIdx && a.col_index === colIdx);
  };

  const getAnomalyInfo = (rowIdx, colIdx) => {
    return analysis?.find(a => a.row_index === rowIdx && a.col_index === colIdx);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            {dataset.name} - CSV Preview
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        {analysis && analysis.length > 0 && (
          <Badge variant="destructive" className="mt-2">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {analysis.length} anomalies detected
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : csvData ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 font-semibold">#</th>
                  {csvData.headers.map((header, idx) => (
                    <th key={idx} className="border border-gray-300 px-2 py-1 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.rows.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    <td className="border border-gray-300 px-2 py-1 bg-gray-50 font-semibold">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, colIdx) => {
                      const anomaly = isAnomaly(rowIdx, colIdx);
                      const anomalyInfo = getAnomalyInfo(rowIdx, colIdx);
                      return (
                        <td
                          key={colIdx}
                          className={`border border-gray-300 px-2 py-1 ${
                            anomaly ? 'bg-red-100 text-red-900 font-semibold' : ''
                          }`}
                          title={anomaly ? `${anomalyInfo.type}: ${anomalyInfo.reason}` : ''}
                        >
                          {cell || <span className="text-gray-400 italic">null</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500 mt-3">
              Showing first 50 rows. Red cells indicate detected anomalies (hover for details).
            </p>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Failed to load CSV</p>
        )}
      </CardContent>
    </Card>
  );
}