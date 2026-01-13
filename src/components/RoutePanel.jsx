import { useState } from 'react'
// Imports removed as logic moves up to App

// RoutePanel: Just the input now, styled plainly to fit into the dashboard card.
function RoutePanel({
  destination,
  setDestination,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Destino
      </label>
      <input
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Ej: Madrid, Barcelona..."
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
      />
    </div>
  )
}

export default RoutePanel
