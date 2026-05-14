"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function CreateChallengeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [tool, setTool] = useState("journaling");
  const [journalType, setJournalType] = useState<"write" | "audio" | "art">("audio");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<"INDIVIDUAL" | "CLASS" | "SCHOOL">("INDIVIDUAL");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories based on selected tool
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories", tool],
    queryFn: async () => {
      if (tool === "journaling") return [];
      
      try {
        console.log("Fetching categories for tool:", tool);
        const response = await fetch(`/api/categories?tool=${tool}`);
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch categories: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Response data:", data);
        return data.data || [];
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
    enabled: tool !== "journaling",
  });

  // Reset category when tool changes
  useEffect(() => {
    setSelectedCategory("");
  }, [tool]);

  const Req = () => <span className="text-[#EF4444]">*</span>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const challengeData = {
      name: formData.get("ch-name") as string,
      description: formData.get("ch-desc") as string,
      startsAt: formData.get("ch-start-date") as string,
      endsAt: formData.get("ch-end-date") as string,
      instructions: formData.get("ch-instructions") as string,
      requiresJournaling: tool === "journaling",
      requiresMeditation: tool === "meditation",
      requiresMusic: tool === "music",
      requiresPsychoeducation: tool === "psychoeducation",
      category: tool === "journaling" 
        ? "Journaling" 
        : (selectedCategory || tool.charAt(0).toUpperCase() + tool.slice(1)),
      journalType: tool === "journaling" ? journalType : undefined,
      assignmentType: assignmentType,
      isActive: true,
    };

    try {
      const response = await fetch("/api/counselor/challenges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(challengeData),
      });

      if (!response.ok) throw new Error("Failed to create challenge");

      toast({ title: "Challenge created successfully" });
      queryClient.invalidateQueries({ queryKey: ["counselor-challenges"] });
      onOpenChange(false);
    } catch (error) {
      toast({ 
        title: "Failed to create challenge", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[560px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Challenges</DialogTitle>
          <DialogDescription>Design a challenge to assign to your students.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="space-y-1.5">
            <Label htmlFor="ch-name">
              Challenge Name <Req />
            </Label>
            <Input id="ch-name" name="ch-name" className="bg-[#F1F5F9]/40" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ch-desc">
              Description <Req />
            </Label>
            <Textarea id="ch-desc" name="ch-desc" className="min-h-[100px] bg-[#F1F5F9]/40" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ch-start-date">
                Start Date & Time <Req />
              </Label>
              <Input id="ch-start-date" name="ch-start-date" type="datetime-local" className="bg-[#F1F5F9]/40" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ch-end-date">
                End Date & Time <Req />
              </Label>
              <Input id="ch-end-date" name="ch-end-date" type="datetime-local" className="bg-[#F1F5F9]/40" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ch-instructions">
              Instructions <Req />
            </Label>
            <Textarea
              id="ch-instructions"
              name="ch-instructions"
              className="min-h-[140px] bg-[#F1F5F9]/40"
              placeholder={`Step by step guidance. One step per line, e.g.\n  1. Open your journal each evening.\n  2. Write down 3 things you're grateful for.\n  3. Reflect briefly on each.`}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>
              Challenge <Req />
            </Label>

            <div className="space-y-1.5">
              <Label className="text-sm font-normal">
                Tool <Req />
              </Label>
              <Select value={tool} onValueChange={setTool}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journaling">Journaling</SelectItem>
                  <SelectItem value="meditation">Meditation</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="psychoeducation">Psychoeducation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show journaling types when journaling is selected */}
            {tool === "journaling" && (
              <div className="flex gap-2 rounded-lg bg-[#F1F5F9]/40 p-2">
                {(
                  [
                    { id: "write", label: "Write journal" },
                    { id: "audio", label: "Audio Journal" },
                    { id: "art", label: "Art Journal" },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setJournalType(o.id)}
                    className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                      journalType === o.id
                        ? "border-transparent bg-[#3B82F6] text-[#FFFFFF]"
                        : "border-[#E2E8F0] bg-[#FFFFFF] text-[#1E293B] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {/* Show categories dropdown for non-journaling tools */}
            {tool !== "journaling" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-normal">
                  Category <Req />
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={categoriesLoading}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {tool === "journaling" && (
            <div className="space-y-1.5">
              <Label htmlFor="ch-prompt">
                Journaling Prompt <Req />
              </Label>
              <Textarea
                id="ch-prompt"
                name="ch-prompt"
                className="min-h-[100px] bg-[#F1F5F9]/40"
                placeholder="Type journaling prompt here ..."
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-normal">
              Assignment Type <Req />
            </Label>
            <Select value={assignmentType} onValueChange={(value: "INDIVIDUAL" | "CLASS" | "SCHOOL") => setAssignmentType(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual Student</SelectItem>
                <SelectItem value="CLASS">Entire Class</SelectItem>
                <SelectItem value="SCHOOL">Entire School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#3B82F6] text-[#FFFFFF] hover:bg-[#3B82F6]/90">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { CreateChallengeDialog };
