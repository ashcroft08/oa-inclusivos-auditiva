# Frontend — OA Inclusivos

SPA de los Objetos de Aprendizaje. La documentación completa del proyecto
(arquitectura, despliegue y configuración LTI) está en el
[README de la raíz](../README.md).

## Stack

React 19 · Vite 7 · Tailwind CSS 4 · Material UI 7 · React Router 7

## Scripts

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | ESLint sobre el proyecto |
| `npm run audit:accessibility` | Auditoría WCAG 2.1 AA con axe-core + Playwright |

## Variables de entorno

| Variable | Descripción | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base del backend | `https://api-oa.ueesch.org` |

## Estructura

```
src/
├── components/
│   ├── modules/    # 27 actividades interactivas de los módulos
│   ├── shared/     # Componentes compartidos
│   └── views/      # Vistas (Home, Actividad, Panel Docente, etc.)
├── context/        # AuthContext (sesión LTI) y ProgressContext
├── data/           # Definición de módulos y actividades
└── services/       # Clientes HTTP de la API del backend
```

## Nota para desarrollo

La aplicación espera una sesión LTI iniciada desde Moodle. Para desarrollar sin
Moodle, `AuthContext` admite credenciales de prueba en `localStorage`
(`oa_user`, `oa_course`, `oa_roles`).
