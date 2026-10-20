import React, { useState } from 'react';
import { api } from '../../services/api';
import { parseOpportunitiesCSV, downloadSampleCSV, CSVParseResult } from '../../lib/csvEngine';
import { Upload, Download, CheckCircle2, AlertTriangle, FileSpreadsheet, Sparkles } from 'lucide-react';

interface Props {
  onImportComplete: () => void;
}

export const CsvImportView: React.FC<Props> = ({ onImportComplete }) => {
  const [csvRaw, setCsvRaw] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [onDuplicate, setOnDuplicate] = useState<'skip' | 'overwrite'>('skip');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    updated: number;
    skipped: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File exceeds 2 MB size limit.');
      return;
    }

    setFileName(file.name);
    setErrorMsg(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setCsvRaw(text);
      const res = parseOpportunitiesCSV(text);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleCommit = async () => {
    if (!csvRaw || !parseResult || parseResult.validRecords.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await api.importCSV(csvRaw, onDuplicate);
      setImportSummary({
        imported: res.imported,
        updated: res.updated,
        skipped: res.skipped,
      });
      onImportComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch import failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">Batch CSV Opportunity Ingestion</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            RFC 4180 compliant parser with server-side validation and duplicate identifier detection.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5 text-[#1ec992]" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Summary Alert */}
      {importSummary && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            <span>Batch Ingestion Completed Successfully</span>
          </div>
          <p className="text-emerald-400/90">
            New Opportunities Added: <strong>{importSummary.imported}</strong> · Records Overwritten: <strong>{importSummary.updated}</strong> · Existing Duplicates Skipped: <strong>{importSummary.skipped}</strong>
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <label className="border-2 border-dashed border-slate-700 hover:border-[#12805c] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/50">
          <FileSpreadsheet className="w-10 h-10 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-200">
            {fileName ? fileName : 'Select or drop compliant dataset CSV (< 2 MB)'}
          </span>
          <span className="text-[11px] text-slate-500 mt-1">
            Required headers: id, title, provider_name, host_country, degree_level, funding_type, official_url
          </span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Duplicate Resolution Setting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-800">
          <span className="text-slate-300 font-medium">Duplicate Record Strategy (Matched by ID):</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnDuplicate('skip')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                onDuplicate === 'skip'
                  ? 'bg-slate-800 text-[#1ec992] border-[#12805c] font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Skip Duplicates
            </button>
            <button
              type="button"
              onClick={() => setOnDuplicate('overwrite')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                onDuplicate === 'overwrite'
                  ? 'bg-slate-800 text-[#1ec992] border-[#12805c] font-semibold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Overwrite Existing Records
            </button>
          </div>
        </div>
      </div>

      {/* Parse Preview */}
      {parseResult && (
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1ec992]" />
              <span>CSV Pre-Flight Inspection</span>
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Total Scanned: <strong className="text-white">{parseResult.totalRows}</strong></span>
              <span className="text-[#1ec992]">Valid: <strong>{parseResult.validRecords.length}</strong></span>
              <span className="text-rose-400">Invalid: <strong>{parseResult.errors.length}</strong></span>
            </div>
          </div>

          {/* Validation Errors List */}
          {parseResult.errors.length > 0 && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded-lg text-xs space-y-1 max-h-48 overflow-y-auto">
              <span className="font-semibold text-rose-300 block mb-1">Row Validation Errors:</span>
              {parseResult.errors.map((err, i) => (
                <div key={i} className="text-rose-400/90 text-[11px] font-mono">
                  Row {err.row}: {err.reason}
                </div>
              ))}
            </div>
          )}

          {/* Valid Records Preview List */}
          {parseResult.validRecords.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Validated Rows Ready for Commit ({parseResult.validRecords.length}):
              </span>
              <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg divide-y divide-slate-800 bg-slate-950 text-xs">
                {parseResult.validRecords.slice(0, 10).map((r, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between">
                    <div className="truncate pr-3">
                      <span className="font-medium text-slate-200 block truncate">{r.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {r.id} · {r.host_country} · {r.degree_level} · {r.funding_type}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                      Validated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleCommit}
              disabled={parseResult.validRecords.length === 0 || isSubmitting}
              className="px-4 py-2 bg-[#12805c] hover:bg-[#0f6b4d] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Executing Ingest...'
                  : `Commit ${parseResult.validRecords.length} Records to Database`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
