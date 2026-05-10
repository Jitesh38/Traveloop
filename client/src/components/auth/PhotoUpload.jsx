import { useRef } from 'react'

// Palette: #767f9e | #daa464 | #dec384 | #e8ddb4
// onChange(previewDataUrl, file) — both provided so parent can preview + upload

export default function PhotoUpload({ image, onChange, readOnly = false }) {
  const inputRef = useRef(null)

  function handleClick() {
    if (!readOnly) inputRef.current?.click()
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onChange(ev.target.result, file)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex justify-center mb-6">
      <button
        type="button"
        onClick={handleClick}
        className={`relative w-24 h-24 rounded-full border-4 border-[#daa464] overflow-hidden shadow-lg bg-[#dec384]/30 flex items-center justify-center group ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {image ? (
          <img src={image} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center text-[#767f9e]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {!readOnly && <span className="text-xs mt-1 font-semibold">Photo</span>}
          </span>
        )}
        {!readOnly && (
          <div className="absolute inset-0 bg-[#3d4460]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </button>
      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
      )}
    </div>
  )
}
