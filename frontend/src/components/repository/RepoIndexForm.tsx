"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useRepoStore } from "@/store/repo-store";
import { GitBranch, Loader2 } from "lucide-react";

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid GitHub URL.").includes("github.com", { message: "Only GitHub URLs are supported." }),
  branch: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function RepoIndexForm() {
  const router = useRouter();
  const { setActiveRepo, setIndexing, isIndexing } = useRepoStore();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { repoUrl: "", branch: "main" },
  });

  const onSubmit = async (values: FormValues) => {
    setErrorMsg("");
    setIndexing(true);
    try {
      const response = await api.indexRepository(values.repoUrl, values.branch);
      if ((response.data.statusCode === 200 || response.data.statusCode === 201) && response.data.data) {
        setActiveRepo(response.data.data);
        router.push(`/${response.data.data.namespace}/chat`);
      } else {
        setErrorMsg(response.data.message || "Failed to index repository.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "An error occurred while indexing.");
    } finally {
      setIndexing(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col space-y-4 text-center mb-8">
        <h2 className="text-3xl font-[family-name:var(--font-display)] text-[#e3e2de] font-bold">New Repository</h2>
        <p className="text-sm text-[#8e9289]">Connect a GitHub repository to build the architecture index.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="relative">
            <GitBranch className="absolute left-3 top-3 h-4 w-4 text-[#8e9289]" />
            <Input
              {...register("repoUrl")}
              placeholder="https://github.com/user/repo"
              className="pl-9 bg-white/5 border-white/10 text-[#e3e2de] placeholder:text-[#8e9289] focus-visible:ring-[#98b090]/50 h-11"
              disabled={isIndexing}
            />
          </div>
          {errors.repoUrl && <p className="text-xs text-red-400 mt-1">{errors.repoUrl.message}</p>}
        </div>

        <div>
          <Input
            {...register("branch")}
            placeholder="Branch (optional, default: main)"
            className="bg-white/5 border-white/10 text-[#e3e2de] placeholder:text-[#8e9289] focus-visible:ring-[#98b090]/50 h-11"
            disabled={isIndexing}
          />
        </div>

        {errorMsg && <p className="text-xs text-red-400 text-center">{errorMsg}</p>}

        <Button
          type="submit"
          disabled={isIndexing}
          className="w-full bg-[#98b090] text-[#0a0a0a] hover:bg-[#b5cdac] hover:shadow-[0_0_20px_rgba(181,205,172,0.4)] rounded-xl h-11 font-semibold transition-all duration-300"
        >
          {isIndexing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Indexing... (This may take a few minutes)
            </>
          ) : (
            "Start Analysis"
          )}
        </Button>
      </form>
    </div>
  );
}
