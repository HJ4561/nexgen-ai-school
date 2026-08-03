// src/components/ui/Card.jsx
import React from "react";

const Card = ({
  tone = "brand",
  title,
  subtitle,
  icon,
  children,
  footer,
  accent = "top",
  onClick,
  className = "",
  hover = true,
  floatingIcon = false,
  accentColor,
  ...props
}) => {
  const THEMES = {
    brand: { accent: "bg-brand-primary", border: "border-brand-primary/20", text: "text-brand-primary" },
    admin: { accent: "bg-admin-primary", border: "border-admin-primary/20", text: "text-admin-primary" },
    teacher: { accent: "bg-teacher-primary", border: "border-teacher-primary/20", text: "text-teacher-primary" },
    student: { accent: "bg-student-primary", border: "border-student-primary/20", text: "text-student-primary" },
    parent: { accent: "bg-parent-primary", border: "border-parent-primary/20", text: "text-parent-primary" },
  };

  const theme = THEMES[tone] || THEMES.brand;
  const accentClass = accentColor || theme.accent;

  const containerClasses = `
    bg-white rounded-xl border border-gray-100 
    overflow-hidden relative
    ${hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const accentClasses = {
    top: `border-t-4 ${accentClass}`,
    left: `border-l-4 ${accentClass}`,
    none: "",
  };

  return (
    <div
      className={`${containerClasses} ${accentClasses[accent] || accentClasses.top}`}
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-start gap-4 px-6 pt-6 pb-4">
          {icon && (
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
              ${floatingIcon ? 'animate-float' : ''}
              bg-gradient-to-br from-${tone}-light to-${tone}-border
              text-${tone}-primary
            `}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-sm font-semibold text-gray-800">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="px-6 pb-4">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {typeof footer === 'string' ? <span className="text-xs text-gray-500">{footer}</span> : footer}
        </div>
      )}
    </div>
  );
};

// Sub-components
export const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 pt-6 pb-4 border-b border-gray-100 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 ${className}`}>{children}</div>
);

// ✅ BOTH default AND named export for Card
export { Card };
export default Card;
