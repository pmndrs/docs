#!/bin/bash

# Script pour tester les workflows GitHub avec act
# Usage: ./scripts/test-workflows.sh [workflow-name] [options]

set -e

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction d'aide
show_help() {
    echo "Usage: $0 [workflow] [options]"
    echo ""
    echo "Workflows disponibles:"
    echo "  ci          - Test du workflow CI principal"
    echo "  chromatic   - Test du workflow Chromatic (Playwright)"
    echo "  build       - Test du workflow de build"
    echo "  docs        - Test du workflow de documentation"
    echo "  list        - Liste tous les workflows et jobs"
    echo ""
    echo "Options:"
    echo "  -n, --dry-run    Mode simulation (recommandé)"
    echo "  -j, --job JOB    Exécuter un job spécifique"
    echo "  -h, --help       Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 list"
    echo "  $0 ci --dry-run"
    echo "  $0 chromatic --dry-run --job playwright"
}

# Vérifier que act est installé
if ! command -v act &> /dev/null; then
    echo -e "${RED}Erreur: 'act' n'est pas installé${NC}"
    echo "Installez-le avec:"
    echo "  curl -L https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz -o /tmp/act.tar.gz"
    echo "  tar xzf /tmp/act.tar.gz -C /tmp"
    echo "  sudo mv /tmp/act /usr/local/bin/"
    exit 1
fi

# Parsing des arguments
WORKFLOW=""
DRY_RUN=""
JOB=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--dry-run)
            DRY_RUN="-n"
            shift
            ;;
        -j|--job)
            JOB="-j $2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        list)
            echo -e "${GREEN}Liste des workflows disponibles:${NC}"
            act -l
            exit 0
            ;;
        ci|chromatic|build|docs)
            WORKFLOW="$1"
            shift
            ;;
        *)
            echo -e "${RED}Argument inconnu: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Si aucun workflow spécifié, afficher l'aide
if [ -z "$WORKFLOW" ]; then
    show_help
    exit 1
fi

# Construire la commande act
WORKFLOW_FILE=".github/workflows/${WORKFLOW}.yml"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}Erreur: Workflow file $WORKFLOW_FILE n'existe pas${NC}"
    exit 1
fi

echo -e "${GREEN}Exécution du workflow: ${WORKFLOW}${NC}"
echo -e "${YELLOW}Fichier: ${WORKFLOW_FILE}${NC}"

if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}Mode: DRY-RUN (simulation)${NC}"
else
    echo -e "${RED}Mode: EXECUTION REELLE${NC}"
    echo -e "${YELLOW}Attention: Cette commande va vraiment exécuter le workflow!${NC}"
    read -p "Continuer? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Annulé."
        exit 0
    fi
fi

# Exécuter act
echo ""
echo -e "${GREEN}Commande: act -W $WORKFLOW_FILE $JOB $DRY_RUN${NC}"
echo ""

act -W "$WORKFLOW_FILE" $JOB $DRY_RUN
