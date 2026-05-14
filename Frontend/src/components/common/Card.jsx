function Card({ title, value, icon, badge, badgeTone = 'neutral', valueTone = 'primary', children }) {
  const badgeClasses = {
    neutral: 'bg-slate-100 text-slate-500',
    success: 'bg-emerald-50 text-emerald-600',
    live: 'text-[#14B8A6]',
    danger: 'bg-red-50 text-red-600',
  }

  const valueClasses = {
    primary: 'text-[#1E3A8A]',
    danger: 'text-red-600',
  }

  return (
    <article className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#1E3A8A]">
          {icon}
        </div>
        {badge ? (
          <span className={`rounded-xl px-3 py-1 text-sm font-medium ${badgeClasses[badgeTone] || badgeClasses.neutral}`}>
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <p className={`mt-2 text-5xl font-bold tracking-tight ${valueClasses[valueTone] || valueClasses.primary}`}>
          {value}
        </p>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </article>
  )
}

export default Card
