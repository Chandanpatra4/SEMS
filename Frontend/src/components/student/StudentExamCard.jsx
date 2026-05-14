function StudentExamCard({
  icon,
  title,
  subject,
  duration,
  dateTime,
  status,
  actionLabel,
  actionDisabled = false,
  onAction,
}) {
  const statusClasses =
    status === 'Active'
      ? 'bg-[#E4F0EC] text-[#1B4E49]'
      : status === 'Upcoming'
        ? 'bg-[#FEF3C7] text-[#92400E]'
      : 'bg-[#EFF2F6] text-slate-500'

  const actionClasses = actionDisabled
    ? 'bg-[#E7EBF0] text-slate-400 shadow-none'
    : 'bg-[#0B278A] text-white shadow-[0_12px_30px_-18px_rgba(11,39,138,0.8)] hover:bg-[#102f9f]'

  return (
    <article className="grid items-center gap-6 rounded-[28px] bg-white px-4 py-5 shadow-[0_22px_55px_-45px_rgba(15,23,42,0.38)] sm:px-6 sm:py-6 lg:grid-cols-[96px_1.2fr_1fr_1.1fr_180px_170px] lg:gap-8 lg:px-7 lg:py-7">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E3E8F3] text-[#0B278A]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Exam Title</p>
        <h3 className="mt-2 text-[1.15rem] font-semibold text-[#141B2B]">{title}</h3>
        <p className="mt-1 text-[0.95rem] text-slate-500">{subject}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Duration</p>
        <p className="mt-3 flex items-center gap-3 text-[1.05rem] text-[#232C3F]">
          <i className="ri-time-line text-lg text-slate-700" aria-hidden="true" />
          {duration}
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Date & Time</p>
        <p className="mt-3 flex items-center gap-3 text-[1.05rem] text-[#232C3F]">
          <i className="ri-calendar-event-line text-lg text-slate-700" aria-hidden="true" />
          {dateTime}
        </p>
      </div>

      <div>
        <span className={`inline-flex rounded-full px-5 py-2 text-[1rem] font-medium ${statusClasses}`}>
          {status}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={actionDisabled}
          onClick={onAction}
          className={`min-w-35 rounded-2xl px-8 py-4 text-[1rem] font-semibold transition ${actionClasses}`}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  )
}

export default StudentExamCard
