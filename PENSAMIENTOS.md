Este proyecto lo empecé investigando qué era Microsoft Graph. Tras enterarme un poco, entré en la página de Microsoft referida a esto. Ahí encontré los endpoints, pero nada para iniciar sesión con el correo y la contraseña asignados. Acabé viendo que este correo y contraseña eran para Azure.

Desde que dijeron de qué se trataba, pensé en hacerlo una aplicación web, pero, por la limitación de tiempo, no puse backend y acabé haciendo un frontend que (para evitar problemas de seguridad) no necesita una clave de API per se, sino que te pide el inicio de sesión de un usuario y, a partir de ahí, saca lo necesario para acceder a la API.

Una vez que has iniciado sesión, simplemente saco los datos mediante solicitudes a la API. Estas dos últimas cosas no tuve que pensarlas mucho porque ya estoy acostumbrado al consumo de API por proyectos personales, y la IA me ayudó en los casos específicos que tiene esta API.

En un principio puse unos endpoints que, por lo visto, requerían Premium, pero tuve que quitarlos, pues la cuenta otorgada no tiene Premium.