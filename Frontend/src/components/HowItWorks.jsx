const steps = [
  {
    title: 'Step 1: Onboarding',
    text: 'Admin creates secure credentials for all institutional users and maps roles.',
    symbol: 'A',
  },
  {
    title: 'Step 2: Preparation',
    text: 'Teacher prepares MCQ banks and schedules the exam duration and availability.',
    symbol: 'T',
  },
  {
    title: 'Step 3: Execution',
    text: 'Student logs in to attempt the exam and receives instant automated results.',
    symbol: 'S',
  },
]

function HowItWorks() {
  return (
    <section id="contact" className="bg-[#0b2c7b]">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-white/15 bg-white/5 p-6 text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f7669] text-base font-bold text-white">
                {step.symbol}
              </div>
              <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-200">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
