#!/bin/bash

# Configuración
PROJECT_DIR="/home/rayuela/rayuela-frontend"
COMPOSE_FILE="docker-compose.yml"

echo "🌐 Iniciando deploy del frontend..."

# Ir al directorio del proyecto
cd "$PROJECT_DIR" || { echo "❌ No se pudo acceder al directorio $PROJECT_DIR"; exit 1; }

# Traer cambios del repositorio
echo "🔄 Haciendo git pull..."
git pull origin main || { echo "❌ Error al hacer git pull"; exit 1; }

# Construir la nueva imagen de Docker
echo "📦 Construyendo imagen Docker del frontend..."
docker compose -f "$COMPOSE_FILE" build || { echo "❌ Error al construir la imagen"; exit 1; }

# Levantar servicios en segundo plano
echo "🚀 Levantando servicios del frontend..."
docker compose -f "$COMPOSE_FILE" up -d || { echo "❌ Error al levantar los servicios"; exit 1; }

# Mostrar logs del contenedor principal (por ejemplo, 'frontend')
echo "📄 Mostrando logs del contenedor frontend (últimas 50 líneas)..."
docker compose -f "$COMPOSE_FILE" logs --tail 50 -f frontend
