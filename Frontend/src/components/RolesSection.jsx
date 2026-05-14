import RoleCard from './RoleCard'

const roles = [
  {
    role: 'Student',
    description:
      'Securely access scheduled examinations, attempt MCQs within set time limits, and view authenticated results.',
    items: ['Attempt exams', 'Instant evaluation'],
  },
  {
    role: 'Teacher',
    description:
      'Develop complex question banks, schedule specific exam windows, and manage academic content.',
    items: ['Question creation', 'Schedule management'],
    active: true,
  },
  {
    role: 'Admin',
    description:
      'Oversee institutional users and exam integrity, manage user registrations, and monitor real-time activity.',
    items: ['User management', 'Integrity monitoring'],
  },
]

function RolesSection() {
  return (
    <section id="about" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold tracking-tight text-[#1E3A8A] sm:text-4xl">System Users</h2>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {roles.map((role) => (
          <RoleCard
            key={role.role}
            role={role.role}
            description={role.description}
            items={role.items}
            active={role.active}
          />
        ))}
      </div>
    </section>
  )
}

export default RolesSection
