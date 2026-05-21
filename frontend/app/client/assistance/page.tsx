'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Wrench, AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AssistanceItem {
  id: number;
  title: string;
  description: string;
  type: 'faq' | 'contact' | 'guide';
  icon: React.ReactNode;
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
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      id: 2,
      title: t('assistance.contactSupport'),
      description: t('assistance.talkDirectly'),
      type: 'contact',
      icon: <Phone className="w-6 h-6" />
    },
    {
      id: 3,
      title: t('assistance.userGuide'),
      description: t('assistance.learnToUse'),
      type: 'guide',
      icon: <Wrench className="w-6 h-6" />
    },
    {
      id: 4,
      title: t('assistance.liveChat'),
      description: t('assistance.instantAssistance'),
      type: 'contact',
      icon: <MessageCircle className="w-6 h-6" />
    }
  ];

  const filteredItems = assistanceItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {t('assistance.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('assistance.findHelp')}
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('assistance.searchInAssistance')}
            className="flex-1"
          />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            {t('assistance.search')}
          </Button>
        </div>
      </div>

      {/* Cartes d'assistance */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  {item.icon}
                </div>
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {item.description}
              </p>
              <Button variant="outline" size="sm">
                {t('assistance.access')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section FAQ rapide */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          {t('assistance.frequentQuestions')}
        </h2>
        <div className="space-y-4">
          {[
            {
              question: t('assistance.frequentQuestions'),
              answer: t('assistance.findAnswers')
            },
            {
              question: t('assistance.contactSupport'),
              answer: t('assistance.talkDirectly')
            },
            {
              question: t('assistance.userGuide'),
              answer: t('assistance.learnToUse')
            }
          ].map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
