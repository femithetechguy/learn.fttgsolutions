interface Props {
  query?: string
}

export default function EmptyState({ query }: Props) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-3">
      <span className="text-4xl">🔍</span>
      <p className="font-display font-bold text-text-primary text-lg">
        {query
          ? <>&ldquo;{query}&rdquo; isn&apos;t in our arsenal&hellip; yet.</>
          : <>Nothing here for that filter&hellip; yet.</>}
      </p>
      <p className="font-sans text-text-muted text-sm max-w-xs">
        We&apos;re always loading up — check back soon or suggest it to the team.
      </p>
    </div>
  )
}
