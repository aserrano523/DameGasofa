import { useState, useEffect } from 'react'
import crosshairIcon from '../assets/crosshair.png'

function LocationPanel({ userLocation, onDetectLocation, onSetManualLocation }) {
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')

  useEffect(() => {
    if (userLocation) {
      setManualLat(userLocation.lat)
      setManualLng(userLocation.lng)
    }
  }, [userLocation])

  // Update parent whenever inputs change, but wait for valid numbers
  // Actually, per requirements: "Clicking 'Usar mi ubicación' prints a text block... MUST NOT display... Autofill... Update internal location state"
  // And "Remove the second large button 'Establecer manualmente'"
  // We need to keep the inputs controllable.

  function handleLatChange(e) {
    const val = e.target.value
    setManualLat(val)
    const num = parseFloat(val)
    if (!isNaN(num) && manualLng !== '' && !isNaN(parseFloat(manualLng))) {
      onSetManualLocation(num, parseFloat(manualLng))
    }
  }

  function handleLngChange(e) {
    const val = e.target.value
    setManualLng(val)
    const num = parseFloat(val)
    if (!isNaN(num) && manualLat !== '' && !isNaN(parseFloat(manualLat))) {
      onSetManualLocation(parseFloat(manualLat), num)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-[#5B9BD5]/20 pb-8">
      <h3 className="text-lg font-semibold text-[#2A8BC0] mb-4">Ubicación de referencia</h3>
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-gray-700">
            Latitud
            <input
              type="number"
              step="any"
              value={manualLat}
              onChange={handleLatChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5B9BD5] focus:ring-[#5B9BD5] sm:text-sm p-3 border"
              placeholder="0.0000"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Longitud
            <input
              type="number"
              step="any"
              value={manualLng}
              onChange={handleLngChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#5B9BD5] focus:ring-[#5B9BD5] sm:text-sm p-3 border"
              placeholder="0.0000"
            />
          </label>
        </div>
        <button
          onClick={onDetectLocation}
          className="btn-compact-primary w-full md:w-auto mt-0 mb-[1px]"
          title="Usar mi ubicación actual"
        >
          <span className="mr-2 text-xl">📍</span>
          Usar mi ubicación
        </button>
      </div>
    </div>
  )
}

export default LocationPanel
