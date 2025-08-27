import React, { useState } from 'react';

export const Dialog = ({ children }) => {
  return <div>{children}</div>;
};

export const DialogTrigger = ({ asChild, children, onClick }) => {
  return React.cloneElement(children, { onClick });
};

export const DialogContent = ({ className = '', children, ...props }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
    <div
      className={`relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  </div>
);

export const DialogHeader = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ className = '', children, ...props }) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h2>
);

export const DialogDescription = ({ className = '', children, ...props }) => (
  <p className={`text-sm text-muted-foreground ${className}`} {...props}>
    {children}
  </p>
);