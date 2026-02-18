import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Power, 
  BookOpen, 
  Sparkles, 
  Mic, 
  Palette, 
  Shield, 
  Clock, 
  Undo, 
  Redo, 
  Trash, 
  PenTool, 
  Loader2, 
  School, 
  Users, 
  UserCheck, 
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/src/contexts/AuthContext";
import { 
  JournalPrompt, 
  JournalingConfig, 
  AudioJournalingConfig, 
  ArtJournalingConfig, 
  ApiResponse,
  journalPrompts,
  defaultJournalMoods
} from "./types";

interface JournalingToolsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAddJournalingPromptOpen?: boolean;
  setIsAddJournalingPromptOpen?: (open: boolean) => void;
  isAddJournalingCategoryOpen?: boolean;
  setIsAddJournalingCategoryOpen?: (open: boolean) => void;
  selectedSchool?: string;
  isSuperAdmin?: boolean;
  schools?: Array<{ id: string; name: string }>;
}

export default function JournalingTools({ 
  searchQuery, 
  setSearchQuery, 
  isAddJournalingPromptOpen = false, 
  setIsAddJournalingPromptOpen,
  isAddJournalingCategoryOpen = false, 
  setIsAddJournalingCategoryOpen,
  selectedSchool = "all",
  isSuperAdmin = false,
  schools = []
}: JournalingToolsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false); // Track when saving is in progress
  
  // Load color palette setting from localStorage
  const loadColorPaletteFromStorage = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('artColorPaletteEnabled');
      return saved !== null ? JSON.parse(saved) : true; // Default to true
    }
    return true;
  };

  // Save color palette setting to localStorage
  const saveColorPaletteToStorage = (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('artColorPaletteEnabled', JSON.stringify(enabled));
    }
  };

  // Data states
  const [journalPrompts, setJournalPrompts] = useState<JournalPrompt[]>([]);
  
  // Configuration states
  const [journalingConfig, setJournalingConfig] = useState<JournalingConfig>({
    writingEnabled: true,
    audioEnabled: true,
    artEnabled: true,
  });
  
  const [audioConfig, setAudioConfig] = useState<AudioJournalingConfig>({
    maxRecordingDuration: 180,
    autoDeleteBehavior: "manual",
  });
  
  const [artConfig, setArtConfig] = useState<ArtJournalingConfig>({
    undoRedoEnabled: true,
    colorPaletteEnabled: loadColorPaletteFromStorage(), // Load from localStorage
    clearCanvasEnabled: true,
  });

  // Lists management
  const [journalMoods, setJournalMoods] = useState<string[]>(defaultJournalMoods);
  
  // Form states
  const [journalForm, setJournalForm] = useState({ 
    prompt: "", 
    moods: [] as string[], 
    journalTypes: ["writing"] as ("writing" | "art")[] 
  });
  
  // Dialog states
  const [isAddJournalOpen, setIsAddJournalOpen] = useState(false);

  // API Functions
  const fetchJournalingConfig = async () => {
    try {
      let url = '/api/admin/journaling/config';
      
      console.log('=== FETCH CONFIG START ===');
      console.log('fetchJournalingConfig called:', { selectedSchool, isSuperAdmin, userSchoolId: user?.school?.id });
      
      // Add schoolId parameter if a specific school is selected
      if (selectedSchool !== "all") {
        url += `?schoolId=${selectedSchool}`;
      }
      // For regular admins, always use their school
      else if (user?.school?.id && !isSuperAdmin) {
        url += `?schoolId=${user.school.id}`;
      }
      // If super admin selects "all", we need to handle this differently
      // For now, we'll skip fetching config for "all" as it's ambiguous
      else if (selectedSchool === "all" && isSuperAdmin) {
        console.log('Super admin selected "all schools", setting defaults');
        // Reset to default values when "all schools" is selected
        setJournalingConfig({
          writingEnabled: true,
          audioEnabled: true,
          artEnabled: true,
        });
        setAudioConfig({
          maxRecordingDuration: 180,
          autoDeleteBehavior: "manual",
        });
        setArtConfig({
          undoRedoEnabled: true,
          colorPaletteEnabled: true,
          clearCanvasEnabled: true,
        });
        return;
      }
      
      console.log('Fetching config from:', url);
      const response = await fetch(url, {
        headers: {
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(selectedSchool !== "all" && { "x-school-id": selectedSchool }),
          ...(user?.school?.id && !isSuperAdmin && { "x-school-id": user.school.id }),
        },
      });
      const data: ApiResponse<any> = await response.json();
      console.log('Config API response:', data);
      
      if (data.success && data.data) {
        console.log('Updating config state with:', data.data);
        console.log('Current local state before update:', { journalingConfig, audioConfig, artConfig });
        
        // Update the config state with fetched data
        const newJournalingConfig = { ...journalingConfig };
        const newAudioConfig = { ...audioConfig };
        const newArtConfig = { ...artConfig };
        
        if (data.data.enableWriting !== undefined) {
          newJournalingConfig.writingEnabled = data.data.enableWriting;
          console.log('Set writingEnabled to:', data.data.enableWriting);
        }
        if (data.data.enableAudio !== undefined) {
          newJournalingConfig.audioEnabled = data.data.enableAudio;
          console.log('Set audioEnabled to:', data.data.enableAudio);
        }
        if (data.data.enableArt !== undefined) {
          newJournalingConfig.artEnabled = data.data.enableArt;
          console.log('Set artEnabled to:', data.data.enableArt);
        }
        if (data.data.maxAudioDuration !== undefined) {
          newAudioConfig.maxRecordingDuration = data.data.maxAudioDuration;
          console.log('Set maxRecordingDuration to:', data.data.maxAudioDuration);
        }
        if (data.data.enableUndo !== undefined) {
          newArtConfig.undoRedoEnabled = data.data.enableUndo;
          console.log('Set undoRedoEnabled to:', data.data.enableUndo);
        }
        if (data.data.enableRedo !== undefined) {
          newArtConfig.undoRedoEnabled = data.data.enableRedo;
          console.log('Set undoRedoEnabled to:', data.data.enableRedo);
        }
        if (data.data.enableClearCanvas !== undefined) {
          newArtConfig.clearCanvasEnabled = data.data.enableClearCanvas;
          console.log('Set clearCanvasEnabled to:', data.data.enableClearCanvas);
        }
        // enableColorPalette is not stored in DB yet, so we don't load it from backend
        // if (data.data.enableColorPalette !== undefined) {
        //   newArtConfig.colorPaletteEnabled = data.data.enableColorPalette;
        //   console.log('Set colorPaletteEnabled to:', data.data.enableColorPalette);
        // }
        
        console.log('Final states to set:', { newJournalingConfig, newAudioConfig, newArtConfig });
        setJournalingConfig(newJournalingConfig);
        setAudioConfig(newAudioConfig);
        setArtConfig(newArtConfig);
      } else {
        console.log('Config API returned no data, setting defaults');
        // Set default values if no config exists
        setJournalingConfig({
          writingEnabled: true,
          audioEnabled: true,
          artEnabled: true,
        });
        setAudioConfig({
          maxRecordingDuration: 180,
          autoDeleteBehavior: "manual",
        });
        setArtConfig({
          undoRedoEnabled: true,
          colorPaletteEnabled: true,
          clearCanvasEnabled: true,
        });
      }
      console.log('=== FETCH CONFIG END ===');
    } catch (error) {
      console.error('Failed to fetch journaling config:', error);
      toast({ title: "Error", description: "Failed to fetch journaling config", variant: "destructive" });
    }
  };

  const fetchJournalPrompts = async () => {
    try {
      const url = selectedSchool === "all" 
        ? '/api/admin/journaling/prompts'
        : `/api/admin/journaling/prompts?schoolId=${selectedSchool}`;
      
      const response = await fetch(url, {
        headers: {
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(selectedSchool !== "all" && { "x-school-id": selectedSchool }),
        },
      });
      const data: ApiResponse<JournalPrompt[]> = await response.json();
      if (data.success && data.data) {
        setJournalPrompts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch journal prompts:', error);
      toast({ title: "Error", description: "Failed to fetch journal prompts", variant: "destructive" });
    }
  };

  const fetchJournalMoods = async () => {
    try {
      const response = await fetch('/api/labels/moods', {
        headers: {
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(user?.school?.id && { "x-school-id": user.school.id }),
        },
      });
      const data: ApiResponse<any[]> = await response.json();
      if (data.success && data.data) {
        const moodNames = data.data.map((mood: any) => mood.name);
        setJournalMoods(moodNames);
      }
    } catch (error) {
      console.error('Failed to fetch journal moods:', error);
      toast({ title: "Error", description: "Failed to fetch journal moods", variant: "destructive" });
    }
  };

  const createJournalPrompt = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        text: journalForm.prompt,
        moodIds: journalForm.moods,
        journalTypes: journalForm.journalTypes,
        isEnabled: true
      };

      // Add schoolId based on selection
      if (selectedSchool !== "all") {
        payload.schoolId = selectedSchool;
      }
      // For regular admins, always use their school
      else if (user?.school?.id && !isSuperAdmin) {
        payload.schoolId = user.school.id;
      }

      const response = await fetch('/api/admin/journaling/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(selectedSchool !== "all" && { "x-school-id": selectedSchool }),
          ...(user?.school?.id && !isSuperAdmin && { "x-school-id": user.school.id }),
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<JournalPrompt> = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Journal prompt created successfully" });
        setJournalForm({ prompt: "", moods: [], journalTypes: ["writing"] });
        setIsAddJournalOpen(false);
        await fetchJournalPrompts();
      } else {
        toast({ title: "Error", description: data.error || "Failed to create prompt", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to create journal prompt:', error);
      toast({ title: "Error", description: "Failed to create journal prompt", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateJournalPromptStatus = async (id: string, isEnabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/journaling/prompts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(user?.school?.id && { "x-school-id": user.school.id }),
        },
        body: JSON.stringify({ isEnabled })
      });
      const data: ApiResponse<JournalPrompt> = await response.json();
      if (data.success) {
        toast({ 
          title: isEnabled ? "Prompt Enabled" : "Prompt Disabled",
          description: `Journal prompt has been ${isEnabled ? "enabled" : "disabled"} for students.`
        });
        await fetchJournalPrompts();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update prompt status", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to update journal prompt status:', error);
      toast({ title: "Error", description: "Failed to update prompt status", variant: "destructive" });
    }
  };

  const deleteJournalPrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/journaling/prompts/${id}`, {
        method: 'DELETE',
        headers: {
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(user?.school?.id && { "x-school-id": user.school.id }),
        },
      });
      const data: ApiResponse<null> = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Journal prompt deleted successfully" });
        await fetchJournalPrompts();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete prompt", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to delete journal prompt:', error);
      toast({ title: "Error", description: "Failed to delete prompt", variant: "destructive" });
    }
  };

  const saveJournalingConfig = async (updatedConfig?: JournalingConfig, updatedArtConfig?: ArtJournalingConfig, updatedAudioConfig?: AudioJournalingConfig) => {
    try {
      setIsSavingConfig(true);
      
      // Use the provided updated config or fall back to current state
      const configToSave = updatedConfig || journalingConfig;
      const artConfigToUse = updatedArtConfig || artConfig;
      const audioConfigToUse = updatedAudioConfig || audioConfig;
      
      console.log('=== SAVE JOURNALING CONFIG START ===');
      console.log('configToSave:', configToSave);
      console.log('artConfigToUse:', artConfigToUse);
      console.log('audioConfigToUse:', audioConfigToUse);
      
      const payload: any = {
        enableWriting: configToSave.writingEnabled,
        enableAudio: configToSave.audioEnabled,
        enableArt: configToSave.artEnabled,
        maxAudioDuration: audioConfigToUse.maxRecordingDuration,
        enableUndo: artConfigToUse.undoRedoEnabled,
        enableRedo: artConfigToUse.undoRedoEnabled,
        enableClearCanvas: artConfigToUse.clearCanvasEnabled,
        // enableColorPalette: artConfigToUse.colorPaletteEnabled, // Temporarily disabled - DB schema doesn't support this field yet
      };

      // Add schoolId based on selection
      if (selectedSchool !== "all") {
        payload.schoolId = selectedSchool;
      }
      // For regular admins, always use their school
      else if (user?.school?.id && !isSuperAdmin) {
        payload.schoolId = user.school.id;
      }

      console.log('Final payload being sent to API:', payload);

      const response = await fetch('/api/admin/journaling/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "x-user-id": user?.id || "admin@calmpath.ai",
          ...(selectedSchool !== "all" && { "x-school-id": selectedSchool }),
          ...(user?.school?.id && !isSuperAdmin && { "x-school-id": user.school.id }),
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<any> = await response.json();
      console.log('Save config response:', data);
      
      if (data.success) {
        console.log('Save successful, keeping local state as-is');
        // Don't override local state with server response to prevent toggle reversion
        // The local state should already be correct since we set it before saving
        
        toast({ title: "Success", description: "Journaling configuration saved successfully" });
      } else {
        toast({ title: "Error", description: data.error || "Failed to save configuration", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to save journaling config:', error);
      toast({ title: "Error", description: "Failed to save configuration", variant: "destructive" });
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Load data on component mount and school change
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchJournalingConfig(),
        fetchJournalPrompts(),
        fetchJournalMoods()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, [selectedSchool]); // Only refetch when school selection changes

  // Handlers
  const handleJournalingConfigChange = async (key: keyof JournalingConfig, value: boolean) => {
    console.log('=== TOGGLE CHANGE START ===');
    console.log('handleJournalingConfigChange called:', { key, value, currentConfig: journalingConfig });
    
    // Update local state immediately for UI feedback
    const newConfig = { ...journalingConfig, [key]: value };
    console.log('Local state updated to:', newConfig);
    setJournalingConfig(newConfig);
    
    console.log('State updated, calling saveJournalingConfig with new values');
    await saveJournalingConfig(newConfig); // Pass the updated config directly
    console.log('=== TOGGLE CHANGE END ===');
    
    toast({
      title: value ? "Enabled" : "Disabled",
      description: `${key.replace("Enabled", "")} journaling has been ${value ? "enabled" : "disabled"} for students.`,
    });
  };

  const handleAudioConfigChange = async <K extends keyof AudioJournalingConfig>(key: K, value: AudioJournalingConfig[K]) => {
    const newAudioConfig = { ...audioConfig, [key]: value };
    setAudioConfig(newAudioConfig);
    
    // Create updated config with the new audio settings
    const updatedConfig = {
      ...journalingConfig,
      // Audio settings are mapped from audioConfig in saveJournalingConfig
    };
    
    // Pass the updated audio config directly to avoid race condition
    await saveJournalingConfig(updatedConfig, undefined, newAudioConfig);
    toast({ title: "Settings Updated", description: "Audio journaling configuration has been saved." });
  };

  const handleArtConfigChange = async (key: keyof ArtJournalingConfig, value: boolean) => {
    console.log('=== ART CONFIG CHANGE START ===');
    console.log('Key:', key, 'Value:', value);
    console.log('Current artConfig before update:', artConfig);
    
    const newArtConfig = { ...artConfig, [key]: value };
    console.log('New artConfig after update:', newArtConfig);
    setArtConfig(newArtConfig);
    
    // Save color palette to localStorage if that's what changed
    if (key === 'colorPaletteEnabled') {
      saveColorPaletteToStorage(value);
      console.log('Color palette setting saved to localStorage:', value);
    }
    
    // Create updated config with the new art settings
    const updatedConfig = {
      ...journalingConfig,
      // Art settings are mapped from artConfig in saveJournalingConfig
    };
    
    console.log('Updated config being passed to save:', updatedConfig);
    
    // Pass the updated art config directly to avoid race condition
    await saveJournalingConfig(updatedConfig, newArtConfig);
    console.log('=== ART CONFIG CHANGE END ===');
    
    toast({ title: "Settings Updated", description: "Art journaling configuration has been saved." });
  };

  const handleSaveJournal = async () => {
    await createJournalPrompt();
  };

  const handleTogglePromptStatus = async (id: string, currentStatus: boolean) => {
    await updateJournalPromptStatus(id, !currentStatus);
  };

  const handleDeletePrompt = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this journal prompt? This action cannot be undone.")) {
      await deleteJournalPrompt(id);
    }
  };

  // Role-based permission helpers
  const canManageAllSchools = isSuperAdmin;
  const userSchoolName = user?.school?.name || 'Unknown School';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAutoDeleteLabel = (value: string) => {
    switch (value) {
      case "manual": return "Manual only";
      case "7days": return "After 7 days";
      case "14days": return "After 14 days";
      case "30days": return "After 30 days";
      case "90days": return "After 90 days";
      default: return "Manual only";
    }
  };

  const filteredPrompts = journalPrompts.filter(p => 
    p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.moods.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading journaling tools...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role-based Permission Banner */}
      <div className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        isSuperAdmin 
          ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900" 
          : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900"
      )}>
        {isSuperAdmin ? (
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
        ) : (
          <UserCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        )}
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {isSuperAdmin ? "Super Admin Access" : "School Admin Access"}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {isSuperAdmin 
              ? selectedSchool === "all" 
                ? "Please select a specific school from the dropdown to manage its journaling settings."
                : `You are currently managing journaling settings for: ${schools.find((s: { id: string; name: string }) => s.id === selectedSchool)?.name || selectedSchool}`
              : `You can manage journaling settings for ${userSchoolName} only.`
            }
          </p>
        </div>
      </div>

      {/* Show warning when all schools is selected */}
      {isSuperAdmin && selectedSchool === "all" && (
        <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              School Selection Required
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              To manage journaling settings, please select a specific school from the dropdown above. Configuration changes apply per school.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-4">
        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Privacy Protected</p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Journaling content is private to students and is not accessible or reviewed by administrators.
          </p>
        </div>
      </div>

      {/* Journaling Types Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Journaling Types
          </CardTitle>
          <CardDescription>Enable or disable journaling modes for students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PenTool className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Writing</p>
                  <p className="text-xs text-muted-foreground">Text-based journaling</p>
                </div>
              </div>
              <Switch 
                checked={journalingConfig.writingEnabled}
                onCheckedChange={(v) => handleJournalingConfigChange("writingEnabled", v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Audio</p>
                  <p className="text-xs text-muted-foreground">Voice recordings</p>
                </div>
              </div>
              <Switch 
                checked={journalingConfig.audioEnabled}
                onCheckedChange={(v) => handleJournalingConfigChange("audioEnabled", v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Art-Based</p>
                  <p className="text-xs text-muted-foreground">Drawing & visual art</p>
                </div>
              </div>
              <Switch 
                checked={journalingConfig.artEnabled}
                onCheckedChange={(v) => handleJournalingConfigChange("artEnabled", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Journaling Configuration */}
      {journalingConfig.audioEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Audio Journaling Settings
            </CardTitle>
            <CardDescription>Configure audio recording parameters (content is never accessible to admins)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Maximum Recording Duration
                </Label>
                <Select 
                  value={audioConfig.maxRecordingDuration.toString()} 
                  onValueChange={(v) => handleAudioConfigChange("maxRecordingDuration", parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue>{formatDuration(audioConfig.maxRecordingDuration)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1:00 (1 minute)</SelectItem>
                    <SelectItem value="120">2:00 (2 minutes)</SelectItem>
                    <SelectItem value="180">3:00 (3 minutes)</SelectItem>
                    <SelectItem value="300">5:00 (5 minutes)</SelectItem>
                    <SelectItem value="600">10:00 (10 minutes)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Maximum length for each audio recording</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Trash className="h-4 w-4 text-muted-foreground" />
                  Auto-Delete Behavior
                </Label>
                <Select 
                  value={audioConfig.autoDeleteBehavior} 
                  onValueChange={(v: AudioJournalingConfig["autoDeleteBehavior"]) => handleAudioConfigChange("autoDeleteBehavior", v)}
                >
                  <SelectTrigger>
                    <SelectValue>{getAutoDeleteLabel(audioConfig.autoDeleteBehavior)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual only (student deletes)</SelectItem>
                    <SelectItem value="7days">Auto-delete after 7 days</SelectItem>
                    <SelectItem value="14days">Auto-delete after 14 days</SelectItem>
                    <SelectItem value="30days">Auto-delete after 30 days</SelectItem>
                    <SelectItem value="90days">Auto-delete after 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">When audio recordings are automatically removed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Art Journaling Configuration */}
      {journalingConfig.artEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Art Journaling Settings
            </CardTitle>
            <CardDescription>Configure canvas tools for art journaling (drawings are never visible to admins)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enable or disable canvas tools globally</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Undo className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Undo / Redo</span>
                  </div>
                  <Switch 
                    checked={artConfig.undoRedoEnabled}
                    onCheckedChange={(v) => {
                      console.log('Undo/Redo toggle clicked, value:', v);
                      console.log('Current artConfig before update:', artConfig);
                      handleArtConfigChange("undoRedoEnabled", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Color Palette</span>
                  </div>
                  <Switch 
                    checked={artConfig.colorPaletteEnabled}
                    onCheckedChange={(v) => {
                      console.log('Color Palette toggle clicked, value:', v);
                      handleArtConfigChange("colorPaletteEnabled", v);
                    }}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Clear Canvas</span>
                  </div>
                  <Switch 
                    checked={artConfig.clearCanvasEnabled}
                    onCheckedChange={(v) => {
                      console.log('Clear Canvas toggle clicked, value:', v);
                      handleArtConfigChange("clearCanvasEnabled", v);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Mood-Based Prompts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Mood-Based Prompts</h3>
            <p className="text-sm text-muted-foreground">
              Manage prompts for writing and art journaling. Prompts can be reused across journaling types.
            </p>
          </div>
        </div>
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search prompts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className={cn("transition-all duration-200", !prompt.isEnabled && "opacity-60")}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1">
                    {prompt.moods.map((mood) => (
                      <Badge key={mood} variant="outline" className="text-xs">{mood}</Badge>
                    ))}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2"><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem 
                        className="gap-2 text-destructive" 
                        onClick={() => handleDeletePrompt(prompt.id)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground mb-3">{prompt.prompt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {prompt.journalTypes.includes("writing") && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <PenTool className="h-3 w-3" />
                        Writing
                      </Badge>
                    )}
                    {prompt.journalTypes.includes("art") && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Palette className="h-3 w-3" />
                        Art
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Power className={cn("h-4 w-4", prompt.isEnabled ? "text-success" : "text-muted-foreground")} />
                    <Switch 
                      checked={prompt.isEnabled} 
                      onCheckedChange={() => handleTogglePromptStatus(prompt.id, prompt.isEnabled)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Journal Prompt Dialog */}
      <Dialog open={isAddJournalOpen} onOpenChange={setIsAddJournalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Journal Prompt</DialogTitle>
            <DialogDescription>Create a new prompt for student journaling. Prompts can be used across writing and art journaling.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Prompt</Label>
              <Textarea 
                placeholder="Enter the journal prompt..."
                value={journalForm.prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setJournalForm((prev: any) => ({ ...prev, prompt: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Journaling Type(s)</Label>
              <div className="flex gap-2">
                {["writing", "art"].map((type) => (
                  <Button
                    key={type}
                    variant={journalForm.journalTypes.includes(type as "writing" | "art") ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (journalForm.journalTypes.includes(type as "writing" | "art")) {
                        setJournalForm((prev: any) => ({ ...prev, journalTypes: prev.journalTypes.filter((t: string) => t !== type) }));
                      } else {
                        setJournalForm((prev: any) => ({ ...prev, journalTypes: [...prev.journalTypes, type as "writing" | "art"] }));
                      }
                    }}
                  >
                    {type === "writing" ? <PenTool className="h-4 w-4 mr-1" /> : <Palette className="h-4 w-4 mr-1" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Mood(s)</Label>
              <div className="flex flex-wrap gap-2">
                {journalMoods.map((mood) => (
                  <Button
                    key={mood}
                    variant={journalForm.moods.includes(mood) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (journalForm.moods.includes(mood)) {
                        setJournalForm((prev: any) => ({ ...prev, moods: prev.moods.filter((m: string) => m !== mood) }));
                      } else {
                        setJournalForm((prev: any) => ({ ...prev, moods: [...prev.moods, mood] }));
                      }
                    }}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddJournalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveJournal} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Prompt"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
