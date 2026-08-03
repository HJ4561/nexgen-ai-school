import { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import gsap from 'gsap';
import { sendMessage } from '@/store/chat/chatThunks';
import promptSuggestions from '@/modules/chat/data/promptSuggestions.json'; // or inline

import {
  TrendingUp, Handshake, BarChart3, BookOpen, GraduationCap,
  Wrench, DollarSign, Image, ClipboardList, Trophy,
  FileText, Users, Package, Calendar, Radio, ArrowRight,
  MessageCircleQuestion,
} from 'lucide-react';

const INK = '#0f172a';
const MUTED = '#64748b';
const SURFACE = '#ffffff';
const BORDER = 'rgba(15, 23, 42, 0.07)';

// Icon per bot type, used when a suggestion doesn't name its own.
const botIconMap = {
  fee: DollarSign,
  attendance: ClipboardList,
  assignment: BookOpen,
  exam: Trophy,
  certificate: FileText,
  scholarship: GraduationCap,
  inventory: Package,
  event: Calendar,
  maintenance: Wrench,
  media: Image,
  general: BarChart3,
};
const fallbackIconCycle = [BarChart3, ClipboardList, Calendar, BookOpen, Users, TrendingUp, Handshake, Radio];

// A small curated accent palette — each card is assigned one, cycling in order.
// Distinct hues (not just app-wide indigo/cyan) so an 8-card grid reads as
// a set of categories rather than one repeated tile.
const ACCENTS = [
  { fg: '#4f46e5', bg: '#eef2ff' }, // indigo
  { fg: '#0891b2', bg: '#ecfeff' }, // cyan
  { fg: '#059669', bg: '#ecfdf5' }, // emerald
  { fg: '#d97706', bg: '#fffbeb' }, // amber
  { fg: '#db2777', bg: '#fdf2f8' }, // pink
  { fg: '#7c3aed', bg: '#f5f3ff' }, // violet
  { fg: '#0d9488', bg: '#f0fdfa' }, // teal
  { fg: '#dc2626', bg: '#fef2f2' }, // red
];

function normalizeSuggestion(raw, index, fallbackIcon) {
  const accent = ACCENTS[index % ACCENTS.length];
  if (typeof raw === 'string') {
    const words = raw.trim().split(' ');
    const title = words.slice(0, 4).join(' ');
    const subtitle = words.length > 4 ? words.slice(4).join(' ') : raw;
    return { title, subtitle, prompt: raw, Icon: fallbackIconCycle[index % fallbackIconCycle.length], accent };
  }
  return {
    title: raw.title,
    subtitle: raw.subtitle,
    prompt: raw.prompt ?? raw.title,
    Icon: botIconMap[raw.icon] || fallbackIcon,
    accent,
  };
}

export default function PromptCards() {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth.user?.role_name) || 'Admin';
  const currentBot = useSelector((s) => s.chat.currentSession?.bot_type) || 'general';
  const rawSuggestions = promptSuggestions[role]?.[currentBot] || promptSuggestions[role]?.general || [];

  const rootRef = useRef(null);
  const gridRef = useRef(null);

  const fallbackIcon = botIconMap[currentBot] || MessageCircleQuestion;
  const suggestions = rawSuggestions
    .slice(0, 8)
    .map((raw, idx) => normalizeSuggestion(raw, idx, fallbackIcon));

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current.querySelector('h2'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
      gsap.fromTo(
        rootRef.current.querySelector('p'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.08 }
      );
      if (gridRef.current) {
        gsap.fromTo(
          gridRef.current.querySelectorAll('[data-card]'),
          { opacity: 0, y: 18, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)', stagger: 0.06, delay: 0.12 }
        );
      }
    }, rootRef);
    return () => ctx.revert();
  }, [currentBot]);

  const handleClick = (prompt) => dispatch(sendMessage({ content: prompt }));

  if (suggestions.length === 0) return null;

  return (
    <div ref={rootRef} className="text-center mb-10 mt-16 px-4">
      <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: INK }}>
        How can I assist you today?
      </h2>
      <p className="max-w-md mx-auto mb-9" style={{ color: MUTED }}>
        Try one of these questions
      </p>

      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto"
      >
        {suggestions.map(({ title, subtitle, prompt, Icon, accent }, idx) => (
          <button
            key={idx}
            data-card
            type="button"
            onClick={() => handleClick(prompt)}
            aria-label={`Ask: ${prompt}`}
            title={prompt}
            className="group relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl
                       border p-5 text-left transition-transform duration-200 ease-out
                       hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2"
            style={{ background: SURFACE, borderColor: BORDER, '--tw-ring-color': accent.fg }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform
                         duration-200 group-hover:scale-105"
              style={{ background: accent.bg }}
            >
              <Icon style={{ color: accent.fg }} size={19} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug" style={{ color: INK }}>
                {title}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-snug" style={{ color: MUTED }}>
                {subtitle}
              </p>
            </div>

            <span
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium opacity-0
                         transition-opacity duration-200 group-hover:opacity-100"
              style={{ color: accent.fg }}
            >
              Ask
              <ArrowRight
                size={13}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </span>

            {/* Signature element: a colored underline that draws itself in on hover/focus,
                anchored bottom-left — reinforces which category accent this card belongs to. */}
            <span
              className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full origin-left
                         scale-x-0 transition-transform duration-300 ease-out
                         group-hover:scale-x-100 group-focus-visible:scale-x-100"
              style={{ background: accent.fg }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
