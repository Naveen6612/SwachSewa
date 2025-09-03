import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Star, Gift } from 'lucide-react';

interface Incentive {
  id: string;
  points: number;
  reason: string;
  created_at: string;
}

export default function Incentives() {
  const { user } = useAuth();
  const [incentives, setIncentives] = useState<Incentive[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncentives() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('incentives')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setIncentives(data);
          setTotalPoints(data.reduce((sum, incentive) => sum + incentive.points, 0));
        }
      } catch (error) {
        console.error('Error fetching incentives:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchIncentives();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Incentives & Rewards</h1>
        <p className="text-muted-foreground mt-1">Track your points and achievements</p>
      </div>

      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Trophy className="h-12 w-12" />
            <div>
              <h2 className="text-3xl font-bold">{totalPoints}</h2>
              <p>Total Points Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Activities</h3>
        {incentives.map((incentive) => (
          <Card key={incentive.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">{incentive.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(incentive.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">+{incentive.points} pts</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}