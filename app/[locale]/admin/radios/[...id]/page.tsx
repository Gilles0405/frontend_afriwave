import RadioDetail from "@/components/Radio/RadioDetail";



interface RadioPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function RadioPage({ params }: RadioPageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <RadioDetail radioId={id} />
    </main>
  );
}
