import { PropertyForm } from "@/components/admin/property-form";

export default function NewPropertyPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif-brand text-2xl font-semibold text-navy-950 dark:text-white">Add Property</h1>
      <PropertyForm />
    </div>
  );
}
