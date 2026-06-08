import { z } from "zod";

function isGitHubRepositoryUrl(value: string): boolean {
  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.hostname !== "github.com") {
      return false;
    }

    const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
    return pathSegments.length >= 2;
  } catch {
    return false;
  }
}

export const repositoryIntakeSchema = z.object({
  repoUrl: z
    .string()
    .trim()
    .url("Provide a valid GitHub repository URL.")
    .refine(isGitHubRepositoryUrl, {
      message: "Only GitHub repository URLs are supported for now.",
    }),
  branch: z.string().trim().min(1).optional(),
});

export type RepositoryIntakeSchema = z.infer<typeof repositoryIntakeSchema>;
