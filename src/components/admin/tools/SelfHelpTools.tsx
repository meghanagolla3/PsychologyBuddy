import React, { useState, useEffect } from "react";
import { BookOpen, Music, Sparkles, Plus } from "lucide-react";
import { AdminHeader } from "@/src/components/admin/layout/AdminHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import JournalingTools from "./SelfHelpTools/JournalingTools";
import MusicTools from "./SelfHelpTools/MusicTools";
import MeditationTools from "./SelfHelpTools/MeditationTools";
import { ApiResponse } from "./SelfHelpTools/types";

export default function SelfHelpTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("journaling");
  const [searchQuery, setSearchQuery] = useState("");
  
  // School filter state with localStorage persistence
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-selected-school');
      return saved || 'all';
    }
    return 'all';
  });
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  
  // Check if user is super admin
  const isSuperAdmin = user?.role?.name === 'SUPER_ADMIN' || user?.role?.name === 'SUPERADMIN';
  const showSchoolFilter = isSuperAdmin;
  
  // Save selected school to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-selected-school', selectedSchool);
    }
  }, [selectedSchool]);
  
  // Modal states for meditation
  const [isAddMeditationOpen, setIsAddMeditationOpen] = useState(false);
  const [isAddMeditationCategoryModalOpen, setIsAddMeditationCategoryModalOpen] = useState(false);
  
  // Modal states for journaling
  const [isAddJournalingPromptOpen, setIsAddJournalingPromptOpen] = useState(false);
  const [isAddJournalingCategoryOpen, setIsAddJournalingCategoryOpen] = useState(false);
  
  // Modal states for music
  const [isAddMusicTrackOpen, setIsAddMusicTrackOpen] = useState(false);
  const [isAddMusicCategoryOpen, setIsAddMusicCategoryOpen] = useState(false);

  // Fetch schools for super admin
  const fetchSchools = async () => {
    if (!isSuperAdmin) {
      setIsLoadingSchools(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/schools', {
        headers: {
          "x-user-id": user?.id || "admin@calmpath.ai",
        },
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setSchools(data.data);
      } else {
        // Fallback to mock data for testing
        setSchools([
          { id: 'school-1', name: 'Demo Elementary School' },
          { id: 'school-2', name: 'Demo High School' },
          { id: 'school-3', name: 'Demo University' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
      // Fallback to mock data for testing
      setSchools([
        { id: 'school-1', name: 'Demo Elementary School' },
        { id: 'school-2', name: 'Demo High School' },
        { id: 'school-3', name: 'Demo University' }
      ]);
      toast({ 
        title: "Warning", 
        description: "Using demo data. Schools API failed.", 
        variant: "default"
      });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  // Load schools on component mount
  useEffect(() => {
    fetchSchools();
  }, [isSuperAdmin]);

  const renderActions = () => {
    // Show different Add buttons based on active tab
    if (activeTab === "meditation") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddMeditationCategoryModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button onClick={() => setIsAddMeditationOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Meditation
          </Button>
        </div>
      );
    } else if (activeTab === "journaling") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddJournalingCategoryOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button onClick={() => setIsAddJournalingPromptOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Prompt
          </Button>
        </div>
      );
    } else if (activeTab === "music") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddMusicCategoryOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button onClick={() => setIsAddMusicTrackOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Track
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader 
        title="Self-help Tools" 
        subtitle="Manage interactive wellness tools for learners"
        showTimeFilter={false}
        showSchoolFilter={showSchoolFilter}
        schoolFilterValue={selectedSchool}
        onSchoolFilterChange={setSelectedSchool}
        schools={schools}
        actions={renderActions()}
      />
      
      <div className="flex-1 overflow-auto p-6 space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="journaling" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Journaling
            </TabsTrigger>
            <TabsTrigger value="music" className="gap-2">
              <Music className="h-4 w-4" />
              Music Therapy
            </TabsTrigger>
            <TabsTrigger value="meditation" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Meditation
            </TabsTrigger>
          </TabsList>

          {/* Journaling Tab */}
          <TabsContent value="journaling">
            <JournalingTools 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              isAddJournalingPromptOpen={isAddJournalingPromptOpen}
              setIsAddJournalingPromptOpen={setIsAddJournalingPromptOpen}
              isAddJournalingCategoryOpen={isAddJournalingCategoryOpen}
              setIsAddJournalingCategoryOpen={setIsAddJournalingCategoryOpen}
              selectedSchool={selectedSchool}
              isSuperAdmin={isSuperAdmin}
              schools={schools}
            />
          </TabsContent>

          {/* Music Therapy Tab */}
          <TabsContent value="music">
            <MusicTools 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              isAddMusicTrackOpen={isAddMusicTrackOpen}
              setIsAddMusicTrackOpen={setIsAddMusicTrackOpen}
              isAddMusicCategoryOpen={isAddMusicCategoryOpen}
              setIsAddMusicCategoryOpen={setIsAddMusicCategoryOpen}
            />
          </TabsContent>

          {/* Meditation Tab */}
          <TabsContent value="meditation">
            <MeditationTools 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery}
              isAddMeditationOpen={isAddMeditationOpen}
              setIsAddMeditationOpen={setIsAddMeditationOpen}
              isAddMeditationCategoryModalOpen={isAddMeditationCategoryModalOpen}
              setIsAddMeditationCategoryModalOpen={setIsAddMeditationCategoryModalOpen}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
