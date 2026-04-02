'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import {
  getComplaintStatusIcon,
  getComplaintStatusColor,
  getComplaintStatusLabel,
} from '@/lib/complaint-utils';

interface ComplaintItemProps {
  complaint: any;
}

export function ComplaintItem({ complaint }: ComplaintItemProps) {
  const StatusIcon = getComplaintStatusIcon(complaint.statut);

  return (
    <Card className="border">
      <CardContent className={`p-4 ${getComplaintStatusColor(complaint.statut)}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900">{complaint.sujet}</h4>
              <Badge variant="outline" className="text-xs">
                {getComplaintStatusLabel(complaint.statut)}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mt-1">{complaint.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
              <span>#{complaint.numero}</span>
              <span>•</span>
              <span>{new Date(complaint.date_creation).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ComplaintListProps {
  complaints: any[];
  isLoading: boolean;
}

export function ComplaintList({ complaints, isLoading }: ComplaintListProps) {
  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Chargement...</div>;
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">Aucune réclamation</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {complaints.map((complaint) => (
        <ComplaintItem key={complaint.id} complaint={complaint} />
      ))}
    </div>
  );
}
