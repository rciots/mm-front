import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  MenuToggle,
  PageSection,
  Tab,
  Tabs,
  TabTitleText,
  Text,
  TextContent,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartDonut,
  ChartThemeColor
} from '@patternfly/react-charts/victory';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@patternfly/react-table';
import {
  BellIcon,
  CogIcon,
  SearchIcon
} from '@patternfly/react-icons';

// Mock data para el dashboard
const MOCK_DATA = {
  fleets: ['Fleet A', 'Fleet B', 'Fleet C', 'Fleet D'],
  locations: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
  devices: [
    { id: 'dev-001', name: 'Edge Device 001', fleet: 'Fleet A', location: 'Madrid', online: true, version: 'v1.2.3', lastSeen: '2025-02-27T08:32:45' },
    { id: 'dev-002', name: 'Edge Device 002', fleet: 'Fleet A', location: 'Madrid', online: true, version: 'v1.2.3', lastSeen: '2025-02-27T08:30:12' },
    { id: 'dev-003', name: 'Edge Device 003', fleet: 'Fleet A', location: 'Barcelona', online: false, version: 'v1.1.8', lastSeen: '2025-02-26T14:22:30' },
    { id: 'dev-004', name: 'Edge Device 004', fleet: 'Fleet B', location: 'Valencia', online: true, version: 'v1.2.2', lastSeen: '2025-02-27T08:15:40' },
    { id: 'dev-005', name: 'Edge Device 005', fleet: 'Fleet B', location: 'Sevilla', online: true, version: 'v1.2.3', lastSeen: '2025-02-27T08:28:15' },
    { id: 'dev-006', name: 'Edge Device 006', fleet: 'Fleet C', location: 'Bilbao', online: false, version: 'v1.1.7', lastSeen: '2025-02-25T18:45:22' },
    { id: 'dev-007', name: 'Edge Device 007', fleet: 'Fleet C', location: 'Madrid', online: true, version: 'v1.2.1', lastSeen: '2025-02-27T07:55:10' },
    { id: 'dev-008', name: 'Edge Device 008', fleet: 'Fleet D', location: 'Barcelona', online: true, version: 'v1.2.3', lastSeen: '2025-02-27T08:10:35' },
    { id: 'dev-009', name: 'Edge Device 009', fleet: 'Fleet D', location: 'Valencia', online: false, version: 'v1.2.0', lastSeen: '2025-02-26T22:18:05' },
    { id: 'dev-010', name: 'Edge Device 010', fleet: 'Fleet A', location: 'Sevilla', online: true, version: 'v1.2.3', lastSeen: '2025-02-27T08:05:50' },
  ],
  containers: [
    { deviceId: 'dev-001', containers: [
      { name: 'nginx', status: 'running', cpu: 2.3, memory: 256, uptime: '3d 5h' },
      { name: 'postgres', status: 'running', cpu: 5.7, memory: 512, uptime: '3d 5h' },
      { name: 'redis', status: 'running', cpu: 1.2, memory: 128, uptime: '3d 5h' }
    ]},
    { deviceId: 'dev-002', containers: [
      { name: 'nginx', status: 'running', cpu: 2.1, memory: 256, uptime: '2d 12h' },
      { name: 'postgres', status: 'running', cpu: 4.9, memory: 512, uptime: '2d 12h' }
    ]},
    { deviceId: 'dev-004', containers: [
      { name: 'nginx', status: 'running', cpu: 2.5, memory: 256, uptime: '5d 8h' },
      { name: 'mongodb', status: 'running', cpu: 6.2, memory: 768, uptime: '5d 8h' },
      { name: 'redis', status: 'running', cpu: 1.5, memory: 128, uptime: '5d 8h' }
    ]},
    { deviceId: 'dev-005', containers: [
      { name: 'nginx', status: 'running', cpu: 2.2, memory: 256, uptime: '1d 16h' },
      { name: 'redis', status: 'running', cpu: 1.3, memory: 128, uptime: '1d 16h' }
    ]},
    { deviceId: 'dev-007', containers: [
      { name: 'nginx', status: 'running', cpu: 2.4, memory: 256, uptime: '4d 2h' },
      { name: 'postgres', status: 'running', cpu: 5.2, memory: 512, uptime: '4d 2h' }
    ]},
    { deviceId: 'dev-008', containers: [
      { name: 'nginx', status: 'running', cpu: 2.6, memory: 256, uptime: '2d 5h' },
      { name: 'mongodb', status: 'running', cpu: 6.5, memory: 768, uptime: '2d 5h' },
      { name: 'redis', status: 'running', cpu: 1.4, memory: 128, uptime: '2d 5h' }
    ]},
    { deviceId: 'dev-010', containers: [
      { name: 'nginx', status: 'running', cpu: 2.7, memory: 256, uptime: '1d 3h' },
      { name: 'postgres', status: 'running', cpu: 5.5, memory: 512, uptime: '1d 3h' },
      { name: 'redis', status: 'running', cpu: 1.6, memory: 128, uptime: '1d 3h' }
    ]}
  ],
  logs: [
    { deviceId: 'dev-001', timestamp: '2025-02-27T08:32:45', level: 'INFO', message: 'Container nginx reiniciado' },
    { deviceId: 'dev-001', timestamp: '2025-02-27T08:30:12', level: 'WARN', message: 'Uso de CPU alto en container postgres' },
    { deviceId: 'dev-002', timestamp: '2025-02-27T08:28:15', level: 'INFO', message: 'Actualización de configuración aplicada' },
    { deviceId: 'dev-003', timestamp: '2025-02-26T14:22:30', level: 'ERROR', message: 'Conexión perdida con el dispositivo' },
    { deviceId: 'dev-004', timestamp: '2025-02-27T08:15:40', level: 'INFO', message: 'Sincronización de datos completada' },
    { deviceId: 'dev-005', timestamp: '2025-02-27T08:10:35', level: 'INFO', message: 'Backup programado ejecutado' },
    { deviceId: 'dev-006', timestamp: '2025-02-25T18:45:22', level: 'ERROR', message: 'Error en actualización de firmware' },
    { deviceId: 'dev-007', timestamp: '2025-02-27T07:55:10', level: 'WARN', message: 'Espacio de almacenamiento bajo' },
    { deviceId: 'dev-008', timestamp: '2025-02-27T08:05:50', level: 'INFO', message: 'Container redis optimizado' },
    { deviceId: 'dev-009', timestamp: '2025-02-26T22:18:05', level: 'ERROR', message: 'Fallo de hardware detectado' }
  ]
};

const Dashboard1: React.FunctionComponent = () => {

  const containerStats = {
    total: 0,
    running: 0,
    stopped: 0,
    averageCpu: 0,
    averageMemory: 0
  };
  
  let totalContainers = 0;
  let runningContainers = 0;
  let totalCpu = 0;
  let totalMemory = 0;

  return (
    <div className="edge-dashboard">
      <PageSection variant="light">
        <Flex>
          <FlexItem>
            <TextContent>
              <Title headingLevel="h1">Overview dashboard</Title>
              <Text>Visión general del estado y rendimiento de los dispositivos edge</Text>
            </TextContent>
          </FlexItem>
          <FlexItem align={{ default: 'alignRight' }}>
            <Flex>
              <FlexItem>
                <Button variant="plain" aria-label="notifications">
                  <BellIcon />
                </Button>
              </FlexItem>
              <FlexItem>
                <Button variant="plain" aria-label="settings">
                  <CogIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection>
        <Toolbar>
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem>
                
              </ToolbarItem>
              <ToolbarItem>
                
              </ToolbarItem>
              <ToolbarItem>
                
              </ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Actualizar
              </Button>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      </PageSection>

      <PageSection>
        <Grid hasGutter>
          {/* Tarjetas de resumen */}
          <GridItem span={3}>
            <Card>
              <CardTitle>Dispositivos</CardTitle>
              <CardBody>
                <TextContent>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card>
              <CardTitle>Contenedores</CardTitle>
              <CardBody>
                <TextContent>
                  <Text component="h2">{containerStats.total}</Text>
                  <Text>{containerStats.running} running | {containerStats.stopped} stopped</Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card>
              <CardTitle>CPU Promedio</CardTitle>
              <CardBody>
                <TextContent>
                  <Text component="h2">{containerStats.averageCpu}%</Text>
                  <Text>Por contenedor activo</Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={3}>
            <Card>
              <CardTitle>Memoria Promedio</CardTitle>
              <CardBody>
                <TextContent>
                  <Text component="h2">{containerStats.averageMemory} MB</Text>
                  <Text>Por contenedor activo</Text>
                </TextContent>
              </CardBody>
            </Card>
          </GridItem>

          {/* Gráficos */}
          <GridItem span={6}>
            <Card>
              <CardTitle>Estado de los Dispositivos</CardTitle>
              <CardBody>
                
              </CardBody>
            </Card>
          </GridItem>
          <GridItem span={6}>
            <Card>
              <CardTitle>Distribución de Versiones</CardTitle>
              <CardBody>
                
              </CardBody>
            </Card>
          </GridItem>

          {/* Tabs con tablas y logs */}
          <GridItem span={12}>
            <Card>
              <CardBody>
                <Tabs isBox>
                  <Tab eventKey={0} title={<TabTitleText>Dispositivos</TabTitleText>}>
                    <Table aria-label="Tabla de dispositivos">
                      <Thead>
                        <Tr>
                          <Th>Nombre</Th>
                          <Th>Flota</Th>
                          <Th>Ubicación</Th>
                          <Th>Estado</Th>
                          <Th>Versión</Th>
                          <Th>Última conexión</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        
                      </Tbody>
                    </Table>
                  </Tab>
                  <Tab eventKey={1} title={<TabTitleText>Contenedores</TabTitleText>}>
                    <Table aria-label="Tabla de contenedores">
                      <Thead>
                        <Tr>
                          <Th>Dispositivo</Th>
                          <Th>Contenedor</Th>
                          <Th>Estado</Th>
                          <Th>CPU (%)</Th>
                          <Th>Memoria (MB)</Th>
                          <Th>Tiempo activo</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        
                      </Tbody>
                    </Table>
                  </Tab>
                  <Tab eventKey={2} title={<TabTitleText>Logs</TabTitleText>}>
                    <Table aria-label="Tabla de logs">
                      <Thead>
                        <Tr>
                          <Th>Timestamp</Th>
                          <Th>Dispositivo</Th>
                          <Th>Nivel</Th>
                          <Th>Mensaje</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        
                      </Tbody>
                    </Table>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>
    </div>
  );
};

export {Dashboard1};