# Pruebas de regresión

## Ejecutar

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Resultado de esta revisión: **92 pruebas aprobadas en 7 archivos**, ESLint sin errores, TypeScript y compilación de producción correctos.

## Cobertura funcional

| Archivo | Casos cubiertos |
| --- | --- |
| `tests/auth.test.ts` | Sesiones válidas e inválidas, protección de administración, login, cookies, logout y rutas de retorno. |
| `tests/product-actions.test.ts` | Creación y edición de productos y piedras, límites, composición inválida, orden de fotos, portada, compatibilidad con galerías anteriores, permisos, fallos de transacción y conservación de fotos compartidas. |
| `tests/catalog-actions.test.ts` | Categorías, atributos duplicados, listas de opciones, números con coma decimal, campos obligatorios, referencias inexistentes y bloqueo de eliminación de materiales en uso. |
| `tests/upload.test.ts` | Autorización, configuración, archivos ausentes, formatos permitidos, límite de 5 MB, respuestas de Cloudinary y propagación de errores al cliente. |
| `tests/admin-ui.test.tsx` | Interacciones con los cuatro formularios, cambios de categoría, selección de portada, carga diferida, límites de fotos, fallo de subida, guardado bloqueado durante el encuadre, coordenadas del recorte y exportación, carrusel, miniaturas, teclado, gestos táctiles, modal, restauración del foco y mostrar/ocultar contraseña. |
| `tests/design-actions.test.ts` | Diseños completos e incompletos, cantidades de posiciones, componentes inválidos, base/cierre incompatibles, colisiones de código y permisos de eliminación. |
| `tests/utils.test.ts` | URL del sitio y enlaces/mensajes de WhatsApp. |

## Fallos corregidos

- Login y logout utilizaban redirecciones 307 después de POST. Se cambiaron a 303 para que el navegador continúe con GET y no reenvíe el formulario a la página de destino.
- La validación de retorno del login aceptaba rutas como `/administrator` y `/admin/../preview`. Ahora se verifica la ruta normalizada y su origen.
- El borrado de galerías podía eliminar archivos que seguían referenciados por productos o piedras. Se comprueban las referencias antes de borrar archivos, también al editar galerías de piedras.

## Alcance y límites

Las acciones y rutas se prueban con Prisma, sesiones y Cloudinary simulados. No se modifican registros reales ni se suben o eliminan fotos reales. Las interacciones se ejecutan con React Testing Library y jsdom; el canvas y las primitivas nativas del diálogo se simulan explícitamente.

La revisión en navegador real quedó bloqueada por un error de la herramienta (`missing field sandboxPolicy`). Por eso estas pruebas no certifican la apariencia en dispositivos, la rasterización real del canvas, CORS de fotos remotas, la trampa de foco nativa del modal ni la integración completa con PostgreSQL/Cloudinary. Esos puntos requieren una sesión de navegador funcional y datos de prueba en un entorno separado.

Una ejecución correcta reduce el riesgo de regresión; no garantiza ausencia absoluta de errores.
