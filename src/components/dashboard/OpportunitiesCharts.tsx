import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { OpportunityStats } from '../../types';

interface Props {
  stats: OpportunityStats;
}

const COLORS = ['#12805c', '#2b6cb0', '#8B5CF6', '#F59E0B', '#06B6D4', '#EC4899'];

export const DeadlinesTimelineChart: React.FC<Props> = ({ stats }) => {
  const data = stats.by_deadline_month.map(item => ({
    month: item.month,
    count: item.count,
  }));

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white font-serif">Application Deadline Schedule</h3>
          <p className="text-xs text-slate-400">Distribution of upcoming intake deadlines by calendar month</p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          <strong className="text-[#1ec992]">{stats.closing_in_30_days}</strong> Closing in 30d
        </span>
      </div>

      <div className="flex-1 w-full mt-2">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            No scheduled deadlines recorded.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#12805c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#12805c" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#06101e',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#e2e8f0',
                }}
                formatter={(val: any) => [`${val} opportunities closing`, 'Deadlines']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#12805c"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#monthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export const CountryDistributionChart: React.FC<Props> = ({ stats }) => {
  // Top 8 countries for clean visualization
  const data = stats.by_country.slice(0, 8);

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white font-serif">Top Host Nations</h3>
          <p className="text-xs text-slate-400">Leading destinations for funded technical graduate study</p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          <strong className="text-white">{stats.by_country.length}</strong> Countries
        </span>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="country" stroke="#64748b" fontSize={10} tickLine={false} interval={0} angle={-20} textAnchor="end" />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#06101e',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="count" fill="#2b6cb0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const FundingTypeDistributionChart: React.FC<Props> = ({ stats }) => {
  const data = stats.by_funding_type.map(item => ({
    name: item.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count,
  }));

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white font-serif">Funding Structure Breakdown</h3>
          <p className="text-xs text-slate-400">Full scholarships vs waivers and stipends</p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="#06101e"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#06101e',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DegreeLevelDistributionChart: React.FC<Props> = ({ stats }) => {
  const data = (stats.by_degree_level || []).map(item => ({
    name: item.degree,
    value: item.count,
  }));

  const DEGREE_COLORS = ['#12805c', '#8B5CF6'];

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white font-serif">Degree Level Scope</h3>
          <p className="text-xs text-slate-400">Master's terminal awards vs direct PhD pipelines</p>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
              stroke="#06101e"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={`degree-${index}`} fill={DEGREE_COLORS[index % DEGREE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#06101e',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const StudyFieldDistributionChart: React.FC<Props> = ({ stats }) => {
  // Top 8 fields of study
  const data = (stats.by_field || []).slice(0, 8);

  return (
    <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col h-80">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-white font-serif">Opportunities by Tech Specialization</h3>
          <p className="text-xs text-slate-400">Distribution across CS, AI, Robotics, VLSI & Cybersecurity</p>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis
              type="category"
              dataKey="field"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#06101e',
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#e2e8f0',
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
