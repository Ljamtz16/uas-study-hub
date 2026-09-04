# Deployment de UAS Study Hub en VPS

## Propósito y flujo de autoridad

La laptop es el entorno de desarrollo. Codex trabaja exclusivamente sobre la copia local. Git es obligatorio y GitHub es el source of truth remoto del código. La VPS solo ejecuta builds revisados obtenidos desde GitHub; no se desarrolla ni se editan archivos de aplicación directamente en la VPS.

Este procedimiento despliega un único proceso Next.js detrás de Nginx. No añade Docker, backend, base de datos remota ni sincronización. El progreso, la evidencia y las notas continúan en IndexedDB, en cada navegador y dispositivo.

## Variables que deben definirse antes del primer deployment

```bash
GITHUB_REPOSITORY="OWNER/REPOSITORY"
DEPLOY_BRANCH="BRANCH_NAME"
DOMAIN="YOUR_DOMAIN"
APP_DIR="/home/ljamtz/apps/uas-study-hub"
```

No copies literalmente `YOUR_DOMAIN`, `OWNER/REPOSITORY` ni `BRANCH_NAME` dentro de una configuración activa. Sustitúyelos por los valores aprobados. El repositorio local usa actualmente `master`; confirma la rama que será source of truth en GitHub antes del primer deployment.

## Requisitos de Ubuntu

Recomendado:

- Ubuntu Server 24.04 LTS o una versión LTS soportada.
- Usuario `ljamtz` con acceso SSH y permisos `sudo`.
- Puertos TCP 22, 80 y 443 permitidos por el firewall/proveedor.
- DNS A/AAAA apuntando a la VPS antes de solicitar HTTPS.
- Al menos 1 GB de RAM; 2 GB ofrecen más margen para `pnpm build`.
- Git, curl, Nginx, Node.js LTS, pnpm y PM2.

Actualiza el sistema e instala utilidades base:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl nginx snapd
git --version
nginx -v
```

Git recomienda usar el gestor de paquetes de la distribución en Debian/Ubuntu: <https://git-scm.com/install/linux>.

## Instalar Node.js

Instala Node.js 22 LTS para el usuario `ljamtz` mediante nvm. No ejecutes la aplicación como `root`.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.6/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 22
nvm alias default 22
nvm use 22
node --version
npm --version
```

La versión del instalador debe revisarse contra el repositorio oficial de nvm antes de una instalación futura: <https://github.com/nvm-sh/nvm#installing-and-updating>.

## Instalar pnpm

El proyecto declara pnpm en `package.json`. Habilita Corepack y activa esa versión:

```bash
corepack enable
corepack install
pnpm --version
```

Si `corepack` no está disponible en la distribución de Node elegida, sigue el método alternativo oficial de pnpm: <https://pnpm.io/installation>.

## Instalar PM2

```bash
npm install --global pm2@latest
pm2 --version
```

PM2 se instala globalmente como herramienta operativa de la VPS; no se añade como dependencia funcional de la aplicación.

## Preparar acceso a GitHub

Para un repositorio privado, crea una clave SSH exclusiva para deployment y añade únicamente su clave pública como Deploy Key de solo lectura en GitHub.

```bash
ssh-keygen -t ed25519 -C "uas-study-hub-vps" -f ~/.ssh/uas-study-hub-deploy
cat ~/.ssh/uas-study-hub-deploy.pub
```

Configura `~/.ssh/config` con la identidad aprobada o usa HTTPS con un mecanismo de credenciales seguro. No guardes tokens, claves privadas ni credenciales en el repositorio.

## Clonar desde GitHub

```bash
mkdir -p /home/ljamtz/apps
cd /home/ljamtz/apps
git clone git@github.com:OWNER/REPOSITORY.git uas-study-hub
cd /home/ljamtz/apps/uas-study-hub
git switch BRANCH_NAME
git status
```

Sustituye `BRANCH_NAME` por la rama de producción aprobada en GitHub.

## Instalar, verificar y construir

Usa el lockfile sin actualizar dependencias:

```bash
cd /home/ljamtz/apps/uas-study-hub
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No continúes si cualquier comando falla.

## Ejecutar con PM2

El archivo `ecosystem.config.js` ejecuta una sola instancia de `next start`, enlazada exclusivamente a `127.0.0.1:3000`.

Primer inicio:

```bash
cd /home/ljamtz/apps/uas-study-hub
pm2 start ecosystem.config.js --env production
pm2 status
pm2 logs uas-study-hub --lines 100
curl --fail --head http://127.0.0.1:3000/
```

No habilites `watch` en producción.

### Reinicio automático tras reboot

```bash
pm2 startup systemd
```

Ejecuta exactamente el comando con `sudo` que PM2 muestre. Después:

```bash
pm2 save
systemctl status pm2-ljamtz
```

Si se actualiza Node/nvm, vuelve a generar el startup script para que systemd use el binario vigente. Referencia: <https://pm2.keymetrics.io/docs/usage/startup/>.

## Configurar Nginx como reverse proxy

Next.js recomienda colocar un reverse proxy delante del servidor cuando se hace self-hosting: <https://nextjs.org/docs/app/guides/self-hosting>.

1. Copia el ejemplo.
2. Sustituye `YOUR_DOMAIN` por el dominio aprobado.
3. Valida antes de recargar.

```bash
cd /home/ljamtz/apps/uas-study-hub
sudo cp deployment/nginx/uas-study-hub.conf.example /etc/nginx/sites-available/uas-study-hub
sudo nano /etc/nginx/sites-available/uas-study-hub
sudo ln -s /etc/nginx/sites-available/uas-study-hub /etc/nginx/sites-enabled/uas-study-hub
sudo nginx -t
sudo systemctl reload nginx
curl --head http://YOUR_DOMAIN/
```

La configuración reenvía `Host`, IP de cliente y protocolo original, conecta solo con `127.0.0.1:3000` y desactiva el buffering para conservar streaming. Referencia del proxy: <https://nginx.org/en/docs/http/ngx_http_proxy_module.html>.

## Activar HTTPS con Certbot

Ejecuta esta sección solo cuando el dominio ya resuelva hacia la VPS y HTTP funcione:

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/local/bin/certbot
sudo certbot --nginx -d YOUR_DOMAIN
sudo certbot renew --dry-run
```

Certbot modificará la copia activa bajo `/etc/nginx`; el archivo de ejemplo del repositorio continuará sin dominio ni certificados reales. Consulta las instrucciones oficiales para Nginx/Ubuntu antes de ejecutar: <https://certbot.eff.org/instructions>.

Tras habilitar HTTPS:

```bash
sudo nginx -t
sudo systemctl reload nginx
curl --fail --head https://YOUR_DOMAIN/
```

HTTPS es necesario para que el service worker y la PWA funcionen fuera de `localhost`.

## Deployments posteriores

No edites código en la VPS. Primero integra, prueba y sube los cambios desde la laptop a GitHub. En la VPS:

```bash
cd /home/ljamtz/apps/uas-study-hub
git status --short
git fetch --prune origin
git switch BRANCH_NAME
git pull --ff-only origin BRANCH_NAME
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pm2 startOrReload ecosystem.config.js --env production
pm2 save
```

`git status --short` debe estar vacío antes del pull. `--ff-only` evita merges o commits improvisados en la VPS.

## Rollback

Anota el commit anterior antes de actualizar:

```bash
cd /home/ljamtz/apps/uas-study-hub
git rev-parse HEAD
git log --oneline -10
```

Si el deployment falla, selecciona un commit conocido y publicado en GitHub:

```bash
git fetch --prune origin
git switch --detach COMMIT_SHA_VALIDADO
pnpm install --frozen-lockfile
pnpm build
pm2 startOrReload ecosystem.config.js --env production
pm2 save
```

Verifica el rollback y registra el SHA utilizado. Después corrige el problema en la laptop, publícalo en GitHub y vuelve a la rama con `git switch BRANCH_NAME`. No uses `git reset --hard` como procedimiento normal de rollback.

## Logs

```bash
pm2 status
pm2 logs uas-study-hub
pm2 logs uas-study-hub --lines 200
pm2 flush
sudo journalctl -u pm2-ljamtz --since "1 hour ago"
sudo journalctl -u nginx --since "1 hour ago"
sudo tail -n 200 /var/log/nginx/access.log
sudo tail -n 200 /var/log/nginx/error.log
```

Los logs predeterminados de PM2 viven bajo `~/.pm2/logs`. Configura rotación del sistema antes de una operación prolongada.

## Comandos de diagnóstico

```bash
node --version
pnpm --version
pm2 report
pm2 describe uas-study-hub
systemctl status pm2-ljamtz
systemctl status nginx
sudo nginx -t
ss -ltnp | grep ':3000'
curl --fail --head http://127.0.0.1:3000/
curl --fail --head http://YOUR_DOMAIN/
curl --fail --head https://YOUR_DOMAIN/
curl --fail https://YOUR_DOMAIN/manifest.webmanifest
curl --fail --head https://YOUR_DOMAIN/sw.js
git status --short --branch
git rev-parse HEAD
```

En el navegador, abre DevTools → Application para revisar Manifest, Service Worker, Cache Storage e IndexedDB. Recuerda que IndexedDB pertenece al navegador/dispositivo, no a la VPS.

## Checklist post-deployment

- [ ] La VPS ejecuta el SHA aprobado de GitHub.
- [ ] `git status --short` está vacío.
- [ ] `pnpm install --frozen-lockfile` terminó correctamente.
- [ ] Lint, typecheck, tests y build pasaron en la VPS.
- [ ] PM2 muestra `uas-study-hub` como `online`.
- [ ] PM2 revive la aplicación tras reboot.
- [ ] Next.js escucha solo en `127.0.0.1:3000`.
- [ ] `nginx -t` pasa.
- [ ] HTTP redirige a HTTPS después de configurar Certbot.
- [ ] El certificado es válido y `certbot renew --dry-run` pasa.
- [ ] Dashboard, Courses y Radioenlaces cargan por HTTPS.
- [ ] `manifest.webmanifest` y `sw.js` responden correctamente.
- [ ] La PWA carga offline después de una primera visita online.
- [ ] Marcar estudiado conserva Mastery `10/100` tras recargar.
- [ ] Las notas persisten en el mismo navegador.
- [ ] La exportación JSON funciona.
- [ ] Se confirmó que el progreso no se sincroniza entre dispositivos.
