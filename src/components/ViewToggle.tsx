
import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid2x2, LayoutList } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
        className={`rounded-none min-h-[48px] min-w-[48px] transition-all duration-200 ${
          view === 'grid' 
            ? 'bg-gold text-navy shadow-sm' 
            : 'text-gray-600 hover:text-navy hover:bg-white'
        }`}
      >
        <Grid2x2 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`rounded-none min-h-[48px] min-w-[48px] transition-all duration-200 ${
          view === 'list' 
            ? 'bg-gold text-navy shadow-sm' 
            : 'text-gray-600 hover:text-navy hover:bg-white'
        }`}
      >
        <LayoutList className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ViewToggle;
