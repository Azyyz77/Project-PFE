'use client';

import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

  const assistanceItems: AssistanceItem[] = [
    {
      id: 1,
      title: 'Questions Fréquentes',
      description: 'Trouvez des réponses aux questions les plus courantes',
      type: 'faq',
      icon: <AlertCircle className="w-6 h-6" />
    },
    {
      id: 2,
      title: 'Contacter le Support',
      description: 'Parlez directement avec notre équipe de support',
      type: 'contact',
      icon: <Phone className="w-6 h-6" />
    },
    {
      id: 3,
      title: 'Guide d\'Utilisation',
      description: 'Apprenez à utiliser toutes les fonctionnalités',
      type: 'guide',
      icon: <Wrench className="w-6 h-6" />
    },
    {
      id: 4,
      title: 'Chat en Direct',
      description: 'Assistance instantanée via notre chatbot',
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
          Centre d'Assistance
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Trouvez de l'aide et des réponses à vos questions
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="flex gap-3">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans l'assistance..."
            className="flex-1"
          />
          <Button>
            <Search className="w-4 h-4 mr-2" />
            Rechercher
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
                Accéder
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section FAQ rapide */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Questions Fréquentes
        </h2>
        <div className="space-y-4">
          {[
            {
              question: "Comment prendre un rendez-vous ?",
              answer: "Rendez-vous dans la section 'Rendez-vous' de votre dashboard client."
            },
            {
              question: "Comment suivre mes commandes ?",
              answer: "Consultez la section 'Mes Commandes' pour voir l'état de vos commandes."
            },
            {
              question: "Comment contacter le support ?",
              answer: "Utilisez le chatbot ou contactez-nous directement via la section contact."
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
