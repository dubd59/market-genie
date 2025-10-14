import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UnsubscribeService from '../services/unsubscribeService';
import toast from 'react-hot-toast';

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const reasons = [
    'Too many emails',
    'Content not relevant',
    'Changed email address',
    'No longer interested',
    'Spam/unwanted content',
    'Other'
  ];

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      processUnsubscribe(token);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const processUnsubscribe = async (token) => {
    try {
      const result = await UnsubscribeService.processUnsubscribe(token);
      setEmail(result.email);
      setStatus('success');
      setShowFeedback(true);
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setStatus('error');
      toast.error('Failed to process unsubscribe request');
    }
  };

  const submitFeedback = async () => {
    try {
      // You could store this feedback for analytics
      toast.success('Thank you for your feedback!');
      setShowFeedback(false);
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-genie-teal mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your unsubscribe request...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-lg p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
          <p className="text-gray-600 mb-6">
            The unsubscribe link appears to be invalid or expired.
          </p>
          <a
            href="/"
            className="bg-genie-teal text-white px-6 py-3 rounded-lg hover:bg-genie-teal/80 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Unsubscribed</h1>
          <p className="text-gray-600">
            <strong>{email}</strong> has been removed from our email list.
          </p>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Help us improve (optional)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you unsubscribing?
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us how we can improve our emails..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-genie-teal focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={submitFeedback}
                  className="flex-1 bg-genie-teal text-white py-3 px-4 rounded-lg hover:bg-genie-teal/80 transition-colors"
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Options */}
        {!showFeedback && (
          <div className="border-t pt-6 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Changed your mind? You can resubscribe anytime.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => setShowFeedback(true)}
                className="bg-genie-teal text-white px-6 py-2 rounded-lg hover:bg-genie-teal/80 transition-colors"
              >
                Provide Feedback
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-500">
          <p>You will no longer receive marketing emails from us.</p>
          <p>You may still receive important account-related notifications.</p>
        </div>
      </div>
    </div>
  );
};

export default UnsubscribePage;