'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAppointments } from '@/lib/api/agentDashboard';
import { Button } from '@/components/ui/button';
import { Users, Phone, Mail, Car, Calendar, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string;
  dernierRdv?: string;
  nombreRdv: number;
  vehicules: string[];
}

export default function ClientsPage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || !['AGENT'].includes(user.role))) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (token) {
      loadClients();
    }
  }, [token]);

  const loadClients = async () => {
    try {
      setLoading(true);
      // Récupérer tous les rendez-vous pour extraire les clients
      const appointments = await fetchAppointments(token, {});
      
      // Grouper par client
      const clientsMap = new Map<number, Client>();
      
      appointments.forEach((rdv: any) => {
        const clientId = rdv.client_id;
        
        if (!clientsMap.has(clientId)) {
          clientsMap.set(clientId, {
            id: clientId,
            nom: rdv.client_nom,
            prenom: rdv.client_prenom,
            telephone: rdv.client_telephone,
            email: rdv.client_email,
            dernierRdv: rdv.date_rendez_vous,
            nombreRdv: 1,
            vehicules: [`${rdv.marque_nom} ${rdv.modele_nom} (${rdv.immatriculation})`]
          });
        } else {
          const client = clientsMap.get(clientId)!;
          client.nombreRdv++;
          
          // Mettre à jour le dernier RDV si plus récent
          if (new Date(rdv.date_rendez_vous) > new Date(client.dernierRdv || '')) {
            client.dernierRdv = rdv.date_rendez_vous;
          }
          
          // Ajouter le véhicule s'il n'existe pas déjà
          const vehiculeStr = `${rdv.marque_nom} ${rdv.modele_nom} (${rdv.immatriculation})`;
          if (!client.vehicules.includes(vehiculeStr)) {
            client.vehicules.push(vehiculeStr);
          }
        }
      });
      
      // Convertir en tableau et trier par nom
      const clientsArray = Array.from(clientsMap.values()).sort((a, b) => 
        a.nom.localeCompare(b.nom)
      );
      
      setClients(clientsArray);
    } catch (error) {
      console.error(error);
      toast.error('Erreur', { description: 'Impossible de charger les clients' });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (client: Client) => {
    if (client.telephone) {
      // Ouvrir WhatsApp avec le numéro de téléphone
      const phoneNumber = client.telephone.replace(/\s/g, '');
      const message = encodeURIComponent(`Bonjour ${client.prenom} ${client.nom}, `);
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } else {
      toast.error('Erreur', { description: 'Numéro de téléphone non disponible' });
    }
  };

  const filteredClients = clients.filter(client => 
    `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || !user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-orange-500" />
          Mes Clients
        </h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 pl-10 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-80"
          />
          <Users className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Clients</p>
          <p className="text-2xl font-bold text-white">{clients.length}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-orange-400 text-sm">Clients Actifs</p>
          <p className="text-2xl font-bold text-orange-500">
            {clients.filter(c => c.dernierRdv && 
              new Date(c.dernierRdv) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            ).length}
          </p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-sm">Total Rendez-vous</p>
          <p className="text-2xl font-bold text-blue-500">
            {clients.reduce((sum, c) => sum + c.nombreRdv, 0)}
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="text-slate-400 mt-4">Chargement...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">Aucun client trouvé</p>
            <p className="text-slate-500 text-sm">
              {searchTerm ? 'Essayez une autre recherche' : 'Les clients apparaîtront ici'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-orange-500/50 transition-all"
              >
                {/* Client Name */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">
                      {client.prenom} {client.nom}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {client.nombreRdv} rendez-vous
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-500" />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {client.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">{client.telephone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300 truncate">{client.email}</span>
                    </div>
                  )}
                  {client.dernierRdv && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        {new Date(client.dernierRdv).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Vehicles */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Car className="w-3 h-3" />
                    Véhicules
                  </p>
                  <div className="space-y-1">
                    {client.vehicules.slice(0, 2).map((vehicule, idx) => (
                      <p key={idx} className="text-sm text-slate-300 truncate">
                        {vehicule}
                      </p>
                    ))}
                    {client.vehicules.length > 2 && (
                      <p className="text-xs text-slate-500">
                        +{client.vehicules.length - 2} autre(s)
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Button */}
                <Button
                  onClick={() => handleContact(client)}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
