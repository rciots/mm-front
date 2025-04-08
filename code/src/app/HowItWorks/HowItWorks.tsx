import * as React from 'react';
import { PageSection, Title, Wizard, WizardStep } from '@patternfly/react-core';

const HowItWorks: React.FunctionComponent = () => {
  const [isWideScreen, setIsWideScreen] = React.useState(window.innerWidth > 1000);
    React.useEffect(() => {
      const handleResize = () => {
        setIsWideScreen(window.innerWidth > 1000);
      };
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  
  return (
  <PageSection>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div id="divResponsive" style={isWideScreen ? { maxWidth: '80%', width: '100%' } : {}}>
    <Title headingLevel="h1">How It Works</Title>
    <br/>
    <Wizard title="Basic wizard" footer={{isCancelHidden: true}} height={'80vh'}>
      <WizardStep name="Overview" id="overview">
      <Title headingLevel="h1" size="lg">Overview</Title>
      <br/>
        <b>RCIoTs</b> is my personal "organization" for deploying proof-of-concept demos related to IoT, 
        Edge Computing, and any other cool technologies that catch my interest.
        <br/><br/>
        Currently, I’m showcasing <b>Multiplayer Marble Maze</b>, a robotic demo controlled from the cloud. 
        The idea came to me while watching videos of engineering projects, specifically from <a target='_blank' href='https://www.aaedmusa.com/projects/project-three-sng7y-gaslp'>Aaed Musa and his Ball Balancer project</a>. 
        <br/>
        I have used part of his design to move the platform, and it has been a great inspiration for how to implement it.
        <br/><br/>
        Players can interact with the machine through a web interface while watching the machine in action via a live camera feed.
        <br/><br/>
        The robot features a maze where each player takes on the role of a marble, aiming to reach the finish line. 
        All players can send commands to tilt the maze, 
        but the final movement is calculated as a weighted average of all received inputs, ensuring a collaborative challenge.
        <br/><br/>
        The first player to reach the end wins. Once the game is over or time runs out, 
        the robot automatically resets the maze to prepare for a new round.
        <br/><br/>
        The system is powered by three stepper motors that balance the base, 
        controlled by a Makerbase MKS Robin E3D board—similar to those used in 3D printers and CNC machines.
        <br/><br/>
        Additionally, an Arduino Mega manages various servos and sensors, while an Intel NUC coordinates both boards and the camera. 
        The entire setup is connected to the cloud via WebSockets.
        <br/><br/>
        The web interface is built with React and communicates with the cloud services using WebSockets as well, ensuring real-time end-to-end interaction from players’ browsers to the robot.
        <br/><br/>

      </WizardStep>
      <WizardStep name="Hardware" id="hardware">
      <Title headingLevel="h1" size="lg">Hardware</Title>
      <br/>
      This is the list of hardware components used at the Edge:
      <br/><br/>
      <li>Intel NUC</li>
      <li>Arduino Mega 2560</li>
      <li>Makerbase MKS Robin E3D</li>
      <li>TMC2209 x4</li>
      <li>Stepper Motors NEMA 17 x3+1 (3 for the base + 1 for the elevator)</li>
      <li>Micro Servos SG90 x6</li>
      <li>PCA9685 16-Channel PWM Driver</li>
      <li>USB Web Camera</li>
      <li>RGB Sensors TCS34725 x2 </li>
      <li>Power Supply 12V 10A</li>
      <li>Solenoids v12 x3</li>
      <li>Tons of 3D models printed</li>
      </WizardStep>
      <WizardStep name="Operative System" id="os">
        Step 3 content
      </WizardStep>
      <WizardStep name="Edge Manager" id="edge">
        Step 4 content
      </WizardStep>
      <WizardStep name="Software" id="software" isExpandable steps={[
        <WizardStep name="Edge" id="sedge" isExpandable>
          <Title headingLevel="h1" size="lg">Edge microservices</Title>
          <br/>
        At the Edge (Intel NUC) there are running several services on Microshift, a lightweight Kubernetes distribution:
        <br/><br/>
        <Title headingLevel="h4">WS-Connector</Title>
        This service is responsible for managing the WebSockets connections between the cloud with MTLS, and the other services.
        <br/><br/>
        <Title headingLevel="h4">Cam</Title>
        This service runs ffmpeg and stream the camera feed to the cloud.
        <br/><br/>
        <Title headingLevel="h4">steppers-controller</Title>
        This service is responsible for controlling the stepper motors sending GCODEs to the MKS Robin E3D board.
        <br/><br/>
        <Title headingLevel="h4">arduino-controller</Title>
        This service is responsible for controlling the servos and sensors connected to the Arduino Mega board.
        <br/><br/>
      </WizardStep>,
      <WizardStep name="Cloud" id="scloud" isExpandable>
        <Title headingLevel="h1" size="lg">Cloud microservices</Title>
        <br/>
        At the Cloud there are running several services on OpenShift:
        <br/><br/>
        <Title headingLevel="h4">socket-manager</Title>
        This service is responsible for managing the WebSockets connections between the edge devices with MTLS, and the other cloud microservices.
        <br/><br/>
        <Title headingLevel="h4">game-manager</Title>
        This service is responsible for managing the game logic, players, and rounds.
        <br/><br/>
        <Title headingLevel="h4">Front</Title>
        This service is responsible for serving the web interface to the players, built with React.
        <br/><br/>
      </WizardStep>
    ]}>
      </WizardStep>
      <WizardStep name="Environment" id="environment">
        Step 6 content
      </WizardStep>
      <WizardStep name="What's next" id="next">
        Step 7 content
      </WizardStep>
    </Wizard>
    </div>
    </div>
  </PageSection>
);
};
export { HowItWorks };
