# Seed Completo de Base de Datos - Feniz Trading Platform

Este archivo contiene un seed completo que **elimina todos los datos existentes** y crea un sistema completo desde cero con usuarios de todos los tipos.

## 📋 Datos Incluidos

### 🏢 Infraestructura Base
- **Empresa**: Información completa de Feniz Trading Platform
- **PropFirms**: FTMO, MyForexFunds, The Funded Trader
- **Brokers**: OANDA, IC Markets, Pepperstone
- **Símbolos**: 14 símbolos (Forex, Crypto, Commodities, Indices)

### 👥 Usuarios de Todos los Tipos (8 usuarios)

| Usuario | Email | Contraseña | Rol | Idioma | Riesgo | Suscripción |
|---------|-------|------------|-----|--------|--------|-------------|
| **Super Admin** | `superadmin@feniz.com` | `SuperAdmin123!@#` | super_admin | EN | 0.0% | Premium |
| **Admin User** | `admin@feniz.com` | `Admin123!@#` | admin | EN | 0.5% | Premium |
| **Moderator User** | `moderator@feniz.com` | `Moderator123!@#` | moderator | ES | 1.0% | Premium |
| **Alex Trader** | `trader@feniz.com` | `Trader123!@#` | trader | ES | 1.5% | Premium |
| **Maria Rodriguez** | `maria@feniz.com` | `Maria123!@#` | trader | ES | 2.0% | Premium |
| **John Smith** | `john@feniz.com` | `John123!@#` | trader | EN | 1.0% | Premium |
| **Ana Silva** | `ana@feniz.com` | `Ana123!@#` | trader | PT | 1.8% | Premium |
| **Viewer User** | `viewer@feniz.com` | `Viewer123!@#` | viewer | EN | 0.0% | Free |

### 🔐 Sistema RBAC Completo
- **5 Roles**: super_admin, admin, moderator, trader, viewer
- **Permisos**: 50+ permisos granulares por recurso
- **Jerarquía**: Super Admin > Admin > Moderator > Trader > Viewer

### 💼 Cuentas de Trading (para el primer trader)
1. **FTMO 10K Challenge** - Cuenta de evaluación ($10,250.75)
2. **FTMO 25K Funded** - Cuenta fondeada ($26,750.25)
3. **OANDA Live Account** - Cuenta de broker ($5,234.50)
4. **IC Markets Live** - Cuenta de broker ($3,156.80)

### 🔗 Conexiones (Account Links)
1. **FTMO 25K → OANDA** - Copia automática (2% riesgo)
2. **FTMO 10K → IC Markets** - Copia manual (1.5% riesgo)

### 📊 Trades
- **Total**: 40 trades
- **Por conexión**: 20 trades cada una
- **Distribución**: 60% trades ganadores
- **Período**: Últimos 30 días

## 🚀 Cómo Ejecutar

### ⚠️ **ADVERTENCIA IMPORTANTE**
Este seed **ELIMINA TODOS LOS DATOS EXISTENTES** y crea todo desde cero.

### Prerequisitos
1. Base de datos PostgreSQL ejecutándose
2. Variables de entorno configuradas (`DATABASE_URL`)
3. Dependencias instaladas (`pnpm install`)

### Comandos Disponibles

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm postinstall

# Ejecutar migraciones (si es necesario)
pnpm db:migrate

# Ejecutar el seed completo (ELIMINA TODO)
pnpm db:seed

# Abrir Prisma Studio para ver los datos
pnpm db:studio
```

### Ejecución Paso a Paso

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configurar base de datos**:
   ```bash
   # Si es la primera vez, ejecutar migraciones
   pnpm db:migrate
   ```

3. **Ejecutar seed completo**:
   ```bash
   pnpm db:seed
   ```

4. **Verificar datos**:
   ```bash
   pnpm db:studio
   ```

## 🔍 Verificación de Datos

Después de ejecutar el seed, deberías ver:

- ✅ 1 registro en `CompanyInfo`
- ✅ 5 roles con permisos granulares
- ✅ 3 propfirms con fases y tipos de cuenta
- ✅ 3 brokers con configuraciones de símbolos
- ✅ 14 símbolos en múltiples categorías
- ✅ **8 usuarios** (1 super admin, 1 admin, 1 moderator, 4 traders, 1 viewer)
- ✅ 4 cuentas de trading activas (para el primer trader)
- ✅ 2 conexiones entre cuentas
- ✅ 40 trades distribuidos en las últimas 4 semanas

## 🔐 Credenciales de Acceso

### 👑 Super Admin
- **Email**: `superadmin@feniz.com`
- **Contraseña**: `SuperAdmin123!@#`
- **Permisos**: Acceso completo al sistema

### 👨‍💼 Admin
- **Email**: `admin@feniz.com`
- **Contraseña**: `Admin123!@#`
- **Permisos**: Gestión de usuarios y configuración del sistema

### 👨‍🔧 Moderator
- **Email**: `moderator@feniz.com`
- **Contraseña**: `Moderator123!@#`
- **Permisos**: Gestión básica de usuarios y monitoreo

### 👨‍💻 Traders (4 usuarios)
- **Alex**: `trader@feniz.com` / `Trader123!@#`
- **Maria**: `maria@feniz.com` / `Maria123!@#`
- **John**: `john@feniz.com` / `John123!@#`
- **Ana**: `ana@feniz.com` / `Ana123!@#`
- **Permisos**: Acceso completo a trading y gestión de cuentas

### 👁️ Viewer
- **Email**: `viewer@feniz.com`
- **Contraseña**: `Viewer123!@#`
- **Permisos**: Solo lectura de datos básicos

## 🛠️ Personalización

Para modificar los datos del seed:

1. **Cambiar datos de usuarios**: Edita el array `users` en la sección "USER CREATION"
2. **Agregar más propfirms/brokers**: Modifica los arrays en las secciones correspondientes
3. **Cambiar número de trades**: Modifica el bucle en la sección "TRADES GENERATION"
4. **Ajustar permisos**: Modifica las secciones de asignación de permisos por rol

## 📝 Notas Importantes

- ⚠️ **EL SEED ELIMINA TODOS LOS DATOS** antes de crear nuevos
- ✅ Usa **Better Auth** para autenticación real
- ✅ **Email verificado** automáticamente para todos los usuarios
- ✅ **Contraseñas seguras** que cumplen requisitos mínimos
- ✅ **Sistema RBAC completo** con jerarquía de permisos
- ✅ **Datos realistas** con balances y trades generados

## 🐛 Troubleshooting

### Error: "Database not found"
- Verifica que PostgreSQL esté ejecutándose
- Confirma que `DATABASE_URL` esté configurada correctamente

### Error: "Permission denied"
- Ejecuta `pnpm db:migrate` antes del seed
- Verifica que el usuario de la DB tenga permisos de escritura

### Error: "Password too short"
- Las contraseñas deben tener al menos 8 caracteres
- Deben incluir mayúsculas, minúsculas, números y símbolos

### Error: "tsx not found"
- Ejecuta `pnpm install` para instalar todas las dependencias

## 🎯 Casos de Uso

### Para Desarrollo
- Usa `trader@feniz.com` para testing de funcionalidades de trading
- Usa `admin@feniz.com` para testing de administración
- Usa `viewer@feniz.com` para testing de permisos de solo lectura

### Para Testing
- Usa `superadmin@feniz.com` para testing completo del sistema
- Usa diferentes traders para testing de múltiples usuarios
- Usa `moderator@feniz.com` para testing de roles intermedios

## 📞 Soporte

Si encuentras problemas con el seed, revisa:
1. Los logs de la consola durante la ejecución
2. La configuración de la base de datos
3. Las variables de entorno
4. La versión de Node.js (recomendado: 18+)

## 🔄 Reset Completo

Para hacer un reset completo:
```bash
pnpm db:reset  # Esto también ejecuta el seed automáticamente
```