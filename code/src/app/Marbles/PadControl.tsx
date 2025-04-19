import * as React from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface PadControlProps {
  onDirectionChange: (direction: string) => void;
}

const PadControl: React.FunctionComponent<PadControlProps> = ({ onDirectionChange }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDirectionChange('center');
    // Forzar el retorno al centro
    animate(x, 0, { duration: 0.1 });
    animate(y, 0, { duration: 0.1 });
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