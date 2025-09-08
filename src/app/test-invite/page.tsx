'use client'

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { EmailInput } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { useNotification } from '@/components/ui/Notification';

export default function TestInvitePage() {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testInvite = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: 'Test Company',
          adminEmail: email,
          website: 'https://test.com'
        }),
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">Test Invite System</h1>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              <EmailInput
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test invite"
              />

              <Button
                onClick={testInvite}
                disabled={loading || !email}
                loading={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Test Invite'}
              </Button>

              {result && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-600">
                <p><strong>Steps to test:</strong></p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Enter your email address</li>
                  <li>Click "Send Test Invite"</li>
                  <li>Check your email for the invite</li>
                  <li>Click the invite link</li>
                  <li>Set your password</li>
                  <li>Verify you're redirected to dashboard</li>
                </ol>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
