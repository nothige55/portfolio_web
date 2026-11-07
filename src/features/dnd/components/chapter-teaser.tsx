import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Chapter } from "../config/chapters";

export function ChapterTeaser({ chapter }: { chapter: Chapter }) {
  return (
    <Link
      href={`/dnd#chapter-${chapter.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            {chapter.versions}
          </Badge>
          <CardTitle className="font-heading text-lg">{chapter.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{chapter.feel}</CardContent>
      </Card>
    </Link>
  );
}
