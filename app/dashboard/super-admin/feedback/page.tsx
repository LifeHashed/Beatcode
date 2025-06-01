'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertCircle, Reply, Filter } from 'lucide-react';

interface Feedback {
  id: number;
  type: string;
  title: string;
  message: string;
  status: string;
  createdAt: string;
  fromUser: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  adminReply?: {
    message: string;
    createdAt: string;
    fromUser: {
      name: string;
      role: string;
    };
  };
}

export default function SuperAdminFeedbackPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      let url = '/api/admin/feedback?limit=50';
      if (selectedType !== 'all') {
        url += `&type=${selectedType}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'SUPER_ADMIN') {
        router.push('/dashboard/user/problems');
      } else {
        fetchFeedbacks();
      }
    }
  }, [status, session, router]);

  const handleReply = async (feedbackId: number) => {
    if (!replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });

      if (response.ok) {
        setReplyingTo(null);
        setReplyMessage('');
        fetchFeedbacks(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const updateFeedbackStatus = async (feedbackId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchFeedbacks(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'REVIEWED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REPLIED':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FEEDBACK':
        return 'bg-blue-100 text-blue-800';
      case 'FEATURE_RECOMMENDATION':
        return 'bg-green-100 text-green-800';
      case 'NEW_QUESTION':
        return 'bg-purple-100 text-purple-800';
      case 'BUG_REPORT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const typeMatch = selectedType === 'all' || feedback.type === selectedType;
    const statusMatch = selectedStatus === 'all' || feedback.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
        <p className="text-gray-600">Review and respond to user feedback</p>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="FEEDBACK">General Feedback</option>
            <option value="FEATURE_RECOMMENDATION">Feature Requests</option>
            <option value="NEW_QUESTION">Question Suggestions</option>
            <option value="BUG_REPORT">Bug Reports</option>
          </select>
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="REPLIED">Replied</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{feedbacks.length}</div>
          <div className="text-sm text-gray-500">Total Feedback</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {feedbacks.filter(f => f.status === 'PENDING').length}
          </div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {feedbacks.filter(f => f.status === 'REVIEWED').length}
          </div>
          <div className="text-sm text-gray-500">Reviewed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {feedbacks.filter(f => f.status === 'REPLIED').length}
          </div>
          <div className="text-sm text-gray-500">Replied</div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
            <p className="text-gray-500">No feedback matches the current filters.</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(feedback.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{feedback.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(feedback.type)}`}>
                        {formatType(feedback.type)}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {feedback.fromUser.name} ({feedback.fromUser.role})
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={feedback.status}
                    onChange={(e) => updateFeedbackStatus(feedback.id, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="REPLIED">Replied</option>
                  </select>
                  
                  <button
                    onClick={() => setReplyingTo(replyingTo === feedback.id ? null : feedback.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{feedback.message}</p>
              
              {feedback.adminReply && (
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Admin Response from {feedback.adminReply.fromUser.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.adminReply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{feedback.adminReply.message}</p>
                </div>
              )}
              
              {replyingTo === feedback.id && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyMessage('');
                      }}
                      className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReply(feedback.id)}
                      disabled={!replyMessage.trim() || isSubmittingReply}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmittingReply ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
