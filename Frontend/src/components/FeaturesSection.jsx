import FeatureCard from './FeatureCard'

const featureList = [
  {
    title: 'Secure Login',
    description:
      'Role-based access control ensuring restricted entry for students, teachers, and administrators.',
    icon: <i className="ri-lock-2-line text-xl" aria-hidden="true" />,
  },
  {
    title: 'Question Bank Management',
    description:
      'Centralized repository for teachers to organize and maintain comprehensive MCQ collections.',
    icon: <i className="ri-database-2-line text-xl" aria-hidden="true" />,
  },
  {
    title: 'Exam Creation',
    description:
      'Configure precise exam parameters including duration, scheduling, and dynamic question selection.',
    icon: <i className="ri-file-add-line text-xl" aria-hidden="true" />,
  },
  {
    title: 'Randomized Questions',
    description:
      'Unique exam sequences for every student via randomized shuffling of questions and options.',
    icon: <i className="ri-shuffle-line text-xl" aria-hidden="true" />,
  },
  {
    title: 'Automatic Evaluation',
    description:
      'Instant grading engine that calculates results immediately upon submission for rapid feedback.',
    icon: <i className="ri-calculator-line text-xl" aria-hidden="true" />,
  },
  {
    title: 'Exam Monitoring',
    description:
      'Active integrity tracking including tab-switching detection and restricted navigation alerts.',
    icon: <i className="ri-eye-line text-xl" aria-hidden="true" />,
  },
]

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0f7669]">Capabilities</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#1E3A8A] sm:text-4xl">System Features</h2>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featureList.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
