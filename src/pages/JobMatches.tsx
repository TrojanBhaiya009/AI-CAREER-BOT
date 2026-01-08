import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Briefcase, DollarSign, ArrowLeft, 
  ExternalLink, Bookmark, BookmarkCheck, Sparkles, TrendingUp,
  Building, Target, AlertCircle, Clock, Filter, SortDesc, Award, Zap
} from "lucide-react";
import confetti from "canvas-confetti";

export default function JobMatches() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("match_score");
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndLoadJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, searchQuery, filterType, sortBy]);

  const checkAuthAndLoadJobs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadJobs();
      } else {
        // Redirect to auth page if not authenticated
        navigate("/auth");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    }
  };

  const loadJobs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data, error: loadError } = await supabase
        .from("job_matches")
        .select("*")
        .order("match_score", { ascending: false });

      if (loadError) throw loadError;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error loading jobs:", error);
      setError(error.message || "Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const findNewJobs = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("Please log in to find jobs");
        setIsLoading(false);
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/match-jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to find jobs: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setJobs(result.data.jobs || []);
        if (result.data.jobs && result.data.jobs.length > 0) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        setError(result.error || "Failed to find jobs");
      }
    } catch (error: any) {
      console.error("Error finding jobs:", error);
      setError(error.message || "An error occurred while finding jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveJob = async (jobId: string, currentlySaved: boolean) => {
    try {
      const { error: saveError } = await supabase
        .from("job_matches")
        .update({ is_saved: !currentlySaved })
        .eq("id", jobId);

      if (!saveError) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, is_saved: !currentlySaved } : job
        ));
      }
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const updateApplicationStatus = async (jobId: string, status: string) => {
    try {
      const updates: any = { application_status: status };
      if (status === "applied" && !jobs.find(j => j.id === jobId)?.applied_at) {
        updates.applied_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("job_matches")
        .update(updates)
        .eq("id", jobId);

      if (!updateError) {
        setJobs(jobs.map(job => 
          job.id === jobId ? { ...job, ...updates } : job
        ));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(job => job.job_type === filterType);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "match_score") return (b.match_score || 0) - (a.match_score || 0);
      if (sortBy === "created_at") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

    setFilteredJobs(filtered);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 90) return "Perfect Match";
    if (score >= 80) return "Excellent Match";
    if (score >= 70) return "Great Match";
    if (score >= 60) return "Good Match";
    return "Fair Match";
  };

  const savedJobs = filteredJobs.filter(j => j.is_saved);
  const appliedJobs = filteredJobs.filter(j => j.application_status !== "not_applied");

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Clean, minimal header inspired by Google */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2 px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <div className="h-6 sm:h-8 w-px bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                    Job Matches
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                    {filteredJobs.length} opportunities
                  </p>
                </div>
              </div>
            </div>
            <Button 
              onClick={findNewJobs} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 sm:h-10 px-3 sm:px-6 font-medium shrink-0"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 sm:mr-2 animate-spin text-white" />
                  <span className="text-white hidden sm:inline">Finding Jobs...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:mr-2 text-white" />
                  <span className="text-white hidden sm:inline">Find New Jobs</span>
                  <span className="text-white sm:hidden">Find</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <Alert variant="destructive" className="mb-4 sm:mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters - Google-style */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4 sm:mb-6 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
              <div className="lg:col-span-6 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <Input
                  placeholder="Search by title, company, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 text-sm sm:text-base"
                />
              </div>
              <div className="lg:col-span-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-10 sm:h-11 border-gray-300">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Types</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="lg:col-span-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-10 sm:h-11 border-gray-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match_score">Best Match</SelectItem>
                    <SelectItem value="created_at">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Clean Google style */}
        <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white border border-gray-200 p-1 h-auto rounded-lg shadow-sm w-full sm:w-auto flex flex-wrap sm:inline-flex">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">All Jobs</span>
              <span className="sm:hidden">All</span>
              <Badge variant="secondary" className="ml-1 sm:ml-2 bg-gray-100 text-gray-700 text-xs">
                {filteredJobs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Saved</span>
              <Badge variant="secondary" className="ml-1 sm:ml-2 bg-gray-100 text-gray-700 text-xs">
                {savedJobs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="applied" 
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium flex-1 sm:flex-none"
            >
              <Award className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Applied</span>
              <Badge variant="secondary" className="ml-1 sm:ml-2 bg-gray-100 text-gray-700 text-xs">
                {appliedJobs.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSave={toggleSaveJob}
                onUpdateStatus={updateApplicationStatus}
                getMatchColor={getMatchColor}
                getMatchLabel={getMatchLabel}
              />
            ))}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-16 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No saved jobs yet</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
                  Save interesting opportunities to review them later
                </p>
              </div>
            ) : (
              savedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSave={toggleSaveJob}
                  onUpdateStatus={updateApplicationStatus}
                  getMatchColor={getMatchColor}
                  getMatchLabel={getMatchLabel}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            {appliedJobs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-16 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">No applications yet</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto">
                  Track your job applications and interview progress here
                </p>
              </div>
            ) : (
              appliedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSave={toggleSaveJob}
                  onUpdateStatus={updateApplicationStatus}
                  getMatchColor={getMatchColor}
                  getMatchLabel={getMatchLabel}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {filteredJobs.length === 0 && !isLoading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">Discover Your Perfect Role</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
              Click "Find New Jobs" to get AI-powered job recommendations matched to your skills and career goals
            </p>
            <Button 
              onClick={findNewJobs}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 sm:h-12 px-6 sm:px-8 w-full sm:w-auto"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Find Jobs Now
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function JobCard({ job, onSave, onUpdateStatus, getMatchColor, getMatchLabel }: any) {
  const getSourceBadge = (source: string) => {
    const badges: any = {
      remotive: { label: "Remotive", color: "bg-blue-50 text-blue-700 border-blue-200" },
      adzuna: { label: "Adzuna", color: "bg-purple-50 text-purple-700 border-purple-200" },
      themuse: { label: "The Muse", color: "bg-pink-50 text-pink-700 border-pink-200" },
      jsearch: { label: "JSearch", color: "bg-orange-50 text-orange-700 border-orange-200" },
      "ai-generated": { label: "AI Match", color: "bg-blue-50 text-blue-600 border-blue-200" },
    };
    return badges[source] || { label: source, color: "bg-gray-50 text-gray-700 border-gray-200" };
  };

  const sourceBadge = getSourceBadge(job.source);

  return (
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <CardContent className="p-4 sm:p-6">
        {/* Header with company and match score */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-6 mb-4">
          <div className="flex-1 w-full">
            {/* Company info */}
            <div className="flex items-center gap-2 sm:gap-3 mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">{job.company_name}</div>
                <Badge className={`border text-xs font-medium ${sourceBadge.color}`}>
                  {sourceBadge.label}
                </Badge>
              </div>
            </div>

            {/* Job title */}
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
              {job.job_title}
            </h3>

            {/* Job meta info */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
              {job.job_type && (
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
              )}
              {job.salary_range && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="truncate">{job.salary_range}</span>
                </div>
              )}
            </div>
          </div>

          {/* Match score badge */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0 self-start">
            <div className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border font-semibold ${getMatchColor(job.match_score)}`}>
              <div className="text-xl sm:text-2xl">{job.match_score}%</div>
            </div>
            <span className="text-xs font-medium text-gray-600">{getMatchLabel(job.match_score)}</span>
          </div>
        </div>

        {/* Job description */}
        {job.job_description && (
          <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed line-clamp-2">
              {job.job_description}
            </p>
          </div>
        )}

        {/* Skills section */}
        {job.required_skills && job.required_skills.length > 0 && (
          <div className="mb-4 sm:mb-5 space-y-3">
            {/* Required skills */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                <span className="text-xs sm:text-sm font-semibold text-gray-900">Required Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {job.required_skills.slice(0, 8).map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs font-medium">
                    {skill}
                  </Badge>
                ))}
                {job.required_skills.length > 8 && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                    +{job.required_skills.length - 8}
                  </Badge>
                )}
              </div>
            </div>

            {/* Skill gaps */}
            {job.skill_gaps && job.skill_gaps.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">Skills to Develop</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {job.skill_gaps.slice(0, 5).map((skill: string, i: number) => (
                    <Badge key={i} variant="outline" className="border-orange-200 text-orange-700 text-xs bg-orange-50">
                      {skill}
                    </Badge>
                  ))}
                  {job.skill_gaps.length > 5 && (
                    <Badge variant="outline" className="border-gray-300 text-gray-600 text-xs">
                      +{job.skill_gaps.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 sm:pt-5 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSave(job.id, job.is_saved)}
            className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
          >
            {job.is_saved ? (
              <>
                <BookmarkCheck className="w-4 h-4 mr-2 text-blue-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                <span>Save</span>
              </>
            )}
          </Button>

          <Select
            value={job.application_status}
            onValueChange={(value) => onUpdateStatus(job.id, value)}
          >
            <SelectTrigger className="w-full sm:w-[150px] border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_applied">Not Applied</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {job.job_url && (
            <Button 
              variant="default" 
              size="sm" 
              asChild 
              className="sm:ml-auto bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
            >
              <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                View Job
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
