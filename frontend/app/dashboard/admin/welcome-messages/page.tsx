'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, RefreshCw, MessageSquare, Eye, EyeOff } from 'lucide-react';
import {
  getAllMessages,
  createMessage,
  updateMessage,
  deleteMessage
} from '@/lib/api/welcomeMessages';
import { WelcomeMessage, MessageType } from '@/types/promotions';

const MESSAGE_TYPES: { value: MessageType; label: string; color: string }[] = [
  { value: 'INFO', label: 'Information', color: 'bg-blue-100 text-blue-700' },
  { value: 'ALERTE', label: 'Alerte', color: 'bg-amber-100 text-amber-700' },
  { value: 'PROMOTION', label: 'Promotion', color: 'bg-purple-100 text-purple-700' },
  { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-slate-100 text-slate-700' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-700' }
];

export default function WelcomeMessagesAdminPage() {
  const [messages, setMessages] = useState<WelcomeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<WelcomeMessage | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    type: 'INFO' as MessageType,
    priorite: 2,
    date_debut: '',
    date_fin: '',
    afficher_accueil: true,
    afficher_dashboard: true,
    lien_url: '',
    lien_texte: ''
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getAllMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMessage) {
        await updateMessage(editingMessage.id, formData);
      } else {
        await createMessage(formData);
      }
      setShowModal(false);
      resetForm();
      await loadMessages();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (message: WelcomeMessage) => {
    setEditingMessage(message);
    setFormData({
      titre: message.titre,
      contenu: message.contenu,
      type: message.type,
      priorite: message.priorite,
      date_debut: message.date_debut.split('T')[0],
      date_fin: message.date_fin ? message.date_fin.split('T')[0] : '',
      afficher_accueil: message.afficher_accueil,
      afficher_dashboard: message.afficher_dashboard,
      lien_url: message.lien_url || '',
      lien_texte: message.lien_texte || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver ce message ?')) return;
    
    try {
      await deleteMessage(id);
      await loadMessages();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      contenu: '',
      type: 'INFO',
      priorite: 2,
      date_debut: '',
      date_fin: '',
      afficher_accueil: true,
      afficher_dashboard: true,
      lien_url: '',
      lien_texte: ''
    });
    setEditingMessage(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages d'Accueil</h1>
          <p className="text-slate-600">Gérer les messages et annonces pour les clients</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadMessages}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau message
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{messages.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Actifs</p>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.actif).length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Inactifs</p>
              <p className="text-2xl font-bold text-slate-400">
                {messages.filter(m => !m.actif).length}
              </p>
            </div>
            <EyeOff className="w-8 h-8 text-slate-400" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Lectures totales</p>
              <p className="text-2xl font-bold text-purple-600">
                {messages.reduce((sum, m) => sum + (m.nb_lectures || 0), 0)}
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map(message => {
          const typeInfo = MESSAGE_TYPES.find(t => t.value === message.type);
          return (
            <div key={message.id} className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900">{message.titre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo?.color}`}>
                      {typeInfo?.label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.actif ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {message.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Priorité: {message.priorite}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 mb-3 whitespace-pre-wrap">{message.contenu}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>Du {formatDate(message.date_debut)}</span>
                    {message.date_fin && <span>au {formatDate(message.date_fin)}</span>}
                    {message.afficher_accueil && <span className="text-blue-600">• Accueil</span>}
                    {message.afficher_dashboard && <span className="text-purple-600">• Dashboard</span>}
                    {message.nb_lectures !== undefined && (
                      <span className="text-green-600">• {message.nb_lectures} lectures</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(message)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {messages.length === 0 && (
          <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Aucun message</p>
            <p className="text-sm text-slate-400">Créez votre premier message d'accueil</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h2 className="text-xl font-bold mb-4">
              {editingMessage ? 'Modifier le message' : 'Nouveau message'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contenu *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.contenu}
                  onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as MessageType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {MESSAGE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Basse</option>
                    <option value={2}>Normale</option>
                    <option value={3}>Haute</option>
                    <option value={4}>Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date début *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.date_fin}
                    onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Lien URL (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.lien_url}
                    onChange={(e) => setFormData({ ...formData, lien_url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Texte du lien
                  </label>
                  <input
                    type="text"
                    value={formData.lien_texte}
                    onChange={(e) => setFormData({ ...formData, lien_texte: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="En savoir plus"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.afficher_accueil}
                    onChange={(e) => setFormData({ ...formData, afficher_accueil: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Afficher sur l'accueil</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.afficher_dashboard}
                    onChange={(e) => setFormData({ ...formData, afficher_dashboard: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Afficher sur le dashboard</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingMessage ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
