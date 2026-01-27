# Test des Workflows GitHub avec `act`

Ce guide explique comment utiliser `act` pour exécuter et tester les workflows GitHub Actions localement dans ce repository.

> **Note pour les agents Copilot:** Des instructions spécifiques pour la validation pre-push sont disponibles dans [.github/agents/README.md](.github/agents/README.md)

## 🎯 Objectif

`act` permet de :
- ✅ Tester les workflows localement avant de les pousser sur GitHub
- 🐛 Déboguer les problèmes de CI/CD rapidement
- ⚡ Itérer sur les configurations sans polluer l'historique Git
- 🤖 Validation automatique pour les agents Copilot avant chaque push

## 📦 Installation de `act`

`act` a été installé et configuré dans cet environnement. Si vous souhaitez l'installer ailleurs :

```bash
# Télécharger et installer le binaire
cd /tmp
curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
tar xzf act.tar.gz
sudo mv act /usr/local/bin/
act --version
```

## 🚀 Utilisation rapide

### Via le script helper

Nous avons créé un script pratique pour simplifier l'utilisation :

```bash
# Lister tous les workflows
./scripts/test-workflows.sh list

# Tester le workflow CI en mode dry-run (recommandé)
./scripts/test-workflows.sh ci --dry-run

# Tester uniquement le job playwright du workflow chromatic
./scripts/test-workflows.sh chromatic --dry-run --job playwright
```

### Via la commande act directement

```bash
# Lister les workflows disponibles
act -l

# Dry-run du workflow CI
act -W .github/workflows/ci.yml -n

# Dry-run du job playwright
act -W .github/workflows/chromatic.yml -j playwright -n

# Exécution réelle (attention aux effets de bord !)
act -W .github/workflows/chromatic.yml -j playwright
```

## 📋 Workflows disponibles

| Workflow | Fichier | Description | Statut Test |
|----------|---------|-------------|-------------|
| **CI** | `ci.yml` | Pipeline principal avec Vercel & Docker | ✅ Testé |
| **Chromatic** | `chromatic.yml` | Tests visuels Playwright | ✅ Testé |
| **Build** | `build.yml` | Workflow réutilisable pour docs | ℹ️ Workflow call |
| **Docs** | `docs.yml` | Génération et déploiement docs | ℹ️ Nécessite Pages |

## ⚠️ Limitations importantes

### Secrets manquants

Les workflows qui nécessitent des secrets ne fonctionneront pas complètement :
- `VERCEL_TOKEN` (pour le déploiement Vercel)
- `CHROMATIC_PROJECT_TOKEN` (pour Chromatic)
- `GITHUB_TOKEN` (accès API GitHub limité)

### Services externes

Certaines étapes échoueront sans accès aux services :
- Déploiement Vercel
- Push vers Docker Registry
- Publication sur GitHub Pages
- Upload vers Chromatic

### Mode recommandé : Dry-run

Pour la plupart des cas, le **mode dry-run** (`-n`) est suffisant et recommandé :
```bash
act -W .github/workflows/ci.yml -n
```

Ce mode :
- ✅ Valide la syntaxe du workflow
- ✅ Simule toutes les étapes
- ✅ N'exécute pas réellement les commandes
- ✅ Pas d'effets de bord

## 📊 Résultats des tests effectués

### ✅ CI Workflow (ci.yml)

Test en dry-run réussi avec toutes les étapes validées :

```
✅ Set up job
✅ actions/checkout@v6
✅ pnpm/action-setup@v4
✅ actions/setup-node@v6
✅ pnpm install --frozen-lockfile
✅ Check version bump
✅ Vercel deploy (simulé)
✅ Docker build-push (simulé)
✅ Complete job
```

**Durée**: ~13 secondes (dry-run)

### ✅ Chromatic Workflow - Job Playwright (chromatic.yml)

Test en dry-run réussi :

```
✅ Set up job
✅ actions/checkout@v6
✅ pnpm/action-setup@v4
✅ actions/setup-node@v6
✅ Install dependencies
✅ Run Playwright tests
✅ Upload artifact
✅ Complete job
```

**Durée**: ~8 secondes (dry-run)

## 🔧 Configuration avancée

### Fichier de configuration `~/.config/act/actrc`

Pour personnaliser le comportement de `act` :

```bash
# Utiliser l'image medium par défaut
-P ubuntu-latest=catthehacker/ubuntu:act-latest

# Désactiver les pulls Docker répétés
--pull=false

# Variables d'environnement par défaut
--env GITHUB_TOKEN=ghp_xxxxx
```

### Utiliser des secrets locaux

Créer un fichier `.secrets` (ne pas commiter !) :

```bash
VERCEL_TOKEN=xxx
CHROMATIC_PROJECT_TOKEN=xxx
```

Puis l'utiliser :

```bash
act -W .github/workflows/ci.yml --secret-file .secrets
```

## 📚 Documentation complémentaire

- [Documentation officielle de act](https://nektosact.com/)
- [Guide détaillé dans docs/act-demo.md](./docs/act-demo.md)
- [Workflows GitHub Actions](https://docs.github.com/en/actions)
- **[Instructions pour agents Copilot](.github/agents/README.md)** - Validation pre-push obligatoire

## 💡 Conseils

1. **Toujours tester en dry-run d'abord** : `act -n`
2. **Utiliser le script helper** : Plus simple et sécurisé
3. **Tester job par job** : Utiliser `-j <job-name>` pour isoler les tests
4. **Nettoyer les containers Docker** : `docker ps -a | grep act` puis `docker rm`
5. **Pour les agents Copilot** : Toujours valider avec `act` avant `report_progress`

## 🤖 Pour les agents Copilot

**Validation pre-push obligatoire :** Avant chaque utilisation de `report_progress`, vous devez :

```bash
# Valider le workflow CI avec act
act -W .github/workflows/ci.yml -n
```

Consultez les [instructions complètes pour agents](.github/agents/README.md) pour plus de détails sur :
- Quand valider (pour quels types de changements)
- Comment gérer les échecs de validation
- Processus complet de validation pre-push

Cette étape est **obligatoire** pour maintenir la qualité du code et éviter les échecs CI.

## ❓ Aide

Pour toute question ou problème :

```bash
# Aide du script
./scripts/test-workflows.sh --help

# Aide de act
act --help

# Voir les logs détaillés
act -W .github/workflows/ci.yml -n --verbose
```

---

**Note**: Ce setup a été testé et validé le 2026-01-27. Les workflows `ci.yml` et `chromatic.yml` (job playwright) ont été testés avec succès en mode dry-run.
