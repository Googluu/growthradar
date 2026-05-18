import { EmptySection } from "@/components/dashboard/EmptySection";
export default function ConfiguracionPage() {
  return (
    <EmptySection
      icon="⚙️"
      title="Configuración"
      description="Administra tu perfil, plan y conexiones con otras herramientas."
      hint="Disponible con cuenta registrada"
      ctaLabel="Crear cuenta →"
      ctaHref="/register"
    />
  );
}
