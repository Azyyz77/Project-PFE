# docker/sqlserver.Dockerfile
FROM mcr.microsoft.com/mssql/server:2022-latest
USER root
COPY backup/STA_SAV_DB.bak /var/opt/mssql/backup/
COPY docker/restore-db.sh /scripts/restore-db.sh
RUN chmod +x /scripts/restore-db.sh
EXPOSE 1433
CMD ["/bin/bash", "-c", "/opt/mssql/bin/sqlservr & sleep 30 && /scripts/restore-db.sh && wait"]