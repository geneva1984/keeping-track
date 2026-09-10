interface Props {
  count: number
  active: boolean
  onToggle: () => void
}

export default function FollowUpBanner({ count, active, onToggle }: Props) {
  if (count === 0) return null

  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
        active ? 'bg-gold text-white' : 'bg-gold-soft text-ink hover:bg-gold-soft/70'
      }`}
    >
      <span className="text-sm font-medium">
        {count} open follow-up{count === 1 ? '' : 's'} {count === 1 ? 'needs' : 'need'} attention
      </span>
      <span className={`text-xs font-medium ${active ? 'text-white' : 'text-gold'}`}>
        {active ? 'Show all' : 'View'}
      </span>
    </button>
  )
}
