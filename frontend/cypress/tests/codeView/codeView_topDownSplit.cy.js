describe('Top-Down Split Mobile UI - Comprehensive Tests', () => {
  beforeEach(() => {
    // Open the application and navigate to code view
    cy.visit('/');
    cy.get('.icon-button.fa-code').first().click();
    cy.get('#tab-authorship', { timeout: 30000 }).should('be.visible');
  });

  describe('Viewport and Orientation Tests', () => {
    it('switches between portrait layout (top-down) and landscape layout (left-right)', () => {
      // Test landscape layout
      cy.viewport(1200, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');
      
      // Verify container arrangement in landscape
      cy.get('.left-resize-container').should('be.visible');
      cy.get('.right-resize-container').should('be.visible');

      // Switch to portrait layout
      cy.viewport(600, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'column');
    });

    it('maintains separate resize ratios for portrait and landscape modes', () => {
      // Start in landscape and adjust the resize ratio
      cy.viewport(1200, 800);
      
      // Get initial landscape dimensions
      cy.get('.right-resize-container').invoke('outerWidth').as('initialLandscapeWidth');
      cy.get('#app-wrapper').invoke('outerWidth').as('totalLandscapeWidth');

      // Switch to portrait and verify different ratios are maintained
      cy.viewport(600, 800);
      
      // Check that both containers together fill the parent vertically
      cy.get('.left-resize-container').invoke('outerHeight').as('leftHeight');
      cy.get('.right-resize-container').invoke('outerHeight').as('rightHeight');
      cy.get('#app-wrapper').invoke('outerHeight').as('totalHeight');

      cy.then(function checkCombinedHeight() {
        const combined = this.leftHeight + this.rightHeight;
        expect(combined).to.be.closeTo(this.totalHeight, 15); // Account for borders/padding
      });

      // Switch back to landscape and verify landscape ratios are preserved
      cy.viewport(1200, 800);
      cy.get('.right-resize-container').invoke('outerWidth').as('currentLandscapeWidth');
      
      cy.then(function checkLandscapeRatioPreserved() {
        // The ratio should be approximately the same as before
        const initialRatio = this.initialLandscapeWidth / this.totalLandscapeWidth;
        const currentRatio = this.currentLandscapeWidth / this.totalLandscapeWidth;
        expect(currentRatio).to.be.closeTo(initialRatio, 0.1);
      });
    });

    it('verifies CSS flex-direction changes correctly between row and column', () => {
      // Landscape: flex-direction should be 'row'
      cy.viewport(1200, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');

      // Portrait: flex-direction should be 'column'  
      cy.viewport(600, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'column');

      // Test edge case - exactly at threshold (768px)
      cy.viewport(768, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row'); // Should still be row at 768px

      // Just below threshold
      cy.viewport(767, 800);
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'column');
    });

    it('handles viewport changes when height is not greater than width', () => {
      // Test case where width <= 768 but height is not > width (should still be landscape)
      cy.viewport(600, 400); // width <= 768 but height < width
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');

      // Square viewport
      cy.viewport(600, 600); // width <= 768 but height = width
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');
    });
  });

  describe('Resizer Drag Functionality Tests', () => {
    it('shows resize guide visibility during drag operations in both orientations', () => {
      // Test in landscape mode
      cy.viewport(1200, 800);
      
      // Initially, resize guide should not be visible
      cy.get('#tab-resize-guide')
        .should('not.be.visible');

      // Start dragging
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      // During drag, guide should be visible
      cy.get('#tab-resize-guide')
        .should('be.visible');

      // End dragging
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // After drag, guide should be hidden again
      cy.get('#tab-resize-guide')
        .should('not.be.visible');

      // Test in portrait mode
      cy.viewport(600, 800);
      
      // Start dragging in portrait
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      // Guide should be visible during portrait drag
      cy.get('#tab-resize-guide')
        .should('be.visible');

      // End dragging
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // Guide should be hidden after drag
      cy.get('#tab-resize-guide')
        .should('not.be.visible');
    });

    it('changes cursor correctly (row-resize for portrait, col-resize for landscape)', () => {
      // Test landscape: should have col-resize cursor
      cy.viewport(1200, 800);
      cy.get('#tab-resize')
        .should('have.css', 'cursor', 'col-resize');

      // Test portrait: should have row-resize cursor
      cy.viewport(600, 800);
      cy.get('#tab-resize')
        .should('have.css', 'cursor', 'row-resize');

      // During drag operations, app-wrapper should show appropriate cursor
      cy.viewport(1200, 800);
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      cy.get('#app-wrapper')
        .should('have.css', 'cursor', 'col-resize');
      
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // Test portrait drag cursor
      cy.viewport(600, 800);
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      cy.get('#app-wrapper')
        .should('have.css', 'cursor', 'row-resize');
        
      cy.get('#app-wrapper')
        .trigger('mouseup');
    });

    it('performs actual drag and resize behavior', () => {
      // Test landscape resize
      cy.viewport(1200, 800);
      
      // Get initial dimensions
      cy.get('.right-resize-container').invoke('outerWidth').as('initialWidth');
      
      // Perform drag operation
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      cy.get('#app-wrapper')
        .trigger('mousemove', { clientX: 500 }); // Move 100px to the left
      
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // Verify the resize occurred
      cy.get('.right-resize-container').invoke('outerWidth').as('newWidth');
      
      cy.then(function checkResize() {
        expect(this.newWidth).not.to.equal(this.initialWidth);
      });

      // Test portrait resize
      cy.viewport(600, 800);
      
      // Get initial dimensions
      cy.get('.right-resize-container').invoke('outerHeight').as('initialHeight');
      
      // Perform vertical drag operation
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientY: 400 });
      
      cy.get('#app-wrapper')
        .trigger('mousemove', { clientY: 350 }); // Move 50px up
      
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // Verify the vertical resize occurred
      cy.get('.right-resize-container').invoke('outerHeight').as('newHeight');
      
      cy.then(function checkVerticalResize() {
        expect(this.newHeight).not.to.equal(this.initialHeight);
      });
    });

    it('handles drag operations with throttled mouse events', () => {
      cy.viewport(1200, 800);
      
      // Start drag
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      // Send multiple rapid mousemove events (should be throttled)
      for (let i = 0; i < 10; i += 1) {
        cy.get('#app-wrapper')
          .trigger('mousemove', { clientX: 500 + i * 5 });
      }
      
      // End drag
      cy.get('#app-wrapper')
        .trigger('mouseup');
      
      // Verify the guide is no longer visible
      cy.get('#tab-resize-guide')
        .should('not.be.visible');
    });
  });

  describe('Edge Cases and Error Handling Tests', () => {
    it('handles rapid orientation changes during resize operations', () => {
      // Start in landscape
      cy.viewport(1200, 800);
      
      // Begin drag operation
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      // Rapidly switch to portrait during drag
      cy.viewport(600, 800);
      
      // Verify the component handles the orientation change gracefully
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'column');
      
      cy.get('#tab-resize')
        .should('have.css', 'cursor', 'row-resize');
      
      // End the drag operation
      cy.get('#app-wrapper')
        .trigger('mouseup');
      
      // Switch back to landscape
      cy.viewport(1200, 800);
      
      // Verify everything still works
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');
    });

    it('enforces minimum and maximum resize bounds', () => {
      // Test landscape bounds
      cy.viewport(1200, 800);
      
      // Try to drag to extreme positions
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      // Try to drag to minimum (should be bounded)
      cy.get('#app-wrapper')
        .trigger('mousemove', { clientX: 1190 }); // Very close to right edge
      
      cy.get('#app-wrapper')
        .trigger('mouseup');
      
      // Verify minimum width is maintained
      cy.get('.right-resize-container').invoke('outerWidth').then((width) => {
        expect(width).to.be.greaterThan(30); // Should have minimum width
      });

      // Try to drag to maximum (should be bounded)
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      cy.get('#app-wrapper')
        .trigger('mousemove', { clientX: 10 }); // Very close to left edge
      
      cy.get('#app-wrapper')
        .trigger('mouseup');
      
      // Verify maximum width is bounded
      cy.get('.right-resize-container').invoke('outerWidth').then((width) => {
        expect(width).to.be.lessThan(1180); // Should be less than full width
      });
    });

    it('handles mouse leave behavior during drag operations', () => {
      cy.viewport(1200, 800);
      
      // Start drag operation
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0 });
      
      // Verify drag state is active
      cy.get('#tab-resize-guide')
        .should('be.visible');
      
      // Simulate mouse leave
      cy.get('#app-wrapper')
        .trigger('mouseleave');
      
      // Verify drag state is deactivated
      cy.get('#tab-resize-guide')
        .should('not.be.visible');
      
      // Verify cursor is reset
      cy.get('#app-wrapper')
        .should('not.have.css', 'cursor', 'col-resize');
    });

    it('maintains robustness when viewport changes during active resize', () => {
      // Start drag in landscape
      cy.viewport(1200, 800);
      
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      // Change viewport during drag
      cy.viewport(1000, 700);
      
      // Continue dragging
      cy.get('#app-wrapper')
        .trigger('mousemove', { clientX: 400 });
      
      // End drag
      cy.get('#app-wrapper')
        .trigger('mouseup');
      
      // Verify the component still functions correctly
      cy.get('.right-resize-container').should('be.visible');
      cy.get('#tab-resize-guide').should('not.be.visible');
    });

    it('handles multiple rapid resize attempts', () => {
      cy.viewport(1200, 800);
      
      // Perform multiple rapid drag operations
      for (let i = 0; i < 3; i += 1) {
        cy.get('#tab-resize')
          .trigger('mousedown', { button: 0, clientX: 600 });
        
        cy.get('#app-wrapper')
          .trigger('mousemove', { clientX: 500 + i * 20 });
        
        cy.get('#app-wrapper')
          .trigger('mouseup');
      }
      
      // Verify the component is still functional
      cy.get('.right-resize-container').should('be.visible');
      cy.get('#tab-resize').should('be.visible');
    });
  });

  describe('Visual Layout Verification Tests', () => {
    it('verifies correct element positioning (top-down vs left-right)', () => {
      // Test landscape positioning (left-right)
      cy.viewport(1200, 800);
      
      cy.get('.left-resize-container').then(($left) => {
        cy.get('.right-resize-container').then(($right) => {
          const leftRect = $left[0].getBoundingClientRect();
          const rightRect = $right[0].getBoundingClientRect();
          
          // In landscape, right container should be to the right of left container
          expect(rightRect.left).to.be.greaterThan(leftRect.right - 20); // Account for border
        });
      });

      // Test portrait positioning (top-down)
      cy.viewport(600, 800);
      
      cy.get('.left-resize-container').then(($left) => {
        cy.get('.right-resize-container').then(($right) => {
          const leftRect = $left[0].getBoundingClientRect();
          const rightRect = $right[0].getBoundingClientRect();
          
          // In portrait, right container should be below left container
          expect(rightRect.top).to.be.greaterThan(leftRect.bottom - 20); // Account for border
        });
      });
    });

    it('validates CSS property changes for different orientations', () => {
      // Test landscape CSS properties
      cy.viewport(1200, 800);
      
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'row');
      
      cy.get('.right-resize-container')
        .should('have.css', 'flex')
        .and('match', /0 0 \d+(\.\d+)?%/); // flex: 0 0 percentage
      
      // Test portrait CSS properties
      cy.viewport(600, 800);
      
      cy.get('#app-wrapper')
        .should('have.css', 'flex-direction', 'column');
      
      cy.get('.right-resize-container')
        .should('have.css', 'flex')
        .and('match', /0 0 \d+(\.\d+)?%/); // flex: 0 0 percentage
      
      // Verify height is also set in portrait mode
      cy.get('.right-resize-container')
        .should('have.css', 'height')
        .and('match', /\d+(\.\d+)?%/); // height: percentage
    });

    it('ensures layout consistency across viewport changes', () => {
      const viewports = [
        [1200, 800], // Landscape
        [600, 800],  // Portrait
        [768, 800],  // Edge case - exactly at threshold
        [1000, 600], // Wide but short
        [400, 900],  // Narrow and tall
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        
        // Verify basic layout elements are always present and visible
        cy.get('.left-resize-container').should('be.visible');
        cy.get('.right-resize-container').should('be.visible');
        cy.get('#tab-resize').should('be.visible');
        
        // Verify appropriate flex-direction
        const isPortrait = width <= 768 && height > width;
        const expectedDirection = isPortrait ? 'column' : 'row';
        
        cy.get('#app-wrapper')
          .should('have.css', 'flex-direction', expectedDirection);
        
        // Verify resize cursor
        const expectedCursor = isPortrait ? 'row-resize' : 'col-resize';
        cy.get('#tab-resize')
          .should('have.css', 'cursor', expectedCursor);
      });
    });

    it('verifies resize guide positioning in different orientations', () => {
      // Test landscape resize guide positioning
      cy.viewport(1200, 800);
      
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientX: 600 });
      
      cy.get('#tab-resize-guide')
        .should('be.visible')
        .should('have.css', 'display', 'block');
      
      // In landscape, guide should have 'right' positioning
      cy.get('#tab-resize-guide')
        .should('have.css', 'right')
        .and('match', /\d+(\.\d+)?%/);
      
      cy.get('#app-wrapper')
        .trigger('mouseup');

      // Test portrait resize guide positioning
      cy.viewport(600, 800);
      
      cy.get('#tab-resize')
        .trigger('mousedown', { button: 0, clientY: 400 });
      
      cy.get('#tab-resize-guide')
        .should('be.visible')
        .should('have.css', 'display', 'block');
      
      // In portrait, guide should have 'bottom' positioning
      cy.get('#tab-resize-guide')
        .should('have.css', 'bottom')
        .and('match', /\d+(\.\d+)?%/);
      
      cy.get('#app-wrapper')
        .trigger('mouseup');
    });

    it('validates container dimensions and ratios', () => {
      // Test landscape dimensions
      cy.viewport(1200, 800);
      
      cy.get('#app-wrapper').invoke('outerWidth').as('totalWidth');
      cy.get('#app-wrapper').invoke('outerHeight').as('totalHeight');
      cy.get('.left-resize-container').invoke('outerWidth').as('leftWidth');
      cy.get('.right-resize-container').invoke('outerWidth').as('rightWidth');
      
      cy.then(function validateLandscapeDimensions() {
        // Both containers should fill the total width (approximately)
        const combinedWidth = this.leftWidth + this.rightWidth;
        expect(combinedWidth).to.be.closeTo(this.totalWidth, 20); // Account for borders/padding
        
        // Each container should have reasonable minimum dimensions
        expect(this.leftWidth).to.be.greaterThan(50);
        expect(this.rightWidth).to.be.greaterThan(50);
      });

      // Test portrait dimensions  
      cy.viewport(600, 800);
      
      cy.get('#app-wrapper').invoke('outerHeight').as('totalHeight');
      cy.get('.left-resize-container').invoke('outerHeight').as('leftHeight');
      cy.get('.right-resize-container').invoke('outerHeight').as('rightHeight');
      
      cy.then(function validatePortraitDimensions() {
        // Both containers should fill the total height (approximately)
        const combinedHeight = this.leftHeight + this.rightHeight;
        expect(combinedHeight).to.be.closeTo(this.totalHeight, 20); // Account for borders/padding
        
        // Each container should have reasonable minimum dimensions
        expect(this.leftHeight).to.be.greaterThan(50);
        expect(this.rightHeight).to.be.greaterThan(50);
      });
    });
  });
});