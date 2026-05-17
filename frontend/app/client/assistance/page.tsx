'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, 
  Wrench, 
  AlertCircle, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  ChevronRight, 
  LifeBuoy, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Headphones,
  FileText
} from 'lucide-react';
import {
  ClientPageWrapper,
  ClientCard,
  ClientButton,
  ClientStatCard,
  ClientEmptyState,
  ClientLoadingState,
} from '@/components/client';
import { motion, AnimatePresence } from 'framer-motion';

interface AssistanceItem {
  id: number;
  title: string;
  description: string;
  type: 'faq' | 'contact' | 'guide';
  icon: any;
  color: string;
}

export default function ClientAssistancePage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const assistanceItems: AssistanceItem[] = [
    {
      id: 1,
      title: t('assistance.frequentQuestions'),
      description: t('assistance.findAnswers'),
      type: 'faq',
      icon: AlertCircle,
      color: 'blue'
    },
    {
      id: 2,
      title: t('assistance.contactSupport'),
      description: t('assistance.talkDirectly'),
      type: 'contact',
      icon: Headphones,
      color: 'red'
    },
    {
      id: 3,
      title: t('assistance.userGuide'),
      description: t('assistance.learnToUse'),
      type: 'guide',
      icon: FileText,
      color: 'purple'
    },
    {
      id: 4,
      title: t('assistance.liveChat'),
      description: t('assistance.instantAssistance'),
      type: 'contact',
      icon: MessageCircle,
      color: 'emerald'
    }
  ];

  const filteredItems = assistanceItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClientPageWrapper className="space-y-12 pb-20">
      {/* ─── Premium Header ─── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 text-slate-800 shadow-sm border border-slate-200/80"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-blue-600/5 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600 backdrop-blur-md">
              <LifeBuoy className="h-3.5 w-3.5" />
              {t('assistance.centreTitle')}
            </div>
            <h1 className="mb-4 text-4xl sm:text-4xl font-extrabold tracking-tight leading-none text-slate-900">
              {t('assistance.helpTitle')}
            </h1>
            <p className="text-slate-500 font-semibold text-base leading-relaxed">
              {t('assistance.helpSubtitle')}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t('assistance.searchInAssistance')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 py-3.5 pl-12 pr-4 text-sm font-semibold outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Assistance Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => {
          const colors: any = {
            blue: 'text-blue-600 bg-blue-50 border-blue-100',
            red: 'text-blue-600 bg-blue-50 border-blue-100',
            purple: 'text-purple-600 bg-purple-50 border-purple-100',
            emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100'
          };
          const Icon = item.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ClientCard 
                className="group h-full flex flex-col p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 cursor-pointer"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${colors[item.color]} border group-hover:scale-115 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                
                <div className="flex-1 space-y-3 mb-8">
                  <h3 className="text-lg font-extrabold text-slate-800 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-semibold leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                   <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{item.type}</span>
                   <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-4 w-4" />
                   </div>
                </div>
              </ClientCard>
            </motion.div>
          );
        })}
      </div>

      {/* ─── FAQ Quick Access ─── */}
      <div className="space-y-8 mt-12">
        <div className="flex items-center justify-between px-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t('assistance.frequentQuestions')}</h2>
            <p className="text-slate-500 text-sm font-semibold mt-1">{t('assistance.findAnswers')}</p>
          </div>
          <ClientButton variant="secondary" className="hidden sm:flex rounded-xl">{t('assistance.viewAllHelp')}</ClientButton>
        </div>

        <div className="grid gap-4">
          {[
            {
              question: t('assistance.faq.q1') || "Comment prendre rendez-vous pour une révision ?",
              answer: t('assistance.faq.a1') || "Vous pouvez prendre rendez-vous directement depuis votre espace client dans la section 'Rendez-vous'. Choisissez votre véhicule, l'agence et le créneau qui vous convient."
            },
            {
              question: t('assistance.faq.q2') || "Quelles sont les conditions de la garantie Chery ?",
              answer: t('assistance.faq.a2') || "La garantie Chery couvre les défauts de fabrication pour une durée de 5 ans ou 100,000 km (au premier terme échu). Consultez votre carnet de garantie pour plus de détails."
            },
            {
              question: t('assistance.faq.q3') || "Où trouver le manuel d'utilisation de mon véhicule ?",
              answer: t('assistance.faq.a3') || "Tous les manuels d'utilisation sont disponibles en téléchargement PDF dans la section 'Mes Documents' de votre portail client."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <ClientCard className="p-6 border border-slate-200/80 bg-white rounded-2xl hover:border-blue-100 transition-all group">
                <div className="flex items-start gap-4">
                   <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors mt-0.5 font-extrabold text-xs">
                      Q
                   </div>
                   <div>
                     <h3 className="font-extrabold text-slate-800 mb-2">{faq.question}</h3>
                     <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                       {faq.answer}
                     </p>
                   </div>
                </div>
              </ClientCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Call to Action ─── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white overflow-hidden shadow-sm"
      >
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
           <div>
              <h2 className="text-3xl font-extrabold mb-4">{t('assistance.immediateAssistance')}</h2>
              <p className="text-blue-100 font-semibold max-w-lg">{t('assistance.advisorsListening')}</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <ClientButton variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none px-8 py-6 h-auto rounded-xl shadow-sm">
                 <Phone className="h-5 w-5 mr-3" />
                 {t('assistance.phone') || "71 111 222"}
              </ClientButton>
              <ClientButton variant="primary" className="bg-blue-600 hover:bg-blue-700 border border-blue-500 px-8 py-6 h-auto rounded-xl shadow-sm text-white">
                 {t('assistance.contactUs')}
                 <ArrowRight className="h-5 w-5 ml-3" />
              </ClientButton>
           </div>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}
