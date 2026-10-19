
import RadioRequestDetail from "@/components/admin/RadioRequestDetail";

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function RadioRequestDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  return (
    <main className="container mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <RadioRequestDetail id={id} />
    </main>
  );
}
