import { CheckCircle2, Circle, Loader2 } from "lucide-react";

// decorative sample cards shown on the branded auth panel — purely visual
const SAMPLE_TASKS = [
  {
    title: "Ship onboarding flow",
    meta: "Due tomorrow · In progress",
    icon: Loader2,
    tint: "text-status-progress-fg",
    dot: "bg-status-progress-fg",
  },
  {
    title: "Review Q3 roadmap",
    meta: "Due Fri · To do",
    icon: Circle,
    tint: "text-status-todo-fg",
    dot: "bg-status-todo-fg",
  },
  {
    title: "Publish release notes",
    meta: "Completed today · Done",
    icon: CheckCircle2,
    tint: "text-status-done-fg",
    dot: "bg-status-done-fg",
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Two-column auth shell: branded panel (soft accent tint) on the left,
// the form (paper background) on the right. Collapses to a single column
// with the form only on small screens.
const AuthLayout = ({ children }: AuthLayoutProps) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    {/* branded panel */}
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary-tint p-12 lg:flex">
      <div className="flex items-center gap-2 font-bold text-primary-hover">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          T
        </span>
        Tasktide
      </div>

      <div className="max-w-md">
        <h1 className="font-serif text-5xl leading-[1.05] text-foreground">
          The calm way to move work forward.
        </h1>
        <p className="mt-5 text-base text-muted-foreground">
          Plan, track and finish your tasks without the noise. Real-time
          updates keep everyone in sync, so nothing slips through.
        </p>

        <div className="mt-10 space-y-3">
          {SAMPLE_TASKS.map((task) => {
            const Icon = task.icon;
            return (
              <div
                key={task.title}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl bg-primary-tint ${task.tint}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {task.title}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${task.dot}`} />
                    {task.meta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tasktide
      </p>
    </aside>

    {/* form side */}
    <main className="flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  </div>
);

export default AuthLayout;
