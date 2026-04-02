/**
 * AuthCard - Reusable wrapper component for auth pages
 */

import { Card } from '@/components/ui/card';
import { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  bottomLink?: {
    text: string;
    href: string;
    linkText: string;
  };
}

export function AuthCard({
  title,
  subtitle,
  children,
  bottomLink,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <Card className="p-8">
          {children}
        </Card>

        {bottomLink && (
          <p className="text-center text-sm text-gray-600">
            {bottomLink.text}{' '}
            <a
              href={bottomLink.href}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {bottomLink.linkText}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
