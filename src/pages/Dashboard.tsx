import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  MapPin, 
  Camera, 
  Users,
  Leaf,
  Recycle,
  AlertTriangle
} from 'lucide-react';

interface UserProfile {
  role: string;
  full_name: string;
  is_verified: boolean;
}

interface TrainingProgress {
  completed: number;
  total: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress>({ completed: 0, total: 0 });
  const [incentivePoints, setIncentivePoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role, full_name, is_verified')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch training progress
        const { data: progressData } = await supabase
          .from('training_progress')
          .select('status')
          .eq('user_id', user.id);

        const { data: modulesData } = await supabase
          .from('training_modules')
          .select('id')
          .eq('target_role', profileData?.role || 'citizen');

        if (progressData && modulesData) {
          const completed = progressData.filter(p => p.status === 'completed').length;
          setTrainingProgress({ completed, total: modulesData.length });
        }

        // Fetch incentive points
        const { data: incentivesData } = await supabase
          .from('incentives')
          .select('points')
          .eq('user_id', user.id);

        if (incentivesData) {
          const totalPoints = incentivesData.reduce((sum, incentive) => sum + incentive.points, 0);
          setIncentivePoints(totalPoints);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const trainingPercentage = trainingProgress.total > 0 
    ? (trainingProgress.completed / trainingProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-accent rounded-lg p-6 text-primary-foreground">
        <div className="flex items-center gap-3 mb-2">
          <Leaf className="h-8 w-8" />
          <h1 className="text-2xl font-bold">
            {user ? `Welcome back, ${profile?.full_name || 'User'}!` : 'Welcome to Swach Sewa!'}
          </h1>
        </div>
        {user ? (
          <>
            <p className="text-primary-foreground/90">
              Your role: <Badge variant="secondary" className="ml-2">{profile?.role}</Badge>
            </p>
            {!profile?.is_verified && (
              <div className="mt-4 flex items-center gap-2 text-warning-foreground bg-warning/20 rounded-lg p-3">
                <AlertTriangle className="h-5 w-5" />
                <span>Complete your mandatory training to get verified!</span>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-primary-foreground/90">
              Join our community to track your progress, earn rewards, and make a difference!
            </p>
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/auth">Sign Up</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingProgress.completed}/{trainingProgress.total}</div>
              <Progress value={trainingPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(trainingPercentage)}% complete
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incentive Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{incentivePoints}</div>
              <p className="text-xs text-muted-foreground">
                Earned through participation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.is_verified ? (
                  <span className="text-success">Verified</span>
                ) : (
                  <span className="text-warning">Pending</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Complete training to verify
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5+</div>
              <p className="text-xs text-muted-foreground">
                Learn waste management techniques
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Facilities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">50+</div>
              <p className="text-xs text-muted-foreground">
                Find collection centers near you
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Community Impact</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1000+</div>
              <p className="text-xs text-muted-foreground">
                Reports submitted by users
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/training">
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Start Training</h3>
              <p className="text-sm text-muted-foreground">Learn waste management</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/report">
            <CardContent className="p-6 text-center">
              <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Report Waste</h3>
              <p className="text-sm text-muted-foreground">Upload waste photos</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/facilities">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Find Facilities</h3>
              <p className="text-sm text-muted-foreground">Locate waste centers</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/incentives">
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold mb-1">View Rewards</h3>
              <p className="text-sm text-muted-foreground">Check your points</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity or Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-primary" />
            Daily Tip
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            <strong>Did you know?</strong> Proper source segregation can reduce waste management costs by up to 40%. 
            Separate your waste into dry, wet, and hazardous categories before disposal.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}