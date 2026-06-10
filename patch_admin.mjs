import fs from 'node:fs';

const filepath = 'client/src/pages/Admin.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const targetBlock = `// ── NEW: Leads CRM Tab ──
function LeadsTab() {
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
                leads.filter(l => l.status === status).map(lead => (
                  <Card key={lead.id} className="bg-[hsl(220_24%_9%)] border-white/5 p-4 hover:border-[#fbbf24]/20 transition-all cursor-move group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">{lead.clientName}</h4>
                      <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] px-1.5 h-4 uppercase">{lead.source}</Badge>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3 truncate">{lead.notes || "No additional notes provided."}</p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                      <div className="flex -space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-black" />)}
                      </div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fbbf24]" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

const replacementBlock = `// ── NEW: Leads CRM Tab ──
function LeadsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });

  // OPTIMIZATION: Replaced repetitive .filter() inside the map loop with a single O(N) grouping operation using useMemo.
  // PERFORMANCE IMPACT: Changes render complexity from O(N * M) (where N=leads, M=stages) to O(N + M), significantly reducing CPU time on re-renders for large lists.
  const leadsByStatus = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const status = lead.status || 'unknown';
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
                statusLeads.map(lead => (
                  <Card key={lead.id} className="bg-[hsl(220_24%_9%)] border-white/5 p-4 hover:border-[#fbbf24]/20 transition-all cursor-move group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#fbbf24] transition-colors">{lead.clientName}</h4>
                      <Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px] px-1.5 h-4 uppercase">{lead.source}</Badge>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3 truncate">{lead.notes || "No additional notes provided."}</p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                      <div className="flex -space-x-1">
                        {[1,2,3].map(i => <div key={i} className="w-4 h-4 rounded-full bg-white/10 border border-black" />)}
                      </div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#fbbf24]" style={{ width: '40%' }} />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}`;

content = content.replace(targetBlock, replacementBlock);
fs.writeFileSync(filepath, content);
