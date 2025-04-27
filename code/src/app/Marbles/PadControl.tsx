import * as React from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

// Declarar la interfaz global para updatePadPosition
declare global {
  interface Window {
    updatePadPosition?: (direction: string) => void;
  }
}

interface PadControlProps {
  onDirectionChange: (direction: string) => void;
}

const PadControl: React.FunctionComponent<PadControlProps> = ({ onDirectionChange }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Función para actualizar la posición del pad
  const updatePadPosition = React.useCallback((direction: string) => {
    const distance = 50; // Misma distancia que en dragConstraints
    let newX = 0;
    let newY = 0;

    switch(direction) {
      case 'N':
        newY = -distance;
        break;
      case 'S':
        newY = distance;
        break;
      case 'E':
        newX = distance;
        break;
      case 'W':
        newX = -distance;
        break;
      case 'NE':
        newX = distance * Math.cos(Math.PI / 4);
        newY = -distance * Math.sin(Math.PI / 4);
        break;
      case 'NW':
        newX = -distance * Math.cos(Math.PI / 4);
        newY = -distance * Math.sin(Math.PI / 4);
        break;
      case 'SE':
        newX = distance * Math.cos(Math.PI / 4);
        newY = distance * Math.sin(Math.PI / 4);
        break;
      case 'SW':
        newX = -distance * Math.cos(Math.PI / 4);
        newY = distance * Math.sin(Math.PI / 4);
        break;
      case 'center':
        newX = 0;
        newY = 0;
        break;
    }

    animate(x, newX, { duration: 0.1 });
    animate(y, newY, { duration: 0.1 });
  }, [x, y]);

  // Exponer la función al scope global
  React.useEffect(() => {
    window.updatePadPosition = updatePadPosition;
    return () => {
      delete window.updatePadPosition;
    };
  }, [updatePadPosition]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reset position
    animate(x, 0, { duration: 0.1 });
    animate(y, 0, { duration: 0.1 });
    // Send center direction
    onDirectionChange('center');
    // Update movement state through global function
    if (window.updateMovementState) {
      window.updateMovementState('center');
    }
  };

  const handleDrag = (event: any, info: any) => {
    const angle = Math.atan2(info.offset.y, info.offset.x) * (180 / Math.PI);
    let direction = 'center';

    if (Math.abs(info.offset.x) > 20 || Math.abs(info.offset.y) > 20) {
      if (angle >= -22.5 && angle < 22.5) direction = 'E';
      else if (angle >= 22.5 && angle < 67.5) direction = 'SE';
      else if (angle >= 67.5 && angle < 112.5) direction = 'S';
      else if (angle >= 112.5 && angle < 157.5) direction = 'SW';
      else if (angle >= 157.5 || angle < -157.5) direction = 'W';
      else if (angle >= -157.5 && angle < -112.5) direction = 'NW';
      else if (angle >= -112.5 && angle < -67.5) direction = 'N';
      else if (angle >= -67.5 && angle < -22.5) direction = 'NE';
    }

    onDirectionChange(direction);
    // Update movement state through global function
    if (window.updateMovementState) {
      window.updateMovementState(direction);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <motion.div
        drag
        dragConstraints={{
          top: -50,
          left: -50,
          right: 50,
          bottom: 50
        }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrag={handleDrag}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: isDragging 
            ? 'radial-gradient(circle at 30% 30%, rgba(50, 255, 50, 0.9), rgba(0, 150, 0, 0.9))'
            : 'radial-gradient(circle at 30% 30%, rgba(50, 255, 50, 0.7), rgba(0, 150, 0, 0.7))',
          boxShadow: isDragging
            ? '0 0 15px rgba(0, 255, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.5)'
            : '0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 8px rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          position: 'absolute',
          x,
          y
        }}
      />
    </div>
  );
};

export { PadControl }; 