import * as React from 'react';
import { Flex, FlexItem, ExpandableSection, List, ListItem, PageSection, Title, TitleSizes, Card, CardTitle, CardBody, CardFooter, Icon } from '@patternfly/react-core';


const Home: React.FunctionComponent = () => {
  const [isWideScreen, setIsWideScreen] = React.useState(window.innerWidth > 1000);
  const [isExpanded1, setIsExpanded1] = React.useState(false);
  const [isExpanded2, setIsExpanded2] = React.useState(false);
  const [isExpanded3, setIsExpanded3] = React.useState(false);
  const [isExpanded4, setIsExpanded4] = React.useState(false);
  const [isExpanded5, setIsExpanded5] = React.useState(false);
  const onToggle1 = (_event: React.MouseEvent, isExpanded1: boolean) => {
    setIsExpanded1(isExpanded1);
  };
  const onToggle2 = (_event: React.MouseEvent, isExpanded2: boolean) => {
    setIsExpanded2(isExpanded2);
  };
  const onToggle3 = (_event: React.MouseEvent, isExpanded3: boolean) => {
    setIsExpanded3(isExpanded3);
  };
  const onToggle4 = (_event: React.MouseEvent, isExpanded4: boolean) => {
    setIsExpanded4(isExpanded4);
  };
  const onToggle5 = (_event: React.MouseEvent, isExpanded5: boolean) => {
    setIsExpanded5(isExpanded5);
  };

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
    <Flex spaceItems={{ default: 'spaceItemsXl' }}>
    <FlexItem spacer={{ default: 'spacer3xl' }}>
    <Title headingLevel="h1">Welcome to RCIoTs</Title>
    <br/>
    </FlexItem>
    <FlexItem>
    <Card >
      <CardTitle>Experience the power of <b>Edge Computing</b> like never before!</CardTitle>
      <CardBody>
      This POC is a real-time multiplayer Marble Maze, designed to showcase the power of Edge Computing in a fun and interactive way. By leveraging innovative and state-of-the-art technologies such as: <br/><br/>
      <ExpandableSection toggleText={isExpanded1 ? 'Red Hat Device Edge' : 'Red Hat Device Edge'} onToggle={onToggle1} isExpanded={isExpanded1} isIndented >
      A lightweight and secure distribution of Red Hat Enterprise Linux (RHEL) optimized for edge devices. <a target="_blank" href="https://docs.redhat.com/en/documentation/red_hat_device_edge/latest/html/overview/device-edge-overview">+Learn more</a>
      <br/><br/>
      </ExpandableSection>
      <ExpandableSection toggleText={isExpanded2 ? 'Microshift' : 'Microshift'} onToggle={onToggle2} isExpanded={isExpanded2} isIndented >
        Minimal distribution of Openshift for edge devices or computers with limited resources. <a target="_blank" href="https://docs.redhat.com/en/documentation/red_hat_build_of_microshift/latest/html/understanding_microshift/microshift-understanding">+Learn more</a>
        <br/><br/>
      </ExpandableSection>
      <ExpandableSection toggleText={isExpanded3 ? 'image mode' : 'image mode'} onToggle={onToggle3} isExpanded={isExpanded3} isIndented >
      Image mode is a new deployment method that uses a container-native approach to build, deploy and manage the operating system as a bootc container. <a target="_blank" href="https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_image_mode_for_rhel_to_build_deploy_and_manage_operating_systems/introducing-image-mode-for-rhel_using-image-mode-for-rhel-to-build-deploy-and-manage-operating-systems">+Learn more</a>
        <br/><br/>
      </ExpandableSection>
      <ExpandableSection toggleText={isExpanded4 ? 'Bootc' : 'Bootc'} onToggle={onToggle4} isExpanded={isExpanded4} isIndented >
      Transactional, in-place operating system updates using OCI/Docker container images. <a target="_blank" href="https://developers.redhat.com/articles/2024/09/24/bootc-getting-started-bootable-containers">+Learn more</a>
        <br/><br/>
      </ExpandableSection>
      <ExpandableSection toggleText={isExpanded5 ? 'FlightCTL' : 'FlightCTL'} onToggle={onToggle5} isExpanded={isExpanded5} isIndented >
      Flight Control is a service for declarative management of fleets of edge devices and their workloads.<a target="_blank" href="https://github.com/flightctl/flightctl/blob/main/docs/user/introduction.md">+Learn more</a>
        <br/><br/>
      </ExpandableSection>
      This demo isn't just a game.
      It's a hands-on showcase of how next-gen Edge Computing enables low-latency, 
      high-performance applications at scale. Whether you're a developer, architect, or tech enthusiast, 
      this POC makes complex concepts accessible, exciting, and interactive.
      Play. Learn. Explore.</CardBody>
    </Card>
    <br/>
    <Card>
      <CardTitle>Presentation</CardTitle>
      <CardBody>
      Hi there! I'm <b>Mario Parra</b>, a Senior Consultant at Red Hat, passionate about robotics and Edge Computing.<br/><br/>
      I'm thrilled to share this Proof of Concept with you, and I hope you enjoy playing it as much as I enjoyed building it.<br/><br/>
      <b>RCIoTs</b> is my personal lab for experimentation, and this time, the focus is on Edge Computing. I’ve built a <b>real-time multiplayer Marble Maze</b>, managed at the edge from the cloud using components from a 3D printer, with websockets enabling fast, bidirectional communication.<br/><br/>
      I’m excited to share the entire journey, from 3D modeling and electronics to microservices orchestration, real-time streaming, and, most importantly, how I’m leveraging the latest <b>Open Source Edge technologies</b>. This includes everything from the operating system and containerized applications to managing fleets of thousands of devices. Although in this case, we are handling a single device, using solutions designed to scale effortlessly to hundreds or even thousands of them.<br/><br/>
      Let’s explore the future of Edge Computing together! <br/>
      </CardBody>
    </Card>
    </FlexItem>
    </Flex>
    </div>
    </div>
  </PageSection>
  );
};

export { Home };
