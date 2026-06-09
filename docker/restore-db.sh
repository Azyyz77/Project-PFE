#!/bin/bash
echo "Attente de SQL Server (30s)..."
sleep 30

if [ -f /opt/mssql-tools18/bin/sqlcmd ]; then
  SQLCMD=/opt/mssql-tools18/bin/sqlcmd
  TRUST_CERT="-No"
elif [ -f /opt/mssql-tools/bin/sqlcmd ]; then
  SQLCMD=/opt/mssql-tools/bin/sqlcmd
  TRUST_CERT=""
else
  echo "ERREUR: sqlcmd introuvable!"
  exit 1
fi

echo "Utilisation de: $SQLCMD"
echo "Restauration de $DB_NAME depuis $BACKUP_FILE..."

$SQLCMD \
  -S "$DB_SERVER" \
  -U "$DB_USER" \
  -P "$DB_PASSWORD" \
  $TRUST_CERT \
  -Q "RESTORE DATABASE [$DB_NAME] FROM DISK='$BACKUP_FILE' WITH REPLACE, MOVE 'STA_SAV_DB' TO '/var/opt/mssql/data/STA_SAV_DB.mdf', MOVE 'STA_SAV_DB_log' TO '/var/opt/mssql/data/STA_SAV_DB_log.ldf', STATS=10"

if [ $? -eq 0 ]; then
  echo "Restauration terminee avec succes !"
else
  echo "ERREUR: La restauration a echoue."
  exit 1
fi