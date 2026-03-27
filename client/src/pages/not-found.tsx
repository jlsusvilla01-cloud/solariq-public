import { Link } from "wouter";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[hsl(220_28%_6%)] flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl font-black text-white/20 mb-4">404</div>
      <p className="text-white/50 mb-6">Page not found</p>
      <Link href="/"><a className="bg-[#fbbf24] text-[hsl(220_28%_6%)] font-bold px-5 py-2.5 rounded-xl text-sm hover:brightness-110">Go Home</a></Link>
    </div>
  );
}
