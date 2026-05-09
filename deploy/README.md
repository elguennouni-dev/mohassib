# Deploiement Mohassib (Contabo VPS)

Cible : Ubuntu 22.04 LTS, domaine `mohassib.elguennouni.site`.

## 1. Provisionnement initial (une seule fois)

```bash
# Utilisateur dedie
sudo adduser --system --group --home /opt/mohassib mohassib
sudo mkdir -p /opt/mohassib /var/log/mohassib /var/lib/mohassib/storage /var/www/mohassib /var/backups/mohassib
sudo chown -R mohassib:mohassib /opt/mohassib /var/log/mohassib /var/lib/mohassib

# Paquets
sudo apt update
sudo apt install -y openjdk-21-jre-headless postgresql nginx certbot python3-certbot-nginx git nodejs npm
```

Java 21 est compatible avec le JAR Spring Boot 4 produit par Maven.

## 2. PostgreSQL

```bash
sudo -u postgres psql <<SQL
CREATE DATABASE mohassib_db;
CREATE USER mohassib_admin WITH ENCRYPTED PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE mohassib_db TO mohassib_admin;
ALTER DATABASE mohassib_db OWNER TO mohassib_admin;
SQL
```

## 3. Code et environnement

```bash
sudo -u mohassib git clone https://github.com/<org>/mohassib.git /opt/mohassib/repo
sudo cp /opt/mohassib/repo/deploy/env.example /opt/mohassib/.env
sudo chown mohassib:mohassib /opt/mohassib/.env
sudo chmod 600 /opt/mohassib/.env
sudo nano /opt/mohassib/.env   # remplir les secrets
```

## 4. Build et premier deploiement

```bash
sudo -u mohassib /opt/mohassib/repo/deploy/deploy.sh
```

Le premier `ddl-auto=validate` echouera si le schema n'existe pas. Pour amorcer, lancer une fois en `update` :

```bash
sudo -u mohassib SPRING_PROFILES_ACTIVE=dev java -jar /opt/mohassib/app.jar
```

Arreter une fois les tables creees, puis enchainer avec systemd (profil `prod`).

## 5. systemd

```bash
sudo cp /opt/mohassib/repo/deploy/mohassib.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mohassib
sudo journalctl -u mohassib -f
```

## 6. Nginx + TLS

```bash
sudo cp /opt/mohassib/repo/deploy/nginx.conf /etc/nginx/sites-available/mohassib
sudo ln -s /etc/nginx/sites-available/mohassib /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Certificat Let's Encrypt
sudo certbot --nginx -d mohassib.elguennouni.site
sudo systemctl status certbot.timer   # renouvellement auto
```

## 7. Sauvegardes Postgres

```bash
sudo cp /opt/mohassib/repo/deploy/backup.sh /opt/mohassib/backup.sh
sudo chmod 750 /opt/mohassib/backup.sh
sudo chown mohassib:mohassib /opt/mohassib/backup.sh

# Cron : 02h00 UTC chaque jour
echo '0 2 * * * mohassib /opt/mohassib/backup.sh >> /var/log/mohassib/backup.log 2>&1' \
    | sudo tee /etc/cron.d/mohassib-backup
```

Retention : 14 jours sur disque. Pour un mirroir hors-site, `rsync` ou `rclone` le contenu de `/var/backups/mohassib/` vers un stockage distant.

## 8. Pare-feu

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Postgres reste ferme aux connexions externes (port 5432 non expose).

## 9. Mises a jour

Apres chaque commit sur `main` :

```bash
sudo -u mohassib /opt/mohassib/repo/deploy/deploy.sh
```

Rollback rapide :

```bash
sudo -u mohassib bash -c 'cd /opt/mohassib/repo && git reset --hard <sha-precedent> && /opt/mohassib/repo/deploy/deploy.sh'
```

## 10. Verification post-deploiement

- `https://mohassib.elguennouni.site` charge la SPA
- `https://mohassib.elguennouni.site/api/v1/auth/login` repond 400 (champs requis) ou 405
- En-tetes : `Strict-Transport-Security`, `X-Frame-Options: DENY` presents
- `journalctl -u mohassib --since '5 min ago'` n'affiche aucun stack trace
- `tail -f /var/log/mohassib/mohassib.log` confirme l'ecriture des logs applicatifs
