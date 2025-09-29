export default function MyTradesPage() {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>TODO:</strong> Implementar página de "Mis Trades" para
              traders.
              <br />
              Esta página debe mostrar el historial de operaciones del usuario.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Mis Operaciones
        </h1>
        <p className="text-muted-foreground">
          Esta funcionalidad está pendiente de implementación. Aquí se
          mostrarán:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Historial completo de trades</li>
          <li>• Filtros por fecha, símbolo, tipo de operación</li>
          <li>• P&L de cada operación</li>
          <li>• Métricas de performance (win rate, profit factor, etc.)</li>
          <li>• Gráficos de equity curve</li>
          <li>• Exportación a CSV/Excel</li>
        </ul>
      </div>
    </div>
  );
}
