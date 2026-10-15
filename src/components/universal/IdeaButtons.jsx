import {
  Globe, ShoppingCart, Filter, Smartphone, Palette, Share2,
  Video, Mail, Users, MessageCircle, Calendar, BarChart3,
  Shield, Target, DollarSign, UserPlus, Gift, FileText,
  LayoutTemplate, Code, Plug, Database, GitBranch, CreditCard, Image,
} from "lucide-react";

const IDEAS = [
  { type: "website", prompt: "AI-powered SaaS landing page for a CRM tool with hero, features, pricing, and testimonials", icon: Globe, label: "SaaS Landing Page" },
  { type: "ecommerce", prompt: "E-commerce store for handmade jewelry with product grid, cart, and checkout flow", icon: ShoppingCart, label: "E-commerce Store" },
  { type: "funnel", prompt: "Lead magnet funnel for a fitness coach offering a free workout guide", icon: Filter, label: "Lead Gen Funnel" },
  { type: "app", prompt: "Mobile app UI for a food delivery service with restaurant list, menu, and order tracking", icon: Smartphone, label: "Mobile App UI" },
  { type: "brand", prompt: "Brand identity for a sustainable fashion brand targeting eco-conscious millennials", icon: Palette, label: "Brand Identity" },
  { type: "social", prompt: "Social media kit for a real estate agency showcasing luxury properties", icon: Share2, label: "Social Media Kit" },
  { type: "video", prompt: "Video script for a SaaS product launch announcement, 60 seconds", icon: Video, label: "Video Script" },
  { type: "email", prompt: "5-email welcome sequence for a B2B software company onboarding new users", icon: Mail, label: "Email Sequence" },
  { type: "chatbot", prompt: "Chatbot script for customer support handling billing, technical, and general inquiries", icon: MessageCircle, label: "Chatbot Script" },
  { type: "booking", prompt: "Booking system design for a hair salon with service selection, stylist choice, and time slots", icon: Calendar, label: "Booking System" },
  { type: "dashboard", prompt: "Analytics dashboard for a marketing agency showing campaign performance, ROI, and client metrics", icon: BarChart3, label: "Analytics Dashboard" },
  { type: "compliance", prompt: "Compliance checklist for a healthcare app handling patient data under HIPAA", icon: Shield, label: "Compliance Checklist" },
  { type: "competitor", prompt: "Competitor analysis for a fintech startup in the personal finance space", icon: Target, label: "Competitor Analysis" },
  { type: "pricing", prompt: "Pricing strategy for a SaaS product with free, pro, and enterprise tiers", icon: DollarSign, label: "Pricing Strategy" },
  { type: "onboarding", prompt: "Customer onboarding flow for a B2B service with 7-day activation milestone", icon: UserPlus, label: "Onboarding Flow" },
  { type: "referral", prompt: "Referral program for an e-commerce store with double-sided incentives", icon: Gift, label: "Referral Program" },
  { type: "content", prompt: "SEO blog post about AI trends in small business marketing, 1500 words", icon: FileText, label: "SEO Blog Post" },
  { type: "landing", prompt: "High-converting landing page for a mobile app launch with app store badges and demo video", icon: LayoutTemplate, label: "App Landing Page" },
  { type: "workflow", prompt: "Workflow automation for lead qualification with scoring, routing, and follow-up triggers", icon: GitBranch, label: "Workflow Automation" },
  { type: "api", prompt: "API integration plan for connecting a CRM with an email marketing platform", icon: Plug, label: "API Integration" },
];

export default function IdeaButtons({ onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
      {IDEAS.map((idea, i) => {
        const Icon = idea.icon;
        return (
          <button
            key={i}
            onClick={() => onSelect(idea.type, idea.prompt)}
            className="group flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-3 text-center hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all duration-150"
          >
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#00d4ff] transition" />
            <span className="text-[11px] font-semibold text-slate-600 group-hover:text-[#00d4ff] leading-tight">
              {idea.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export { IDEAS };