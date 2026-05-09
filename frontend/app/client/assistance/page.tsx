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
        className="relative overflow-hidden rounded-[3rem] bg-[#0b1221] p-10 sm:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-red-600/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center md:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 backdrop-blur-md border border-white/10">
              <LifeBuoy className="h-3.5 w-3.5" />
              Centre d'Assistance Client
            </div>
            <h1 className="mb-4 text-4xl sm:text-6xl font-black tracking-tight leading-none">
              Comment pouvons-nous <span className="text-red-500">vous aider ?</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg leading-relaxed">
              Explorez nos ressources, contactez nos experts ou trouvez des solutions rapides pour votre Chery.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder={t('assistance.searchInAssistance')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 pl-12 pr-4 text-sm font-medium text-white placeholder-slate-500 outline-none transition-all focus:bg-white/10 focus:ring-4 focus:ring-red-500/10"
            />
          </div>
        </div>
      </motion.div>

      {/* ─── Assistance Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map((item, idx) => {
          const colors: any = {
            blue: 'text-blue-600 bg-blue-50 border-blue-100',
            red: 'text-red-600 bg-red-50 border-red-100',
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
                className="group h-full flex flex-col p-8 border-none shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer"
              >
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${colors[item.color]} shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                
                <div className="flex-1 space-y-3 mb-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.type}</span>
                   <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <ChevronRight className="h-5 w-5" />
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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t('assistance.frequentQuestions')}</h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Réponses rapides aux questions courantes.</p>
          </div>
          <ClientButton variant="secondary" className="hidden sm:flex rounded-full">Voir tout le centre d'aide</ClientButton>
        </div>

        <div className="grid gap-4">
          {[
            {
              question: "Comment prendre rendez-vous pour une révision ?",
              answer: "Vous pouvez prendre rendez-vous directement depuis votre espace client dans la section 'Rendez-vous'. Choisissez votre véhicule, l'agence et le créneau qui vous convient."
            },
            {
              question: "Quelles sont les conditions de la garantie Chery ?",
              answer: "La garantie Chery couvre les défauts de fabrication pour une durée de 5 ans ou 100,000 km (au premier terme échu). Consultez votre carnet de garantie pour plus de détails."
            },
            {
              question: "Où trouver le manuel d'utilisation de mon véhicule ?",
              answer: "Tous les manuels d'utilisation sont disponibles en téléchargement PDF dans la section 'Mes Documents' de votre portail client."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <ClientCard className="p-6 border-none shadow-lg shadow-slate-100 hover:shadow-xl transition-all group">
                <div className="flex items-start gap-4">
                   <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors mt-0.5 font-black text-xs">
                      Q
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 mb-2">{faq.question}</h3>
                     <p className="text-sm text-slate-500 leading-relaxed">
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
        className="relative rounded-[3rem] bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 h-64 w-64 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
           <div>
              <h2 className="text-3xl font-black mb-4">Besoin d'une assistance immédiate ?</h2>
              <p className="text-blue-100 font-medium max-w-lg">Nos conseillers sont à votre écoute du lundi au samedi de 8h00 à 18h00 pour répondre à toutes vos questions.</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <ClientButton variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 border-none px-8 py-6 h-auto rounded-2xl shadow-xl">
                 <Phone className="h-5 w-5 mr-3" />
                 71 111 222
              </ClientButton>
              <ClientButton variant="primary" className="bg-red-600 hover:bg-red-700 border-none px-8 py-6 h-auto rounded-2xl shadow-xl">
                 Nous contacter
                 <ArrowRight className="h-5 w-5 ml-3" />
              </ClientButton>
           </div>
        </div>
      </motion.div>
    </ClientPageWrapper>
  );
}
