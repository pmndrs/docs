# Utilisation de `act` pour exécuter les workflows GitHub localement

Ce document explique comment utiliser `act` pour tester les workflows GitHub Actions de ce repository en local.

## Installation de `act`

```bash
# Via le binaire GitHub (recommandé)
cd /tmp
curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o act.tar.gz
tar xzf act.tar.gz
sudo mv act /usr/local/bin/
act --version
```

## Workflows disponibles

Ce repository contient 4 workflows :

1. **ci.yml** - Workflow principal CI/CD avec déploiement Vercel et Docker
2. **build.yml** - Workflow réutilisable pour construire la documentation
3. **chromatic.yml** - Tests visuels avec Playwright et Chromatic
4. **docs.yml** - Génération et déploiement de la documentation

## Commandes utiles

### Lister les workflows et jobs disponibles

```bash
act -l
```

### Exécuter un workflow en mode dry-run (simulation)

```bash
# Test du workflow CI
act -W .github/workflows/ci.yml -n

# Test du job playwright du workflow chromatic
act -W .github/workflows/chromatic.yml -j playwright -n
```

### Exécuter un workflow réellement (attention aux effets de bord)

```bash
# Exécuter le workflow chromatic (job playwright seulement)
act -W .github/workflows/chromatic.yml -j playwright

# Exécuter avec des variables d'environnement
act -W .github/workflows/ci.yml --env GITHUB_TOKEN=xxx
```

## Limitations

⚠️ **Important** : L'exécution de workflows avec `act` a des limitations :

1. **Secrets manquants** : Les secrets GitHub (VERCEL_TOKEN, CHROMATIC_PROJECT_TOKEN, etc.) ne sont pas disponibles
2. **Services externes** : Les déploiements vers Vercel, registries Docker, etc. ne fonctionneront pas complètement
3. **Compatibilité** : Certaines actions GitHub peuvent avoir un comportement différent avec `act`
4. **Ressources** : Les workflows nécessitant beaucoup de ressources peuvent échouer

## Résultats des tests

### ✅ ci.yml - Dry-run réussi

Le workflow principal a été testé en mode dry-run et toutes les étapes sont validées :
- Setup job avec l'image Ubuntu
- Clonage des actions nécessaires
- Simulation de toutes les étapes (checkout, pnpm install, vercel deploy, docker build, etc.)

### ✅ chromatic.yml - Dry-run réussi

Le job `playwright` a été testé avec succès :
- Utilisation de l'image Playwright officielle
- Installation des dépendances
- Exécution des tests Playwright

## Conclusion

`act` est un outil puissant pour :
- 🧪 Tester les workflows localement avant de les pousser
- 🐛 Déboguer les problèmes de workflow
- ⚡ Itérer rapidement sur les configurations CI/CD

Cependant, pour les workflows complexes avec des dépendances externes, le mode dry-run (`-n`) est souvent le plus utile pour valider la syntaxe et la structure du workflow.
