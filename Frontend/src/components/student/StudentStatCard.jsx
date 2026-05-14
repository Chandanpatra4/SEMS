function StudentStatCard({
  title,
  value,
  meta,
  accent = 'blue',
  icon,
  highlight = false,
}) {
  const accentClasses = {
    blue: 'text-[#0B278A] bg-[#DCE2FF]',
    mint: 'text-[#0D5D58] bg-[#66E7D5]',
    neutral: 'text-[#0B278A] bg-[#F1F3F7]',
  }

  return (
    <article
      className={`rounded-[28px] bg-white p-10 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.38)] ${
        highlight ? 'border-l-4 border-[#0B278A]' : 'border border-slate-100'
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[1.05rem] font-semibold text-[#20273C]">{title}</p>
          <p className="mt-3 text-[3.1rem] leading-none font-bold tracking-tight text-[#111827]">{value}</p>
          <p className="mt-4 text-[1.05rem] text-slate-600">{meta}</p>
        </div>

        <div
          className={`flex h-17 w-17 items-center justify-center rounded-2xl ${accentClasses[accent] || accentClasses.blue}`}
        >
          {icon}
        </div>
      </div>
    </article>
  )
}

export default StudentStatCard
