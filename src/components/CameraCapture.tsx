import { useEffect, useRef, useState } from 'react'

interface Props {
  onCapture: (file: File) => void
  onClose: () => void
}

export default function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't access the camera. Check camera permission for this site and try again.")
      })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function handleCapture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
      },
      'image/jpeg',
      0.9,
    )
  }

  return (
    <div className="fixed inset-0 bg-ink z-50 flex flex-col">
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {error ? (
          <p className="text-white text-sm text-center px-6">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="max-w-full max-h-full" />
        )}
      </div>
      <div className="flex items-center justify-center gap-8 py-6 bg-ink">
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 text-sm font-medium px-4 py-2 hover:text-white"
        >
          Cancel
        </button>
        {!error && (
          <button
            type="button"
            onClick={handleCapture}
            disabled={!ready}
            aria-label="Take photo"
            className="w-16 h-16 rounded-full bg-white border-4 border-white/30 disabled:opacity-40"
          />
        )}
      </div>
    </div>
  )
}
