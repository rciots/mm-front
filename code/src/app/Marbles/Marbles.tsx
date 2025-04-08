import * as React from 'react';
import { PageSection, Title, Modal, ModalVariant, Button, Form, FormGroup, Grid, GridItem, Popover, TextInput, Drawer, DrawerPanelContent, DrawerContent, DrawerContentBody, DrawerHead, DrawerActions, DrawerCloseButton, Spinner, Label, Progress, ProgressStepper, ProgressStep } from '@patternfly/react-core';
import { ResourcesFullIcon, TimesIcon } from '@patternfly/react-icons';
import { QuestionCircleIcon } from '@patternfly/react-icons';
import RosaVientosEstrellas from '@app/Marbles/rose';
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
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [playerName, setPlayerName] = React.useState('');
  const [isWideScreen, setIsWideScreen] = React.useState(window.innerWidth > 1000);
  const [isLandscape, setIsLandscape] = React.useState(window.innerWidth > window.innerHeight);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setModalOpen(!isModalOpen);
    setIsWaiting(true);
    setCurrentStep(1);
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleNameInputChange = (_event, value: string) => {
    setPlayerName(value);
  };

  const handleStartGame = () => {
    setIsWaiting(false);
    setIsPlaying(true);
    setCurrentStep(2);
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
        const jsmpegurl = 'ws://' + location.hostname + ':8084';
        const player = new window.JSMpeg.Player(jsmpegurl, {
          canvas: canvas
        });
      }

      // Detectar si estamos en móvil y en horizontal
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(isLandscape);

      if (isMobile && isLandscape) {
        // Modo pantalla completa en móvil horizontal
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.borderRadius = '0';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1000';
        setIsFullscreen(true);
      } else {
        // Modo normal
        setIsFullscreen(false);
        canvas.style.position = 'relative';
        canvas.style.width = '1600px';
        canvas.style.height = '900px';
        canvas.style.borderRadius = '30px';
        
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
      }

      // Ajustar rosa de los vientos
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
  
        rosaVientos.style.position = isFullscreen ? 'fixed' : 'absolute';
        rosaVientos.style.top = `${canvasRect.top + (canvasRect.height / 2) - (rosaVientosHeight / 2)}px`;
        rosaVientos.style.left = `${canvasRect.left + (canvasRect.width / 2) - (rosaVientosWidth / 2)}px`;
        rosaVientos.style.zIndex = isFullscreen ? '1001' : '50';
      }

      canvas.style.borderRadius = '30px';
      canvas.style.border = '0px solid';
    }
  }
 
  const exitFullscreen = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.style.position = 'relative';
      canvas.style.width = '1600px';
      canvas.style.height = '900px';
      canvas.style.borderRadius = '30px';
      canvas.style.top = 'auto';
      canvas.style.left = 'auto';
      canvas.style.zIndex = 'auto';
      setIsFullscreen(false);
      updatePositions();
    }
  };

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
    <PageSection style={{ height: '100%', padding: '16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '16px' }}>
        <Title headingLevel="h1">Play Marbles Maze at the Edge!</Title>
        <Button variant="primary" onClick={handleDrawerToggle}>
          How to play <QuestionCircleIcon />
        </Button>
      </div>
      <Drawer isExpanded={isDrawerOpen}>
        <DrawerContent panelContent={
          <DrawerPanelContent>
            <DrawerHead>
              <Title headingLevel="h2">How to Play</Title>

              <DrawerActions>
                <DrawerCloseButton onClick={handleDrawerToggle} />
              </DrawerActions>
            </DrawerHead>
            <DrawerContentBody>
              <div className="pf-u-p-md">
                <ol className="pf-u-ml-md">
                  <li>Add your Player name in the text field</li><br/>
                  <li>Click "Start" to play</li><br/>
                  <li>Wait for other players or start playing</li><br/>
                  <li>Use arrow keys to move the platform during the game time</li>
                  The movement is weighted by all players commands<br/><br/>
                  <li>The first marble that enters the center hole wins!</li>
                </ol>
              </div>
            </DrawerContentBody>
          </DrawerPanelContent>
        }>
          <DrawerContentBody>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '32px', height: '100%', position: 'relative' }}>
              <div style={{ flex: '1', minWidth: 0 }}>
                <div id="divResponsive" style={isWideScreen ? { maxWidth: '90%', width: '100%' } : {}}>
                  <div style={{ position: 'relative' }}>
                    <Form isHorizontal style={{ marginBottom: '16px' }}>
                      <Grid hasGutter>
                        <GridItem span={3} className="pf-u-ml-md"> 
                          <br/>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '800px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '200px' }}>
                                <TextInput 
                                  isRequired
                                  isDisabled={isWaiting || isPlaying}
                                  placeholder="Player Name"
                                  type="text"
                                  id="playerName"
                                  name="playerName"
                                  aria-describedby="playerName"
                                  value={playerName}
                                  onChange={handleNameInputChange}
                                />
                              </div>
                              <Button 
                                variant="secondary" 
                                onClick={handleModalToggle}
                                isDisabled={isWaiting || isPlaying}
                              >
                                Start
                              </Button>
                              {isWaiting && (
                                <>
                                  <Spinner size="md" />
                                  <div style={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}>
                                    <span>Waiting for other players... 1/4</span>
                                  </div>
                                  <Label color="red" icon={<ResourcesFullIcon />}>
                                    {playerName}
                                  </Label>
                                  <Button 
                                    variant="secondary" 
                                    onClick={handleStartGame}
                                    isDisabled={isPlaying}
                                  >
                                    GO!
                                  </Button>
                                </>
                              )}
                              {isPlaying && (
                                <Label color="red" icon={<ResourcesFullIcon />}>
                                  {playerName}
                                </Label>
                              )}
                            </div>
                          </div>
                        </GridItem>
                      </Grid>
                    </Form>

                    <canvas
                      id="videoCanvas"
                      ref={canvasRef}
                      width={1792}
                      height={1008}
                      style={{ position: 'relative'}}
                    />
                    
                    {isFullscreen && (
                      <Button
                        variant="plain"
                        onClick={exitFullscreen}
                        style={{
                          position: 'fixed',
                          top: '10px',
                          right: '10px',
                          zIndex: 1002,
                          background: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          padding: '8px',
                          borderRadius: '50%'
                        }}
                        aria-label="Exit fullscreen"
                      >
                        <TimesIcon />
                      </Button>
                    )}
                    
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
              <div style={{ width: '250px', flexShrink: 0, position: 'sticky', right: '16px', top: '16px', alignSelf: 'flex-start', backgroundColor: 'var(--pf-v5-global--BackgroundColor--100)', padding: '24px', borderRadius: '8px', boxShadow: 'var(--pf-v5-global--BoxShadow--sm)' }}>
                <ProgressStepper isVertical isCenterAligned>
                  <ProgressStep
                    variant={currentStep >= 1 ? "success" : currentStep === 0 ? "info" : "pending"}
                    titleId="select-username"
                  >
                    Select username
                  </ProgressStep>
                  <ProgressStep
                    variant={currentStep >= 2 ? "success" : currentStep === 1 ? "info" : "pending"}
                    titleId="wait-players"
                  >
                    Wait for other players
                  </ProgressStep>
                  <ProgressStep
                    variant={currentStep >= 3 ? "success" : currentStep === 2 ? "info" : "pending"}
                    titleId="starting-game"
                  >
                    Starting game
                  </ProgressStep>
                  <ProgressStep
                    variant={currentStep >= 4 ? "success" : currentStep === 3 ? "info" : "pending"}
                    titleId="play"
                  >
                    Play
                  </ProgressStep>
                  <ProgressStep
                    variant={currentStep >= 5 ? "success" : currentStep === 4 ? "info" : "pending"}
                    titleId="end-game"
                  >
                    End game
                  </ProgressStep>
                </ProgressStepper>
              </div>
            </div>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </PageSection>
  );
};

export { Marbles };