import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Star
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration_minutes: number;
  is_mandatory: boolean;
  target_role: string;
}

interface TrainingProgress {
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
}

export default function Training() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [userRole, setUserRole] = useState<string>('citizen');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrainingData() {
      try {
        // Always fetch all training modules to show them
        const { data: modulesData } = await supabase
          .from('training_modules')
          .select('*')
          .order('created_at');

        if (modulesData) {
          setModules(modulesData);
        }

        // Only fetch user-specific data if logged in
        if (user) {
          // Get user role
          const { data: profileData } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();

          const role = profileData?.role || 'citizen';
          setUserRole(role);

          // Fetch user's progress
          const { data: progressData } = await supabase
            .from('training_progress')
            .select('*')
            .eq('user_id', user.id);

          if (progressData) {
            setProgress(progressData);
          }
        }
      } catch (error) {
        console.error('Error fetching training data:', error);
        toast({
          title: "Error",
          description: "Failed to load training modules",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTrainingData();
  }, [user, toast]);

  const startModule = async (moduleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setProgress(prev => {
        const existing = prev.find(p => p.module_id === moduleId);
        if (existing) {
          return prev.map(p => 
            p.module_id === moduleId 
              ? { ...p, status: 'in_progress' as const }
              : p
          );
        } else {
          return [...prev, { module_id: moduleId, status: 'in_progress' as const }];
        }
      });

      toast({
        title: "Training Started",
        description: "You have started this training module"
      });
    } catch (error) {
      console.error('Error starting module:', error);
      toast({
        title: "Error",
        description: "Failed to start training module",
        variant: "destructive"
      });
    }
  };

  const completeModule = async (moduleId: string) => {
    if (!user) return;

    try {
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100

      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          module_id: moduleId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          score: score
        });

      if (error) throw error;

      // Award points for completion
      await supabase
        .from('incentives')
        .insert({
          user_id: user.id,
          points: 50,
          reason: 'Training module completed'
        });

      // Update local state
      setProgress(prev => 
        prev.map(p => 
          p.module_id === moduleId 
            ? { ...p, status: 'completed' as const, score }
            : p
        )
      );

      toast({
        title: "Training Completed!",
        description: `Congratulations! You scored ${score}% and earned 50 points.`
      });
    } catch (error) {
      console.error('Error completing module:', error);
      toast({
        title: "Error",
        description: "Failed to complete training module",
        variant: "destructive"
      });
    }
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find(p => p.module_id === moduleId);
  };

  const getStatusBadge = (moduleProgress: TrainingProgress | undefined) => {
    if (!moduleProgress || moduleProgress.status === 'not_started') {
      return <Badge variant="secondary">Not Started</Badge>;
    }
    if (moduleProgress.status === 'in_progress') {
      return <Badge variant="outline">In Progress</Badge>;
    }
    return <Badge variant="default" className="bg-success text-success-foreground">Completed</Badge>;
  };

  const completedModules = progress.filter(p => p.status === 'completed').length;
  const progressPercentage = modules.length > 0 ? (completedModules / modules.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Modules</h1>
          <p className="text-muted-foreground mt-1">
            Complete mandatory training for your role: <Badge>{userRole}</Badge>
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Training Progress
            </CardTitle>
            <CardDescription>
              Your overall progress through the training curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed: {completedModules}/{modules.length} modules</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {!user && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign up to track your progress</h3>
            <p className="text-muted-foreground mb-4">
              Create an account to save your training progress and earn rewards.
            </p>
            <Button asChild>
              <a href="/auth">Get Started</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id);
          const isCompleted = moduleProgress?.status === 'completed';
          const isInProgress = moduleProgress?.status === 'in_progress';

          return (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="mt-1">{module.description}</CardDescription>
                  </div>
                  {getStatusBadge(moduleProgress)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {module.duration_minutes} min
                    </div>
                    {module.is_mandatory && (
                      <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                    )}
                    {isCompleted && moduleProgress?.score && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-warning" />
                        {moduleProgress.score}%
                      </div>
                    )}
                  </div>

                  {module.content && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.content}
                    </p>
                  )}

                   <div className="flex gap-2">
                     {!user ? (
                       <Button 
                         asChild
                         className="flex items-center gap-2"
                       >
                         <a href="/auth">
                           <PlayCircle className="h-4 w-4" />
                           Sign up to access
                         </a>
                       </Button>
                     ) : !moduleProgress || moduleProgress.status === 'not_started' ? (
                       <Button 
                         onClick={() => startModule(module.id)}
                         className="flex items-center gap-2"
                       >
                         <PlayCircle className="h-4 w-4" />
                         Start Training
                       </Button>
                     ) : isInProgress ? (
                       <Button 
                         onClick={() => completeModule(module.id)}
                         className="flex items-center gap-2"
                       >
                         <CheckCircle className="h-4 w-4" />
                         Complete Training
                       </Button>
                     ) : (
                       <Button variant="outline" disabled>
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Completed
                       </Button>
                     )}
                   </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Training Modules Available</h3>
            <p className="text-muted-foreground">
              Training modules for your role will appear here when available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}