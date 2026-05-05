/**
 * Script pour générer le schéma de base de données pour la conception UML
 * Extrait toutes les tables, colonnes et relations
 */

const { getConnection, sql } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function generateUMLSchema() {
  console.log('============================================================================');
  console.log('GÉNÉRATION DU SCHÉMA UML DE LA BASE DE DONNÉES');
  console.log('============================================================================');
  console.log('');

  try {
    const pool = await getConnection();
    
    // Créer le dossier de sortie
    const outputDir = path.join(__dirname, '../../docs/uml');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // ========================================================================
    // 1. LISTE DES TABLES
    // ========================================================================
    console.log('📊 Extraction des tables...');
    const tablesResult = await pool.request().query(`
      SELECT 
        t.name AS table_name,
        SCHEMA_NAME(t.schema_id) AS schema_name,
        (SELECT COUNT(*) FROM sys.columns c WHERE c.object_id = t.object_id) AS column_count
      FROM sys.tables t
      WHERE t.is_ms_shipped = 0
      ORDER BY t.name
    `);
    
    console.log(`   ✅ ${tablesResult.recordset.length} tables trouvées`);

    // ========================================================================
    // 2. COLONNES POUR CHAQUE TABLE
    // ========================================================================
    console.log('📋 Extraction des colonnes...');
    const columnsResult = await pool.request().query(`
      SELECT 
        t.name AS table_name,
        c.column_id AS ordinal_position,
        c.name AS column_name,
        TYPE_NAME(c.user_type_id) AS data_type,
        CASE 
          WHEN TYPE_NAME(c.user_type_id) IN ('varchar', 'nvarchar', 'char', 'nchar') 
          THEN c.max_length
          ELSE NULL
        END AS max_length,
        CASE 
          WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')
          THEN c.precision
          ELSE NULL
        END AS numeric_precision,
        CASE 
          WHEN TYPE_NAME(c.user_type_id) IN ('decimal', 'numeric')
          THEN c.scale
          ELSE NULL
        END AS numeric_scale,
        c.is_nullable,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
        CASE WHEN fk.parent_column_id IS NOT NULL THEN 1 ELSE 0 END AS is_foreign_key,
        c.is_identity,
        ISNULL(dc.definition, '') AS default_value
      FROM sys.tables t
      INNER JOIN sys.columns c ON t.object_id = c.object_id
      LEFT JOIN (
        SELECT ic.object_id, ic.column_id
        FROM sys.indexes i
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        WHERE i.is_primary_key = 1
      ) pk ON c.object_id = pk.object_id AND c.column_id = pk.column_id
      LEFT JOIN sys.foreign_key_columns fk ON c.object_id = fk.parent_object_id AND c.column_id = fk.parent_column_id
      LEFT JOIN sys.default_constraints dc ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
      WHERE t.is_ms_shipped = 0
      ORDER BY t.name, c.column_id
    `);
    
    console.log(`   ✅ ${columnsResult.recordset.length} colonnes trouvées`);

    // ========================================================================
    // 3. RELATIONS (CLÉS ÉTRANGÈRES)
    // ========================================================================
    console.log('🔗 Extraction des relations...');
    const relationsResult = await pool.request().query(`
      SELECT 
        fk.name AS constraint_name,
        OBJECT_NAME(fk.parent_object_id) AS source_table,
        c_parent.name AS source_column,
        OBJECT_NAME(fk.referenced_object_id) AS target_table,
        c_ref.name AS target_column,
        CASE fk.delete_referential_action
          WHEN 0 THEN 'NO ACTION'
          WHEN 1 THEN 'CASCADE'
          WHEN 2 THEN 'SET NULL'
          WHEN 3 THEN 'SET DEFAULT'
        END AS on_delete,
        CASE fk.update_referential_action
          WHEN 0 THEN 'NO ACTION'
          WHEN 1 THEN 'CASCADE'
          WHEN 2 THEN 'SET NULL'
          WHEN 3 THEN 'SET DEFAULT'
        END AS on_update
      FROM sys.foreign_keys fk
      INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN sys.columns c_parent ON fkc.parent_object_id = c_parent.object_id 
        AND fkc.parent_column_id = c_parent.column_id
      INNER JOIN sys.columns c_ref ON fkc.referenced_object_id = c_ref.object_id 
        AND fkc.referenced_column_id = c_ref.column_id
      ORDER BY OBJECT_NAME(fk.parent_object_id), fk.name
    `);
    
    console.log(`   ✅ ${relationsResult.recordset.length} relations trouvées`);

    // ========================================================================
    // 4. GÉNÉRER LE FICHIER JSON
    // ========================================================================
    console.log('');
    console.log('📝 Génération des fichiers de sortie...');
    
    const schema = {
      database: 'STA_SAV_DB',
      generated_at: new Date().toISOString(),
      tables: []
    };

    // Organiser les données par table
    for (const table of tablesResult.recordset) {
      const tableColumns = columnsResult.recordset.filter(c => c.table_name === table.table_name);
      const tableRelations = relationsResult.recordset.filter(r => r.source_table === table.table_name);
      
      schema.tables.push({
        name: table.table_name,
        schema: table.schema_name,
        columns: tableColumns.map(col => ({
          name: col.column_name,
          type: col.data_type,
          length: col.max_length,
          precision: col.numeric_precision,
          scale: col.numeric_scale,
          nullable: col.is_nullable,
          primary_key: col.is_primary_key === 1,
          foreign_key: col.is_foreign_key === 1,
          auto_increment: col.is_identity,
          default_value: col.default_value
        })),
        foreign_keys: tableRelations.map(rel => ({
          constraint_name: rel.constraint_name,
          column: rel.source_column,
          references_table: rel.target_table,
          references_column: rel.target_column,
          on_delete: rel.on_delete,
          on_update: rel.on_update
        }))
      });
    }

    // Sauvegarder JSON
    const jsonPath = path.join(outputDir, 'database_schema.json');
    fs.writeFileSync(jsonPath, JSON.stringify(schema, null, 2), 'utf8');
    console.log(`   ✅ JSON: ${jsonPath}`);

    // ========================================================================
    // 5. GÉNÉRER LE FICHIER MARKDOWN
    // ========================================================================
    let markdown = '# Schéma de Base de Données - STA Chery SAV\n\n';
    markdown += `**Date de génération**: ${new Date().toLocaleString('fr-FR')}\n\n`;
    markdown += `**Base de données**: STA_SAV_DB\n\n`;
    markdown += `**Nombre de tables**: ${tablesResult.recordset.length}\n\n`;
    markdown += '---\n\n';

    // Table des matières
    markdown += '## Table des Matières\n\n';
    for (const table of tablesResult.recordset) {
      markdown += `- [${table.table_name}](#${table.table_name.toLowerCase()})\n`;
    }
    markdown += '\n---\n\n';

    // Détails de chaque table
    for (const table of schema.tables) {
      markdown += `## ${table.name}\n\n`;
      
      // Colonnes
      markdown += '### Colonnes\n\n';
      markdown += '| Nom | Type | Taille | Nullable | PK | FK | Auto |\n';
      markdown += '|-----|------|--------|----------|----|----|------|\n';
      
      for (const col of table.columns) {
        const size = col.length ? `${col.length}` : (col.precision ? `${col.precision},${col.scale}` : '-');
        markdown += `| ${col.name} | ${col.type} | ${size} | ${col.nullable ? '✓' : '✗'} | ${col.primary_key ? '🔑' : ''} | ${col.foreign_key ? '🔗' : ''} | ${col.auto_increment ? '✓' : ''} |\n`;
      }
      
      markdown += '\n';

      // Relations
      if (table.foreign_keys.length > 0) {
        markdown += '### Relations\n\n';
        markdown += '| Colonne | Référence | On Delete |\n';
        markdown += '|---------|-----------|----------|\n';
        
        for (const fk of table.foreign_keys) {
          markdown += `| ${fk.column} | ${fk.references_table}.${fk.references_column} | ${fk.on_delete} |\n`;
        }
        
        markdown += '\n';
      }

      markdown += '---\n\n';
    }

    // Diagramme de relations
    markdown += '## Diagramme de Relations\n\n';
    markdown += '```\n';
    for (const rel of relationsResult.recordset) {
      markdown += `${rel.source_table}[${rel.source_column}] ----> ${rel.target_table}[${rel.target_column}]\n`;
    }
    markdown += '```\n\n';

    const mdPath = path.join(outputDir, 'database_schema.md');
    fs.writeFileSync(mdPath, markdown, 'utf8');
    console.log(`   ✅ Markdown: ${mdPath}`);

    // ========================================================================
    // 6. GÉNÉRER LE FICHIER CSV
    // ========================================================================
    let csv = 'Table,Colonne,Type,Taille,Nullable,PK,FK,Auto\n';
    
    for (const table of schema.tables) {
      for (const col of table.columns) {
        const size = col.length ? `${col.length}` : (col.precision ? `${col.precision}.${col.scale}` : '');
        csv += `${table.name},${col.name},${col.type},${size},${col.nullable ? 'OUI' : 'NON'},${col.primary_key ? 'OUI' : 'NON'},${col.foreign_key ? 'OUI' : 'NON'},${col.auto_increment ? 'OUI' : 'NON'}\n`;
      }
    }

    const csvPath = path.join(outputDir, 'database_schema.csv');
    fs.writeFileSync(csvPath, csv, 'utf8');
    console.log(`   ✅ CSV: ${csvPath}`);

    // ========================================================================
    // 7. GÉNÉRER LE FICHIER DE RELATIONS CSV
    // ========================================================================
    let relCsv = 'Contrainte,Table_Source,Colonne_Source,Table_Cible,Colonne_Cible,On_Delete,On_Update\n';
    
    for (const rel of relationsResult.recordset) {
      relCsv += `${rel.constraint_name},${rel.source_table},${rel.source_column},${rel.target_table},${rel.target_column},${rel.on_delete},${rel.on_update}\n`;
    }

    const relCsvPath = path.join(outputDir, 'database_relations.csv');
    fs.writeFileSync(relCsv, relCsv, 'utf8');
    console.log(`   ✅ Relations CSV: ${relCsvPath}`);

    console.log('');
    console.log('============================================================================');
    console.log('✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!');
    console.log('============================================================================');
    console.log('');
    console.log('📁 Fichiers générés dans: docs/uml/');
    console.log('   - database_schema.json (pour import dans outils)');
    console.log('   - database_schema.md (documentation lisible)');
    console.log('   - database_schema.csv (pour Excel/LibreOffice)');
    console.log('   - database_relations.csv (relations pour diagrammes)');
    console.log('');
    console.log('💡 Vous pouvez maintenant utiliser ces fichiers pour créer vos diagrammes UML!');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
generateUMLSchema()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
