# ScrollableTable Component

Un componente de tabla altamente flexible y reutilizable con paginación, búsqueda, ordenamiento y responsividad integradas.

## Características

- ✅ **Responsivo**: Scroll horizontal en pantallas pequeñas
- ✅ **Paginación**: Navegación completa con tamaños de página configurables
- ✅ **Búsqueda**: Filtrado integrado con placeholder personalizable
- ✅ **Ordenamiento**: Columnas ordenables con indicadores visuales
- ✅ **Acciones**: Botones de acción por fila completamente configurables
- ✅ **Selección**: Checkbox de selección múltiple opcional
- ✅ **Estados**: Loading, error y empty states integrados
- ✅ **Eventos**: onClick y onDoubleClick en filas
- ✅ **Personalización**: Estilos y clases CSS flexibles

## Uso Básico

```tsx
import { ScrollableTable, TableColumn, TableAction } from "@/components/ui/scrollable-table";

// Definir columnas
const columns: TableColumn<User>[] = [
  {
    key: "name",
    title: "Nombre",
    sortable: true,
  },
  {
    key: "email", 
    title: "Email",
    sortable: true,
  },
  {
    key: "status",
    title: "Estado",
    render: (value) => (
      <span className={value === 'active' ? 'text-green-600' : 'text-red-600'}>
        {value === 'active' ? 'Activo' : 'Inactivo'}
      </span>
    ),
  },
];

// Definir acciones
const actions: TableAction<User>[] = [
  {
    label: "Editar",
    icon: <Edit className="h-4 w-4" />,
    onClick: (user) => handleEdit(user),
    variant: "outline",
  },
  {
    label: "Eliminar", 
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (user) => handleDelete(user),
    variant: "destructive",
    disabled: (user) => user.role === 'admin', // Los admins no se pueden eliminar
  },
];

// Usar el componente
<ScrollableTable
  data={users}
  columns={columns}
  actions={actions}
  loading={isLoading}
  pagination={paginationInfo}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  searchValue={search}
  onSearchChange={setSearch}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={handleSort}
/>
```

## Props Principales

### Data Props
- `data: T[]` - Array de datos a mostrar
- `columns: TableColumn<T>[]` - Definición de columnas
- `loading?: boolean` - Estado de carga
- `error?: string | null` - Mensaje de error

### Pagination Props
- `pagination?: PaginationInfo` - Información de paginación
- `onPageChange?: (page: number) => void` - Callback al cambiar página
- `onPageSizeChange?: (pageSize: number) => void` - Callback al cambiar tamaño
- `pageSizeOptions?: number[]` - Opciones de tamaño de página (default: [5,10,20,50,100])

### Search Props
- `searchable?: boolean` - Habilitar búsqueda (default: true)
- `searchValue?: string` - Valor actual de búsqueda
- `onSearchChange?: (value: string) => void` - Callback de búsqueda
- `searchPlaceholder?: string` - Placeholder del input

### Sorting Props
- `sortBy?: string` - Campo actual de ordenamiento
- `sortOrder?: "asc" | "desc"` - Dirección del ordenamiento
- `onSortChange?: (sortBy: string, sortOrder: "asc" | "desc") => void` - Callback de ordenamiento

### Actions Props
- `actions?: TableAction<T>[]` - Array de acciones por fila
- `showActions?: boolean` - Mostrar columna de acciones (default: true)
- `actionsWidth?: string` - Ancho de la columna de acciones

## Definición de Columnas

```tsx
interface TableColumn<T> {
  key: string;                    // Clave del campo en el objeto
  title: string;                  // Título de la columna
  width?: string;                 // Ancho CSS de la columna
  sortable?: boolean;             // ¿Es ordenable?
  render?: (value: any, record: T, index: number) => ReactNode; // Renderizado custom
  className?: string;             // Clases CSS para celdas
  headerClassName?: string;       // Clases CSS para el header
}
```

### Ejemplos de Columnas

```tsx
// Columna simple
{
  key: "name",
  title: "Nombre",
  sortable: true,
}

// Columna con renderizado custom
{
  key: "avatar",
  title: "Avatar",
  render: (value, record) => (
    <img src={value} alt={record.name} className="h-8 w-8 rounded-full" />
  ),
}

// Columna con formato de fecha
{
  key: "createdAt",
  title: "Creado",
  sortable: true,
  render: (value) => new Date(value).toLocaleDateString(),
  className: "text-gray-500 text-sm",
}

// Columna con badge de estado
{
  key: "status",
  title: "Estado",
  render: (value) => (
    <span className={`px-2 py-1 text-xs rounded-full ${
      value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {value === 'active' ? 'Activo' : 'Inactivo'}
    </span>
  ),
}
```

## Definición de Acciones

```tsx
interface TableAction<T> {
  label: string;                              // Texto del botón
  icon?: ReactNode;                           // Icono del botón
  onClick: (record: T) => void;               // Función al hacer click
  variant?: "default" | "destructive" | ...;  // Variante del botón
  size?: "default" | "sm" | "lg" | "icon";   // Tamaño del botón
  className?: string;                         // Clases CSS adicionales
  disabled?: (record: T) => boolean;          // Función para deshabilitar
  hidden?: (record: T) => boolean;            // Función para ocultar
}
```

### Ejemplos de Acciones

```tsx
const actions: TableAction<User>[] = [
  // Acción simple
  {
    label: "Ver",
    onClick: (user) => navigate(`/users/${user.id}`),
  },
  
  // Acción con icono
  {
    label: "Editar",
    icon: <Edit className="h-4 w-4" />,
    onClick: handleEdit,
    variant: "outline",
  },
  
  // Acción condicional
  {
    label: "Activar",
    icon: <Check className="h-4 w-4" />,
    onClick: handleActivate,
    variant: "default",
    hidden: (user) => user.status === 'active', // Solo mostrar si está inactivo
  },
  
  // Acción con confirmación
  {
    label: "Eliminar",
    icon: <Trash2 className="h-4 w-4" />,
    onClick: (user) => {
      if (confirm('¿Eliminar usuario?')) {
        handleDelete(user);
      }
    },
    variant: "destructive",
    disabled: (user) => user.role === 'admin', // No eliminar admins
  },
];
```

## Funcionalidades Avanzadas

### Selección Múltiple
```tsx
<ScrollableTable
  selectable={true}
  selectedRows={selectedIds}
  onRowSelect={setSelectedIds}
  rowKey="id" // o función: (record) => record.customId
/>
```

### Eventos de Fila
```tsx
<ScrollableTable
  onRowClick={(record, index) => console.log('Click:', record)}
  onRowDoubleClick={(record, index) => handleEdit(record)}
/>
```

### Header Actions
```tsx
<ScrollableTable
  headerActions={
    <div className="flex gap-2">
      <Button onClick={handleBulkAction}>Acción Masiva</Button>
      <Button onClick={handleExport}>Exportar</Button>
    </div>
  }
/>
```

### Estilos Personalizados
```tsx
<ScrollableTable
  className="custom-table"
  tableClassName="custom-table-inner"
  headerClassName="custom-header"
  rowClassName={(record, index) => 
    record.priority === 'high' ? 'bg-red-50' : ''
  }
/>
```

## Integración con tRPC y Paginación

```tsx
function UserList() {
  const pagination = usePagination({ defaultLimit: 10 });
  const { search, sortBy, sortOrder } = pagination;
  
  const { data: response, isLoading, error } = trpc.user.getAll.useQuery({
    page: pagination.page,
    limit: pagination.limit,
    search,
    sortBy,
    sortOrder,
  });
  
  return (
    <ScrollableTable
      data={response?.data || []}
      pagination={response?.pagination}
      loading={isLoading}
      error={error?.message}
      searchValue={search}
      onSearchChange={pagination.setSearch}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={(field, order) => {
        pagination.setSortBy(field);
        pagination.setSortOrder(order);
      }}
      onPageChange={pagination.setPage}
      onPageSizeChange={pagination.setLimit}
      // ... resto de props
    />
  );
}
```

## Estados Especiales

### Loading State
Se muestra automáticamente un spinner cuando `loading={true}`

### Error State
Se muestra un mensaje de error cuando `error` tiene valor

### Empty State
Se muestra cuando `data` está vacío, personalizable con `emptyMessage` y `emptyIcon`

## Responsive Design

- **Desktop**: Tabla completa con todas las columnas
- **Tablet**: Scroll horizontal automático
- **Mobile**: Scroll horizontal con columnas compactas

El componente es completamente responsive y se adapta automáticamente a diferentes tamaños de pantalla.
