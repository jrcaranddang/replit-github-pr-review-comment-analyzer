import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PullRequest } from "@shared/schema";

interface AnalysisChartProps {
  prs: PullRequest[];
}

export function AnalysisChart({ prs }: AnalysisChartProps) {
  console.log('Chart data before transform:', prs); // Add logging
  const data = prs.map(pr => ({
    name: `#${pr.githubPrId}`,
    approvals: pr.analysisResult?.approvals ?? 0,
    changes: pr.analysisResult?.changes ?? 0,
    sentiment: pr.analysisResult?.sentiment ?? 0,
  }));
  console.log('Chart data after transform:', data); // Add logging

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-[#24292E]">Review Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] w-full flex items-center justify-center">
          <p className="text-gray-500">No pull requests to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-[#24292E]">Review Analysis</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="approvals" fill="#2EA44F" name="Approvals" />
            <Bar dataKey="changes" fill="#E34C26" name="Changes Requested" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}