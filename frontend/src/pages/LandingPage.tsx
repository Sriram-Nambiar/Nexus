import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Check,
  X,
  Play,
  FileText,
  Bot,
  Calendar,
  Wifi,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  UploadCloud,
  Star,
  ExternalLink,
  Laptop,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'video' | 'ai' | 'analytics'>('video');

  return (
    <div className="min-h-screen bg-[#171e19] text-black font-sans selection:bg-[#ffe17c] selection:text-black">


      {/* =========================================================================
          2. HERO SECTION
          Two-column grid on #ffe17c background with radial dot pattern.
          Left column: Badge 'NEW: AI Content Assistant 2.0' (White, pill-shaped, 2px border).
          Heading: 'Cabinet Grotesk' 8xl, black, with one keyword using
                   -webkit-text-stroke: 2px black and transparent fill.
          CTA group: Primary black button with 8px hard shadow, secondary white button with 4px hard shadow.
          Right column: Browser mockup (White, 2px border, 12px hard shadow) showing a
                        dashboard with revenue/learning charts and sage-colored accent panels.
          ========================================================================= */}
      <section className="bg-radial-dots border-b-2 border-black py-16 sm:py-24 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column (span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-white text-black font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full border-2 border-black shadow-hard-sm">
              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
              <span>NEW: AI Content Assistant 2.0</span>
            </div>

            {/* Heading: Cabinet Grotesk 8xl with outline keyword */}
            <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl font-extrabold text-black tracking-tighter leading-[0.95]">
              CAMPUS KNOWLEDGE <br />
              <span className="text-stroke-black">UNLIMITED.</span>
            </h1>

            {/* Subtitle in Satoshi */}
            <p className="text-lg sm:text-xl text-black font-medium max-w-xl leading-relaxed">
              Ultra-fast local streaming for NPTEL and university video lectures, syllabus-grounded
              AI question answering, and structured revision plans on private campus intranets.
              Zero internet dependency.
            </p>

            {/* CTA Group */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/courses')}
                className="neo-btn-primary text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 shadow-hard-lg"
              >
                <span>Launch Course Player</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/assistant')}
                className="neo-btn-secondary text-base sm:text-lg px-6 sm:px-8 py-3.5 sm:py-4 shadow-hard-md"
              >
                <Bot className="w-5 h-5 text-black" />
                <span>Ask Campus AI</span>
              </button>
            </div>

            {/* Micro-Features */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs sm:text-sm font-bold text-black">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-black text-[#ffe17c] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>HTTP Range Video Seeking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-black text-[#ffe17c] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Kiwix Hotspot Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-black text-[#ffe17c] flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>Zero Cloud Ingress</span>
              </div>
            </div>
          </div>

          {/* Right Column (span 5): Browser Mockup Dashboard */}
          <div className="lg:col-span-5">
            <div className="bg-white border-2 border-black rounded-xl shadow-hard-xl overflow-hidden">
              {/* Browser Mockup Top Bar: 40px height, border-b-2 border-black, 3 window dots */}
              <div className="h-10 bg-white border-b-2 border-black px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f57] border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#febc2e] border border-black" />
                  <span className="w-3 h-3 rounded-full bg-[#28c840] border border-black" />
                </div>
                <div className="bg-[#f4f4f5] border border-black px-3 py-0.5 rounded text-[11px] font-mono text-black font-semibold truncate max-w-[200px]">
                  nexus://lan-node:5000/demo
                </div>
                <div className="w-10" />
              </div>

              {/* Mockup Dashboard Content: Split Layout */}
              <div className="flex min-h-[380px]">
                {/* Mini-Sidebar: #171e19 with #b7c6c2 icons */}
                <div className="w-14 bg-[#171e19] border-r-2 border-black flex flex-col items-center py-4 gap-4 shrink-0">
                  <div
                    onClick={() => setActiveTab('video')}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border border-black transition-colors ${
                      activeTab === 'video'
                        ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                        : 'text-[#b7c6c2] hover:bg-zinc-800'
                    }`}
                    title="NPTEL Video Player"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </div>
                  <div
                    onClick={() => setActiveTab('ai')}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border border-black transition-colors ${
                      activeTab === 'ai'
                        ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                        : 'text-[#b7c6c2] hover:bg-zinc-800'
                    }`}
                    title="AI Study Assistant"
                  >
                    <Bot className="w-4 h-4" />
                  </div>
                  <div
                    onClick={() => setActiveTab('analytics')}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border border-black transition-colors ${
                      activeTab === 'analytics'
                        ? 'bg-[#ffe17c] text-black shadow-hard-sm'
                        : 'text-[#b7c6c2] hover:bg-zinc-800'
                    }`}
                    title="Intranet Stats"
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="mt-auto w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-800 text-[#b7c6c2] border border-black">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                {/* Main Preview Pane: #ffffff with Sage accent panels & interactive controls */}
                <div className="flex-1 p-4 bg-white space-y-3 flex flex-col justify-between">
                  {/* Sage-colored Accent Panels (#b7c6c2) */}
                  <div className="bg-[#b7c6c2] p-3 border-2 border-black rounded-lg shadow-hard-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-black">
                      <span className="uppercase tracking-wider">Lecture 01 • NPTEL ML</span>
                      <span className="bg-black text-[#ffe17c] px-2 py-0.5 rounded text-[10px] font-mono">
                        HTTP 206 LIVE
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-black mt-1 font-heading">
                      Introduction to Machine Learning — Prof. Balaraman Ravindran
                    </div>
                  </div>

                  {/* Interactive Dashboard Graphic / Content */}
                  {activeTab === 'video' && (
                    <div className="bg-[#171e19] text-white p-3 border-2 border-black rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#ffe17c]">demo_ml_lecture.mp4</span>
                        <span className="text-[#b7c6c2] font-mono text-[11px]">1080p Range Active</span>
                      </div>
                      {/* Video Seek Simulation Bar */}
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden border border-black flex">
                        <div className="bg-[#ffe17c] w-3/5 h-full" />
                        <div className="bg-[#b7c6c2] w-1/5 h-full opacity-60" />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>14:32 / 48:10</span>
                        <span className="text-emerald-400">Buffered locally (0ms lag)</span>
                      </div>
                    </div>
                  )}

                  {activeTab === 'ai' && (
                    <div className="bg-[#f4f4f5] border-2 border-black p-3 rounded-lg space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-black">
                        <Sparkles className="w-3.5 h-3.5 text-black" />
                        <span>Question: What is supervised vs unsupervised learning?</span>
                      </div>
                      <p className="text-xs text-black/80 font-medium bg-white p-2 border border-black rounded">
                        "Supervised learning trains on labeled data (X, y) to predict outputs. Unsupervised learning discovers hidden patterns in unlabeled inputs..."
                      </p>
                    </div>
                  )}

                  {activeTab === 'analytics' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#ffe17c] border-2 border-black p-2.5 rounded shadow-hard-sm">
                        <div className="text-[10px] uppercase font-bold text-black">Bandwidth Saved</div>
                        <div className="text-xl font-extrabold font-heading text-black">18.4 GB</div>
                      </div>
                      <div className="bg-[#b7c6c2] border-2 border-black p-2.5 rounded shadow-hard-sm">
                        <div className="text-[10px] uppercase font-bold text-black">Active Peers</div>
                        <div className="text-xl font-extrabold font-heading text-black">42 Users</div>
                      </div>
                    </div>
                  )}

                  {/* Revenue / Campus Performance Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="border-2 border-black p-2 rounded bg-white">
                      <div className="text-[9px] font-bold text-zinc-600 uppercase">Latency</div>
                      <div className="text-sm font-extrabold font-heading text-black">&lt; 4ms</div>
                    </div>
                    <div className="border-2 border-black p-2 rounded bg-white">
                      <div className="text-[9px] font-bold text-zinc-600 uppercase">Offline Seek</div>
                      <div className="text-sm font-extrabold font-heading text-black">Instant</div>
                    </div>
                    <div className="border-2 border-black p-2 rounded bg-[#ffe17c]">
                      <div className="text-[9px] font-bold text-black uppercase">Hotspot</div>
                      <div className="text-sm font-extrabold font-heading text-black">Kiwix</div>
                    </div>
                  </div>

                  {/* Bottom Action inside Mockup */}
                  <button
                    onClick={() => navigate('/courses/1')}
                    className="w-full neo-btn-yellow text-xs py-2 px-3 justify-center"
                  >
                    <span>Open Live NPTEL Player</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SOCIAL PROOF MARQUEE
          Full-width bar, background #171e19, border-b-2 border-black.
          Contains a continuous horizontal marquee of brand names (ACME, GLOBEX, etc.)
          in Cabinet Grotesk, color #b7c6c2, 50% opacity, moving infinitely at a slow linear pace.
          ========================================================================= */}
      <section className="bg-[#171e19] border-b-2 border-black py-5 overflow-hidden select-none">
        <div className="animate-marquee items-center gap-16 whitespace-nowrap">
          {[
            'ACME ACADEMY',
            'GLOBEX RESEARCH',
            'NPTEL IIT MADRAS',
            'KIWIX HOTSPOT OS',
            'INITECH LABS',
            'SOYLENT EDUTECH',
            'UMBRELLA CORP INTRANET',
            'CYBERDYNE SYLLABUS',
            'MASSIVE DYNAMIC',
            'WAYNE ENTERPRISES CAMPUS',
          ]
            .concat([
              'ACME ACADEMY',
              'GLOBEX RESEARCH',
              'NPTEL IIT MADRAS',
              'KIWIX HOTSPOT OS',
              'INITECH LABS',
              'SOYLENT EDUTECH',
              'UMBRELLA CORP INTRANET',
              'CYBERDYNE SYLLABUS',
              'MASSIVE DYNAMIC',
              'WAYNE ENTERPRISES CAMPUS',
            ])
            .map((brand, idx) => (
              <span
                key={idx}
                className="font-heading text-2xl sm:text-3xl font-extrabold text-[#b7c6c2]/50 tracking-wider uppercase transition-colors hover:text-[#b7c6c2]"
              >
                {brand} •
              </span>
            ))}
        </div>
      </section>

      {/* =========================================================================
          4. PROBLEM VS SOLUTION
          White background section. Two large 3xl-rounded cards side-by-side.
          Card A (Problem): #f4f4f5, 2px dashed gray border, 70% opacity.
          Card B (Solution): #ffe17c, 2px solid black border, 8px hard shadow.
          Both cards use bold lists with custom check/x icons.
          ========================================================================= */}
      <section className="bg-white border-b-2 border-black py-20 sm:py-28 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-[#171e19] text-[#ffe17c] px-3.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border-2 border-black">
              Paradigm Shift
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-black tracking-tight">
              THE CAMPUS CONUNDRUM vs NEXUS AI
            </h2>
            <p className="text-zinc-600 font-medium text-base sm:text-lg">
              Traditional cloud educational portals crumble under heavy student concurrency and rural ISP throttles.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Card A (Problem): #f4f4f5, 2px dashed gray border, 70% opacity */}
            <div className="bg-[#f4f4f5] border-2 border-dashed border-zinc-400 opacity-80 rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-bold border border-red-300 mb-4">
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>THE STATUS QUO PROBLEM</span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-800">
                  Fragile Cloud Portals & Internet Outages
                </h3>
                <p className="text-zinc-600 text-sm sm:text-base mt-2">
                  When 300 students stream the same 1080p NPTEL lecture during midterms, university Wi-Fi chokes.
                </p>
              </div>

              {/* Bold List with Custom X icons */}
              <ul className="space-y-4 text-sm sm:text-base font-bold text-zinc-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 mt-0.5 border border-red-300">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Constant video buffering and dropped packets on congested campus networks</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 mt-0.5 border border-red-300">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Thousands in recurring bandwidth costs re-downloading YouTube assets</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 mt-0.5 border border-red-300">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Cloud AI models hallucinating outside prescribed course syllabi</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center shrink-0 mt-0.5 border border-red-300">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Total study blackout whenever severe weather or ISP cuts occur</span>
                </li>
              </ul>

              <div className="text-xs font-mono text-zinc-500 pt-4 border-t border-zinc-300">
                Avg Latency: 450ms+ • Packet Loss: Up to 18%
              </div>
            </div>

            {/* Card B (Solution): #ffe17c, 2px solid black border, 8px hard shadow */}
            <div className="bg-[#ffe17c] border-2 border-black rounded-3xl p-8 sm:p-10 shadow-hard-lg flex flex-col justify-between space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#ffe17c] rounded-lg text-xs font-bold border-2 border-black mb-4">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>THE NEXUS AI SOLUTION</span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-black">
                  Zero-Latency Intranet Edge Architecture
                </h3>
                <p className="text-black/80 text-sm sm:text-base mt-2 font-medium">
                  Store and stream textbooks, NPTEL videos, and revision planners directly from campus server hardware.
                </p>
              </div>

              {/* Bold List with Custom Check icons */}
              <ul className="space-y-4 text-sm sm:text-base font-bold text-black">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-[#ffe17c] flex items-center justify-center shrink-0 mt-0.5 border-2 border-black">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>HTTP Range 206 streaming allows instant video seeking without buffering</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-[#ffe17c] flex items-center justify-center shrink-0 mt-0.5 border-2 border-black">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Integrated Kiwix Hotspot to broadcast educational archives to all nearby phones</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-[#ffe17c] flex items-center justify-center shrink-0 mt-0.5 border-2 border-black">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Strictly grounded AI study assistant answering from verified course materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-black text-[#ffe17c] flex items-center justify-center shrink-0 mt-0.5 border-2 border-black">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span>Self-contained SQLite WAL database running 100% offline indefinitely</span>
                </li>
              </ul>

              <div className="text-xs font-mono text-black font-bold pt-4 border-t-2 border-black flex justify-between">
                <span>Intranet Latency: &lt; 2ms</span>
                <span className="bg-black text-white px-2 py-0.5 rounded">100% Uptime Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. FEATURE GRID
          Background #ffe17c, border-y-2 border-black. 3-column grid of white cards.
          Each card: 2px border, 4px hard shadow.
          Top of card features a 16x16 icon box in #b7c6c2 that turns #ffe17c on hover.
          Headings are Cabinet Grotesk 2xl.
          ========================================================================= */}
      <section className="bg-[#ffe17c] border-b-2 border-black py-20 sm:py-28 px-4 sm:px-8 bg-radial-dots">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-black text-white px-3.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border-2 border-black shadow-hard-sm">
              Capabilities
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-black tracking-tight">
              ENGINEERED FOR RESILIENT EDUCATION
            </h2>
            <p className="text-black/80 font-medium text-base sm:text-lg">
              Everything required to operate an offline digital university on a single local server node.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <Play className="w-8 h-8 text-black fill-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                HTTP Range Video Seeking
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Stream dense lecture recordings (like NPTEL Machine Learning) with true HTTP 206 Partial Content support. Jump to any timestamp in milliseconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <FileText className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                Inline PDF Textbook Delivery
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Read textbooks, cheat sheets, and lab guides directly in modern web browsers without external software or security vulnerabilities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <Bot className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                Syllabus-Grounded AI Proxy
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Forward queries to local Python AI inference microservices with strict citation guarantees and graceful fallbacks when offline.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <Calendar className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                Algorithmic Revision Planner
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Generate structured, multi-week study timetables with daily milestones, hours breakdown, and persistent SQLite tracking.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <Wifi className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                Kiwix Hotspot Synchronization
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Turn any campus computer into an autonomous Wi-Fi hotspot distributing video lectures and offline Wikipedia dumps to entire student groups.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-white p-8 border-2 border-black rounded-xl shadow-hard-md hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] border-2 border-black rounded-xl flex items-center justify-center mb-6 transition-colors shadow-hard-sm">
                <UploadCloud className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-heading text-2xl font-extrabold text-black mb-3">
                Secure Intranet Ingestion
              </h3>
              <p className="text-zinc-700 text-sm leading-relaxed">
                Administrators can upload new course modules with automated path sanitization, MIME validation, and isolated file-system storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HOW IT WORKS
          Dark mode section (Background #171e19). 3-step horizontal flow.
          Steps are marked by large 24x24 circles with 4px colored 'glow' borders
          (Sage, Yellow, White). Steps are connected by a dark gray #272727 horizontal line.
          ========================================================================= */}
      <section className="bg-[#171e19] text-white border-b-2 border-black py-24 sm:py-32 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-[#ffe17c] text-black px-3.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border-2 border-black">
              Architecture
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              HOW IT WORKS IN 3 STEPS
            </h2>
            <p className="text-[#b7c6c2] font-medium text-base sm:text-lg">
              Set up a fully functional offline campus educational network in under five minutes.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line: dark gray #272727 */}
            <div className="hidden lg:block absolute top-12 left-24 right-24 h-1 bg-[#272727] -z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {/* Step 1: Sage glow border */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-[#b7c6c2] shadow-[0px_0px_20px_rgba(183,198,194,0.3)] flex items-center justify-center font-heading text-3xl font-extrabold text-[#b7c6c2]">
                  01
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Deploy Server Node
                  </h3>
                  <p className="text-[#b7c6c2]/80 text-sm leading-relaxed">
                    Launch the lightweight Express & SQLite backend on your university computer or Docker container. Database initializes automatically with WAL mode.
                  </p>
                </div>
              </div>

              {/* Step 2: Yellow glow border */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-[#ffe17c] shadow-[0px_0px_20px_rgba(255,225,124,0.3)] flex items-center justify-center font-heading text-3xl font-extrabold text-[#ffe17c]">
                  02
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Connect Student Devices
                  </h3>
                  <p className="text-[#b7c6c2]/80 text-sm leading-relaxed">
                    Broadcast the server via your local campus Wi-Fi router or Kiwix hotspot. Students connect their phones or laptops to the node IP without login friction.
                  </p>
                </div>
              </div>

              {/* Step 3: White glow border */}
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-24 h-24 rounded-full bg-[#171e19] border-4 border-white shadow-[0px_0px_20px_rgba(255,255,255,0.3)] flex items-center justify-center font-heading text-3xl font-extrabold text-white">
                  03
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="font-heading text-2xl font-bold text-white">
                    Stream, Ask & Revise
                  </h3>
                  <p className="text-[#b7c6c2]/80 text-sm leading-relaxed">
                    Students watch NPTEL videos with HTTP Range seeking, read course PDFs, consult the AI assistant, and generate customized revision schedules 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. USE CASE PERSONAS
          White background. 3-column bento-style grid.
          Card 1: Sage (#b7c6c2).
          Card 2: Yellow (#ffe17c) with 8px hard shadow.
          Card 3: Dark Gray (#272727) with white text.
          Each card features a white 'pill' badge at the top indicating the user type.
          ========================================================================= */}
      <section className="bg-white border-b-2 border-black py-20 sm:py-28 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-black text-[#ffe17c] px-3.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border-2 border-black shadow-hard-sm">
              Audience
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-black tracking-tight">
              DESIGNED FOR EVERY CAMPUS ROLE
            </h2>
            <p className="text-zinc-600 font-medium text-base sm:text-lg">
              Tailored workflows for students, professors, and university IT engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Sage (#b7c6c2) */}
            <div className="bg-[#b7c6c2] border-2 border-black rounded-2xl p-8 flex flex-col justify-between shadow-hard-md space-y-6">
              <div className="space-y-4">
                <span className="inline-block bg-white text-black font-bold text-xs px-3.5 py-1 rounded-full border-2 border-black shadow-hard-sm">
                  FOR STUDENTS
                </span>
                <h3 className="font-heading text-3xl font-extrabold text-black">
                  Zero Buffering. Instant Mastery.
                </h3>
                <p className="text-black/85 text-sm sm:text-base font-medium leading-relaxed">
                  Stream high-definition NPTEL video lectures without freezing during peak hostel hours.
                  Ask the offline AI assistant specific questions about exam concepts, and generate custom study plans that match your pace.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black flex items-center justify-between font-bold text-xs">
                <span>Direct Wi-Fi Access</span>
                <button
                  onClick={() => navigate('/courses')}
                  className="underline hover:text-white transition-colors"
                >
                  Browse Lectures &rarr;
                </button>
              </div>
            </div>

            {/* Card 2: Yellow (#ffe17c) with 8px hard shadow */}
            <div className="bg-[#ffe17c] border-2 border-black rounded-2xl p-8 flex flex-col justify-between shadow-hard-lg space-y-6">
              <div className="space-y-4">
                <span className="inline-block bg-white text-black font-bold text-xs px-3.5 py-1 rounded-full border-2 border-black shadow-hard-sm">
                  FOR PROFESSORS
                </span>
                <h3 className="font-heading text-3xl font-extrabold text-black">
                  Effortless Syllabus Distribution
                </h3>
                <p className="text-black/85 text-sm sm:text-base font-medium leading-relaxed">
                  Upload complete course materials, lecture videos, and PDF problem sets directly to the local server.
                  Ensure every student in the lecture hall has immediate offline access to the exact materials covered in class.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black flex items-center justify-between font-bold text-xs">
                <span>Curated Knowledge Bases</span>
                <button
                  onClick={() => navigate('/admin/resources')}
                  className="underline hover:text-white transition-colors"
                >
                  Resource Uploads &rarr;
                </button>
              </div>
            </div>

            {/* Card 3: Dark Gray (#272727) with white text */}
            <div className="bg-[#272727] text-white border-2 border-black rounded-2xl p-8 flex flex-col justify-between shadow-hard-md space-y-6">
              <div className="space-y-4">
                <span className="inline-block bg-white text-black font-bold text-xs px-3.5 py-1 rounded-full border-2 border-black shadow-hard-sm">
                  FOR LAB ADMINS
                </span>
                <h3 className="font-heading text-3xl font-extrabold text-white">
                  95% Bandwidth Savings & Total Control
                </h3>
                <p className="text-zinc-300 text-sm sm:text-base font-normal leading-relaxed">
                  Serve high-bitrate media locally over intranet cables and Wi-Fi access points without wasting expensive commercial satellite or leased-line bandwidth. Complete Docker isolation and SQLite backup.
                </p>
              </div>

              <div className="pt-4 border-t-2 border-zinc-700 flex items-center justify-between font-bold text-xs text-[#ffe17c]">
                <span>Docker Ready</span>
                <span className="font-mono text-zinc-400">Port 5000 / LAN</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS
          Background #b7c6c2. Grid of 3 white cards.
          Unique styling: Cards have asymmetric corner rounding
          (Top-Right and Bottom-Left are 3xl, Top-Left and Bottom-Right are 2px).
          Includes a 5-star rating in #ffbc2e yellow.
          ========================================================================= */}
      <section className="bg-[#b7c6c2] border-b-2 border-black py-20 sm:py-28 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="bg-black text-white px-3.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider border-2 border-black shadow-hard-sm">
              Endorsements
            </span>
            <h2 className="font-heading text-4xl sm:text-6xl font-extrabold text-black tracking-tight">
              FIELD TESTED IN LIVE CAMPUSES
            </h2>
            <p className="text-black/80 font-medium text-base sm:text-lg">
              Here is what educators and university technicians report after running NEXUS nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial Card 1 */}
            <div className="bg-white p-8 neo-asymmetric-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* 5-star rating in #ffbc2e yellow */}
                <div className="flex items-center gap-1 text-[#ffbc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ffbc2e] stroke-black stroke-1" />
                  ))}
                </div>
                <p className="text-black font-bold text-base leading-snug">
                  "During network outages before end-semester exams, the NEXUS node was a lifesaver. Over 80 students streamed the NPTEL Machine Learning lectures without a hiccup."
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black">
                <div className="font-heading text-lg font-extrabold text-black">Dr. K. Swaminathan</div>
                <div className="text-xs text-zinc-600 font-bold">HOD Computer Science, Tech Institute</div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-white p-8 neo-asymmetric-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* 5-star rating in #ffbc2e yellow */}
                <div className="flex items-center gap-1 text-[#ffbc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ffbc2e] stroke-black stroke-1" />
                  ))}
                </div>
                <p className="text-black font-bold text-base leading-snug">
                  "HTTP Range seeking makes scrubbing through a two-hour lecture feel like opening a local video file. And the syllabus-grounded AI explains the tough math instantly."
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black">
                <div className="font-heading text-lg font-extrabold text-black">Aarav Patel</div>
                <div className="text-xs text-zinc-600 font-bold">Final Year B.Tech Student</div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="bg-white p-8 neo-asymmetric-card flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* 5-star rating in #ffbc2e yellow */}
                <div className="flex items-center gap-1 text-[#ffbc2e]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#ffbc2e] stroke-black stroke-1" />
                  ))}
                </div>
                <p className="text-black font-bold text-base leading-snug">
                  "Deploying NEXUS alongside Kiwix Wi-Fi hotspots shaved our ISP bills by 70%. It turns basic lab PCs into resilient community knowledge engines."
                </p>
              </div>

              <div className="pt-4 border-t-2 border-black">
                <div className="font-heading text-lg font-extrabold text-black">Meera Sen</div>
                <div className="text-xs text-zinc-600 font-bold">Systems Engineer & Intranet Admin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CTA & FOOTER
          Final CTA on #ffe17c with large centered heading.
          Footer in #171e19 with 4 columns.
          Social icons are 10x10 squares (#272727) with light gray borders
          that turn Yellow/Black on hover.
          ========================================================================= */}
      {/* Final CTA */}
      <section className="bg-radial-dots border-b-2 border-black py-24 sm:py-32 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-black text-[#ffe17c] px-4 py-1.5 rounded-full text-xs font-bold border-2 border-black shadow-hard-sm">
            <Zap className="w-4 h-4 fill-[#ffe17c]" />
            <span>COMMENCE LOCAL DEPLOYMENT</span>
          </div>

          <h2 className="font-heading text-5xl sm:text-7xl font-extrabold text-black tracking-tight leading-tight">
            START YOUR OFFLINE CAMPUS NODE TODAY.
          </h2>

          <p className="text-lg sm:text-xl text-black font-medium max-w-2xl mx-auto leading-relaxed">
            Zero cloud subscriptions. Zero buffering. 100% resilient access to top-tier university education.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/courses')}
              className="neo-btn-primary text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 shadow-hard-lg"
            >
              <span>Explore Course Library</span>
              <ArrowRight className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigate('/planner')}
              className="neo-btn-secondary text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 shadow-hard-md"
            >
              <span>Create Revision Plan</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer in #171e19 with 4 columns */}
      <footer className="bg-[#171e19] text-white py-16 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-[#ffe17c] shadow-hard-sm">
                <Zap className="w-6 h-6 text-[#ffe17c] fill-[#ffe17c]" />
              </div>
              <span className="font-heading text-2xl font-extrabold tracking-tighter text-white">
                NEXUS AI
              </span>
            </div>
            <p className="text-[#b7c6c2] text-sm leading-relaxed">
              Neo-Brutalist offline education operating system. Serving NPTEL lectures, Kiwix hotspots, and locally grounded AI.
            </p>
            <div className="text-xs font-mono text-zinc-400">
              Host: 127.0.0.1:5000 / LAN Permitted
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-lg font-extrabold text-[#ffe17c] uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-sm font-bold text-[#b7c6c2]">
              <li>
                <button onClick={() => navigate('/courses')} className="hover:text-white transition-colors">
                  Course Library
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/assistant')} className="hover:text-white transition-colors">
                  AI Study Assistant
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/planner')} className="hover:text-white transition-colors">
                  Revision Planner
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/search')} className="hover:text-white transition-colors">
                  Metadata & Notes Search
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/admin/resources')} className="hover:text-white transition-colors">
                  Resource Upload Manager
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Tech Architecture */}
          <div className="space-y-3">
            <h4 className="font-heading text-lg font-extrabold text-[#ffe17c] uppercase tracking-wider">
              Architecture
            </h4>
            <ul className="space-y-2 text-sm font-medium text-[#b7c6c2]">
              <li>HTTP 206 Video Streaming</li>
              <li>SQLite WAL High Concurrency</li>
              <li>Kiwix Offline Hotspot</li>
              <li>Docker Multi-Stage Container</li>
              <li>Zod Schema Validation</li>
            </ul>
          </div>

          {/* Column 4: Social & Node Status */}
          <div className="space-y-4">
            <h4 className="font-heading text-lg font-extrabold text-[#ffe17c] uppercase tracking-wider">
              Network Channels
            </h4>
            <p className="text-xs text-[#b7c6c2]">
              Connect with fellow university lab operators and open education contributors.
            </p>

            {/* Social icons: 10x10 squares (#272727) with light gray borders that turn Yellow/Black on hover */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Sriram-Nambiar/Nexus"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-[#272727] border-2 border-zinc-600 flex items-center justify-center text-zinc-300 hover:bg-[#ffe17c] hover:text-black hover:border-black transition-colors shadow-hard-sm"
                title="GitHub Repo"
              >
                <Laptop className="w-5 h-5" />
              </a>
              <button
                onClick={() => navigate('/courses/1')}
                className="w-10 h-10 bg-[#272727] border-2 border-zinc-600 flex items-center justify-center text-zinc-300 hover:bg-[#ffe17c] hover:text-black hover:border-black transition-colors shadow-hard-sm"
                title="NPTEL Machine Learning Demo"
              >
                <Play className="w-5 h-5 fill-current" />
              </button>
              <button
                onClick={() => navigate('/assistant')}
                className="w-10 h-10 bg-[#272727] border-2 border-zinc-600 flex items-center justify-center text-zinc-300 hover:bg-[#ffe17c] hover:text-black hover:border-black transition-colors shadow-hard-sm"
                title="AI Inference Service"
              >
                <Bot className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 bg-[#272727] border-2 border-zinc-600 flex items-center justify-center text-zinc-300 hover:bg-[#ffe17c] hover:text-black hover:border-black transition-colors shadow-hard-sm"
                title="Global Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-500 pt-2">
              © 2026 NEXUS AI. Distributed under MIT.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
