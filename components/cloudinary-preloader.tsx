"use client";

import { useEffect } from "react";

// Define types for our resources
interface PreloadResource {
  href: string;
  as: string;
  id: string;
  crossOrigin?: string;
  rel?: string; // Add rel to allow either preload or prefetch
}

export function CloudinaryPreloader() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get the cloud name from your environment or set it directly
      // This approach allows for different environments or configurations
      const cloudName = typeof process !== 'undefined' ? 
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwfimti8w' : 
        'dwfimti8w';
      
      // Current Cloudinary widget version
      const widgetVersion = '2.27.9';

      // Resources to preload - core scripts, styles, and assets
      const resources: PreloadResource[] = [
        // Core Cloudinary scripts - these should be preloaded for immediate use
        {
          href: 'https://media-library.cloudinary.com/global/all.js',
          as: 'script',
          id: 'cloudinary-preload-link'
        },
        {
          href: `https://upload-widget.cloudinary.com/${widgetVersion}/widget/runtime.ba06111566795e41.js`,
          as: 'script',
          id: 'cloudinary-runtime-preload-link'
        },
        {
          href: `https://upload-widget.cloudinary.com/${widgetVersion}/widget/main.cd9662a0df381bd3.js`,
          as: 'script',
          id: 'cloudinary-main-preload-link'
        },
        
        // Core Cloudinary styles
        {
          href: `https://upload-widget.cloudinary.com/${widgetVersion}/widget/main.0bd6bb31a229dd71.css`,
          as: 'style',
          id: 'cloudinary-css-preload-link'
        },
        
        // External dependencies
        {
          href: 'https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.11.0/rollbar.min.js',
          as: 'script',
          id: 'rollbar-preload-link'
        },
        {
          href: 'https://www.googletagmanager.com/gtm.js?id=GTM-PL3TQTCW',
          as: 'script',
          id: 'gtm-preload-link'
        },
      ];
      
      // Resources to prefetch - these are needed later but not immediately
      const prefetchResources: PreloadResource[] = [
        // Branding assets - used only when widget opens, so prefetch instead of preload
        {
          href: 'https://res-s.cloudinary.com/cloudinary/image/upload/v1522227140/upload-widget-2-assets/powered-by-new.svg',
          as: 'image',
          id: 'cloudinary-svg-prefetch-link',
          rel: 'prefetch'
        },
        {
          href: `https://res.cloudinary.com/${cloudName}/image/upload/v1747857679/ora6qt0sb6kyso7u7iqd.png`,
          as: 'image',
          id: 'cloudinary-account-image-prefetch-link',
          rel: 'prefetch'
        }
      ];

      // Prefetch the widget configuration
      const configResource: PreloadResource = {
        href: `https://widget.cloudinary.com/info/${cloudName}.json?sources[]=local&sources[]=url&sources[]=camera&sources[]=image_search&sources[]=google_drive&sources[]=dropbox&sources[]=facebook&sources[]=instagram&sources[]=shutterstock&sources[]=getty&sources[]=istock&sources[]=unsplash&uploadPreset=1&secure=1&multiple=1`,
        as: 'fetch',
        id: 'cloudinary-config-prefetch-link',
        crossOrigin: 'anonymous',
        rel: 'prefetch'
      };
      
      // Combine all resources
      const allResources = [...resources, ...prefetchResources, configResource];
      
      // Add preload/prefetch links for all resources
      allResources.forEach(resource => {
        const existingLink = document.head.querySelector(`link[id="${resource.id}"]`);
        if (!existingLink) {
          const linkElement = document.createElement('link');
          linkElement.rel = resource.rel || 'preload'; // Use specified rel or default to preload
          linkElement.href = resource.href;
          linkElement.as = resource.as;
          linkElement.id = resource.id;
          
          // Add crossOrigin for fetch requests
          if (resource.crossOrigin) {
            linkElement.crossOrigin = resource.crossOrigin;
          }
          
          document.head.appendChild(linkElement);
        }
      });

      // Add DNS prefetch and preconnect for domains
      const domains = [
        'upload-widget.cloudinary.com',
        'widget.cloudinary.com',
        'media-library.cloudinary.com',
        'res.cloudinary.com',
        'res-s.cloudinary.com',
        'www.googletagmanager.com',
        'cdnjs.cloudflare.com'
      ];
      
      domains.forEach(domain => {
        // DNS prefetch
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = `//${domain}`;
        document.head.appendChild(dnsPrefetch);
        
        // Preconnect
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = `//${domain}`;
        preconnect.crossOrigin = 'anonymous';
        document.head.appendChild(preconnect);
      });

      // Add global z-index styles for cloudinary modals
      const existingStyleTag = document.getElementById('cloudinary-z-index-style');
      if (!existingStyleTag) {
        const styleTag = document.createElement('style');
        styleTag.id = 'cloudinary-z-index-style';
        styleTag.innerHTML = `
          /* Target the Cloudinary modal with higher specificity */
          .cloudinary-overlay, div.cloudinary-overlay, [class*="cloudinary-overlay"] {
            z-index: 99999999 !important;
            position: fixed !important;
          }
          
          .cloudinary-widget, div.cloudinary-widget, [class*="cloudinary-widget"] {
            z-index: 100000000 !important;
            position: fixed !important;
          }
          
          iframe[data-test="uw-iframe"] {
            z-index: 100000000 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
          
          /* Additional selectors for better modal handling */
          .cloudinary-fileupload {
            z-index: 100000001 !important;
          }
          
          /* Ensure modal appears over all page content */
          body.cld-upload-modal-open {
            overflow: hidden;
          }
        `;
        document.head.appendChild(styleTag);
      }

      // Preload Cloudinary script
      const cloudinaryScript = document.createElement('script');
      cloudinaryScript.src = 'https://media-library.cloudinary.com/global/all.js';
      cloudinaryScript.async = true;
      cloudinaryScript.id = 'cloudinary-script-preload';
      
      // Check if script already exists
      if (!document.getElementById('cloudinary-script-preload')) {
        document.body.appendChild(cloudinaryScript);
      }
      
      // Preload Rollbar script
      const rollbarScript = document.createElement('script');
      rollbarScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/2.11.0/rollbar.min.js';
      rollbarScript.async = true;
      rollbarScript.id = 'rollbar-script-preload';
      
      // Check if Rollbar script already exists
      if (!document.getElementById('rollbar-script-preload')) {
        document.body.appendChild(rollbarScript);
      }
      
      // Preload widget iframe (this helps with initial widget loading)
      const preloadWidgetIframe = () => {
        // Create a hidden iframe to preload the widget
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.id = 'cloudinary-preload-iframe';
        
        // Set the source to the widget URL
        iframe.src = `https://upload-widget.cloudinary.com/${widgetVersion}/widget/index.html?cloudName=${cloudName}`;
        
        // Remove after loading to avoid keeping unnecessary resources
        iframe.onload = () => {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 5000); // Remove after 5 seconds to allow resources to load
        };
        
        // Only add if it doesn't exist
        if (!document.getElementById('cloudinary-preload-iframe')) {
          document.body.appendChild(iframe);
        }
      };
      
      // Execute the preload after a short delay to prioritize critical resources first
      setTimeout(preloadWidgetIframe, 3000);
    }
  }, []);

  return null; // This component doesn't render anything
} 