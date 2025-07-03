
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
}

const ProductBreadcrumb = ({ items }: ProductBreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <Link to="/" className="hover:text-gold transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link to={item.href} className="hover:text-gold transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-navy font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default ProductBreadcrumb;
