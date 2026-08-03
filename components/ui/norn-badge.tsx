import { cn } from '@/lib/utils'
import { NornMark } from '@/components/ui/norn-mark'

/**
 * The mark on its lime tile — the brand lockup used in the hero header, the
 * chat avatars and the footer.
 *
 * `cn` (twMerge) rather than string interpolation because callers override the
 * radius: the chat uses `rounded-xl` to match the avatar next to it, and
 * without merging both radii would land in the class list and the cascade, not
 * the caller, would decide which wins.
 */
export function NornBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime',
        className
      )}
    >
      <NornMark className="h-5 w-5 text-carbon-black" />
    </span>
  )
}
