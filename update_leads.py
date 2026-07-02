import sys

def main():
    try:
        with open('client/src/pages/Admin.tsx', 'r') as f:
            content = f.read()

        # 1. Add useMemo
        content = content.replace(
            'import { useState, useRef, useCallback } from "react";',
            'import { useState, useRef, useCallback, useMemo } from "react";'
        )

        # 2. Replace LeadsTab
        old_leads = """function LeadsTab() {
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
                leads.filter(l => l.status === status).map(lead => ("""

        new_leads = """function LeadsTab() {
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });

  // ⚡ Bolt Performance Optimization
  // Replaced multiple O(N) array filtering calls inside the render loop with a single O(N) reduction
  // into an O(1) lookup dictionary. Reduces array iterations from 12x per render to 1x.
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
                statusLeads.map(lead => ("""

        if old_leads not in content:
            print("Could not find exact LeadsTab text block to replace. Doing it chunk by chunk...")
            import re

            content = re.sub(
                r'const { data: leads = \[\] } = useQuery<Lead\[\]>\({ queryKey: \["/api/admin/leads"\], queryFn: \(\) => apiFetch\("/api/admin/leads"\) }\);',
                r'const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/admin/leads"], queryFn: () => apiFetch("/api/admin/leads") });\n\n  // ⚡ Bolt Performance Optimization\n  // Replaced multiple O(N) array filtering calls inside the render loop with a single O(N) reduction \n  // into an O(1) lookup dictionary. Reduces array iterations from 12x per render to 1x.\n  const leadsByStatus = useMemo(() => {\n    return leads.reduce((acc, lead: Lead) => {\n      const status = lead.status || "new";\n      if (!acc[status]) acc[status] = [];\n      acc[status].push(lead);\n      return acc;\n    }, {} as Record<string, Lead[]>);\n  }, [leads]);',
                content
            )

            content = re.sub(
                r"\{\['new', 'contacted', 'quoted', 'closed'\]\.map\(\(status\) => \(\s*<div key=\{status\} className=\"space-y-4\">\s*<div className=\"flex items-center justify-between pb-2 border-b border-white/5 px-2\">\s*<span className=\"text-\[10px\] font-black uppercase text-white/40 tracking-widest\">\{status\}</span>\s*<span className=\"bg-white/5 text-\[9px\] px-2 py-0\.5 rounded text-white/60\">\s*\{leads\.filter\(l => l\.status === status\)\.length\}\s*</span>\s*</div>\s*<div className=\"space-y-3\">\s*\{leads\.filter\(l => l\.status === status\)\.length > 0 \? \(\s*leads\.filter\(l => l\.status === status\)\.map\(lead => \(",
                r"{['new', 'contacted', 'quoted', 'closed'].map((status) => {\n          const statusLeads = leadsByStatus[status] || [];\n          return (\n          <div key={status} className=\"space-y-4\">\n            <div className=\"flex items-center justify-between pb-2 border-b border-white/5 px-2\">\n              <span className=\"text-[10px] font-black uppercase text-white/40 tracking-widest\">{status}</span>\n              <span className=\"bg-white/5 text-[9px] px-2 py-0.5 rounded text-white/60\">\n                {statusLeads.length}\n              </span>\n            </div>\n            \n            <div className=\"space-y-3\">\n              {statusLeads.length > 0 ? (\n                statusLeads.map(lead => (",
                content,
                count=1,
                flags=re.MULTILINE
            )

            content = re.sub(
                r'                 \)\)\n              \) : \(\n                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">\n                  <p className="text-\[10px\] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>\n                </div>\n              \)}\n            </div>\n          </div>\n        \)\)}',
                r'                ))\n              ) : (\n                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">\n                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>\n                </div>\n              )}\n            </div>\n          </div>\n          );\n        })}',
                content,
                count=1,
                flags=re.MULTILINE
            )

        else:
            print("Found exact block, replacing...")
            content = content.replace(old_leads, new_leads)
            # Find the closing parenthesis for the map and change to closing brace and paren
            content = content.replace(
                """                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
        ))}""",
                """                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                  <p className="text-[10px] text-white/10 uppercase font-black tracking-widest">No leads in this stage</p>
                </div>
              )}
            </div>
          </div>
          );
        })}"""
            )

        with open('client/src/pages/Admin.tsx', 'w') as f:
            f.write(content)

        print("Done!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
