# Panel de administración Microsoft 365

Aplicación web desarrollada con **React** y **Microsoft Authentication
Library (MSAL)** que permite consultar información de usuarios de una
organización de Microsoft 365 mediante **Microsoft Graph API**.

El panel facilita la consulta de datos personales y laborales, estado de
las cuentas, grupos a los que pertenece cada usuario e historial
reciente de inicios de sesión.

## 1. Funcionalidades

-   Autenticación con una cuenta de Microsoft mediante MSAL.
-   Obtención del listado de usuarios de la organización.
-   Paginación automática al recuperar usuarios desde Microsoft Graph.
-   Búsqueda de usuarios por nombre, correo electrónico, UPN o
    departamento.
-   Consulta del detalle de cada usuario:
    -   Nombre y apellidos.
    -   Correo electrónico e identificador.
    -   Cargo y departamento.
    -   Oficina y teléfono móvil.
    -   Estado de la cuenta.
    -   Fecha de creación.
-   Consulta de los últimos inicios de sesión disponibles.
-   Consulta de los grupos a los que pertenece el usuario.
-   Consulta del historial de inicios de sesión de los últimos 30 días,
    con fecha, aplicación, dirección IP, ubicación y resultado.

## 2. Tecnologías utilizadas

-   **React**: construcción de la interfaz.
-   **JavaScript**: lógica de la aplicación.
-   **@azure/msal-browser**: autenticación con Microsoft Entra ID.
-   **@azure/msal-react**: integración de MSAL con React.
-   **Microsoft Graph API v1.0**: consulta de información del directorio
    y registros de auditoría.

## 3. Requisitos previos

Antes de ejecutar el proyecto necesitarás:

-   Node.js y npm instalados.
-   Acceso a una organización de Microsoft 365.
-   Permisos para registrar aplicaciones en Microsoft Entra ID, o la
    colaboración de un administrador que pueda hacerlo.
-   Una aplicación registrada en Microsoft Entra ID con los permisos
    necesarios para consultar Microsoft Graph.

## 4. Instalación

Clona o descarga el repositorio y accede al directorio de la aplicación
React:

``` bash
cd my-app
```

Instala las dependencias:

``` bash
npm install
```

> El proyecto incluye un directorio `node_modules`, pero se recomienda
> instalar las dependencias mediante npm en el entorno donde se vaya a
> ejecutar.

## 5. Configuración de Microsoft Entra ID

La aplicación utiliza MSAL para iniciar sesión y obtener tokens de
acceso que permiten realizar consultas a Microsoft Graph.

### 5.1. Registrar la aplicación

1.  Accede al [Centro de administración de Microsoft
    Entra](https://entra.microsoft.com/).
2.  Entra en **Identidad \> Aplicaciones \> Registros de aplicaciones**.
3.  Selecciona **Nuevo registro**.
4.  Introduce un nombre para la aplicación.
5.  Configura los tipos de cuenta admitidos según las necesidades de tu
    organización.
6.  Registra la aplicación.

### 5.2. Configurar la autenticación

En el apartado **Autenticación** del registro:

1.  Añade una plataforma de tipo **Aplicación de página única (SPA)**.
2.  Configura la URI de redirección utilizada por la aplicación.

Para el entorno local, el código proporcionado utiliza:

``` text
http://localhost:3000
```

La URI configurada en Entra ID debe coincidir con la utilizada por la
aplicación.

### 5.3. Configurar los identificadores

La instancia MSAL se configura en el punto de entrada de React
(`src/index.js` o el archivo equivalente):

``` javascript
const msalConfig = {
    auth: {
        clientId: "TU_CLIENT_ID",
        authority: "https://login.microsoftonline.com/TU_TENANT_ID",
        redirectUri: "http://localhost:3000"
    },
    cache: {
        cacheLocation: "localStorage"
    }
};
```

Sustituye:

-   `TU_CLIENT_ID`: identificador de aplicación (Application Client ID).
-   `TU_TENANT_ID`: identificador del directorio (Directory/Tenant ID).

Utiliza los identificadores correspondientes al registro de aplicación
de tu organización.

## 6. Permisos de Microsoft Graph

La aplicación solicita los siguientes ámbitos de acceso:

``` javascript
const SCOPES = [
    'User.Read.All',
    'AuditLog.Read.All',
    'Directory.Read.All',
    'Policy.Read.All',
    'RoleManagement.Read.Directory',
    'UserAuthenticationMethod.Read.All'
];
```

Estos permisos permiten solicitar información del directorio, usuarios,
registros de auditoría, políticas, administración de roles y métodos de
autenticación.

### Consideraciones sobre los permisos

-   Deben configurarse en **Permisos de API** dentro del registro de
    aplicación.
-   Los permisos solicitados por el código deben estar disponibles para
    la aplicación.
-   Algunos permisos requieren consentimiento de administrador.
-   El acceso efectivo también depende de los roles, licencias y
    políticas de la organización.
-   El código compartido no utiliza todos los ámbitos solicitados en las
    consultas visibles actualmente; conviene revisar y reducir los
    permisos a los estrictamente necesarios antes de desplegar la
    aplicación.

Consulta la documentación oficial de [permisos de Microsoft
Graph](https://learn.microsoft.com/graph/permissions-reference) para
comprobar los requisitos de cada permiso.

## 7. Ejecución del proyecto

Desde el directorio `my-app`, ejecuta:

``` bash
npm start
```

En una configuración React habitual, la aplicación estará disponible en:

``` text
http://localhost:3000
```

Si el comando no está disponible, revisa los scripts definidos en
`my-app/package.json` y utiliza el comando de desarrollo que corresponda
a la configuración real del proyecto.

## 8. Guía de uso

### 8.1. Iniciar sesión

1.  Abre la aplicación en el navegador.
2.  Pulsa **Iniciar sesión con Microsoft**.
3.  Selecciona una cuenta perteneciente al directorio configurado.
4.  Completa la autenticación y concede el consentimiento solicitado, si
    corresponde.

Una vez autenticado, el panel mostrará la cuenta con la que se ha
iniciado sesión.

### 8.2. Cargar usuarios

1.  Pulsa **Cargar usuarios de la organización**.
2.  La aplicación solicitará un token de acceso a MSAL.
3.  Consultará el endpoint `/users` de Microsoft Graph.
4.  Recuperará los usuarios y seguirá automáticamente los enlaces de
    paginación (`@odata.nextLink`) hasta completar el listado.

El número de usuarios recuperados se mostrará en el encabezado de la
lista.

### 8.3. Buscar usuarios

Utiliza el campo **Buscar usuario...** para filtrar el listado.

La búsqueda compara el texto introducido, sin distinguir entre
mayúsculas y minúsculas, con los siguientes campos:

-   Nombre visible.
-   Correo electrónico.
-   Nombre principal de usuario (UPN).
-   Departamento.

El filtrado se realiza sobre los usuarios que ya se han cargado.

### 8.4. Consultar el detalle de un usuario

Haz clic sobre un usuario del listado para consultar su información.

El panel de detalle se divide en los siguientes apartados:

**Información personal y laboral**

Muestra nombre, apellidos, correo, identificador, cargo, departamento,
oficina, teléfono móvil, estado de la cuenta y fecha de creación.

**Últimos accesos**

Muestra las fechas disponibles de:

-   Último inicio de sesión.
-   Último inicio de sesión correcto.

Estos datos proceden de `signInActivity` en Microsoft Graph y pueden no
estar disponibles para todos los usuarios.

**Grupos del usuario**

Muestra los grupos y otros objetos de pertenencia devueltos por el
endpoint `memberOf`.

**Historial de conexiones**

Consulta los registros de inicio de sesión de los últimos 30 días y
muestra:

  -----------------------------------------------------------------------
  Campo                               Descripción
  ----------------------------------- -----------------------------------
  Fecha                               Fecha y hora del evento.

  Aplicación                          Aplicación utilizada para iniciar
                                      sesión.

  IP                                  Dirección IP registrada.

  Ubicación                           Ciudad y país o región, cuando
                                      están disponibles.

  Resultado                           Indica si el inicio de sesión fue
                                      correcto o devolvió un error.
  -----------------------------------------------------------------------

El código solicita hasta 100 registros mediante `$top=100`, ordenados
por fecha descendente. No implementa paginación adicional para este
historial.

## 9. Funcionamiento interno

La aplicación concentra la lógica principal en el componente `App`.

  -----------------------------------------------------------------------
  Función                             Responsabilidad
  ----------------------------------- -----------------------------------
  `getToken()`                        Obtiene un token de Microsoft Graph
                                      mediante MSAL. Si se requiere
                                      interacción, inicia la
                                      autenticación mediante redirección.

  `graphRequest(url, token)`          Ejecuta peticiones HTTP a Microsoft
                                      Graph y gestiona los errores de
                                      respuesta.

  `cargarUsuarios()`                  Recupera el listado completo de
                                      usuarios, siguiendo la paginación.

  `cargarDetalleUsuario(user)`        Recupera los datos del usuario, sus
                                      grupos y sus registros de inicio de
                                      sesión.

  `login()`                           Inicia el proceso de autenticación
                                      con Microsoft.

  `formatDate(date)`                  Formatea las fechas según la
                                      configuración regional española.
  -----------------------------------------------------------------------

Las consultas de detalle, grupos e historial de conexiones se realizan
en paralelo mediante `Promise.all`.

### Endpoints utilizados

  -----------------------------------------------------------------------
  Endpoint                            Información
  ----------------------------------- -----------------------------------
  `GET /users`                        Listado de usuarios y datos
                                      básicos.

  `GET /users/{id}`                   Información detallada del usuario y
                                      actividad de inicio de sesión.

  `GET /users/{id}/memberOf`          Grupos y pertenencias del usuario.

  `GET /auditLogs/signIns`            Historial de inicios de sesión.
  -----------------------------------------------------------------------

Todas las consultas se realizan contra:

``` text
https://graph.microsoft.com/v1.0
```

## 10. Gestión de errores

La aplicación muestra los errores de consulta en el panel y registra
información técnica en la consola del navegador.

Algunos problemas habituales son:

  -----------------------------------------------------------------------
  Problema                            Qué revisar
  ----------------------------------- -----------------------------------
  No hay una sesión activa            Inicia sesión de nuevo con
                                      Microsoft.

  Error de autenticación              Comprueba el Client ID, Tenant ID y
                                      la URI de redirección.

  Error 401                           Comprueba que el token sea válido y
                                      que se haya solicitado para
                                      Microsoft Graph.

  Error 403                           Comprueba los permisos de Graph, el
                                      consentimiento de administrador y
                                      los requisitos de acceso.

  No aparecen registros de acceso     Comprueba la disponibilidad de los
                                      datos de auditoría y los permisos
                                      necesarios.

  No aparecen grupos                  Comprueba los permisos y las
                                      pertenencias devueltas por Graph.
  -----------------------------------------------------------------------

## 11. Seguridad y buenas prácticas

Esta aplicación consulta información sensible del directorio y de los
registros de acceso. Se recomienda:

-   Conceder únicamente los permisos imprescindibles.
-   Revisar los permisos delegados y el consentimiento de administrador.
-   Restringir el acceso a personal autorizado.
-   No publicar información de usuarios, tokens ni registros de acceso.
-   Utilizar HTTPS en entornos distintos del desarrollo local.
-   Revisar las políticas de acceso y las condiciones de uso de
    Microsoft 365.
-   No almacenar tokens ni credenciales manualmente en el código fuente.
-   Mantener actualizadas las dependencias.

La configuración de MSAL utiliza `localStorage` para la caché. Debe
evaluarse esta elección según el modelo de amenazas y las políticas de
seguridad de la organización.

## 12. Estructura del proyecto

Según la estructura compartida, el repositorio contiene:

``` text
tecnica/
├── microsoftcode/
│   ├── docs/
│   ├── extensions/
│   ├── lib/
│   ├── samples/
│   ├── package.json
│   └── README.md
├── my-app/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── App.test.js
│   │   └── reportWebVitals.js
│   ├── package.json
│   └── README.md
└── package.json
```

La carpeta `my-app` contiene la aplicación React descrita en esta guía.
La carpeta `microsoftcode` contiene otro conjunto de código y
documentación; su relación funcional con el panel no queda especificada
en el material revisado.

## 13. Limitaciones conocidas

-   La búsqueda filtra únicamente los usuarios previamente cargados.
-   El historial de conexiones está limitado a los últimos 30 días y a
    los 100 registros solicitados.
-   La información disponible depende de los permisos, licencias y datos
    expuestos por Microsoft Graph.
-   La aplicación consulta información; el código compartido no
    implementa operaciones para modificar usuarios, grupos o políticas.
-   No se incluye en el material revisado una configuración de
    despliegue para producción.

## 14. Documentación oficial

-   [Microsoft Entra ID](https://learn.microsoft.com/entra/identity/)
-   [MSAL para
    JavaScript](https://learn.microsoft.com/entra/msal/javascript/)
-   [MSAL
    React](https://learn.microsoft.com/entra/msal/javascript/react/)
-   [Microsoft Graph](https://learn.microsoft.com/graph/overview)
-   [Referencia de permisos de Microsoft
    Graph](https://learn.microsoft.com/graph/permissions-reference)
-   [API de usuarios de Microsoft
    Graph](https://learn.microsoft.com/graph/api/resources/user)
-   [API de registros de inicio de
    sesión](https://learn.microsoft.com/graph/api/resources/signIn)

------------------------------------------------------------------------

**Nota:** Esta guía se ha elaborado a partir del código y la estructura
facilitados. Antes de utilizarla como documentación definitiva, conviene
contrastar los comandos de ejecución y las dependencias con los archivos
`package.json` reales y validar los permisos en el tenant de Microsoft
365.
