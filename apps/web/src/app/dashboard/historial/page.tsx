import { EmptySection } from "@/components/dashboard/EmptySection";
export default function HistorialPage() {
  return (
    <EmptySection
      icon="📋"
      title="Historial de auditorías"
      description="Tus auditorías pasadas aparecerán aquí para que puedas comparar tu evolución en el tiempo."
      hint="Disponible con cuenta registrada"
    />
  );
}
