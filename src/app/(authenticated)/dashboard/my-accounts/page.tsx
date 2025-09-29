export default function MyAccountsPage() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>TODO:</strong> Implementar página de "Mis Cuentas" para
              traders.
              <br />
              Esta página debe mostrar las cuentas de trading asignadas al
              usuario.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Mis Cuentas de Trading
        </h1>
        <p className="text-muted-foreground">
          Esta funcionalidad está pendiente de implementación. Aquí se
          mostrarán:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Lista de cuentas de trading asignadas</li>
          <li>• Estado de cada cuenta (activa/inactiva)</li>
          <li>• Balance y equity en tiempo real</li>
          <li>• Métricas de rendimiento</li>
          <li>• Historial de depósitos y retiros</li>
        </ul>
      </div>
    </div>
  );
}
