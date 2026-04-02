'use client';

import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ComplaintFormState } from '@/lib/complaint-utils';

interface ComplaintFormProps {
  form: ComplaintFormState;
  isSubmitting: boolean;
  error: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function ComplaintForm({
  form,
  isSubmitting,
  error,
  onInputChange,
  onSubmit,
}: ComplaintFormProps) {
  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardContent className="p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Soumettre une Réclamation</h3>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="text"
            name="sujet"
            placeholder="Sujet de la réclamation"
            value={form.sujet}
            onChange={onInputChange}
            maxLength={255}
          />

          <Textarea
            name="description"
            placeholder="Décrivez votre problème..."
            value={form.description}
            onChange={onInputChange}
            rows={4}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isSubmitting ? 'Envoi...' : 'Soumettre'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
