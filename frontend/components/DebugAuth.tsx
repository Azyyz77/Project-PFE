'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DebugAuth() {
  const { user, token } = useAuth();
  const [localToken, setLocalToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalToken(localStorage.getItem('token'));
    }
  }, []);

  return (
    <Card className="bg-slate-800 border-slate-700 mb-4">
      <CardHeader>
        <CardTitle className="text-white text-sm">🔐 Debug Authentication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Auth Context User:</span>
          <Badge variant={user ? 'default' : 'destructive'}>
            {user ? `${user.role} (${user.email})` : 'None'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Auth Context Token:</span>
          <Badge variant={token ? 'default' : 'destructive'}>
            {token ? `${token.substring(0, 10)}...` : 'None'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">LocalStorage Token:</span>
          <Badge variant={localToken ? 'default' : 'destructive'}>
            {localToken ? `${localToken.substring(0, 10)}...` : 'None'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Tokens Match:</span>
          <Badge variant={token === localToken ? 'default' : 'destructive'}>
            {token === localToken ? 'Yes' : 'No'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}