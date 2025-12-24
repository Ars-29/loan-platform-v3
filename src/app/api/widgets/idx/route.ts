import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IDX Property Search Widget</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 2rem 1rem;
      /* Set up container query context */
      container-type: inline-size;
      container-name: page-container;
    }
    #idxwidget-122191 {
      width: 100% !important;
      min-height: 600px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      /* Set up container query context for widget */
      container-type: inline-size;
      container-name: widget-container;
    }
    #idxwidget-122191 iframe,
    #idxwidget-122191 > div {
      width: 100% !important;
      max-width: 100% !important;
    }
    /* Center the AI search bar */
    #idx-ai-smart-search-122191 {
      margin: 2rem auto !important;
      display: block !important;
      width: 100% !important;
      max-width: 800px !important;
      min-width: 0 !important;
      padding: 0 1rem !important;
      box-sizing: border-box !important;
    }
    
    /* Force width to be responsive - override any inline styles */
    #idx-ai-smart-search-122191[style*="width"] {
      width: 100% !important;
      max-width: 800px !important;
    }
    /* Hide duplicate search bars that might appear at the bottom */
    body > #idx-ai-smart-search-122191:not(:first-of-type) {
      display: none !important;
    }
    /* Container queries for responsive design */
    @container page-container (max-width: 768px) {
      body {
        padding: 1rem 0.5rem !important;
      }
      #idx-ai-smart-search-122191 {
        max-width: 100% !important;
        width: 100% !important;
        margin: 1rem auto !important;
        padding: 0 0.5rem !important;
      }
    }
    
    @container widget-container (max-width: 768px) {
      #idxwidget-122191 {
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch;
      }
    }
    
    @container page-container (max-width: 480px) {
      #idx-ai-smart-search-122191 {
        margin: 0.75rem auto !important;
        padding: 0 0.25rem !important;
      }
    }
  </style>
</head>
<body>
  <script
    id="idxwidgetsrc-122191"
    charset="UTF-8"
    type="text/javascript"
    src="//syncly360.idxbroker.com/idx/widgets/122191"
    async
  ></script>
  <script>
    // Function to make search bar mobile responsive using container queries
    function makeSearchBarResponsive() {
      const searchBar = document.getElementById('idx-ai-smart-search-122191');
      
      if (!searchBar) {
        return false;
      }
      
      // Access shadow DOM if it exists
      let shadowRoot = null;
      try {
        shadowRoot = searchBar.shadowRoot;
      } catch (e) {
        console.log('No shadow DOM access or shadow DOM not found');
      }
      
      // Function to inject container query styles into shadow DOM
      function injectShadowStyles(root) {
        if (!root) return;
        
        // Remove existing styles if present to re-inject
        const existingStyle = root.getElementById('mobile-responsive-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'mobile-responsive-styles';
        style.textContent = \`
          /* Set up container query context in shadow DOM */
          :host {
            container-type: inline-size;
            container-name: search-bar-container;
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box !important;
          }
          
          /* Override any fixed widths on the host */
          :host[style*="width"] {
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Base styles for all containers */
          * {
            box-sizing: border-box !important;
          }

          .idx-ai-smart-search__search-bar::placeholder{
            color: gray !important;
          }
          
          /* Container queries for mobile responsive styles */
          @container search-bar-container (max-width: 768px) {
            :host {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              display: block !important;
            }
            
            /* Target all possible container structures */
            form,
            div,
            div[class*="search"],
            div[class*="form"],
            div[class*="container"],
            .search-container,
            .search-form,
            [class*="wrapper"],
            [class*="input-group"] {
              width: 100% !important;
              max-width: 90% !important;
              min-width: 0 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 0.75rem !important;
              box-sizing: border-box !important;
            }
            
            /* Make inputs full width on mobile */
            input,
            textarea,
            input[type="text"],
            input[type="search"],
            [role="textbox"] {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              font-size: 16px !important;
              padding: 0.875rem 1rem !important;
              box-sizing: border-box !important;
              flex: none !important;
            }
            
            /* Make buttons full width on mobile */
            button,
            input[type="submit"],
            input[type="button"],
            [role="button"],
            [class*="button"] {
              width: 100% !important;
              max-width: 100% !important;
              min-width: 0 !important;
              font-size: 16px !important;
              white-space: normal !important;
              box-sizing: border-box !important;
              flex: none !important;
            }

            .idx-ai-smart-search__search-button{
              border-radius: 0px 0px 0.5rem 0.5rem !important;
              display: flex !important;
              justify-content: center !important;
            }
            
            .idx-ai-smart-search__search-button div{
              max-width: 100px !important;
            }
          }
          
          @container search-bar-container (max-width: 480px) {
            input,
            textarea,
            input[type="text"],
            input[type="search"] {
              padding: 0.75rem 0.875rem !important;
              font-size: 16px !important;
            }
            
            button,
            input[type="submit"],
            input[type="button"] {
              padding: 0.75rem 0.875rem !important;
              font-size: 16px !important;
            }
          }
        \`;
        
        root.appendChild(style);
        console.log('Container query styles injected into shadow DOM');
      }
      
      // Force width on the host element itself
      if (searchBar.style) {
        searchBar.style.width = '100%';
        searchBar.style.maxWidth = '800px';
        searchBar.style.minWidth = '0';
        searchBar.style.boxSizing = 'border-box';
      }
      
      // Inject styles into shadow DOM if it exists
      if (shadowRoot) {
        injectShadowStyles(shadowRoot);
      } else {
        // If no shadow DOM, try to style the element directly
        // The widget might render content after shadow DOM is created
        const observer = new MutationObserver(function() {
          const updatedShadowRoot = searchBar.shadowRoot;
          if (updatedShadowRoot) {
            injectShadowStyles(updatedShadowRoot);
            // Also force width again after shadow DOM is ready
            searchBar.style.width = '100%';
            searchBar.style.maxWidth = '800px';
            observer.disconnect();
          }
        });
        observer.observe(searchBar, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style']
        });
      }
      
      // Watch for style attribute changes and override
      const styleObserver = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const currentWidth = searchBar.style.width;
            if (currentWidth && currentWidth !== '100%' && currentWidth.includes('px')) {
              searchBar.style.width = '100%';
              searchBar.style.maxWidth = '800px';
            }
          }
        });
      });
      
      styleObserver.observe(searchBar, {
        attributes: true,
        attributeFilter: ['style']
      });
      
      return true;
    }
    
    // Try to make responsive immediately
    if (makeSearchBarResponsive()) {
      console.log('Search bar made responsive on initial check');
    }
    
    // Apply responsive styles after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(makeSearchBarResponsive, 500);
      });
    }
    
    // Apply at intervals to catch dynamically loaded content
    const intervals = [500, 1000, 2000, 3000, 5000];
    intervals.forEach(delay => {
      setTimeout(makeSearchBarResponsive, delay);
    });
    
    // Use MutationObserver to watch for dynamically added elements
    const observer = new MutationObserver(function(mutations) {
      const searchBar = document.getElementById('idx-ai-smart-search-122191');
      if (searchBar) {
        console.log('Search bar detected via MutationObserver!');
        makeSearchBarResponsive();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Watch for shadow DOM creation
    const shadowObserver = new MutationObserver(function() {
      const searchBar = document.getElementById('idx-ai-smart-search-122191');
      if (searchBar && searchBar.shadowRoot) {
        console.log('Shadow DOM detected!');
        makeSearchBarResponsive();
      }
    });
    
    shadowObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}

