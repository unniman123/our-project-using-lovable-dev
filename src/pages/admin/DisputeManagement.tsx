import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from '../../components/ui/button';
import { AlertTriangle } from 'lucide-react';
import DisputeResolution from '../../components/dispute/DisputeResolution';
import Navbar from '../../components/Navbar';

const DisputeManagement = () => {
  const { data: disputes, isLoading, refetch } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dispute_cases')
        .select(`
          *,
          reported_by:profiles!dispute_cases_reported_by_id_fkey(username),
          against:profiles!dispute_cases_against_id_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const [selectedDisputeId, setSelectedDisputeId] = React.useState<string | null>(null);

  const handleSelectDispute = (disputeId: string) => {
    setSelectedDisputeId(disputeId);
  };

  const handleResolutionSubmitted = () => {
    setSelectedDisputeId(null);
    refetch();
  };

  if (isLoading) {
    return <div>Loading disputes...</div>;
  }

  return (
    <div className="min-h-screen bg-gaming-dark">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold text-white mb-8">Dispute Management</h1>
        <div className="flex gap-4">
          <div className="w-1/2">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 p-4">
                {disputes?.map((dispute) => (
                  <Card key={dispute.id} className="bg-gaming-dark/50 border-gaming-accent/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <AlertTriangle className="h-5 w-5 text-gaming-accent" />
                        {dispute.title}
                      </CardTitle>
                      <div className="text-sm text-gray-400">
                        Reported by {dispute.reported_by.username} against {dispute.against.username}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4">{dispute.description}</p>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-sm ${
                          dispute.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          dispute.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                        </span>
                        <Button
                          variant="ghost"
                          className="text-gaming-accent hover:text-gaming-accent/80"
                          onClick={() => handleSelectDispute(dispute.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="w-1/2">
            {selectedDisputeId && (
              <div className="bg-gaming-dark/50 border-gaming-accent/20 p-4 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Dispute Resolution</h2>
                <DisputeResolution disputeId={selectedDisputeId} onResolutionSubmitted={handleResolutionSubmitted} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeManagement;
