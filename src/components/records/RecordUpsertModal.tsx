import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types';
import { SEED_COUNTRIES, TECHNICAL_FIELDS } from '../../services/mockData';
import { calculateOpportunityCompleteness } from '../../lib/dataQuality';
import { X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialRecord?: Opportunity | null;
}

export const RecordUpsertModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, initialRecord }) => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerType, setProviderType] = useState<Opportunity['provider_type']>('university');
  const [hostCountry, setHostCountry] = useState('Germany');
  const [hostInstitution, setHostInstitution] = useState('');
  const [degreeLevel, setDegreeLevel] = useState<Opportunity['degree_level']>('masters');
  const [fundingType, setFundingType] = useState<Opportunity['funding_type']>('full');
  const [fundingSummary, setFundingSummary] = useState('');
  const [fundingAmountNote, setFundingAmountNote] = useState('');
  const [fieldsOfStudy, setFieldsOfStudy] = useState('Computer Science; Artificial Intelligence');
  const [eligibilitySummary, setEligibilitySummary] = useState('');
  const [indianApplicantsEligible, setIndianApplicantsEligible] = useState(true);
  const [minGpaNote, setMinGpaNote] = useState('Minimum 7.5 CGPA or equivalent.');
  const [languageRequirements, setLanguageRequirements] = useState('IELTS 6.5+ or TOEFL 90+');
  const [applicationDeadline, setApplicationDeadline] = useState<string>('');
  const [deadlineNote, setDeadlineNote] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [popularityTier, setPopularityTier] = useState<Opportunity['popularity_tier']>('long_tail');
  const [tags, setTags] = useState('full-funding; cs');
  const [isActive, setIsActive] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialRecord) {
      setId(initialRecord.id);
      setTitle(initialRecord.title);
      setProviderName(initialRecord.provider_name);
      setProviderType(initialRecord.provider_type);
      setHostCountry(initialRecord.host_country);
      setHostInstitution(initialRecord.host_institution);
      setDegreeLevel(initialRecord.degree_level);
      setFundingType(initialRecord.funding_type);
      setFundingSummary(initialRecord.funding_summary);
      setFundingAmountNote(initialRecord.funding_amount_note);
      setFieldsOfStudy(initialRecord.fields_of_study.join('; '));
      setEligibilitySummary(initialRecord.eligibility_summary);
      setIndianApplicantsEligible(initialRecord.indian_applicants_eligible);
      setMinGpaNote(initialRecord.min_gpa_note);
      setLanguageRequirements(initialRecord.language_requirements);
      setApplicationDeadline(initialRecord.application_deadline || '');
      setDeadlineNote(initialRecord.deadline_note);
      setOfficialUrl(initialRecord.official_url);
      setPopularityTier(initialRecord.popularity_tier);
      setTags(initialRecord.tags.join('; '));
      setIsActive(initialRecord.is_active);
    } else {
      const generatedId = `opp-lt-${Math.floor(113 + Math.random() * 880)}`;
      setId(generatedId);
      setTitle('');
      setProviderName('');
      setProviderType('university');
      setHostCountry('Germany');
      setHostInstitution('');
      setDegreeLevel('masters');
      setFundingType('full');
      setFundingSummary('Full tuition fee waiver and monthly living research grant.');
      setFundingAmountNote('€1,000/month stipend + health insurance');
      setFieldsOfStudy('Computer Science; Artificial Intelligence');
      setEligibilitySummary('Open to Indian technical graduates with B.Tech/B.E. in CS/IT/ECE.');
      setIndianApplicantsEligible(true);
      setMinGpaNote('Minimum 7.5 CGPA or First Class distinction.');
      setLanguageRequirements('IELTS 6.5+ or TOEFL 90+');
      setApplicationDeadline(new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10));
      setDeadlineNote('Online portal submission deadline.');
      setOfficialUrl(`https://example.com/scholarships/${generatedId}`);
      setPopularityTier('long_tail');
      setTags('fellowship; full-funding; cs');
      setIsActive(true);
    }
    setError(null);
  }, [initialRecord, isOpen]);

  if (!isOpen) return null;

  const currentCompleteness = calculateOpportunityCompleteness({
    title,
    provider_name: providerName,
    host_country: hostCountry,
    funding_summary: fundingSummary,
    fields_of_study: fieldsOfStudy.split(/[;,]/).filter(Boolean),
    application_deadline: applicationDeadline || null,
    official_url: officialUrl,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (!providerName.trim()) {
      setError('Provider name is mandatory.');
      return;
    }

    const fieldsArray = fieldsOfStudy
      .split(/[;,]/)
      .map(f => f.trim())
      .filter(Boolean);

    if (fieldsArray.length === 0) {
      setError('Specify at least one field of study.');
      return;
    }

    const tagsArray = tags
      .split(/[;,]/)
      .map(t => t.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await onSubmit({
        id,
        title: title.trim(),
        provider_name: providerName.trim(),
        provider_type: providerType,
        host_country: hostCountry,
        host_institution: hostInstitution.trim() || providerName.trim(),
        degree_level: degreeLevel,
        funding_type: fundingType,
        funding_summary: fundingSummary.trim(),
        funding_amount_note: fundingAmountNote.trim() || 'See portal for details',
        fields_of_study: fieldsArray,
        eligibility_summary: eligibilitySummary.trim(),
        indian_applicants_eligible: indianApplicantsEligible,
        min_gpa_note: minGpaNote.trim(),
        language_requirements: languageRequirements.trim(),
        application_deadline: applicationDeadline ? applicationDeadline : null,
        deadline_note: deadlineNote.trim() || (applicationDeadline ? 'Annual cycle deadline.' : 'Rolling admissions.'),
        official_url: officialUrl.trim() || `https://example.com/scholarships/${id}`,
        tags: tagsArray,
        popularity_tier: popularityTier,
        curated_by: 'Admin Curator',
        verified_on: new Date().toISOString().slice(0, 10),
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save opportunity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-serif">
              <Sparkles className="w-4 h-4 text-[#1ec992]" />
              {initialRecord ? 'Edit Scholarship Opportunity' : 'Curate New Scholarship Opportunity'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All 25 schema fields validated server-side.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completeness Indicator */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Field Completeness:</span>
            <span className="font-bold text-[#1ec992] font-mono">{currentCompleteness}%</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Record ID: {id}</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Scholarship Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., DAAD Master Fellowship in Computer Science & Robotics"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c] transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Provider Name *</label>
              <input
                type="text"
                required
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                placeholder="DAAD, Gates Trust, University..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Provider Type *</label>
              <select
                value={providerType}
                onChange={e => setProviderType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              >
                <option value="university">University</option>
                <option value="foundation">Foundation</option>
                <option value="government">Government</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Host Country (25 Destinations) *</label>
              <select
                value={hostCountry}
                onChange={e => setHostCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              >
                {SEED_COUNTRIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Host Institution</label>
              <input
                type="text"
                value={hostInstitution}
                onChange={e => setHostInstitution(e.target.value)}
                placeholder="Technical University of Munich"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Degree Level *</label>
              <select
                value={degreeLevel}
                onChange={e => setDegreeLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              >
                <option value="masters">Master's Only</option>
                <option value="masters_or_phd">Master's or PhD</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Funding Type *</label>
              <select
                value={fundingType}
                onChange={e => setFundingType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              >
                <option value="full">Full Funding (100% + Stipend)</option>
                <option value="partial">Partial Funding</option>
                <option value="stipend_only">Stipend Only</option>
                <option value="tuition_waiver">Tuition Waiver Only</option>
                <option value="travel_grant">Travel Grant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Funding Summary *</label>
              <textarea
                rows={2}
                required
                value={fundingSummary}
                onChange={e => setFundingSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Funding Amount Note</label>
              <textarea
                rows={2}
                value={fundingAmountNote}
                onChange={e => setFundingAmountNote(e.target.value)}
                placeholder="e.g., €934/month + health insurance"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Fields of Study (Semicolon separated) *
            </label>
            <input
              type="text"
              required
              value={fieldsOfStudy}
              onChange={e => setFieldsOfStudy(e.target.value)}
              placeholder="Computer Science; Artificial Intelligence; Robotics"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Eligibility Summary *</label>
            <textarea
              rows={2}
              required
              value={eligibilitySummary}
              onChange={e => setEligibilitySummary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Minimum GPA / Grade Note</label>
              <input
                type="text"
                value={minGpaNote}
                onChange={e => setMinGpaNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Language Requirements</label>
              <input
                type="text"
                value={languageRequirements}
                onChange={e => setLanguageRequirements(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Application Deadline (Leave empty if rolling)</label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={e => setApplicationDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Popularity Tier *</label>
              <select
                value={popularityTier}
                onChange={e => setPopularityTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c]"
              >
                <option value="long_tail">Long-Tail Opportunity</option>
                <option value="well_known">Well-Known Global Brand</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Official Portal URL</label>
              <input
                type="url"
                value={officialUrl}
                onChange={e => setOfficialUrl(e.target.value)}
                placeholder="https://example.com/scholarships/opp-xxx"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-[#12805c] font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={indianApplicantsEligible}
                onChange={e => setIndianApplicantsEligible(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-[#12805c] focus:ring-[#12805c] w-4 h-4"
              />
              <span>Indian Applicants Eligible</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-[#12805c] focus:ring-[#12805c] w-4 h-4"
              />
              <span>Opportunity Active & Visible</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#12805c] hover:bg-[#0f6b4d] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Persisting to Database...' : 'Save Opportunity'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
