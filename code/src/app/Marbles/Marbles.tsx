import * as React from 'react';
import { PageSection, Title, Modal, ModalVariant, Button, Form, FormGroup, Grid, GridItem, Popover, TextInput } from '@patternfly/react-core';
import RosaVientosEstrellas from './rose';
declare global {
  interface Window {
    JSMpeg: any;
  }
}

const Marbles: React.FunctionComponent = () => {
  // Crea una referencia para el elemento canvas
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rosaVientosRef = React.useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [streamStarted, setStreamStarted] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [playerName, setPlayerName] = React.useState('');
  const [isWideScreen, setIsWideScreen] = React.useState(window.innerWidth > 1000);
  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setModalOpen(!isModalOpen);
  };
  const handleNameInputChange = (_event, value: string) => {
    setPlayerName(value);
  };
  // Configura JSMpeg cuando el script está cargado y el canvas está disponible
  React.useEffect(() => {
    const scriptPath = '/assets/js/jsmpeg.min.js';
    
    const jsmpeg = document.createElement('script');
    jsmpeg.src = scriptPath;
    jsmpeg.async = true;
    jsmpeg.onload = () => {
      console.log('JSMpeg cargado correctamente');
      setScriptLoaded(true);
    };
    jsmpeg.onerror = (error) => {
      console.error('Error al cargar JSMpeg:', error);
    };
    document.body.appendChild(jsmpeg);
    const socket = document.createElement('script');
    socket.src = '/assets/js/socket.io.min.js';
    socket.async = true;
    socket.onload = () => {
      console.log('Socket cargado correctamente');
      const marblesjs = document.createElement('script');
      marblesjs.src = '/assets/js/marbles.js';
      marblesjs.async = true;
      document.body.appendChild(marblesjs);
    }
    socket.onerror = (error) => {
      console.error('Error al cargar Socket:', error);
    }
    document.body.appendChild(socket);
  }, []);

  const updatePositions = () => {
    if (scriptLoaded && canvasRef.current && rosaVientosRef.current) {

      const canvas = canvasRef.current;
      const rosaVientos = rosaVientosRef.current;
      if (!streamStarted) {
        setStreamStarted(true);
        const jsmpegurl = 'wss://www.rciots.com/video';
        const player = new window.JSMpeg.Player(jsmpegurl, {
          canvas: canvas
        });
      }

      canvas.style.width = '1600px';
      canvas.style.height = '900px';      
      if ((window.innerWidth < 1920) && (window.innerHeight < 1080)) {
        canvas.style.width = window.innerWidth * 0.7 + 'px';
        canvas.style.height = window.innerWidth * 0.7 * 9 / 16 + 'px';
      } else if (window.innerWidth < 1920) {
        canvas.style.width = window.innerWidth * 0.7 + 'px';
        canvas.style.height = window.innerWidth * 0.7 * 9 / 16 + 'px';
      } else if (window.innerHeight < 1080) {
        canvas.style.width = window.innerHeight * 0.7 * 16 / 9 + 'px';
        canvas.style.height = window.innerHeight * 0.7 + 'px';
      }
      // set rosaVientos size based on canvas size
      // if canvas.style.width = 1600px then rosaVientos.style.width = 200px, else will be proportional
      const canvasWidth = canvas.style.width;
      const canvasHeight = canvas.style.height;
      const rosaVientosWidth = 200;
      const rosaVientosHeight = 200;
      if (canvasWidth === '1600px') {
        rosaVientos.style.width = '200px';
        rosaVientos.style.height = '200px';
      } else {
        const width = parseInt(canvasWidth.replace('px', ''));
        const height = parseInt(canvasHeight.replace('px', ''));
        const ratio = width / 1600;
        rosaVientos.style.width = `${rosaVientosWidth * ratio}px`;
        rosaVientos.style.height = `${rosaVientosHeight * ratio}px`;
      }


      if (canvas && rosaVientos) {
        
        
        const canvasRect = canvas.getBoundingClientRect();
        const rosaVientosWidth = rosaVientos.offsetWidth;
        const rosaVientosHeight = rosaVientos.offsetHeight;
  
        rosaVientos.style.position = 'absolute';
        rosaVientos.style.top = `${canvasRect.top + (canvasRect.height / 2) - (rosaVientosHeight / 2)}px`;
        rosaVientos.style.left = `${canvasRect.left + (canvasRect.width / 2) - (rosaVientosWidth / 2)}px`;
      }

      canvas.style.borderRadius = '30px';
      canvas.style.border = '0px solid';
    }
  }
 
  React.useEffect(() => {
    
    const handleSidebarToggle = (event) => {
      setSidebarOpen(event.detail.sidebarOpen);
      updatePositions();
    };
    updatePositions();
    console.log("sideBarOpen: ", sidebarOpen);
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, [scriptLoaded, sidebarOpen, streamStarted]);

  return (
    <PageSection>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div id="divResponsive" style={isWideScreen ? { maxWidth: '90%', width: '100%' } : {}}>
      <Title headingLevel="h1">Play Marbles Maze at the Edge!</Title>
      <br/>
      <div>
        <Form isHorizontal >
          <Grid hasGutter>
            <GridItem span={2}>
                <TextInput 
                  isRequired
                  placeholder="Player Name"
                  type="text"
                  id="playerName"
                  name="playerName"
                  aria-describedby="playerName"
                  value={playerName}
                  onChange={handleNameInputChange}
                />
              
            </GridItem>
            <GridItem span={1} className="pf-u-ml-md"> 
            <Button variant="secondary"  onClick={handleModalToggle}>Start</Button>
            </GridItem>
          </Grid>
        </Form>

      <br/>
        {/* Canvas */}
        <canvas
          id="videoCanvas"
          ref={canvasRef}
          width={1792}
          height={1008}
          style={{ position: 'relative'}}
        />
        
        {/* Rosa de los vientos centrada sobre el canvas */}
        <div 
          ref={rosaVientosRef}
          style={{ 
            position: 'absolute',
            zIndex: 50,
            width: '200px',
            height: '200px',
            pointerEvents: 'auto'
          }}
        >
          <RosaVientosEstrellas />
        </div>
      </div>
      </div>
      </div>
    </PageSection>
  );
};

export { Marbles };