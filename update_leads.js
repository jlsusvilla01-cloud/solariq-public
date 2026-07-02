const fs = require('fs');

let content = fs.readFileSync('client/src/pages/Admin.tsx', 'utf8');

// 1. Add useMemo
content = content.replace(
  'import { useState, useRef, useCallback } from "react";',
  'import { useState, useRef, useCallback, useMemo } from "react";'
);

// 2. Replace LeadsTab
const leadsTabOld = `function LeadsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Users size={24} className="text-[#fbbf24]" /> Sales Pipeline
          </h2>
          <p className="text-white/40 text-sm mt-1">Nurturing {leads.length} active opportunities in the Philippines.</p>
        </div>
        <Button className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold">
          <Plus size={16} className="mr-2" /> Add Prospect
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['new', 'contacted', 'quoted', 'closed'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 px-2">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{status}</span>
              <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-white/60">
                {leads.filter(l => l.status === status).length}
              </span>
            </div>

            <div className="space-y-3">
              {leads.filter(l => l.status === status).length > 0 ? (
                leads.filter(l => l.status === status).map(lead => (`;

const leadsTabNew = `function LeadsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });

  // ⚡ Bolt Performance Optimization
  // Group leads by status using O(n) reduction instead of O(n*m) repeated filtering
  // Reduces array iterations from 12x to 1x per render
  const leadsByStatus = useMemo(() => {
    return leads.reduce((acc, lead: Lead) => {
      const status = lead.status || 'new';
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Users size={24} className="text-[#fbbf24]" /> Sales Pipeline
          </h2>
          <p className="text-white/40 text-sm mt-1">Nurturing {leads.length} active opportunities in the Philippines.</p>
        </div>
        <Button className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold">
          <Plus size={16} className="mr-2" /> Add Prospect
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['new', 'contacted', 'quoted', 'closed'].map((status) => {
          const statusLeads = leadsByStatus[status] || [];
          return (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5 px-2">
              <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{status}</span>
              <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded text-white/60">
                {statusLeads.length}
              </span>
            </div>

            <div className="space-y-3">
              {statusLeads.length > 0 ? (
                statusLeads.map(lead => (`;

content = content.replace(leadsTabOld, leadsTabNew);

// Verify that it replaced
if (content.includes('⚡ Bolt Performance Optimization')) {
    fs.writeFileSync('client/src/pages/Admin.tsx', content);
    console.log("Successfully replaced and wrote file");
} else {
    console.error("Replacement failed!");
}
