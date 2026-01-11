'use client'

import { useEffect } from 'react'

export default function Snackbar({ message, onUndo, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 z-50">
      <span>{message}</span>
      <button
        onClick={onUndo}
        className="text-blue-400 hover:text-blue-300 font-semibold uppercase text-sm"
      >
        Undo
      </button>
    </div>
  )
}