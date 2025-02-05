import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const repoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1),
});

type RepoFormData = z.infer<typeof repoSchema>;

interface RepositorySelectProps {
  defaultOwner?: string;
  defaultRepo?: string;
}

export function RepositorySelect({ defaultOwner, defaultRepo }: RepositorySelectProps) {
  const [_, setLocation] = useLocation();
  
  const form = useForm<RepoFormData>({
    resolver: zodResolver(repoSchema),
    defaultValues: {
      owner: defaultOwner || "",
      repo: defaultRepo || "",
    },
  });

  const onSubmit = (data: RepoFormData) => {
    setLocation(`/analyze/${data.owner}/${data.repo}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
        <FormField
          control={form.control}
          name="owner"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Organization/Owner" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repo"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input placeholder="Repository" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="bg-[#0366D6]">
          Analyze
        </Button>
      </form>
    </Form>
  );
}
