function TeacherStatCard({ title, value, accent = 'blue', icon }) {
  const accentClass =
    accent === 'mint'
      ? 'border-l-[#14B8A6]'
      : accent === 'red'
        ? 'border-l-[#DC2626]'
        : 'border-l-[#1E3A8A]'

  return (
    <article className={`rounded-2xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${accentClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-[#1E3A8A]">{value}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-[#1E3A8A]">{icon}</div>
      </div>
    </article>
  )
}

export default TeacherStatCard
