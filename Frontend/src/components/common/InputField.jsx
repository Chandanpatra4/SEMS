function InputField({
  label,
  id,
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  autoComplete,
  required = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#0F172A]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/25"
      />
    </div>
  )
}

export default InputField
