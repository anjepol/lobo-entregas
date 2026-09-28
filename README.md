# 🐺 Lobo entregas

Plataforma de entregas basada en microservicios. Proyecto de Ingeniería de Software II.

| Servicio | Puerto | Descripción |
|---|---|---|
| `auth-service` | 3001 | Registro/login (clientes, repartidores, restaurantes) con JWT |
| `catalog-service` | 3002 | Restaurantes y menús (REST + GraphQL en `/graphql`) |
| `order-service` | 3003 | Checkout y seguimiento de pedidos |
| `frontend` | 8080 | React + Vite, consume GraphQL |

## Ejecutar localmente
```bash
docker compose up --build   # frontend en http://localhost:8080
```
Sin Docker: en cada servicio `npm install && npm start` (requiere MongoDB en localhost).

## Pruebas
```bash
cd auth-service && npm install && npm test
```

## Kubernetes
```bash
# Reemplazar OWNER por tu usuario/organización de GitHub en k8s/*.yaml
kubectl apply -f k8s/
# Frontend: http://<ip-nodo>:30080  |  APIs: 30001, 30002, 30003
```

## Flujo de trabajo
- `main` (producción) y `staging` protegidas; todo cambio entra por Pull Request desde `feature/*`.
- CI (`.github/workflows/ci.yml`): build, pruebas, docker build y auditoría; `codeql.yml` hace análisis estático.
- CD (`cd.yml`): publica imágenes en GHCR; `staging` → entorno staging, `main` → producción con aprobación y **rollback automático** (`kubectl rollout undo`).

## Secrets / configuración en GitHub
- `KUBE_CONFIG`: kubeconfig del clúster en base64.
- Environments `staging` y `production` (este último con Required reviewers).
