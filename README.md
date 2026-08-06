# Cantine CFA — Registre d'appel

Application de gestion des présences/absences des apprentis à la cantine
d'un CFA : appel du jour par scan QR/code-barres ou pointage manuel, gestion
des apprentis, badges imprimables, historique et export CSV/Excel (base
pour la facturation OPCO).

## Installation

```bash
npm install
npx prisma migrate deploy   # applique le schéma sur dev.db (SQLite)
npm run set-admin-password -- "votre-mot-de-passe"
```

Le mot de passe administrateur protège les pages **Apprentis**, **Badges**
et **Historique**. L'écran **Appel du jour** reste accessible sans
connexion, pour un usage rapide à l'entrée de la cantine.

Copiez `.env.example` en `.env` et changez `SESSION_SECRET` si besoin
(une valeur aléatoire de 32 caractères minimum est déjà fournie par défaut
lors de l'installation locale).

## Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000). L'appel du jour est
la page d'accueil (`/appel`).

## Production

```bash
npm run build
npm run start
```

## Scripts utiles

- `npm run set-admin-password -- <mot-de-passe>` : définit ou change le mot
  de passe administrateur.
- `npx prisma studio` : explorer/éditer la base SQLite dans un navigateur.
- `npx prisma migrate dev` : créer une nouvelle migration après modification
  du schéma (`prisma/schema.prisma`).

## Stack

Next.js (App Router) · TypeScript · Prisma + SQLite · Tailwind CSS ·
iron-session (auth) · `qrcode` · `exceljs`.
