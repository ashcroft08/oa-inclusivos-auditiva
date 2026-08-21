# Guía de Uso de Datos LTI en el Backend

## 📋 Resumen

Este sistema permite acceder a los datos extraídos del LTI (Learning Tools Interoperability) desde cualquier parte de tu backend. Los datos se almacenan en sesiones y están disponibles a través de middlewares y utilidades.

## 🚀 Características

- ✅ **Sesiones LTI**: Los datos se almacenan automáticamente en sesiones
- ✅ **Middleware Global**: Acceso a datos LTI en todas las rutas
- ✅ **Utilidades Reutilizables**: Funciones helper para manejo de datos
- ✅ **Validación de Roles**: Control de acceso basado en roles LTI
- ✅ **Respuestas Estandarizadas**: Formato consistente para todas las respuestas

## 📁 Estructura de Archivos

```
backend/
├── app.js                    # Configuración principal con sesiones
├── lti/provider.js          # Provider LTI (modificado para guardar sesiones)
├── utils/ltiUtils.js        # Utilidades para manejo de datos LTI
├── routes/oa.routes.js      # Rutas actualizadas con datos LTI
├── controllers/exampleController.js  # Ejemplo de uso
└── README_LTI.md           # Esta documentación
```

## 🔧 Configuración

### 1. Dependencias Requeridas

```bash
npm install express-session
```

### 2. Configuración de Sesiones

Las sesiones se configuran automáticamente en `app.js`:

```javascript
app.use(session({
    secret: 'lti-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambiar a true en producción con HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));
```

## 📊 Estructura de Datos LTI

Los datos LTI se almacenan en `req.session.ltiData` y tienen esta estructura:

```javascript
{
    user: {
        id: "user_id_from_moodle",
        name: "Nombre Completo del Usuario",
        email: "usuario@email.com"
    },
    context: {
        id: "course_id_from_moodle",
        title: "Nombre del Curso",
        label: "Etiqueta del Curso"
    },
    roles: {
        names: ["Learner", "Student"], // Roles legibles
        codes: ["urn:lti:role:ims/lis/Learner"] // Códigos de rol
    }
}
```

## 🛠️ Utilidades Disponibles

### Middlewares

```javascript
import { 
    requireLTISession, 
    getLTIData, 
    requireRole,
    logLTIAccess 
} from '../utils/ltiUtils.js';

// Requerir sesión LTI (falla si no hay sesión)
router.get('/protected', requireLTISession, (req, res) => {
    // req.ltiData está garantizado que existe
});

// Obtener datos LTI (opcional - no falla si no hay sesión)
router.get('/optional', getLTIData, (req, res) => {
    // req.ltiData puede ser null
});

// Requerir roles específicos
router.get('/teacher-only', requireRole(['Instructor', 'Teacher']), (req, res) => {
    // Solo accesible para profesores
});

// Logging automático de acceso LTI
router.get('/with-logging', logLTIAccess, (req, res) => {
    // Registra automáticamente el acceso
});
```

### Funciones Helper

```javascript
import { 
    getCurrentUser,
    getCurrentContext,
    isTeacher,
    isStudent,
    createLTIResponse
} from '../utils/ltiUtils.js';

// Obtener información del usuario actual
const user = getCurrentUser(req);
// { id: "...", name: "...", email: "...", roles: [...] }

// Obtener información del contexto (curso)
const context = getCurrentContext(req);
// { id: "...", title: "...", label: "..." }

// Verificar roles
if (isTeacher(req.ltiData)) {
    // Lógica para profesores
}

if (isStudent(req.ltiData)) {
    // Lógica para estudiantes
}

// Crear respuesta estandarizada
res.json(createLTIResponse({
    data: myData,
    message: "Operación exitosa"
}, req));
```

## 📝 Ejemplos de Uso

### 1. Ruta Básica con Datos LTI

```javascript
router.get('/my-data', getLTIData, (req, res) => {
    if (req.ltiData) {
        res.json({
            user: req.ltiData.user.name,
            course: req.ltiData.context.title,
            roles: req.ltiData.roles.names
        });
    } else {
        res.json({ message: 'No hay sesión LTI' });
    }
});
```

### 2. Ruta Protegida (Requiere LTI)

```javascript
router.get('/personal', requireLTISession, (req, res) => {
    const user = getCurrentUser(req);
    const context = getCurrentContext(req);
    
    res.json(createLTIResponse({
        welcome: `¡Hola ${user.name}!`,
        course: context.title,
        is_teacher: isTeacher(req.ltiData)
    }, req));
});
```

### 3. Ruta Solo para Profesores

```javascript
router.get('/teacher-stats', requireRole(['Instructor', 'Teacher']), async (req, res) => {
    // Solo profesores pueden acceder
    const stats = await getCourseStatistics(req.ltiData.context.id);
    
    res.json(createLTIResponse({
        stats,
        teacher: getCurrentUser(req).name
    }, req));
});
```

### 4. Controlador Completo

```javascript
export class MyController {
    static async handleRequest(req, res) {
        try {
            // Los datos LTI están disponibles automáticamente
            const user = getCurrentUser(req);
            const context = getCurrentContext(req);
            
            // Lógica basada en roles
            let response = { message: 'Acceso básico' };
            
            if (isTeacher(req.ltiData)) {
                response.teacher_features = true;
                response.student_count = await getStudentCount(context.id);
            } else if (isStudent(req.ltiData)) {
                response.student_features = true;
                response.progress = await getStudentProgress(user.id);
            }
            
            res.json(createLTIResponse(response, req));
            
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
```

## 🔐 Endpoints Disponibles

### LTI
- `POST /lti-launch` - Inicio de sesión LTI
- `GET /api/lti-data` - Obtener datos LTI actuales
- `POST /api/lti-logout` - Cerrar sesión LTI

### OA (Objetos de Aprendizaje)
- `GET /api/oa` - Listar OAs (con contexto LTI)
- `GET /api/oa/progress/:oaId` - Progreso en OA específico
- `POST /api/oa/progress` - Actualizar progreso
- `GET /api/oa/my-progress` - Progreso personal (requiere LTI)
- `GET /api/oa/course-stats` - Estadísticas del curso (solo profesores)
- `GET /api/oa/me` - Información del usuario actual

## 🚨 Consideraciones de Seguridad

1. **Sesiones**: Las sesiones se almacenan en memoria por defecto. En producción, usa Redis o una base de datos.
2. **HTTPS**: En producción, activa `secure: true` en las cookies de sesión.
3. **Secret**: Cambia el secret de sesión en producción.
4. **Validación**: Siempre valida los datos LTI antes de usarlos.

## 🔄 Flujo de Datos

1. **LTI Launch**: Usuario accede desde Moodle
2. **Validación**: Se validan los parámetros LTI
3. **Sesión**: Los datos se guardan en `req.session.ltiData`
4. **Redirección**: Usuario es redirigido al frontend
5. **Acceso**: Todas las rutas pueden acceder a `req.ltiData`

## 🐛 Debugging

### Verificar Sesión LTI

```javascript
// En cualquier ruta
console.log('Session ID:', req.sessionID);
console.log('LTI Data:', req.session.ltiData);
console.log('User:', getCurrentUser(req));
```

### Logs Automáticos

El middleware `logLTIAccess` registra automáticamente:
- Usuario que accede
- Curso
- Ruta accedida

## 📚 Recursos Adicionales

- [Documentación LTI 1.0/1.1](https://www.imsglobal.org/specs/ltiv1p0)
- [Express Session](https://github.com/expressjs/session)
- [Middleware Patterns](https://expressjs.com/en/guide/using-middleware.html) 