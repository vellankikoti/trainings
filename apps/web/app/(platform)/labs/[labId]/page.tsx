import { notFound } from "next/navigation";
import { getLabDefinition } from "@/lib/labs/lab-content";
import { LabView } from "@/components/labs/LabView";

interface PageProps {
  params: Promise<{ labId: string }>;
}

export default async function LabPage({ params }: PageProps) {
  const { labId } = await params;
  const lab = getLabDefinition(labId);

  if (!lab) {
    notFound();
  }

  // Parse lesson_ref to build back-link
  const lessonParts = lab.lesson_ref.split("/");
  const lessonLink =
    lessonParts.length === 3
      ? `/learn/${lessonParts[0]}/${lessonParts[1]}/${lessonParts[2]}`
      : null;

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <LabView
        labId={lab.name}
        labTitle={lab.title}
        labDescription={lab.description}
        difficulty={lab.difficulty}
        duration={lab.duration}
        exercises={lab.exercises.map((ex) => ({
          id: ex.id,
          title: ex.title,
          description: ex.description,
          hints: ex.hints,
        }))}
        lessonLink={lessonLink}
      />
    </div>
  );
}
