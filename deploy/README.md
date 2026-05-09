# Deploiement Mohassib (Docker sur Contabo VPS)

Cible : Ubuntu 22.04 LTS, domaine `mohassib.elguennouni.site`.
Architecture : 3 conteneurs (postgres, backend, nginx) sur un reseau Docker prive.
Seul le conteneur `nginx` publie 80/443.

## 1. Provisionnement initial (une seule fois)

```bash
# Docker (depot officiel)
sudo apt update && sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Repertoires hotes
sudo mkdir -p /opt/mohassib /var/log/mohassib /var/backups/mohassib /etc/letsencrypt
sudo git clone https://github.com/<org>/mohassib.git /opt/mohassib/repo
```

## 2. Configuration

```bash
sudo cp /opt/mohassib/repo/.env.example /opt/mohassib/repo/.env
sudo chmod 600 /opt/mohassib/repo/.env
sudo nano /opt/mohassib/repo/.env   # remplir POSTGRES_PASSWORD, JWT_SECRET, MAIL_*, GOOGLE_*, etc.
```

`JWT_SECRET` :
```bash
openssl rand -base64 64 | tr -d '\n'
```

## 3. Premier demarrage et provisionnement TLS

Le bloc HTTPS du proxy depend des certificats Let's Encrypt. Sequence :

```bash
cd /opt/mohassib/repo

# 3.1 Demarrer Postgres + backend en premier (le bloc 443 echouera tant qu'aucun cert n'existe).
sudo docker compose --env-file .env -f docker-compose.prod.yml up -d postgres backend

# 3.2 Demarrer nginx en mode HTTP-seul. Patch temporaire :
#     commenter le `server { listen 443 ssl; ... }` dans frontend/nginx.conf,
#     OU lancer nginx avec un fichier de conf reduit. Plus simple : laisser tel quel,
#     le bloc 443 sera ignore au reload une fois les certs presents.
sudo docker compose --env-file .env -f docker-compose.prod.yml up -d nginx

# 3.3 Generer le certificat (challenge http-01 via le webroot du conteneur nginx).
sudo DOMAIN=mohassib.elguennouni.site EMAIL=abdlilah.el.guennouni@gmail.com \
    /opt/mohassib/repo/deploy/init-tls.sh
```

Si le bloc 443 empeche nginx de demarrer (cert absent), commenter temporairement le bloc dans `frontend/nginx.conf`, rebuild, demarrer, generer le cert, puis decommenter et redeployer.

## 4. Premier schema (ddl-auto=update une seule fois)

`application-prod.properties` impose `ddl-auto=validate`, ce qui echoue tant que les tables n'existent pas. Demarrage initial avec le profil dev :

```bash
sudo docker compose --env-file .env -f docker-compose.prod.yml stop backend
sudo docker compose --env-file .env -f docker-compose.prod.yml run --rm \
    -e SPRING_PROFILES_ACTIVE=default backend
# attendre la creation du schema, puis Ctrl+C
sudo docker compose --env-file .env -f docker-compose.prod.yml up -d backend
```

Ensuite, toutes les mises a jour de schema doivent passer par Flyway (a introduire avant la beta).

## 5. Pare-feu

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Postgres reste sur le reseau Docker interne, jamais expose.

## 6. Sauvegardes

```bash
sudo cp /opt/mohassib/repo/deploy/backup.sh /opt/mohassib/backup.sh
sudo chmod 750 /opt/mohassib/backup.sh

echo '0 2 * * * root /opt/mohassib/repo/deploy/backup.sh >> /var/log/mohassib/backup.log 2>&1' \
    | sudo tee /etc/cron.d/mohassib-backup
```

Retention 14 jours dans `/var/backups/mohassib/`. Mirroring distant : `rclone sync /var/backups/mohassib remote:mohassib-backups` dans la meme cron.

## 7. Renouvellement TLS

```bash
echo '0 3 * * * root /opt/mohassib/repo/deploy/renew-tls.sh >> /var/log/mohassib/tls.log 2>&1' \
    | sudo tee /etc/cron.d/mohassib-tls
```

## 8. Mises a jour applicatives

```bash
sudo /opt/mohassib/repo/deploy/deploy.sh
```

Le script fait `git pull`, rebuild les images backend + nginx, redeploie sans toucher a Postgres, et purge les images orphelines.

Rollback :
```bash
sudo bash -c '
    cd /opt/mohassib/repo
    git reset --hard <sha-precedent>
    /opt/mohassib/repo/deploy/deploy.sh
'
```

## 9. Verification post-deploiement

- `https://mohassib.elguennouni.site` charge la SPA.
- `https://mohassib.elguennouni.site/api/v1/actuator/health` repond `{"status":"UP"}`.
- En-tetes presents : `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`.
- `docker compose ps` : tous les services en `healthy`.
- `docker compose logs -f backend` : aucune stack trace.
- Les fichiers generes (PDFs, audit logs) persistent apres `docker compose down && up -d`.

## 10. Restauration d'une sauvegarde

```bash
gunzip -c /var/backups/mohassib/mohassib_YYYYMMDD_HHMMSS.sql.gz \
    | sudo docker exec -i $(sudo docker compose --env-file /opt/mohassib/repo/.env \
        -f /opt/mohassib/repo/docker-compose.prod.yml ps -q postgres) \
        psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```
