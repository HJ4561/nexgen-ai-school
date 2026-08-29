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
    overflow-hidden md:block md:hidden relative
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
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-5 sm:p-4 sm:p-6 sm:gap-5 sm:p-4 sm:p-6 sm:p-4 sm:p-6 px-6 pt-6 pb-4 px-4 sm:px-6 lg:px-8">
          {icon && (
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-xl flex flex-col md:flex-row items-center justify-center
              ${floatingIcon ? 'animate-float' : ''}
              bg-gradient-to-br from-${tone}-light to-${tone}-border
              text-${tone}-primary
            `}>
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8">
            {title && <h3 className="text-sm md:text-base md:text-base font-semibold text-gray-800 px-4 sm:px-6 lg:px-8">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5 px-4 sm:px-6 lg:px-8">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="px-6 pb-4 px-4 sm:px-6 lg:px-8">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 px-4 sm:px-6 lg:px-8">
          {typeof footer === 'string' ? <span className="text-xs text-gray-500 px-4 sm:px-6 lg:px-8">{footer}</span> : footer}
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
  <h3 className={`text-lg md:text-xl md:text-2xl font-semibold text-gray-800 ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm md:text-base md:text-base text-gray-500 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-t border-gray-100 bg-gray-50 ${className}`}>{children}</div>
);

// ? BOTH default AND named export for Card
export { Card };
export default Card;
