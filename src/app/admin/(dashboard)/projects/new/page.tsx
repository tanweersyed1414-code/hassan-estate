import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Add Construction Project</h1>
      <ProjectForm />
    </div>
  );
}
