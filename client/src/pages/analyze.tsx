import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { RepositorySelect } from "@/components/repository-select";
import { PrList } from "@/components/pr-list";
import { AnalysisChart } from "@/components/analysis-chart";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analyze() {
  const { owner, repo } = useParams();
  
  const { data: prs, isLoading } = useQuery({
    queryKey: ["/api/repos", owner, repo, "pulls"],
    enabled: Boolean(owner && repo),
  });

  return (
    <div className="min-h-screen bg-[#F6F8FA]">
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <RepositorySelect defaultOwner={owner} defaultRepo={repo} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <PrList prs={prs || []} />
            )}
          </div>
          <div>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <AnalysisChart prs={prs || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
