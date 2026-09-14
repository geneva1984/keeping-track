import { useEffect, useState } from 'react'
import type { Attachment } from '../types'
import { getSignedUrl } from '../lib/attachments'

interface Props {
  attachment: Attachment
  onDelete?: () => void
}

export default function AttachmentThumb({ attachment, onDelete }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const isImage = attachment.content_type?.startsWith('image/') ?? false

  useEffect(() => {
    let cancelled = false
    getSignedUrl(attachment.storage_path)
      .then((signed) => {
        if (!cancelled) setUrl(signed)
      })
      .catch((err) => console.error('Failed to load attachment', err))
    return () => {
      cancelled = true
    }
  }, [attachment.storage_path])

  function handleClick() {
    if (!url) return
    if (isImage) {
      setLightboxOpen(true)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={handleClick}
          className="w-16 h-16 rounded-lg border border-line bg-white overflow-hidden flex items-center justify-center hover:border-accent/50 transition-colors"
        >
          {isImage && url ? (
            <img src={url} alt={attachment.file_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-ink-soft px-1 text-center leading-tight">
              {attachment.file_name.split('.').pop()?.toUpperCase() ?? 'FILE'}
            </span>
          )}
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-ink/70 text-white text-xs leading-none flex items-center justify-center hover:bg-warn"
            aria-label={`Remove ${attachment.file_name}`}
          >
            ×
          </button>
        )}
      </div>

      {lightboxOpen && url && (
        <div
          className="fixed inset-0 bg-ink/80 flex items-center justify-center z-40 p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={url} alt={attachment.file_name} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </>
  )
}
