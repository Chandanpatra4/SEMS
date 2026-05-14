function RoleCard({ role, description, items, active }) {
  return (
    <article
      className={`rounded-2xl border p-7 ${
        active
          ? 'border-slate-300 bg-white shadow-md'
          : 'border-slate-200 bg-slate-50/70 shadow-sm'
      }`}
    >
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A8A]/10 text-xl font-semibold text-[#1E3A8A]">
        {role[0]}
      </div>
      <h3 className="text-center text-2xl font-semibold text-slate-900">{role}</h3>
      <p className="mt-3 text-center text-sm leading-7 text-slate-600">{description}</p>
      <ul className="mt-6 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-[#1E3A8A]">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-[#1E3A8A]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}



export default RoleCard
