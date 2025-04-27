import * as React from 'react';
import { PageSection, Title, Modal, ModalVariant, Button, Form, FormGroup, Grid, GridItem, Popover, TextInput, Alert, Banner } from '@patternfly/react-core';
import RosaVientosEstrellas from './rose';
import { ExpandArrowsAltIcon, CompressArrowsAltIcon } from '@patternfly/react-icons';
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

const Countdown: React.FC<{ count: number | string }> = ({ count }) => {
  const [key, setKey] = React.useState(0);
  const [shouldRender, setShouldRender] = React.useState(true);

  React.useEffect(() => {
    setKey(prev => prev + 1);
    setShouldRender(true);
    const timer = setTimeout(() => {
      setShouldRender(false);
    }, 1400); // 600ms de espera + 800ms de animación
    return () => clearTimeout(timer);
  }, [count]);

  const getColor = () => {
    switch(count) {
      case 3: return '#ff4d4d';
      case 2: return '#ffff4d';
      case 1: return '#a6ff4d';
      case 'GO!': return '#00ff40';
      default: return '#ffffff';
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      key={key}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(2)',
        fontSize: '12rem',
        fontWeight: 'bold',
        color: getColor(),
        textShadow: `
          0 0 20px rgba(0,0,0,0.8),
          0 0 30px rgba(0,0,0,0.6),
          0 0 40px rgba(0,0,0,0.4),
          0 0 50px rgba(0,0,0,0.2)
        `,
        zIndex: 10000,
        pointerEvents: 'none',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '2px',
        animation: count === 'GO!' 
          ? 'goAnimation 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards'
          : 'countdownAnimation 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards'
      }}
    >
      {count}
      <style>
        {`
          @keyframes countdownAnimation {
            0% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(0.2);
              opacity: 0;
            }
          }
          @keyframes goAnimation {
            0% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 1;
            }
            100% {
              transform: translate(-50%, -50%) scale(4);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

interface Player {
  user: string;
  color: string | null;
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
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [playersQueue, setPlayersQueue] = React.useState<string[]>([]);
  const [currentPlayers, setCurrentPlayers] = React.useState<Player[]>([]);
  const [countdown, setCountdown] = React.useState<number | string | null>(null);
  const [gameTime, setGameTime] = React.useState<string | null>(null);
  const [isGameEnded, setIsGameEnded] = React.useState<boolean>(false);
  const touchStartYRef = React.useRef(0);
  const [currentPlayersHtml, setCurrentPlayersHtml] = React.useState<string>('');

  const handleTouchStart = (e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touchEndY = e.touches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;
    
    // If user swipes down more than 100px, exit fullscreen
    if (diff > 100) {
      toggleFullscreen();
    }
  };

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    if (window.validatePlayerName && window.validatePlayerName(playerName)) {
      setModalOpen(!isModalOpen);
      setShowForm(false);
      socket.emit('join', { userId: playerName });
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
      setCurrentPlayersHtml(event.detail.playersHtml);
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

    // Check if device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (!document.fullscreenElement && !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && !document.msFullscreenElement && !isFullscreen) {
      // Enter fullscreen
      try {
        if (isIOS) {
          // Hide the masthead and menu button
          const masthead = document.querySelector('.pf-v5-c-masthead');
          const pageHeader = document.querySelector('.pf-v5-c-page__header');
          if (masthead) {
            (masthead as HTMLElement).style.display = 'none';
          }
          if (pageHeader) {
            (pageHeader as HTMLElement).style.display = 'none';
          }

          // Add PWA-like styles
          document.body.style.overflow = 'hidden';
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.height = '100%';
          
          // Position the container
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.zIndex = '9999';

          // Add meta viewport for PWA-like behavior
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
          }

          // Add PWA-like status bar color
          const themeColorMeta = document.querySelector('meta[name="theme-color"]');
          if (!themeColorMeta) {
            const newThemeColor = document.createElement('meta');
            newThemeColor.name = 'theme-color';
            newThemeColor.content = '#000000';
            document.head.appendChild(newThemeColor);
          }

          setIsFullscreen(true);
        } else if (isMobile) {
          // For other mobile devices
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            await container.webkitRequestFullscreen();
          } else if (container.mozRequestFullScreen) {
            await container.mozRequestFullScreen();
          } else if (container.msRequestFullscreen) {
            await container.msRequestFullscreen();
          }
          
          // Hide only the masthead and menu button
          const masthead = document.querySelector('.pf-v5-c-masthead');
          const pageHeader = document.querySelector('.pf-v5-c-page__header');
          if (masthead) {
            (masthead as HTMLElement).style.display = 'none';
          }
          if (pageHeader) {
            (pageHeader as HTMLElement).style.display = 'none';
          }
          
          // Adjust container styles for mobile
          container.style.position = 'fixed';
          container.style.top = '0';
          container.style.left = '0';
          container.style.width = '100%';
          container.style.height = '100%';
          container.style.zIndex = '9999';
        } else {
          if (container.requestFullscreen) {
            await container.requestFullscreen();
          } else if (container.webkitRequestFullscreen) {
            await container.webkitRequestFullscreen();
          } else if (container.mozRequestFullScreen) {
            await container.mozRequestFullScreen();
          } else if (container.msRequestFullscreen) {
            await container.msRequestFullscreen();
          }
        }

        setIsFullscreen(true);
      } catch (error) {
        console.error('Error entering fullscreen:', error);
      }
    } else {
      // Exit fullscreen
      try {
        if (isIOS) {
          // Restore PWA-like styles
          document.body.style.overflow = '';
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.height = '';

          // Restore masthead and menu button
          const masthead = document.querySelector('.pf-v5-c-masthead');
          const pageHeader = document.querySelector('.pf-v5-c-page__header');
          if (masthead) {
            (masthead as HTMLElement).style.display = '';
          }
          if (pageHeader) {
            (pageHeader as HTMLElement).style.display = '';
          }

          // Restore container styles
          container.style.position = 'relative';
          container.style.top = '';
          container.style.left = '';
          container.style.width = '';
          container.style.height = '';
          container.style.zIndex = '';

          // Restore viewport meta
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
          }

          // Remove theme-color meta
          const themeColorMeta = document.querySelector('meta[name="theme-color"]');
          if (themeColorMeta) {
            themeColorMeta.remove();
          }

          // Force a reflow
          container.offsetHeight;
          setIsFullscreen(false);
        } else if (isMobile) {
          // For other mobile devices
          // 1. First, restore all styles and visibility
          const masthead = document.querySelector('.pf-v5-c-masthead');
          const pageHeader = document.querySelector('.pf-v5-c-page__header');
          if (masthead) {
            (masthead as HTMLElement).style.display = '';
          }
          if (pageHeader) {
            (pageHeader as HTMLElement).style.display = '';
          }
          
          // 2. Restore container styles
          container.style.position = 'relative';
          container.style.top = '';
          container.style.left = '';
          container.style.width = '';
          container.style.height = '';
          container.style.zIndex = '';

          // 3. Try to exit fullscreen
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
          } catch (error) {
            console.error('Error exiting fullscreen:', error);
          }

          // 4. Force a reflow to ensure styles are applied
          container.offsetHeight;
        } else {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        }

        setIsFullscreen(false);
      } catch (error) {
        console.error('Error exiting fullscreen:', error);
      }
    }
  };

  // Add styles for fullscreen container
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #canvas-container:fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        background: black;
      }
      #canvas-container:-webkit-full-screen {
        width: 100vw !important;
        height: 100vh !important;
        background: black;
      }
      #canvas-container:-moz-full-screen {
        width: 100vw !important;
        height: 100vh !important;
        background: black;
      }
      #canvas-container:-ms-fullscreen {
        width: 100vw !important;
        height: 100vh !important;
        background: black;
      }
      @supports (-webkit-touch-callout: none) {
        /* iOS-specific styles */
        #canvas-container {
          height: -webkit-fill-available;
        }
        body {
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
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

      // Check if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Scale down to 30% for mobile devices
      const scaleFactor = isMobile ? 0.3 : 1;
      
      // Find the flex container and set its size
      const flexContainer = rosaVientos.querySelector('.flex.flex-col.items-center.justify-center');
      if (flexContainer) {
        const baseSize = 200;
        (flexContainer as HTMLElement).style.width = `${baseSize * scaleFactor}px`;
        (flexContainer as HTMLElement).style.height = `${baseSize * scaleFactor}px`;
      }

      // Center rosa de los vientos
      rosaVientos.style.position = 'absolute';
      rosaVientos.style.top = '50%';
      rosaVientos.style.left = '50%';
      rosaVientos.style.transform = 'translate(-50%, -50%)';
      rosaVientos.style.zIndex = '9999';

      // Remove width and height from rosaVientos in mobile
      if (isMobile) {
        rosaVientos.style.width = '';
        rosaVientos.style.height = '';
      }

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

    const handleShowJoinForm = (event) => {
      setShowForm(event.detail.show);
      if (event.detail.error) {
        setErrorMessage(event.detail.error);
      }
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions);
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    window.addEventListener('showJoinForm', handleShowJoinForm);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
      window.removeEventListener('showJoinForm', handleShowJoinForm);
    };
  }, [scriptLoaded, sidebarOpen, streamStarted, isFullscreen]);

  const handleDirectionChange = (direction: string) => {
    console.log('Direction:', direction);
    // Here you can add the logic to handle movements
  };

  React.useEffect(() => {
    const handleCountdownUpdate = (event: CustomEvent) => {
      setCountdown(event.detail.count);
      if (event.detail.count === 'start') {
        setTimeout(() => setCountdown(null), 1000);
      }
    };

    window.addEventListener('countdownUpdate', handleCountdownUpdate as EventListener);
    return () => {
      window.removeEventListener('countdownUpdate', handleCountdownUpdate as EventListener);
    };
  }, []);

  React.useEffect(() => {
    const handleGameTimerUpdate = (event: CustomEvent) => {
      setGameTime(event.detail.time);
      setIsGameEnded(event.detail.isEnded);
    };

    window.addEventListener('updateGameTimer', handleGameTimerUpdate as EventListener);
    return () => {
      window.removeEventListener('updateGameTimer', handleGameTimerUpdate as EventListener);
    };
  }, []);

  return (
    <PageSection>
      <Banner variant="blue">
        Dev Preview: Currently only one player per game is allowed, multiplayer support is pending
      </Banner>
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
                <Form isHorizontal onSubmit={(e) => e.preventDefault()}>
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
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleModalToggle(e as unknown as KeyboardEvent);
                          }
                        }}
                      />
                    </GridItem>
                    <GridItem span={1} className="pf-u-ml-md"> 
                      <Button variant="secondary" onClick={handleModalToggle}>Join</Button>
                    </GridItem>
                  </Grid>
                </Form>
              )}
            </div>

            {errorMessage && (
              <Modal
                variant={ModalVariant.small}
                title="Error"
                isOpen={!!errorMessage}
                onClose={() => setErrorMessage(null)}
                actions={[
                  <Button key="close" variant="primary" onClick={() => setErrorMessage(null)}>
                    Cerrar
                  </Button>
                ]}
              >
                {errorMessage}
              </Modal>
            )}

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
                margin: '0 auto',
                backgroundColor: isFullscreen ? 'black' : 'transparent'
              }}
            >
              <canvas
                id="videoCanvas"
                ref={canvasRef}
                width={1792}
                height={1008}
                style={{ 
                  position: 'relative',
                  width: isFullscreen ? 'auto' : '100%',
                  height: isFullscreen ? '100%' : '100%',
                  objectFit: isFullscreen ? 'contain' : 'cover'
                }}
              />
              
              {countdown !== null && <Countdown count={countdown} />}
              
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
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    pointerEvents: 'auto',
                    touchAction: 'manipulation'
                  }}
                >
                  <CompressArrowsAltIcon />
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
                    fontSize: '1.1em',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px'
                  }}
                >
                  {gameTime && (
                    <div style={{ fontWeight: 'bold' }}>
                      {isGameEnded ? 'Game ended: out of time' : `Time left: ${gameTime}`}
                    </div>
                  )}
                  <div>
                    Current: <span dangerouslySetInnerHTML={{ __html: currentPlayersHtml }} />
                  </div>
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