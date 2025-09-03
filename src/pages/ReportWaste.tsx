import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, MapPin, Upload, CheckCircle } from 'lucide-react';

export default function ReportWaste() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setGettingLocation(false);
        toast({
          title: "Location captured",
          description: "Your current location has been added to the report"
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        toast({
          title: "Location error",
          description: "Unable to get your current location",
          variant: "destructive"
        });
      }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a photo under 5MB",
          variant: "destructive"
        });
        return;
      }
      setPhotoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please fill in title and location",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        // For now, we'll just store the filename since we haven't set up storage buckets
        // In a real implementation, you'd upload to Supabase Storage
        photoUrl = fileName;
      }

      // Insert waste report
      const { error } = await supabase
        .from('waste_reports')
        .insert({
          reporter_id: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          photo_url: photoUrl
        });

      if (error) throw error;

      // Award points for reporting
      await supabase
        .from('incentives')
        .insert({
          user_id: user.id,
          points: 25,
          reason: 'Waste report submitted'
        });

      toast({
        title: "Report submitted successfully!",
        description: "Thank you for helping keep our community clean. You earned 25 points!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        latitude: null,
        longitude: null
      });
      setPhotoFile(null);

    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit waste report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Report Waste</h1>
        <p className="text-muted-foreground mt-1">
          Help keep our community clean by reporting waste dumping sites
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Waste Report Form
          </CardTitle>
          <CardDescription>
            Provide details about the waste you've found. Include photos and location for faster response.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Illegal dumping near park entrance"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the waste type, quantity, and any other relevant details..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter address or landmark"
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="shrink-0"
                >
                  {gettingLocation ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.latitude && formData.longitude && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="h-4 w-4" />
                  Location coordinates captured
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Photo (Optional)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="flex-1"
                />
                {photoFile && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="h-4 w-4" />
                    Photo selected
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a photo of the waste for better identification (max 5MB)
              </p>
            </div>

            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <h4 className="font-semibold text-info-foreground mb-2">Reporting Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Take clear photos showing the waste clearly</li>
                <li>• Provide accurate location information</li>
                <li>• Report immediately for hazardous waste</li>
                <li>• Include any relevant safety concerns</li>
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Submitting Report...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-success/5 border-success/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/20 rounded-full p-2">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <h4 className="font-semibold text-success-foreground">Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Earn 25 points for each valid waste report you submit!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}