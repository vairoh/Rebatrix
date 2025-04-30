
import React, { useEffect } from 'react';

interface ContactFormDebugProps {
  location: string;
}

export default function ContactFormDebug({ location }: ContactFormDebugProps) {
  useEffect(() => {
    console.log(`ContactFormDebug mounted at location: ${location}`);
    
    // Find all forms on the page and log info about them
    const forms = document.querySelectorAll('form');
    console.log(`Found ${forms.length} forms on the page`);
    
    forms.forEach((form, index) => {
      console.log(`Form ${index + 1} details:`, {
        id: form.id,
        className: form.className,
        action: form.action,
        method: form.method,
        elements: Array.from(form.elements).map(el => ({
          name: (el as HTMLElement).getAttribute('name'),
          id: (el as HTMLElement).id,
          type: (el as HTMLInputElement).type,
          placeholder: (el as HTMLInputElement).placeholder
        }))
      });
    });

    // Log DOM hierarchy
    const modalContainers = document.querySelectorAll('[role="dialog"]');
    console.log(`Found ${modalContainers.length} modal containers`);
    
    modalContainers.forEach((container, index) => {
      console.log(`Modal ${index + 1} HTML:`, container.innerHTML.substring(0, 500) + '...');
    });
  }, []);

  return (
    <div style={{ display: 'none' }} data-debug-location={location}>
      {/* Hidden debug component */}
    </div>
  );
}
