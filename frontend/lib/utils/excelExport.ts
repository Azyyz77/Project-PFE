import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
}

/**
 * Génère un nom de fichier Excel avec la date actuelle
 * @param prefix - Préfixe du nom de fichier
 * @returns Nom de fichier avec date
 */
export function generateExcelFilename(prefix: string = 'rapport'): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}_${dateStr}_${timeStr}.xlsx`;
}

/**
 * Exporte des données au format Excel
 * @param data - Données à exporter (array d'objets)
 * @param options - Options d'export
 */
export function exportToExcel(
  data: any[],
  options: ExcelExportOptions = {}
): void {
  const {
    filename = generateExcelFilename('export'),
    sheetName = 'Données',
  } = options;

  try {
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new();

    // Convertir les données en feuille
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajuster la largeur des colonnes
    const colWidths = Object.keys(data[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      ),
    }));
    ws['!cols'] = colWidths;

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Écrire et télécharger le fichier
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error;
  }
}

/**
 * Exporte plusieurs jeux de données dans différentes feuilles
 * @param sheets - Array de {name: string, data: any[]}
 * @param filename - Nom du fichier
 */
export function exportMultipleSheetsToExcel(
  sheets: { name: string; data: any[] }[],
  filename: string = generateExcelFilename('rapport')
): void {
  try {
    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new();

    // Ajouter chaque feuille
    sheets.forEach((sheet) => {
      if (sheet.data.length === 0) {
        console.warn(`Feuille "${sheet.name}" vide, ignorée`);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(sheet.data);

      // Ajuster la largeur des colonnes
      const colWidths = Object.keys(sheet.data[0] || {}).map((key) => ({
        wch: Math.max(
          key.length,
          ...sheet.data.map((row) => String(row[key] || '').length)
        ),
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    // Écrire et télécharger le fichier
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Erreur lors de l\'export Excel multi-feuilles:', error);
    throw error;
  }
}

/**
 * Exporte un tableau HTML vers Excel
 * @param tableId - ID du tableau HTML
 * @param options - Options d'export
 */
export function exportTableToExcel(
  tableId: string,
  options: ExcelExportOptions = {}
): void {
  const {
    filename = generateExcelFilename('tableau'),
    sheetName = 'Tableau',
  } = options;

  try {
    const table = document.getElementById(tableId);
    if (!table) {
      throw new Error(`Tableau avec l'ID "${tableId}" introuvable`);
    }

    // Créer un nouveau classeur
    const wb = XLSX.utils.book_new();

    // Convertir le tableau HTML en feuille
    const ws = XLSX.utils.table_to_sheet(table);

    // Ajouter la feuille au classeur
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Écrire et télécharger le fichier
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Erreur lors de l\'export du tableau:', error);
    throw error;
  }
}

/**
 * Prépare les données de rapport pour Excel
 * @param globalStats - Statistiques globales
 * @param revenueStats - Statistiques de revenus
 * @param satisfactionStats - Statistiques de satisfaction
 * @param agencies - Liste des agences
 */
export function prepareReportDataForExcel(
  globalStats: any,
  revenueStats: any,
  satisfactionStats: any,
  performanceStats: any,
  agencies: any[]
) {
  const sheets: { name: string; data: any[] }[] = [];

  // Feuille 1: Résumé exécutif
  if (globalStats && revenueStats && satisfactionStats) {
    sheets.push({
      name: 'Résumé Exécutif',
      data: [
        {
          'Indicateur': 'Total RDV',
          'Valeur': globalStats.global?.total_rdv || 0,
        },
        {
          'Indicateur': 'RDV Terminés',
          'Valeur': globalStats.global?.rdv_termines || 0,
        },
        {
          'Indicateur': 'RDV Confirmés',
          'Valeur': globalStats.global?.rdv_confirmes || 0,
        },
        {
          'Indicateur': 'RDV en Attente',
          'Valeur': globalStats.global?.rdv_en_attente || 0,
        },
        {
          'Indicateur': 'RDV Annulés',
          'Valeur': globalStats.global?.rdv_annules || 0,
        },
        {
          'Indicateur': 'Total Clients',
          'Valeur': globalStats.global?.total_clients || 0,
        },
        {
          'Indicateur': 'Revenu Total (TND)',
          'Valeur': revenueStats.global?.revenu_total || 0,
        },
        {
          'Indicateur': 'Revenu Moyen (TND)',
          'Valeur': revenueStats.global?.revenu_moyen?.toFixed(2) || 0,
        },
        {
          'Indicateur': 'Note Satisfaction',
          'Valeur': satisfactionStats.satisfaction?.note_moyenne?.toFixed(2) || 0,
        },
        {
          'Indicateur': 'Taux Satisfaction (%)',
          'Valeur': satisfactionStats.satisfaction?.taux_satisfaction?.toFixed(1) || 0,
        },
        {
          'Indicateur': 'Total Feedbacks',
          'Valeur': satisfactionStats.satisfaction?.total_feedbacks || 0,
        },
        {
          'Indicateur': 'Durée Moyenne (min)',
          'Valeur': Math.round(globalStats.global?.duree_moyenne_min || 0),
        },
      ],
    });
  }

  // Feuille 2: Évolution mensuelle
  if (globalStats?.evolution_mensuelle) {
    sheets.push({
      name: 'Évolution Mensuelle',
      data: globalStats.evolution_mensuelle.map((month: any) => ({
        'Année': month.annee,
        'Mois': month.mois,
        'Période': `${month.mois}/${month.annee}`,
        'Total RDV': month.total_rdv,
        'RDV Terminés': month.rdv_termines,
        'Taux Complétion (%)': ((month.rdv_termines / month.total_rdv) * 100).toFixed(1),
      })),
    });
  }

  // Feuille 3: Répartition par statut
  if (globalStats?.par_statut) {
    sheets.push({
      name: 'Par Statut',
      data: globalStats.par_statut.map((stat: any) => ({
        'Statut': stat.statut,
        'Nombre': stat.count,
        'Pourcentage (%)': ((stat.count / globalStats.global.total_rdv) * 100).toFixed(1),
      })),
    });
  }

  // Feuille 4: Performance par agence
  if (revenueStats?.par_agence) {
    sheets.push({
      name: 'Revenus par Agence',
      data: revenueStats.par_agence.map((agency: any) => ({
        'Agence ID': agency.agence_id,
        'Nom Agence': agency.agence_nom,
        'Total RDV': agency.total_rdv,
        'Revenu Total (TND)': agency.revenu_total?.toFixed(2) || 0,
        'Revenu Moyen (TND)': agency.revenu_moyen?.toFixed(2) || 0,
      })),
    });
  }

  // Feuille 5: Top agents
  if (performanceStats?.top_agents) {
    sheets.push({
      name: 'Top Agents',
      data: performanceStats.top_agents.map((agent: any) => ({
        'Agent ID': agent.agent_id,
        'Nom Agent': agent.agent_nom,
        'Total RDV': agent.total_rdv,
        'RDV Terminés': agent.rdv_termines,
        'Taux Complétion (%)': agent.taux_completion?.toFixed(1) || 0,
        'Note Moyenne': agent.note_moyenne?.toFixed(2) || 0,
        'Total Feedbacks': agent.total_feedbacks,
      })),
    });
  }

  // Feuille 6: Liste des agences
  if (agencies.length > 0) {
    sheets.push({
      name: 'Agences',
      data: agencies.map((agency: any) => ({
        'ID': agency.agence_id,
        'Nom': agency.agence_nom,
        'Ville': agency.ville,
        'Total RDV': agency.total_rdv,
        'Taux Complétion (%)': agency.taux_completion?.toFixed(1) || 0,
      })),
    });
  }

  return sheets;
}
