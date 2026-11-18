
import React, { useState, useEffect } from 'react';

import {
    useMsal,
    AuthenticatedTemplate,
    UnauthenticatedTemplate
} from '@azure/msal-react';

const GRAPH = 'https://graph.microsoft.com/v1.0';

const SCOPES = [
    'User.Read.All',
    'AuditLog.Read.All',
    'Directory.Read.All',
    'Policy.Read.All',
    'RoleManagement.Read.Directory',
    'UserAuthenticationMethod.Read.All'
];

function App() {
    const { instance, accounts } = useMsal();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [signIns, setSignIns] = useState([]);
    const [groups, setGroups] = useState([]);

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [error, setError] = useState('');

    // Obtener token de Microsoft Graph
    const getToken = async () => {
        const account = accounts[0];

        if (!account) {
            throw new Error('No hay una sesión activa.');
        }

        try {
            const result = await instance.acquireTokenSilent({
                scopes: SCOPES,
                account
            });

            return result.accessToken;

        } catch (err) {
            if (err.name === 'InteractionRequiredAuthError') {
                await instance.acquireTokenRedirect({
                    scopes: SCOPES,
                    account
                });
                return null;
            }

            throw err;
        }
    };

    // Función general para consultar Graph
    const graphRequest = async (url, token) => {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const details = await response.json().catch(() => ({}));

            throw new Error(
                details.error?.message ||
                `Error Graph: ${response.status}`
            );
        }

        return response.json();
    };

    // Cargar todos los usuarios, respetando la paginación
    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            setError('');

            const token = await getToken();
            if (!token) return;

            let url = GRAPH +
                '/users?$select=id,displayName,givenName,surname,' +
                'mail,userPrincipalName,jobTitle,department,' +
                'officeLocation,accountEnabled';

            let todos = [];

            while (url) {
                const data = await graphRequest(url, token);

                todos = [...todos, ...data.value];

                url = data['@odata.nextLink'] || null;
            }

            setUsers(todos);

        } catch (err) {
            console.error(err);
            setError(err.message);

        } finally {
            setLoading(false);
        }
    };

    // Cargar información completa de un usuario
    const cargarDetalleUsuario = async (user) => {
        try {
            setSelectedUser(user);
            setLoadingDetails(true);
            setError('');

            setUserDetails(null);
            setSignIns([]);
            setGroups([]);

            const token = await getToken();
            if (!token) return;

            const id = user.id;

            // Información del usuario y último acceso
            const detailsUrl =
                `${GRAPH}/users/${id}?$select=` +
                'id,displayName,givenName,surname,mail,' +
                'userPrincipalName,jobTitle,department,' +
                'officeLocation,mobilePhone,businessPhones,' +
                'accountEnabled,createdDateTime,signInActivity';

            // Grupos del usuario
            const groupsUrl =
                `${GRAPH}/users/${id}/memberOf`;

            // Historial de conexiones de los últimos 30 días
            const desde = new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString();

            const filter =
                `userId eq '${id}' and createdDateTime ge ${desde}`;

            const signInsUrl =
                `${GRAPH}/auditLogs/signIns?` +
                `$filter=${encodeURIComponent(filter)}` +
                '&$top=100&$orderby=createdDateTime desc';

            const [details, groupData, signInData] =
                await Promise.all([
                    graphRequest(detailsUrl, token),
                    graphRequest(groupsUrl, token),
                    graphRequest(signInsUrl, token)
                ]);

            setUserDetails(details);
            setGroups(groupData.value || []);
            setSignIns(signInData.value || []);

        } catch (err) {
            console.error(err);
            setError(err.message);

        } finally {
            setLoadingDetails(false);
        }
    };

    // Iniciar sesión
    const login = async () => {
        await instance.loginRedirect({
            scopes: SCOPES
        });
    };

    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
        const value = (
            (user.displayName || '') +
            (user.mail || '') +
            (user.userPrincipalName || '') +
            (user.department || '')
        ).toLowerCase();

        return value.includes(search.toLowerCase());
    });

    // Formatear fechas
    const formatDate = (date) => {
        if (!date) return 'Sin información';

        return new Date(date).toLocaleString('es-ES');
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            background: '#f4f6f9',
            minHeight: '100vh',
            padding: '25px'
        }}>

            <h1>Panel de administración Microsoft 365</h1>

            <UnauthenticatedTemplate>
                <button onClick={login}>
                    Iniciar sesión con Microsoft
                </button>
            </UnauthenticatedTemplate>

            <AuthenticatedTemplate>

                <div style={{
                    background: 'white',
                    padding: 20,
                    borderRadius: 10,
                    marginBottom: 20
                }}>
                    <strong>Sesión activa:</strong>
                    {' '}{accounts[0]?.username}

                    <div style={{ marginTop: 15 }}>
                        <button onClick={cargarUsuarios}>
                            Cargar usuarios de la organización
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: '#ffe4e4',
                        color: '#a00000',
                        padding: 15,
                        marginBottom: 20,
                        borderRadius: 8
                    }}>
                        {error}
                    </div>
                )}

                {loading && <p>Cargando usuarios...</p>}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(280px, 1fr) 2fr',
                    gap: 20,
                    alignItems: 'start'
                }}>

                    {/* LISTADO DE USUARIOS */}

                    <div style={{
                        background: 'white',
                        borderRadius: 10,
                        padding: 20
                    }}>

                        <h2>Usuarios ({users.length})</h2>

                        <input
                            type="text"
                            placeholder="Buscar usuario..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: 12,
                                boxSizing: 'border-box',
                                marginBottom: 15
                            }}
                        />

                        <div style={{
                            maxHeight: 650,
                            overflowY: 'auto'
                        }}>

                            {filteredUsers.map(user => (

                                <div
                                    key={user.id}
                                    style={{
                                        padding: 12,
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        background:
                                            selectedUser?.id === user.id
                                                ? '#eaf2ff'
                                                : 'white'
                                    }}
                                >
                                    <strong>
                                        {user.displayName}
                                    </strong>

                                    <div style={{
                                        fontSize: 12,
                                        color: '#666',
                                        marginTop: 4
                                    }}>
                                        {user.userPrincipalName}
                                    </div>

                                    <div style={{
                                        fontSize: 12,
                                        color: '#888'
                                    }}>
                                        {user.department || 'Sin departamento'}
                                    </div>

                                    <span style={{
                                        fontSize: 11,
                                        color: user.accountEnabled
                                            ? 'green'
                                            : 'red'
                                    }}>
                                        {user.accountEnabled
                                            ? '● Activo'
                                            : '● Deshabilitado'}
                                    </span>
                                </div>

                            ))}

                        </div>
                    </div>

                </div>

            </AuthenticatedTemplate>

        </div>
    );
}

export default App;
