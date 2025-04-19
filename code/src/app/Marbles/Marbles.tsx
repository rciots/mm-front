import * as React from 'react';
import { PageSection, Title, Modal, ModalVariant, Button, Form, FormGroup, Grid, GridItem, Popover, TextInput } from '@patternfly/react-core';
import RosaVientosEstrellas from './rose';
import { ExpandArrowsAltIcon } from '@patternfly/react-icons';
import { PadControl } from './PadControl';

declare global {
  interface Window {
    JSMpeg: any;
    validatePlayerName: (name: string) => boolean;
  }
  interface Document {
    webkitFullscreenElement: Element | null;
    mozFullScreenElement: Element | null;
    msFullscreenElement: Element | null;
    webkitExitFullscreen: () => Promise<void>;
    mozCancelFullScreen: () => Promise<void>;
    msExitFullscreen: () => Promise<void>;
  }
  interface HTMLElement {
    webkitRequestFullscreen: () => Promise<void>;
    mozRequestFullScreen: () => Promise<void>;
    msRequestFullscreen: () => Promise<void>;
  }
  interface ScreenOrientation {
    lock: (orientation: string) => Promise<void>;
    unlock: () => void;
  }
  interface Screen {
    readonly orientation: ScreenOrientation;
  }
}

const Marbles: React.FunctionComponent = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const rosaVientosRef = React.useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [streamStarted, setStreamStarted] = React.useState(false);
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [playerName, setPlayerName] = React.useState('');
  const [isWideScreen, setIsWideScreen] = React.useState(window.innerWidth > 1000);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const fullscreenButtonRef = React.useRef<HTMLButtonElement>(null);
  const [showForm, setShowForm] = React.useState(true);
  const [playersQueue, setPlayersQueue] = React.useState<string[]>([]);
  const [currentPlayers, setCurrentPlayers] = React.useState<string[]>([]);

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    if (window.validatePlayerName && window.validatePlayerName(playerName)) {
      setModalOpen(!isModalOpen);
      setShowForm(false);
    } else {
      alert('Player name must be at least 4 characters long');
    }
  };

  const handleNameInputChange = (_event, value: string) => {
    setPlayerName(value);
  };

  React.useEffect(() => {
    const scriptPath = '/assets/js/jsmpeg.min.js';
    
    const jsmpeg = document.createElement('script');
    jsmpeg.src = scriptPath;
    jsmpeg.async = true;
    jsmpeg.onload = () => {
      console.log('JSMpeg loaded successfully');
      setScriptLoaded(true);
    };
    jsmpeg.onerror = (error) => {
      console.error('Error loading JSMpeg:', error);
    };
    document.body.appendChild(jsmpeg);
    const socket = document.createElement('script');
    socket.src = '/assets/js/socket.io.min.js';
    socket.async = true;
    socket.onload = () => {
      console.log('Socket loaded successfully');
      const marblesjs = document.createElement('script');
      marblesjs.src = '/assets/js/marbles.js';
      marblesjs.async = true;
      document.body.appendChild(marblesjs);
    }
    socket.onerror = (error) => {
      console.error('Error loading Socket:', error);
    }
    document.body.appendChild(socket);

    // Configure listeners for custom events
    const handlePlayersQueueUpdate = (event: CustomEvent) => {
      setPlayersQueue(event.detail.usersList);
    };

    const handleCurrentPlayersUpdate = (event: CustomEvent) => {
      setCurrentPlayers(event.detail.currentPlayers);
    };

    window.addEventListener('updatePlayersQueue', handlePlayersQueueUpdate as EventListener);
    window.addEventListener('updateCurrentPlayers', handleCurrentPlayersUpdate as EventListener);

    return () => {
      window.removeEventListener('updatePlayersQueue', handlePlayersQueueUpdate as EventListener);
      window.removeEventListener('updateCurrentPlayers', handleCurrentPlayersUpdate as EventListener);
    };
  }, []);

  const toggleFullscreen = async () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement) {
      // Enter fullscreen
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          await container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          await container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          await container.msRequestFullscreen();
        }

        // Force landscape orientation on mobile devices
        if (screen.orientation && screen.orientation.lock) {
          try {
            // Check if device is mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
              await screen.orientation.lock('landscape');
            }
          } catch (error) {
            console.log('Could not lock orientation:', error);
          }
        }

        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      // Exit fullscreen
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }

        // Unlock orientation
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }

        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

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

      // Adjust canvas size
      if (isFullscreen) {
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      } else {
        const container = document.getElementById('canvas-container');
        if (container) {
          const maxWidth = Math.min(1600, window.innerWidth * 0.75);
          const maxHeight = Math.min(900, window.innerHeight * 0.75);
          container.style.width = `${maxWidth}px`;
          container.style.height = `${maxHeight}px`;
        }
      }

      // Adjust rosa de los vientos size proportionally
      const container = document.getElementById('canvas-container');
      const containerWidth = container ? container.clientWidth : window.innerWidth;
      const containerHeight = container ? container.clientHeight : window.innerHeight;
      
      const rosaVientosWidth = isFullscreen ? 
        Math.min(window.innerWidth, window.innerHeight) * 0.15 : 
        200 * (containerWidth / 1600);
      const rosaVientosHeight = isFullscreen ? 
        Math.min(window.innerWidth, window.innerHeight) * 0.15 : 
        200 * (containerHeight / 900);

      rosaVientos.style.width = `${rosaVientosWidth}px`;
      rosaVientos.style.height = `${rosaVientosHeight}px`;

      // Center rosa de los vientos
      rosaVientos.style.position = 'absolute';
      rosaVientos.style.top = '50%';
      rosaVientos.style.left = '50%';
      rosaVientos.style.transform = 'translate(-50%, -50%)';
      rosaVientos.style.zIndex = '9999';

      canvas.style.borderRadius = isFullscreen ? '0' : '30px';
      canvas.style.border = '0px solid';
    }
  }
 
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!document.webkitFullscreenElement || 
                     !!document.mozFullScreenElement || !!document.msFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

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
  }, [scriptLoaded, sidebarOpen, streamStarted, isFullscreen]);

  const handleDirectionChange = (direction: string) => {
    console.log('Direction:', direction);
    // Here you can add the logic to handle movements
  };

  return (
    <PageSection>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div id="divResponsive" style={isWideScreen ? { maxWidth: '90%', width: '100%' } : {}}>
          <Title headingLevel="h1">Play Marbles Maze at the Edge!</Title>
          <br/>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ marginRight: '1rem' }}>
                <Button
                  ref={fullscreenButtonRef}
                  variant="secondary"
                  onClick={toggleFullscreen}
                  style={{
                    padding: '8px',
                    minWidth: '40px',
                    height: '40px'
                  }}
                >
                  <ExpandArrowsAltIcon />
                </Button>
              </div>
              {showForm && (
                <Form isHorizontal>
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
                      <Button variant="secondary" onClick={handleModalToggle}>Join</Button>
                    </GridItem>
                  </Grid>
                </Form>
              )}
            </div>

            <br/>
            <div 
              id="canvas-container"
              style={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: isFullscreen ? '100%' : 'auto',
                height: isFullscreen ? '100%' : 'auto',
                margin: '0 auto'
              }}
            >
              <canvas
                id="videoCanvas"
                ref={canvasRef}
                width={1792}
                height={1008}
                style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '100%'
                }}
              />
              
              <div 
                ref={rosaVientosRef}
                style={{ 
                  position: 'absolute',
                  zIndex: 9999,
                  width: '200px',
                  height: '200px',
                  pointerEvents: 'none'
                }}
              >
                <RosaVientosEstrellas />
              </div>

              {isFullscreen && (
                <Button
                  ref={fullscreenButtonRef}
                  variant="secondary"
                  onClick={toggleFullscreen}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    zIndex: 10000,
                    padding: '8px',
                    minWidth: '40px',
                    height: '40px'
                  }}
                >
                  <ExpandArrowsAltIcon />
                </Button>
              )}

              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  zIndex: 10000,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '8px',
                  padding: '10px',
                  minWidth: '200px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ 
                        textAlign: 'right', 
                        padding: '8px',
                        borderBottom: '2px solid #333',
                        fontSize: '1.1em'
                      }}>
                        Players queue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersQueue.map((player, index) => (
                      <tr key={index}>
                        <td style={{ padding: '8px', textAlign: 'right' }}>{player}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {currentPlayers.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10000,
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    padding: '10px',
                    minWidth: '200px',
                    textAlign: 'center',
                    fontSize: '1.1em'
                  }}
                >
                  Current: {currentPlayers.join(' | ')}
                </div>
              )}

              <PadControl onDirectionChange={handleDirectionChange} />
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  );
};

export { Marbles };