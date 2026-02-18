import React, { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Upload, Play, Music, X, Check, ChevronDown, Loader2, Headphones, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { useAuth } from "@/src/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/src/hooks/use-toast";
import { 
  MusicResource, 
  ApiResponse, 
  PaginatedResponse,
  defaultMusicMoods,
  defaultMusicGoals
} from "./types";

interface MusicToolsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAddMusicTrackOpen?: boolean;
  setIsAddMusicTrackOpen?: (open: boolean) => void;
  isAddMusicCategoryOpen?: boolean;
  setIsAddMusicCategoryOpen?: (open: boolean) => void;
}

export default function MusicTools({ 
  searchQuery, 
  setSearchQuery, 
  isAddMusicTrackOpen = false, 
  setIsAddMusicTrackOpen,
  isAddMusicCategoryOpen = false, 
  setIsAddMusicCategoryOpen 
}: MusicToolsProps) {
  const { toast } = useToast();
  const { user } = useAuth(); // Add auth context
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data states
  const [musicResources, setMusicResources] = useState<MusicResource[]>([]);
  
  // Lists management
  const [musicMoods, setMusicMoods] = useState<string[]>(defaultMusicMoods);
  const [musicGoals, setMusicGoals] = useState<string[]>(defaultMusicGoals);
  const [musicCategories, setMusicCategories] = useState<string[]>([]);
  const [musicCategoriesMap, setMusicCategoriesMap] = useState<{[key: string]: string}>({});
  const [musicGoalsMap, setMusicGoalsMap] = useState<{[key: string]: string}>({});
  
  // Form states
  const [musicForm, setMusicForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    url: "",
    audioUrl: "",
    duration: "",
    artist: "",
    album: "",
    coverImage: "",
    thumbnail: "",
    isPublic: true,
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    category: "",
    supportedMoods: [] as string[],
    goal: ""
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE"
  });

  // Additional states
  const [isMusicMoodPopoverOpen, setIsMusicMoodPopoverOpen] = useState(false);
  const [isMusicGoalPopoverOpen, setIsMusicGoalPopoverOpen] = useState(false);
  const [newMood, setNewMood] = useState("");
  const [newGoal, setNewGoal] = useState("");
  
  // Edit states
  const [selectedMusicResource, setSelectedMusicResource] = useState<MusicResource | null>(null);
  const [isEditMusicTrackOpen, setIsEditMusicTrackOpen] = useState(false);
  
  // Instructions state
  const [musicInstructions, setMusicInstructions] = useState<{
    title?: string;
    points?: string[];
    proTip?: string;
  } | null>(null);
  
  // Instructions modal state
  const [isEditMusicInstructionsOpen, setIsEditMusicInstructionsOpen] = useState(false);
  const [instructionsForm, setInstructionsForm] = useState({
    title: "",
    points: [""],
    proTip: ""
  });
  
  // Dialog states
  const [isAddMusicModalOpen, setIsAddMusicModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  // API Functions
  const fetchMoods = async () => {
    try {
      const response = await fetch('/api/admin/music/moods');
      const data: ApiResponse<any[]> = await response.json();
      if (data.success && data.data) {
        const moodNames = data.data.map((mood: any) => mood.name);
        setMusicMoods(moodNames);
      }
    } catch (error) {
      console.error('Failed to fetch music moods:', error);
      toast({ title: "Error", description: "Failed to fetch music moods", variant: "destructive" });
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/labels/goals');
      const data: ApiResponse<any[]> = await response.json();
      if (data.success && data.data) {
        const goalNames = data.data.map((goal: any) => goal.name);
        const goalMap: {[key: string]: string} = {};
        data.data.forEach((goal: any) => {
          goalMap[goal.name] = goal.id;
        });
        setMusicGoals(goalNames);
        setMusicGoalsMap(goalMap);
      }
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast({ title: "Error", description: "Failed to fetch goals", variant: "destructive" });
    }
  };

  const fetchMusicCategories = async () => {
    try {
      const response = await fetch('/api/admin/music/categories');
      const data: ApiResponse<any[]> = await response.json();
      if (data.success && data.data) {
        const categoryNames = data.data.map((category: any) => category.name);
        const categoryMap: {[key: string]: string} = {};
        data.data.forEach((category: any) => {
          categoryMap[category.name] = category.id;
        });
        setMusicCategories(categoryNames);
        setMusicCategoriesMap(categoryMap);
      }
    } catch (error) {
      console.error('Failed to fetch music categories:', error);
      toast({ title: "Error", description: "Failed to fetch music categories", variant: "destructive" });
    }
  };

  const fetchMusicInstructions = async () => {
    try {
      const response = await fetch('/api/admin/music/instructions');
      const data: ApiResponse<any> = await response.json();
      
      if (data.success && data.data) {
        // Handle both single instruction and array of instructions
        const instruction = Array.isArray(data.data) ? data.data[0] : data.data;
        if (instruction) {
          setMusicInstructions({
            title: instruction.title,
            points: instruction.steps?.map((step: any) => step.description) || [],
            proTip: instruction.proTip
          });
        }
      } else {
        console.log('No music instruction data found');
      }
    } catch (error) {
      console.error('Failed to fetch music instructions:', error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch music instructions",
        variant: "destructive" 
      });
    }
  };

  const fetchMusicResources = async () => {
    try {
      const response = await fetch('/api/admin/music/resources?page=1&limit=20');
      const data: PaginatedResponse<MusicResource> = await response.json();
      if (data.success && data.data?.resources) {
        setMusicResources(data.data.resources);
      }
    } catch (error) {
      console.error('Failed to fetch music resources:', error);
      toast({ title: "Error", description: "Failed to fetch music resources", variant: "destructive" });
    }
  };

  const updateMusicResourceStatus = async (id: string, status: 'PUBLISHED' | 'DRAFT') => {
    try {
      const cleanPayload: any = {
        id,
        status
      };
      
      console.log('Updating music status:', { id, status, cleanPayload });
      
      const response = await fetch(`/api/admin/music/resources/${id}?id=${id}`, {
        method: 'PATCH', // Music API uses PATCH, not PUT
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai', // Dynamic user ID from auth context
          ...(user?.school?.id && { 'x-school-id': user.school.id }) // Dynamic school ID from auth context
        },
        body: JSON.stringify({ status }) // Only send status in body, not id
      });
      
      console.log('Response status:', response.status);
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error('Response not ok:', response.statusText);
        toast({ title: "Error", description: "Failed to update resource: " + response.statusText, variant: "destructive" });
        return;
      }
      
      const data: ApiResponse<MusicResource> = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        toast({ title: "Success", description: `Music resource ${status.toLowerCase()} successfully` });
        await fetchMusicResources();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update resource", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to update music resource:', error);
      toast({ title: "Error", description: "Failed to update music resource", variant: "destructive" });
    }
  };

  const deleteMusicResource = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/music/resources/${id}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || 'admin@calmpath.ai', // Dynamic user ID from auth context
          ...(user?.school?.id && { 'x-school-id': user.school.id }) // Dynamic school ID from auth context
        }
      });
      const data: ApiResponse<null> = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Music resource deleted successfully" });
        await fetchMusicResources();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete resource", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to delete music resource:', error);
      toast({ title: "Error", description: "Failed to delete music resource", variant: "destructive" });
    }
  };

  const createMusicResource = async () => {
    setIsSubmitting(true);
    try {
      const durationInSeconds = musicForm.duration ? parseDurationToSeconds(musicForm.duration) : undefined;
      
      const audioUrl = musicForm.audioUrl || musicForm.url;
      if (!audioUrl) {
        toast({ title: "Error", description: "Please upload an audio file", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (!musicForm.title.trim()) {
        toast({ title: "Error", description: "Title is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      const finalUrl = audioUrl.startsWith('blob:') ? 'https://placeholder.audio/file.mp3' : audioUrl;
      
      const payload: any = {
        title: musicForm.title,
        url: finalUrl,
        isPublic: musicForm.isPublic,
        status: musicForm.status,
      };
      
      if (musicForm.description?.trim()) payload.description = musicForm.description;
      if (durationInSeconds !== undefined) payload.duration = durationInSeconds;
      if (musicForm.artist?.trim()) payload.artist = musicForm.artist;
      if (musicForm.album?.trim()) payload.album = musicForm.album;
      if (musicForm.coverImage?.trim()) payload.coverImage = musicForm.coverImage;
      if (musicForm.category && musicCategoriesMap[musicForm.category]) {
        payload.categoryIds = [musicCategoriesMap[musicForm.category]];
      }
      if (musicForm.goal && musicGoalsMap[musicForm.goal]) {
        payload.goalIds = [musicGoalsMap[musicForm.goal]];
      }

      // Only add schoolId if user has a school
      if (user?.school?.id) {
        payload.schoolId = user.school.id;
      }

      const response = await fetch('/api/admin/music/resources', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai', // Dynamic user ID from auth context
          ...(user?.school?.id && { 'x-school-id': user.school.id }) // Dynamic school ID from auth context
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<MusicResource> = await response.json();
      
      if (data.success) {
        toast({ title: "Success", description: "Music resource created successfully" });
        setMusicForm({
          title: "",
          subtitle: "",
          description: "",
          url: "",
          audioUrl: "",
          duration: "",
          artist: "",
          album: "",
          coverImage: "",
          thumbnail: "",
          isPublic: true,
          status: "DRAFT",
          category: "",
          supportedMoods: [],
          goal: ""
        });
        setIsAddMusicTrackOpen?.(false);
        await fetchMusicResources();
      } else {
        toast({ title: "Error", description: data.error || "Failed to create music resource", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to create music resource:', error);
      toast({ title: "Error", description: "Failed to create music resource", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createMusicCategory = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/music/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai', // Dynamic user ID from auth context
          ...(user?.school?.id && { 'x-school-id': user.school.id }) // Dynamic school ID from auth context
        },
        body: JSON.stringify(categoryForm)
      });
      const data: ApiResponse<any> = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "Music category created successfully" });
        setCategoryForm({
          name: "",
          description: "",
          icon: "",
          color: "#3B82F6",
          status: "ACTIVE"
        });
        setIsAddMusicCategoryOpen?.(false);
        await fetchMusicCategories();
      } else {
        toast({ title: "Error", description: data.error || "Failed to create category", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to create music category:', error);
      toast({ title: "Error", description: "Failed to create music category", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editMusicResource = (resource: MusicResource) => {
    setSelectedMusicResource(resource);
    setMusicForm({
      title: resource.title || "",
      subtitle: resource.subtitle || "",
      description: "", // MusicResource doesn't have description
      url: "", // MusicResource doesn't have url
      audioUrl: "", // MusicResource doesn't have audioUrl
      duration: resource.duration || "",
      artist: "", // MusicResource doesn't have artist
      album: "", // MusicResource doesn't have album
      coverImage: resource.thumbnail || "",
      thumbnail: resource.thumbnail || "",
      isPublic: resource.isPublic || true,
      status: resource.status || "DRAFT",
      category: "",
      supportedMoods: [],
      goal: ""
    });
    setIsEditMusicTrackOpen(true);
  };

  const updateMusicResource = async () => {
    if (!selectedMusicResource) return;
    
    setIsSubmitting(true);
    try {
      const durationInSeconds = musicForm.duration ? parseDurationToSeconds(musicForm.duration) : undefined;
      
      const audioUrl = musicForm.audioUrl || musicForm.url;
      if (!audioUrl) {
        toast({ title: "Error", description: "Please upload an audio file", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      if (!musicForm.title.trim()) {
        toast({ title: "Error", description: "Title is required", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
      
      const finalUrl = audioUrl.startsWith('blob:') ? 'https://placeholder.audio/file.mp3' : audioUrl;
      
      const payload: any = {
        id: selectedMusicResource.id,
        title: musicForm.title,
        url: finalUrl,
        isPublic: musicForm.isPublic,
        status: musicForm.status,
      };
      
      if (musicForm.description?.trim()) payload.description = musicForm.description;
      if (durationInSeconds !== undefined) payload.duration = durationInSeconds;
      if (musicForm.artist?.trim()) payload.artist = musicForm.artist;
      if (musicForm.album?.trim()) payload.album = musicForm.album;
      if (musicForm.coverImage?.trim()) payload.coverImage = musicForm.coverImage;
      if (musicForm.category && musicCategoriesMap[musicForm.category]) {
        payload.categoryIds = [musicCategoriesMap[musicForm.category]];
      }
      if (musicForm.goal && musicGoalsMap[musicForm.goal]) {
        payload.goalIds = [musicGoalsMap[musicForm.goal]];
      }

      // Only add schoolId if user has a school
      if (user?.school?.id) {
        payload.schoolId = user.school.id;
      }

      const response = await fetch(`/api/admin/music/resources/${selectedMusicResource.id}?id=${selectedMusicResource.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai', // Dynamic user ID from auth context
          ...(user?.school?.id && { 'x-school-id': user.school.id }) // Dynamic school ID from auth context
        },
        body: JSON.stringify(payload)
      });
      const data: ApiResponse<MusicResource> = await response.json();
      
      if (data.success) {
        toast({ title: "Success", description: "Music resource updated successfully" });
        setIsEditMusicTrackOpen(false);
        setSelectedMusicResource(null);
        setMusicForm({
          title: "",
          subtitle: "",
          description: "",
          url: "",
          audioUrl: "",
          duration: "",
          artist: "",
          album: "",
          coverImage: "",
          thumbnail: "",
          isPublic: true,
          status: "DRAFT",
          category: "",
          supportedMoods: [],
          goal: ""
        });
        await fetchMusicResources();
      } else {
        toast({ title: "Error", description: data.error || "Failed to update music resource", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to update music resource:', error);
      toast({ title: "Error", description: "Failed to update music resource", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility function to format duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchMusicResources(),
        fetchMoods(),
        fetchGoals(),
        fetchMusicCategories(),
        fetchMusicInstructions()
      ]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Utility functions
  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return parseInt(duration) || 0;
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setMusicForm(prev => ({ ...prev, thumbnail: result }));
          toast({ title: "Thumbnail Uploaded", description: "Thumbnail image uploaded successfully" });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const audioUrl = URL.createObjectURL(file);
      
      const audio = new Audio();
      audio.src = audioUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audio.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const durationString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        setMusicForm(prev => ({ 
          ...prev, 
          audioUrl: audioUrl,
          duration: durationString
        }));
      });
      
      audio.addEventListener('error', () => {
        // Fallback duration estimate
        const durationString = `${Math.floor(file.size / 100000)}s`;
        setMusicForm(prev => ({ 
          ...prev, 
          audioUrl: audioUrl,
          duration: durationString
        }));
      });
      
      toast({ title: "Audio Uploaded", description: `Audio file "${file.name}" uploaded successfully` });
    }
  };

  const handleEditInstructions = async (type: string) => {
    if (musicInstructions) {
      // Populate form with existing instructions
      setInstructionsForm({
        title: musicInstructions.title || "",
        points: musicInstructions.points || [""],
        proTip: musicInstructions.proTip || ""
      });
    } else {
      // Reset form for new instructions
      setInstructionsForm({
        title: "",
        points: [""],
        proTip: ""
      });
    }
    setIsEditMusicInstructionsOpen(true);
  };

  const handleDeleteMusicStep = async (stepIndex: number) => {
    try {
      if (!musicInstructions) return;
      
      // Remove step from current instruction
      const updatedPoints = musicInstructions.points?.filter((_, i) => i !== stepIndex) || [];
      
      // Update the form and save to database
      setInstructionsForm((prev) => ({
        ...prev,
        points: updatedPoints,
      }));

      // Save the updated instruction
      const steps = updatedPoints
        .filter((point) => point.trim() !== "")
        .map((point, index) => ({
          stepNumber: index + 1,
          title: `Step ${index + 1}`,
          description: point
        }));

      const response = await fetch('/api/admin/music/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai',
          ...(user?.school?.id && { 'x-school-id': user.school.id })
        },
        body: JSON.stringify({
          title: musicInstructions.title,
          description: musicInstructions.title,
          steps: steps,
          proTip: musicInstructions.proTip,
          difficulty: "BEGINNER",
          status: "PUBLISHED"
        }),
      });

      if (response.ok) {
        // Update local state
        setMusicInstructions((prev) => ({
          ...prev!,
          points: updatedPoints,
        }));
        
        toast({
          title: "Step Deleted",
          description: "The music instruction step has been removed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete step",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete music step:", error);
      toast({
        title: "Error",
        description: "Failed to delete step",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInstructions = async () => {
    try {
      // Delete ALL music instructions from database
      const response = await fetch('/api/admin/music/instructions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai',
          ...(user?.school?.id && { 'x-school-id': user.school.id })
        }
      });
      
      if (response.ok) {
        setMusicInstructions(null);
        toast({ 
          title: "All Instructions Deleted", 
          description: "All music listening instructions have been removed" 
        });
      } else {
        toast({ 
          title: "Error", 
          description: "Failed to delete instructions",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Failed to delete music instructions:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete instructions",
        variant: "destructive" 
      });
    }
  };

  const handleDeleteInstructionsClick = () => {
    handleDeleteInstructions();
  };

  const addInstructionPoint = () => {
    setInstructionsForm(prev => ({
      ...prev,
      points: [...prev.points, ""]
    }));
  };

  const removeInstructionPoint = (index: number) => {
    setInstructionsForm(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const updateInstructionPoint = (index: number, value: string) => {
    setInstructionsForm(prev => ({
      ...prev,
      points: prev.points.map((point, i) => i === index ? value : point)
    }));
  };

  const handleSaveInstructions = async (type: string) => {
    try {
      const steps = instructionsForm.points
        .filter(point => point.trim() !== "")
        .map((point, index) => ({
          stepNumber: index + 1,
          title: `Step ${index + 1}`,
          description: point
        }));

      const response = await fetch('/api/admin/music/instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'admin@calmpath.ai',
          ...(user?.school?.id && { 'x-school-id': user.school.id })
        },
        body: JSON.stringify({
          title: instructionsForm.title || "Listening Instructions",
          description: instructionsForm.title || "Music listening instructions for therapy sessions",
          steps,
          difficulty: "BEGINNER",
          status: "PUBLISHED",
          proTip: instructionsForm.proTip || null
        })
      });

      const data = await response.json();
      if (data.success) {
        setMusicInstructions({
          title: data.data.title,
          points: data.data.steps.map((step: any) => step.description),
          proTip: instructionsForm.proTip || undefined
        });
        
        setIsEditMusicInstructionsOpen(false);
        toast({ 
          title: "Instructions Saved", 
          description: "Music listening instructions have been saved" 
        });
      } else {
        throw new Error(data.error || "Failed to save instructions");
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to save instructions" 
      });
    }
  };

  const filteredMusicResources = musicResources.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.categories?.some(c => c.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading music resources...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <Input 
          placeholder="Search music..."
          className="pl-9"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMusicResources.map((resource) => (
          <Card key={resource.id} className={cn("transition-all duration-200 hover:shadow-card-hover", resource.status === "DRAFT" && "opacity-60")}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center">
                    <Music className="h-6 w-6 text-[#3B82F6]" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <CardDescription className="text-xs">{resource.subtitle || "Music resource"}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2"><Eye className="h-4 w-4" /> Preview</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => editMusicResource(resource)}><Edit className="h-4 w-4" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-[#EF4444]" 
                      onClick={() => deleteMusicResource(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-3">
                {resource.categories?.map((cat) => (
                  <Badge key={cat.category.name} variant="outline" className="text-xs">{cat.category.name}</Badge>
                ))}
                {resource.duration && <span className="text-xs text-[#64748B]">{resource.duration}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#64748B]">{resource.learnerCount || 0} learners</span>
                <div className="flex items-center gap-2">
                  <Badge variant={resource.status === "PUBLISHED" ? "default" : "secondary"} className="text-xs">
                    {resource.status.toLowerCase()}
                  </Badge>
                  <Switch 
                    checked={resource.status === "PUBLISHED"} 
                    onCheckedChange={() => updateMusicResourceStatus(resource.id, resource.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredMusicResources.length === 0 && (
          <div className="col-span-full text-center py-8">
            <Music className="h-12 w-12 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-[#94A3B8]">No music resources found</p>
          </div>
        )}
      </div>

      {/* Music Instructions Section */}
      <Card className="border-[#3B82F6]/20 bg-gradient-to-r from-[#3B82F6]/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#3B82F6]/10 flex items-center justify-center">
                <Headphones className="h-5 w-5 text-[#3B82F6]" />
              </div>
              <div>
                <CardTitle className="text-base">{musicInstructions?.title || "Listening Instructions"}</CardTitle>
                <CardDescription className="text-xs">Global instructions shown to all learners</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {musicInstructions ? (
                <>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleEditInstructions("music")}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-[#EF4444] hover:text-[#EF4444]" onClick={handleDeleteInstructionsClick}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleEditInstructions("music")}>
                  <Plus className="h-4 w-4" />
                  Add Instructions
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {musicInstructions && (
          <CardContent className="pt-0">
            <ul className="space-y-2 mb-3">
              {(musicInstructions.points || []).map((point, i) => (
                <li key={i} className="flex items-start justify-between gap-2 text-sm text-[#1E293B]">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] mt-2 shrink-0" />
                    {point}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-[#EF4444] hover:text-[#EF4444] hover:bg-[#EF4444]/10"
                    onClick={() => handleDeleteMusicStep(i)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
            {musicInstructions.proTip && (
              <div className="flex items-start gap-2 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30 p-3">
                <Lightbulb className="h-4 w-4 text-[#D97706] mt-0.5 shrink-0" />
                <p className="text-sm text-[#92400E]">
                  <span className="font-medium">Pro Tip:</span> {musicInstructions.proTip}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Add Music Modal */}
      <Dialog open={isAddMusicTrackOpen} onOpenChange={setIsAddMusicTrackOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-[#FFFFFF] overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b border-[#E2E8F0]">
            <DialogTitle className="text-xl ">Add Music Resource</DialogTitle>
            <DialogDescription className="text-[#64748B] mt-[-6px]">Create a new music therapy resource for learners.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 border-r border-[#E2E8F0] space-y-4">
              <div className="space-y-2">
                <Label >Thumbnail</Label>
                <div 
                  className="border-2 mt-[8px] border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50"
                  onClick={() => document.getElementById('music-thumb')?.click()}
                >
                  {musicForm.thumbnail ? (
                    <img src={musicForm.thumbnail} alt="Thumbnail" className="w-full h-24 object-cover rounded" />
                  ) : (
                    <div className="space-y-1">
                      <Upload className="h-6 w-6 mx-auto text-[#65758b]" />
                      <p className="text-xs text-[#65758b]">Upload thumbnail</p>
                    </div>
                  )}
                  <input id="music-thumb" type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={musicForm.title} onChange={(e) => setMusicForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Resource title" />
              </div>
              <div className="grid gap-2">
                <Label>Subtitle</Label>
                <Input value={musicForm.subtitle} onChange={(e) => setMusicForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Short subtitle" />
              </div>
              <div className="grid gap-2">
                <Label>Upload Audio</Label>
                <div 
                  className={`relative border-2 border-dashed ${musicForm.audioUrl ? 'border-[#3B82F6]/20 bg-[#3B82F6]/5' : 'border-[#E2E8F0] rounded-lg'} p-6 text-center cursor-pointer transition-all duration-200 hover:border-[#3B82F6]/50`}
                  onClick={() => document.getElementById('music-audio')?.click()}
                >
                  {musicForm.audioUrl ? (
                    <div className="space-y-2">
                      <audio 
                        src={musicForm.audioUrl} 
                        className="w-full h-16 rounded-md"
                        controls
                      />
                      <div className="flex items-center justify-center text-xs text-[#65758b]">
                        <Music className="h-4 w-4 mr-1" />
                        <span>Audio uploaded successfully</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Music className="h-8 w-8 mx-auto text-[#65758b]" />
                      <p className="text-xs text-[#65758b] mt-1">Click to upload audio file</p>
                    </div>
                  )}
                  <input 
                    id="music-audio" 
                    type="file" 
                    accept="audio/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleAudioUpload} 
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Duration: {musicForm.duration}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={musicForm.category} onValueChange={(v) => setMusicForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {musicCategories.map(c => <SelectItem key={c} value={c} className="hover:bg-[#F8FAFC]">{c} </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={musicForm.status} onValueChange={(v: "DRAFT" | "PUBLISHED") => setMusicForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="DRAFT" className="hover:bg-[#F8FAFC]">Draft</SelectItem>
                      <SelectItem value="PUBLISHED"className="hover:bg-[#F8FAFC]">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Supported Moods</Label>
                  <Popover open={isMusicMoodPopoverOpen} onOpenChange={setIsMusicMoodPopoverOpen}>
                    <PopoverTrigger asChild className="bg-white">
                      <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                        <div className="flex flex-wrap gap-1">
                          {musicForm.supportedMoods && musicForm.supportedMoods.length > 0 ? musicForm.supportedMoods.map((mood) => (
                            <Badge key={mood} variant="secondary" className="text-xs">
                              {mood}
                              <span
                                className="ml-1 hover:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMusicForm(prev => ({ ...prev, supportedMoods: prev.supportedMoods?.filter(m => m !== mood) }));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </Badge>
                          )) : <span className="text-[#94A3B8]">Select moods...</span>}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 border bg-white shadow-xl rounded-[6px]" align="start">
                      <div className="space-y-2">
                        {musicMoods.map((mood) => (
                          <div key={mood} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted" onClick={() => {
                            if (musicForm.supportedMoods?.includes(mood)) {
                              setMusicForm(prev => ({ ...prev, supportedMoods: prev.supportedMoods?.filter(m => m !== mood) }));
                            } else {
                              setMusicForm(prev => ({ ...prev, supportedMoods: [...(prev.supportedMoods || []), mood] }));
                            }
                          }}>
                            <div className={`h-4 w-4 border rounded flex items-center justify-center ${musicForm.supportedMoods?.includes(mood) ? 'bg-primary border-primary' : 'border-input'}`}>
                              {musicForm.supportedMoods?.includes(mood) && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{mood}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex gap-2">
                            <Input placeholder="Add new mood..." value={newMood} onChange={(e) => setNewMood(e.target.value)} className="h-8 text-sm" onClick={(e) => e.stopPropagation()} />
                            <Button size="sm" className="h-8" onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (newMood.trim() && !musicMoods.includes(newMood.trim())) { 
                                try {
                                  const response = await fetch('/api/admin/music/moods', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: newMood.trim(), status: 'ACTIVE' })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setMusicMoods(prev => [...prev, newMood.trim()]); 
                                    toast({ title: "Music Mood Added" }); 
                                    setNewMood(""); 
                                  } else {
                                    toast({ title: "Error", description: result.error || "Failed to create music mood", variant: "destructive" });
                                  }
                                } catch (error) {
                                  console.error('Error creating music mood:', error);
                                  toast({ title: "Error", description: "Failed to create music mood", variant: "destructive" });
                                }
                              } 
                            }}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Goal</Label>
                  <Popover open={isMusicGoalPopoverOpen} onOpenChange={setIsMusicGoalPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between hover:bg-gray-200">
                        <span className={musicForm.goal ? "" : "text-muted-foreground"}>{musicForm.goal || "Select goal..."}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 border bg-white shadow-xl rounded-[6px]" align="start">
                      <div className="space-y-2">
                        {musicGoals.map((goal) => (
                          <div key={goal} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted" onClick={() => { setMusicForm(prev => ({ ...prev, goal })); setIsMusicGoalPopoverOpen(false); }}>
                            <div className={`h-4 w-4 border rounded-full flex items-center justify-center ${musicForm.goal === goal ? 'bg-primary border-primary' : 'border-input'}`}>
                              {musicForm.goal === goal && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex gap-2">
                            <Input placeholder="Add new goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="h-8 text-sm" onClick={(e) => e.stopPropagation()} />
                            <Button size="sm" className="h-8" onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (newGoal.trim() && !musicGoals.includes(newGoal.trim())) { 
                                try {
                                  const response = await fetch('/api/labels/goals', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: newGoal.trim(), status: 'active' })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setMusicGoals(prev => [...prev, newGoal.trim()]); 
                                    toast({ title: "Goal Added" }); 
                                    setNewGoal(""); 
                                  } else {
                                    toast({ title: "Error", description: result.error || "Failed to create goal", variant: "destructive" });
                                  }
                                } catch (error) {
                                  console.error('Error creating goal:', error);
                                  toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
                                }
                              } 
                            }}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/30">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Live Preview</h3>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center">
                  {musicForm.thumbnail ? <img src={musicForm.thumbnail} alt="" className="w-full h-full object-cover" /> : <Music className="h-10 w-10 text-[#3B82F6]/40" />}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground">{musicForm.title || "Resource Title"}</h4>
                  <p className="text-sm text-muted-foreground">{musicForm.subtitle || "Subtitle"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {musicForm.category && <Badge variant="outline" className="text-xs">{musicForm.category}</Badge>}
                    <span className="text-xs text-muted-foreground">{musicForm.duration}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-[#334155]/5 rounded-lg p-3">
                    {musicForm.audioUrl && (
                      <audio 
                        src={musicForm.audioUrl} 
                        className="hidden" 
                        onLoadedMetadata={(e) => {
                          const audio = e.target as HTMLAudioElement;
                          const duration = Math.floor(audio.duration);
                          setMusicForm(prev => ({ ...prev, duration: `${duration}s` }));
                        }}
                      />
                    )}
                    <div className="h-8 w-8 rounded-full bg-[#3B82F6] flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          const audio = document.querySelector('audio') as HTMLAudioElement;
                          if (audio) {
                            if (audio.paused) {
                              audio.play();
                            } else {
                              audio.pause();
                            }
                          }
                        }}
                        className="h-8 w-8 rounded-full bg-[#3B82F6] flex items-center justify-center text-white hover:bg-[#2c3e50] transition-colors duration-200"
                      >
                        <Play className="h-4 w-4 text-[#FFFFFF]" />
                      </button>
                    </div>
                    <div className="flex-1 h-1 bg-[#334155] rounded-full">
                      <div className="h-full w-1/3 bg-[#3B82F6] rounded-full" />
                    </div>
                    <span className="text-xs text-muted-foreground">{musicForm.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddMusicTrackOpen?.(false)}>Cancel</Button>
            <Button onClick={createMusicResource} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Music Modal */}
      <Dialog open={isEditMusicTrackOpen} onOpenChange={setIsEditMusicTrackOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] bg-white overflow-y-auto p-0">
          <DialogHeader className="p-6 border-b border-border">
            <DialogTitle className="text-xl ">Edit Music Resource</DialogTitle>
            <DialogDescription className='text-[#65758b] mt-[-6px]'>Update the details of this music therapy resource.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-6 border-r border-border space-y-4">
              <div className="space-y-2">
                <Label >Thumbnail</Label>
                <div 
                  className="border-2 mt-[8px] border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50"
                  onClick={() => document.getElementById('edit-music-thumb')?.click()}
                >
                  {musicForm.thumbnail ? (
                    <img src={musicForm.thumbnail} alt="Thumbnail" className="w-full h-24 object-cover rounded" />
                  ) : (
                    <div className="space-y-1">
                      <Upload className="h-6 w-6 mx-auto text-[#65758b]" />
                      <p className="text-xs text-[#65758b]">Upload thumbnail</p>
                    </div>
                  )}
                  <input id="edit-music-thumb" type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input value={musicForm.title} onChange={(e) => setMusicForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Resource title" />
              </div>
              <div className="grid gap-2">
                <Label>Subtitle</Label>
                <Input value={musicForm.subtitle} onChange={(e) => setMusicForm(prev => ({ ...prev, subtitle: e.target.value }))} placeholder="Short subtitle" />
              </div>
              <div className="grid gap-2">
                <Label>Upload Audio</Label>
                <div 
                  className={`relative border-2 border-dashed ${musicForm.audioUrl ? 'border-primary/20 bg-primary/5' : 'border-border rounded-lg'} p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary/50`}
                  onClick={() => document.getElementById('edit-music-audio')?.click()}
                >
                  {musicForm.audioUrl ? (
                    <div className="space-y-2">
                      <audio 
                        src={musicForm.audioUrl} 
                        className="w-full h-16 rounded-md"
                        controls
                      />
                      <div className="flex items-center justify-center text-xs text-[#65758b]">
                        <Music className="h-4 w-4 mr-1" />
                        <span>Audio uploaded successfully</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Music className="h-8 w-8 mx-auto text-[#65758b]" />
                      <p className="text-xs text-[#65758b] mt-1">Click to upload audio file</p>
                    </div>
                  )}
                  <input 
                    id="edit-music-audio" 
                    type="file" 
                    accept="audio/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={handleAudioUpload} 
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Duration: {musicForm.duration}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={musicForm.category} onValueChange={(v) => setMusicForm(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-white">
                      {musicCategories.map(c => <SelectItem key={c} value={c} className="hover:bg-[#F8FAFC]">{c} </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={musicForm.status} onValueChange={(v: "DRAFT" | "PUBLISHED") => setMusicForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="DRAFT" className="hover:bg-[#F8FAFC]">Draft</SelectItem>
                      <SelectItem value="PUBLISHED"className="hover:bg-[#F8FAFC]">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Supported Moods</Label>
                  <Popover open={isMusicMoodPopoverOpen} onOpenChange={setIsMusicMoodPopoverOpen}>
                    <PopoverTrigger asChild className="bg-white">
                      <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                        <div className="flex flex-wrap gap-1">
                          {musicForm.supportedMoods && musicForm.supportedMoods.length > 0 ? musicForm.supportedMoods.map((mood) => (
                            <Badge key={mood} variant="secondary" className="text-xs">
                              {mood}
                              <span
                                className="ml-1 hover:text-destructive cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMusicForm(prev => ({ ...prev, supportedMoods: prev.supportedMoods?.filter(m => m !== mood) }));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </span>
                            </Badge>
                          )) : <span className="text-muted-foreground">Select moods...</span>}
                        </div>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 border bg-white shadow-xl rounded-[6px]" align="start">
                      <div className="space-y-2">
                        {musicMoods.map((mood) => (
                          <div key={mood} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted" onClick={() => {
                            if (musicForm.supportedMoods?.includes(mood)) {
                              setMusicForm(prev => ({ ...prev, supportedMoods: prev.supportedMoods?.filter(m => m !== mood) }));
                            } else {
                              setMusicForm(prev => ({ ...prev, supportedMoods: [...(prev.supportedMoods || []), mood] }));
                            }
                          }}>
                            <div className={`h-4 w-4 border rounded flex items-center justify-center ${musicForm.supportedMoods?.includes(mood) ? 'bg-primary border-primary' : 'border-input'}`}>
                              {musicForm.supportedMoods?.includes(mood) && <Check className="h-3 w-3 text-primary-foreground" />}
                            </div>
                            <span className="text-sm">{mood}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex gap-2">
                            <Input placeholder="Add new mood..." value={newMood} onChange={(e) => setNewMood(e.target.value)} className="h-8 text-sm" onClick={(e) => e.stopPropagation()} />
                            <Button size="sm" className="h-8" onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (newMood.trim() && !musicMoods.includes(newMood.trim())) { 
                                try {
                                  const response = await fetch('/api/admin/music/moods', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'x-user-id': user?.id || 'admin@calmpath.ai',
                                      ...(user?.school?.id && { 'x-school-id': user.school.id })
                                    },
                                    body: JSON.stringify({ name: newMood.trim(), status: 'ACTIVE' })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setMusicMoods(prev => [...prev, newMood.trim()]); 
                                    toast({ title: "Music Mood Added" }); 
                                    setNewMood(""); 
                                  } else {
                                    toast({ title: "Error", description: result.error || "Failed to create music mood", variant: "destructive" });
                                  }
                                } catch (error) {
                                  console.error('Error creating music mood:', error);
                                  toast({ title: "Error", description: "Failed to create music mood", variant: "destructive" });
                                }
                              } 
                            }}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Goal</Label>
                  <Popover open={isMusicGoalPopoverOpen} onOpenChange={setIsMusicGoalPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between hover:bg-gray-200">
                        <span className={musicForm.goal ? "" : "text-muted-foreground"}>{musicForm.goal || "Select goal..."}</span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 border bg-white shadow-xl rounded-[6px]" align="start">
                      <div className="space-y-2">
                        {musicGoals.map((goal) => (
                          <div key={goal} className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-muted" onClick={() => { setMusicForm(prev => ({ ...prev, goal })); setIsMusicGoalPopoverOpen(false); }}>
                            <div className={`h-4 w-4 border rounded-full flex items-center justify-center ${musicForm.goal === goal ? 'bg-primary border-primary' : 'border-input'}`}>
                              {musicForm.goal === goal && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                            </div>
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex gap-2">
                            <Input placeholder="Add new goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} className="h-8 text-sm" onClick={(e) => e.stopPropagation()} />
                            <Button size="sm" className="h-8" onClick={async (e) => { 
                              e.stopPropagation(); 
                              if (newGoal.trim() && !musicGoals.includes(newGoal.trim())) { 
                                try {
                                  const response = await fetch('/api/labels/goals', {
                                    method: 'POST',
                                    headers: { 
                                      'Content-Type': 'application/json',
                                      'x-user-id': user?.id || 'admin@calmpath.ai',
                                      ...(user?.school?.id && { 'x-school-id': user.school.id })
                                    },
                                    body: JSON.stringify({ name: newGoal.trim(), status: 'active' })
                                  });
                                  const result = await response.json();
                                  if (result.success) {
                                    setMusicGoals(prev => [...prev, newGoal.trim()]); 
                                    toast({ title: "Goal Added" }); 
                                    setNewGoal(""); 
                                  } else {
                                    toast({ title: "Error", description: result.error || "Failed to create goal", variant: "destructive" });
                                  }
                                } catch (error) {
                                  console.error('Error creating goal:', error);
                                  toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
                                }
                              } 
                            }}><Plus className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/30">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Live Preview</h3>
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-[#3B82F6]/20 to-[#3B82F6]/5 flex items-center justify-center">
                  {musicForm.thumbnail ? <img src={musicForm.thumbnail} alt="" className="w-full h-full object-cover" /> : <Music className="h-10 w-10 text-[#3B82F6]/40" />}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground">{musicForm.title || "Resource Title"}</h4>
                  <p className="text-sm text-muted-foreground">{musicForm.subtitle || "Subtitle"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {musicForm.category && <Badge variant="outline" className="text-xs">{musicForm.category}</Badge>}
                    <span className="text-xs text-muted-foreground">{musicForm.duration}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-[#334155]/5 rounded-lg p-3">
                    {musicForm.audioUrl && (
                      <audio 
                        src={musicForm.audioUrl} 
                        className="hidden" 
                        onLoadedMetadata={(e) => {
                          const audio = e.target as HTMLAudioElement;
                          const duration = Math.floor(audio.duration);
                          setMusicForm(prev => ({ ...prev, duration: `${duration}s` }));
                        }}
                      />
                    )}
                    <div className="h-8 w-8 rounded-full bg-[#3B82F6] flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          const audio = document.querySelector('audio') as HTMLAudioElement;
                          if (audio) {
                            if (audio.paused) {
                              audio.play();
                            } else {
                              audio.pause();
                            }
                          }
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-[#334155]/20 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-[#3B82F6] rounded-full transition-all duration-300" style={{ width: '0%' }}></div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">0:00 / {musicForm.duration || '0:00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditMusicTrackOpen(false)}>Cancel</Button>
            <Button onClick={updateMusicResource} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isAddMusicCategoryOpen} onOpenChange={setIsAddMusicCategoryOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Add Music Category</DialogTitle>
            <DialogDescription className='text-[#65758b]'>
              Create a new category for organizing music resources.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Category Name</Label>
              <Input 
                placeholder="e.g., Sleep Sounds" 
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select 
                value={categoryForm.status} 
                onValueChange={(value: "ACTIVE" | "INACTIVE") => setCategoryForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMusicCategoryOpen?.(false)}>
              Cancel
            </Button>
            <Button onClick={createMusicCategory} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instructions Edit Modal */}
      <Dialog open={isEditMusicInstructionsOpen} onOpenChange={setIsEditMusicInstructionsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{musicInstructions ? "Edit" : "Add"} Music Listening Instructions</DialogTitle>
            <DialogDescription>These instructions will be shown to all learners on Music Therapy resources.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-4 py-5 px-5">
            <div className="grid gap-2">
              <Label>Instruction Title</Label>
              <Input 
                placeholder="Listening Instructions"
                value={instructionsForm.title}
                onChange={(e) => setInstructionsForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label>Instruction Points</Label>
              {instructionsForm.points.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="h-6 w-6 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs flex items-center justify-center flex-shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <Textarea
                    placeholder="Enter instruction point..."
                    value={point}
                    onChange={(e) => updateInstructionPoint(index, e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  {instructionsForm.points.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removeInstructionPoint(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addInstructionPoint}>
                <Plus className="h-4 w-4" />
                Add Point
              </Button>
            </div>
            <div className="grid gap-2">
              <Label>Pro Tip (optional)</Label>
              <Textarea
                placeholder="Add a helpful tip for learners..."
                value={instructionsForm.proTip || ""}
                onChange={(e) => setInstructionsForm(prev => ({ ...prev, proTip: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button variant="outline" onClick={() => setIsEditMusicInstructionsOpen(false)}>Cancel</Button>
            <Button onClick={() => handleSaveInstructions("music")}>Save Instructions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
