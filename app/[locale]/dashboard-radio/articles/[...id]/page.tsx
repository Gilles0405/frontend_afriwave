
import ArticleDetails from "@/components/Radio/ArticleDetails";
import { getCurrentUser } from "@/lib/server/auth";
import { notFound, redirect } from "next/navigation";

interface ArticleDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string[];
  }>;
}

export default async function ArticleDetailsPage({
  params,
}: ArticleDetailsPageProps) {
  const { locale, id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const articleId = Number(id[id.length - 1]);
  const radioId = Number(user.radioUsers?.[0]?.radioId);

  if (
    !Number.isInteger(articleId) ||
    articleId <= 0 ||
    !Number.isInteger(radioId) ||
    radioId <= 0
  ) {
    notFound();
  }

  return (
    <ArticleDetails
      articleId={articleId}
      radioId={radioId}
    />
  );
}
