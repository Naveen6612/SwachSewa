import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Phone, 
  Building, 
  Recycle, 
  Zap, 
  Trash2,
  Search,
  ExternalLink
} from 'lucide-react';

interface WasteFacility {
  id: string;
  name: string;
  type: 'biomethanization' | 'waste_to_energy' | 'recycling' | 'scrap_collection';
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  capacity_tons?: number;
  contact_person?: string;
  phone?: string;
  is_active: boolean;
}

const facilityIcons = {
  biomethanization: Building,
  waste_to_energy: Zap,
  recycling: Recycle,
  scrap_collection: Trash2
};

const facilityColors = {
  biomethanization: 'bg-blue-500',
  waste_to_energy: 'bg-yellow-500',
  recycling: 'bg-green-500',
  scrap_collection: 'bg-purple-500'
};

export default function Facilities() {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<WasteFacility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<WasteFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    async function fetchFacilities() {
      try {
        const { data, error } = await supabase
          .from('waste_facilities')
          .select('*')
          .eq('is_active', true)
          .order('city');

        if (error) throw error;

        if (data) {
          setFacilities(data);
          setFilteredFacilities(data);
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        toast({
          title: "Error",
          description: "Failed to load waste facilities",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchFacilities();
  }, [toast]);

  useEffect(() => {
    let filtered = facilities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }

    setFilteredFacilities(filtered);
  }, [facilities, searchTerm, selectedType]);

  const getFacilityTypeLabel = (type: string) => {
    switch (type) {
      case 'biomethanization': return 'Biomethanization Plant';
      case 'waste_to_energy': return 'Waste-to-Energy Plant';
      case 'recycling': return 'Recycling Center';
      case 'scrap_collection': return 'Scrap Collection Hub';
      default: return type;
    }
  };

  const openInMaps = (facility: WasteFacility) => {
    if (facility.latitude && facility.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.address + ', ' + facility.city)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Waste Management Facilities</h1>
        <p className="text-muted-foreground mt-1">
          Find waste processing facilities, recycling centers, and collection points near you
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            size="sm"
          >
            All Types
          </Button>
          <Button
            variant={selectedType === 'recycling' ? 'default' : 'outline'}
            onClick={() => setSelectedType('recycling')}
            size="sm"
          >
            Recycling
          </Button>
          <Button
            variant={selectedType === 'biomethanization' ? 'default' : 'outline'}
            onClick={() => setSelectedType('biomethanization')}
            size="sm"
          >
            Biomethanization
          </Button>
          <Button
            variant={selectedType === 'waste_to_energy' ? 'default' : 'outline'}
            onClick={() => setSelectedType('waste_to_energy')}
            size="sm"
          >
            Waste-to-Energy
          </Button>
          <Button
            variant={selectedType === 'scrap_collection' ? 'default' : 'outline'}
            onClick={() => setSelectedType('scrap_collection')}
            size="sm"
          >
            Scrap Collection
          </Button>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => {
          const IconComponent = facilityIcons[facility.type];
          const colorClass = facilityColors[facility.type];

          return (
            <Card key={facility.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={`${colorClass} rounded-lg p-2 text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">{facility.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {getFacilityTypeLabel(facility.type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{facility.city}</p>
                      <p className="text-muted-foreground">{facility.address}</p>
                    </div>
                  </div>

                  {facility.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${facility.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {facility.phone}
                      </a>
                    </div>
                  )}

                  {facility.contact_person && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contact: </span>
                      <span>{facility.contact_person}</span>
                    </div>
                  )}

                  {facility.capacity_tons && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Capacity: </span>
                      <span className="font-medium">{facility.capacity_tons} tons</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInMaps(facility)}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Directions
                  </Button>
                  {facility.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${facility.phone}`)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Facilities Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No waste management facilities are currently available in the system'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-info/5 border-info/20">
        <CardHeader>
          <CardTitle className="text-info-foreground">Need Help Finding a Facility?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Can't find the right facility for your waste type? Contact your local waste management authority 
            or use the reporting feature to request new facilities in your area.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Dry Waste:</strong> Recycling Centers, Scrap Collection
            </div>
            <div>
              <strong>Wet Waste:</strong> Biomethanization Plants
            </div>
            <div>
              <strong>E-Waste:</strong> Specialized Recycling Centers
            </div>
            <div>
              <strong>Hazardous Waste:</strong> Contact authorities directly
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}