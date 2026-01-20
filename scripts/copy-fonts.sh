#!/bin/bash

# Copy fonts from @fontsource packages to src/fonts/
# This script runs automatically during pnpm install via the 'prepare' hook.
# Can also be run manually with: pnpm run setup-fonts

# Create font directories
mkdir -p src/fonts/inter
mkdir -p src/fonts/inconsolata

# Copy Inter fonts
echo "Copying Inter fonts..."
cp node_modules/@fontsource/inter/files/*latin*normal.woff2 src/fonts/inter/
echo "  Copied $(ls -1 src/fonts/inter/ | wc -l) Inter font files"

# Copy Inconsolata fonts
echo "Copying Inconsolata fonts..."
cp node_modules/@fontsource/inconsolata/files/*latin*normal.woff2 src/fonts/inconsolata/
echo "  Copied $(ls -1 src/fonts/inconsolata/ | wc -l) Inconsolata font files"

echo "✓ Fonts copied successfully"
