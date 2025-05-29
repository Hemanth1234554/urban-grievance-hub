
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, MessageSquare } from 'lucide-react';

interface Complaint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  submitted_by: string;
  submitted_by_name: string;
  submitted_date: string;
  description: string;
  location: string;
  department: string;
}

interface ComplaintResponse {
  id: string;
  message: string;
  responded_by: string;
  responded_by_name: string;
  responded_date: string;
  is_authority: boolean;
}

const ComplaintsList: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [responses, setResponses] = useState<Record<string, ComplaintResponse[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadComplaints();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, statusFilter]);

  const loadComplaints = async () => {
    if (!user) return;

    try {
      let query = supabase.from('complaints').select('*');

      // Filter complaints based on user role
      if (user.role === 'citizen') {
        query = query.eq('submitted_by', user.id);
      } else if (user.role === 'authority') {
        query = query.eq('department', user.department);
      }

      const { data, error } = await query.order('submitted_date', { ascending: false });

      if (error) {
        throw error;
      }

      setComplaints(data || []);
      
      // Load responses for all complaints
      if (data) {
        const complaintIds = data.map(c => c.id);
        await loadResponses(complaintIds);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (complaintIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('complaint_responses')
        .select('*')
        .in('complaint_id', complaintIds)
        .order('responded_date', { ascending: true });

      if (error) {
        throw error;
      }

      // Group responses by complaint_id
      const responsesByComplaint: Record<string, ComplaintResponse[]> = {};
      data?.forEach(response => {
        if (!responsesByComplaint[response.complaint_id]) {
          responsesByComplaint[response.complaint_id] = [];
        }
        responsesByComplaint[response.complaint_id].push(response);
      });

      setResponses(responsesByComplaint);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  const updateComplaintStatus = async (complaintId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', complaintId);

      if (error) {
        throw error;
      }

      // Update local state
      setComplaints(prev => prev.map(c => 
        c.id === complaintId ? { ...c, status } : c
      ));

      toast({
        title: "Status Updated",
        description: `Complaint status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addResponse = async (complaintId: string, responseText: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('complaint_responses')
        .insert([{
          complaint_id: complaintId,
          message: responseText,
          responded_by: user.id,
          responded_by_name: user.name,
          is_authority: user.role === 'authority' || user.role === 'admin'
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local responses state
      setResponses(prev => ({
        ...prev,
        [complaintId]: [...(prev[complaintId] || []), data]
      }));

      setResponse('');

      toast({
        title: "Response Added",
        description: "Your response has been added to the complaint.",
      });
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view complaints.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No complaints found</p>
            </CardContent>
          </Card>
        ) : (
          filteredComplaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority}
                        </Badge>
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <p><strong>Category:</strong> {complaint.category}</p>
                      <p><strong>Department:</strong> {complaint.department}</p>
                      <p><strong>Location:</strong> {complaint.location || 'Not specified'}</p>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{complaint.description.substring(0, 200)}...</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <p>Submitted by: {complaint.submitted_by_name}</p>
                        <p>Date: {new Date(complaint.submitted_date).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {responses[complaint.id] && responses[complaint.id].length > 0 && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {responses[complaint.id].length} response(s)
                          </div>
                        )}
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedComplaint(complaint)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{complaint.title}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><strong>Category:</strong> {complaint.category}</p>
                                <p><strong>Department:</strong> {complaint.department}</p>
                                <p><strong>Priority:</strong> {complaint.priority}</p>
                                <p><strong>Status:</strong> {complaint.status}</p>
                                <p><strong>Location:</strong> {complaint.location || 'Not specified'}</p>
                                <p><strong>Submitted:</strong> {new Date(complaint.submitted_date).toLocaleDateString()}</p>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-gray-700">{complaint.description}</p>
                              </div>

                              {/* Responses */}
                              {responses[complaint.id] && responses[complaint.id].length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Responses</h4>
                                  <div className="space-y-3 max-h-40 overflow-y-auto">
                                    {responses[complaint.id].map((response) => (
                                      <div key={response.id} className={`p-3 rounded-lg ${
                                        response.is_authority ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                                      }`}>
                                        <p className="text-sm">{response.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          By {response.responded_by_name} on {new Date(response.responded_date).toLocaleString()}
                                          {response.is_authority && <span className="text-blue-600 font-medium"> (Authority)</span>}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Add Response */}
                              <div>
                                <h4 className="font-semibold mb-2">Add Response</h4>
                                <Textarea
                                  value={response}
                                  onChange={(e) => setResponse(e.target.value)}
                                  placeholder="Type your response..."
                                  rows={3}
                                />
                                <Button 
                                  className="mt-2" 
                                  onClick={() => addResponse(complaint.id, response)}
                                  disabled={!response.trim()}
                                >
                                  Add Response
                                </Button>
                              </div>

                              {/* Status Update (for authorities and admins) */}
                              {(user.role === 'authority' || user.role === 'admin') && (
                                <div>
                                  <h4 className="font-semibold mb-2">Update Status</h4>
                                  <div className="flex items-center space-x-2">
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      onClick={() => updateComplaintStatus(complaint.id, newStatus)}
                                      disabled={!newStatus || newStatus === complaint.status}
                                    >
                                      Update
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ComplaintsList;
