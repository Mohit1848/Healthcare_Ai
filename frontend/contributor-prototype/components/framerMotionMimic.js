// Premium custom framer-motion mimicking utility supporting cinematic declarative animations
// Supports initial, animate, transition={{ delay, duration }}, layout classes, etc.

const React = window.React;

const createMotionComponent = (Tag) => {
  return React.forwardRef(({ initial, animate, transition, style, className, children, ...props }, ref) => {
    const [currentStyles, setCurrentStyles] = React.useState(() => {
      // Apply initial state styles
      const baseStyles = { ...style };
      if (initial) {
        if (initial.opacity !== undefined) baseStyles.opacity = initial.opacity;
        if (initial.scale !== undefined) baseStyles.transform = `scale(${initial.scale})`;
        if (initial.y !== undefined) baseStyles.transform = `${baseStyles.transform || ''} translateY(${typeof initial.y === 'number' ? initial.y + 'px' : initial.y})`.trim();
        if (initial.x !== undefined) baseStyles.transform = `${baseStyles.transform || ''} translateX(${typeof initial.x === 'number' ? initial.x + 'px' : initial.x})`.trim();
        if (initial.filter !== undefined) baseStyles.filter = initial.filter;
      }
      return baseStyles;
    });

    React.useEffect(() => {
      if (!animate) return;
      
      const delay = (transition?.delay || 0) * 1000;
      const duration = (transition?.duration || 0.6) * 1000;
      
      const timer = setTimeout(() => {
        setCurrentStyles((prev) => {
          const updated = { ...prev };
          // Setup smooth CSS transition
          updated.transition = `all ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
          
          if (animate.opacity !== undefined) updated.opacity = animate.opacity;
          
          let transformStr = '';
          if (animate.scale !== undefined) transformStr += `scale(${animate.scale}) `;
          if (animate.x !== undefined) transformStr += `translateX(${typeof animate.x === 'number' ? animate.x + 'px' : animate.x}) `;
          if (animate.y !== undefined) transformStr += `translateY(${typeof animate.y === 'number' ? animate.y + 'px' : animate.y}) `;
          if (transformStr) updated.transform = transformStr.trim();
          
          if (animate.filter !== undefined) updated.filter = animate.filter;
          if (animate.borderColor !== undefined) updated.borderColor = animate.borderColor;
          if (animate.backgroundColor !== undefined) updated.backgroundColor = animate.backgroundColor;
          if (animate.boxShadow !== undefined) updated.boxShadow = animate.boxShadow;
          
          return updated;
        });
      }, delay);

      return () => clearTimeout(timer);
    }, [animate, transition]);

    return React.createElement(
      Tag,
      {
        ref,
        style: currentStyles,
        className: `${className || ''} transition-all`.trim(),
        ...props
      },
      children
    );
  });
};

window.motion = {
  div: createMotionComponent('div'),
  span: createMotionComponent('span'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  button: createMotionComponent('button'),
  section: createMotionComponent('section'),
  main: createMotionComponent('main'),
};

// Also support a staggered reveal list container helper
window.AnimatePresence = ({ children }) => <>{children}</>;
