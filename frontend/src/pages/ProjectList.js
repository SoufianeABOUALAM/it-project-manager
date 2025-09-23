import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Button,
    Card,
    CardBody,
    SimpleGrid,
    Badge,
    IconButton,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Alert,
    AlertIcon,
    AlertDescription,
    Spinner,
    Divider,
    Flex,
    Stat,
    StatLabel,
    StatNumber,
    useDisclosure,
    Input,
    Select,
    Textarea,
    Grid,
    Icon,
    useToast,
} from '@chakra-ui/react';
import { 
    AddIcon, 
    EditIcon, 
    DeleteIcon, 
    DownloadIcon, 
    ViewIcon,
    ChevronUpIcon,
    StarIcon,
    InfoIcon,
    AtSignIcon
} from '@chakra-ui/icons';
import { MdAdd, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/projects/';

const ProjectList = () => {
    const { authToken, user } = useAuth();
    const navigate = useNavigate();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    
    // Add Project Modal state
    const { isOpen: isAddProjectOpen, onOpen: onAddProjectOpen, onClose: onAddProjectClose } = useDisclosure();
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [localAppsEnabled, setLocalAppsEnabled] = useState(false);
    const [pcTypeSelection, setPcTypeSelection] = useState('BOTH');
    const toast = useToast();

    const fetchProjects = async () => {
        try {
            if (!authToken) {
                setError('No authentication token');
                setLoading(false);
                return;
            }
            
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Token ${authToken}` }
            });
            setProjects(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            setError(`Failed to load projects: ${error.response?.data?.detail || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [authToken]);

    const handleDelete = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await axios.delete(`${API_URL}${projectId}/`, {
                    headers: { Authorization: `Token ${authToken}` }
                });
                fetchProjects();
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    const handleExportExcel = async (projectId) => {
        try {
            const response = await axios.get(`${API_URL}${projectId}/export/excel/`, {
                headers: { Authorization: `Token ${authToken}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `project_${projectId}_budget.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to export project:', error);
        }
    };

    const handleViewDetails = (project) => {
        setSelectedProject(project);
        onOpen();
    };

    const formatCurrency = (amount, currency = '€') => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency === '€' ? 'EUR' : 'MAD'
        }).format(amount);
    };

    const getTotalBudget = () => {
        if (!Array.isArray(projects)) return 0;
        return projects.reduce((total, project) => total + (project.total_cost_france || 0), 0);
    };

    const getTotalProjects = () => {
        return Array.isArray(projects) ? projects.length : 0;
    };

    // Form handling functions
    const clearAddForm = () => {
        // Clear all form fields
        const fields = [
            'project-name', 'number-of-users', 'start-date', 'end-date',
            'num-laptop-office', 'num-laptop-tech', 'num-desktop-office', 'num-desktop-tech',
            'num-printers', 'num-aps', 'num-videoconference', 'num-traceau',
            'local-apps-list', 'site-addresses', 'gps-coordinates'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) element.value = '';
        });
        
        // Reset select fields
        const entitySelect = document.getElementById('entity');
        const pcTypeSelect = document.getElementById('pc-type');
        const localAppsSelect = document.getElementById('local-apps');
        const fileServerSelect = document.getElementById('file-server');
        const internetTypeSelect = document.getElementById('internet-line-type');
        const internetSpeedSelect = document.getElementById('internet-line-speed');
        
        if (entitySelect) entitySelect.value = 'OTHER';
        if (pcTypeSelect) pcTypeSelect.value = 'BOTH';
        if (localAppsSelect) localAppsSelect.value = 'false';
        if (fileServerSelect) fileServerSelect.value = 'false';
        if (internetTypeSelect) internetTypeSelect.value = 'FO';
        if (internetSpeedSelect) internetSpeedSelect.value = '100MBps';
        
        // Reset state variables
        setLocalAppsEnabled(false);
        setPcTypeSelection('BOTH');
    };

    const handleCreateProject = async () => {
        setIsCreatingProject(true);
        try {
            // Helper function to safely get element value
            const getElementValue = (id, defaultValue = '') => {
                const element = document.getElementById(id);
                return element ? element.value : defaultValue;
            };

            const getElementValueAsNumber = (id, defaultValue = 0) => {
                const element = document.getElementById(id);
                return element ? parseInt(element.value) || defaultValue : defaultValue;
            };

            // Collect all form data
            const projectData = {
                name: getElementValue('project-name'),
                entity: getElementValue('entity'),
                number_of_users: getElementValueAsNumber('number-of-users', 1),
                start_date: getElementValue('start-date'),
                end_date: getElementValue('end-date'),
                pc_type_selection: getElementValue('pc-type'),
                local_apps_enabled: getElementValue('local-apps') === 'true',
                local_apps_list: getElementValue('local-apps-list'),
                file_server: getElementValue('file-server') === 'true',
                site_addresses: getElementValue('site-addresses'),
                gps_coordinates: getElementValue('gps-coordinates'),
                internet_line_type: getElementValue('internet-line-type'),
                internet_line_speed: getElementValue('internet-line-speed'),
                num_laptop_office: getElementValueAsNumber('num-laptop-office'),
                num_laptop_tech: getElementValueAsNumber('num-laptop-tech'),
                num_desktop_office: getElementValueAsNumber('num-desktop-office'),
                num_desktop_tech: getElementValueAsNumber('num-desktop-tech'),
                num_printers: getElementValueAsNumber('num-printers'),
                num_traceau: getElementValueAsNumber('num-traceau'),
                num_videoconference: getElementValueAsNumber('num-videoconference'),
                num_aps: getElementValueAsNumber('num-aps'),
                user: user.id,
                status: 'draft'
            };

            console.log('Creating project with data:', projectData);

            // Check if user is authenticated
            if (!authToken) {
                toast({
                    title: 'Authentication Error',
                    description: 'Please log in to create projects.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            // First create the project with basic info
            console.log('Creating project with basic info...');
            console.log('POST URL:', `${API_URL}projects/`);
            console.log('Auth token:', authToken);
            
            let createResponse;
            try {
                createResponse = await axios.post(`${API_URL}projects/`, {
                    name: projectData.name,
                    company_name: '' // Set empty company name as per backend requirements
                }, {
                    headers: {
                        'Authorization': `Token ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Create response:', createResponse.data);
                console.log('Create response status:', createResponse.status);
                console.log('Create response headers:', createResponse.headers);
                console.log('Response data keys:', Object.keys(createResponse.data));
            } catch (createError) {
                console.error('Create project error:', createError);
                console.error('Create error response:', createError.response?.data);
                console.error('Create error status:', createError.response?.status);
                throw createError;
            }

            const projectId = createResponse.data.id;
            console.log('Project ID:', projectId);
            console.log('Project ID type:', typeof projectId);

            if (!projectId) {
                throw new Error('Project creation failed: No project ID returned');
            }

            // Then update with detailed information
            console.log('Updating project with detailed information...');
            const updateResponse = await axios.patch(`${API_URL}projects/${projectId}/`, projectData, {
                headers: {
                    'Authorization': `Token ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Project created successfully:', updateResponse.data);

            toast({
                title: 'Project Created Successfully!',
                description: `Project "${projectData.name}" has been created.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Refresh projects list
            await fetchProjects();
            
            // Close modal and clear form
            clearAddForm();
            onAddProjectClose();

        } catch (error) {
            console.error('Error creating project:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Full error response:', JSON.stringify(error.response?.data, null, 2));
            
            // Extract validation errors
            let errorMessage = 'An error occurred while creating the project.';
            if (error.response?.data) {
                if (error.response.data.status && Array.isArray(error.response.data.status)) {
                    errorMessage = error.response.data.status.join(', ');
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                }
            }
            
            toast({
                title: 'Error Creating Project',
                description: errorMessage,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsCreatingProject(false);
        }
    };

    if (loading) {
        return (
            <Container maxW="container.xl" py={8}>
                <Flex justify="center" align="center" minH="400px">
                    <VStack spacing={4}>
                        <Spinner size="xl" color="brand.500" />
                        <Text fontSize="lg">Loading your projects...</Text>
                    </VStack>
                </Flex>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxW="container.xl" py={8}>
                <Alert status="error" borderRadius="md" mb={4}>
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button 
                    colorScheme="brand"
                    onClick={() => {
                        setError(null);
                        setLoading(true);
                        fetchProjects();
                    }}
                >
                    Retry
                </Button>
            </Container>
        );
    }

    return (
        <Container maxW="container.xl" py={8}>
            {/* Welcome Section */}
            <Box mb={8}>
                <Heading as="h1" size="xl" mb={2}>
                    Welcome back, {user?.username}! 👋
                </Heading>
                <Text color="gray.600" fontSize="lg">
                    Manage your IT infrastructure projects and budgets
                </Text>
            </Box>

            {/* Dashboard Stats */}
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6} mb={8}>
                <Card textAlign="center" p={4}>
                    <CardBody>
                        <StarIcon w={10} h={10} color="brand.500" mb={2} />
                        <Stat>
                            <StatNumber fontSize="2xl">{getTotalProjects()}</StatNumber>
                            <StatLabel>Total Projects</StatLabel>
                        </Stat>
                    </CardBody>
                </Card>
                <Card textAlign="center" p={4}>
                    <CardBody>
                        <InfoIcon w={10} h={10} color="green.500" mb={2} />
                        <Stat>
                            <StatNumber fontSize="2xl">{formatCurrency(getTotalBudget())}</StatNumber>
                            <StatLabel>Total Budget</StatLabel>
                        </Stat>
                    </CardBody>
                </Card>
                <Card textAlign="center" p={4}>
                    <CardBody>
                        <AtSignIcon w={10} h={10} color="blue.500" mb={2} />
                        <Stat>
                            <StatNumber fontSize="2xl">
                                {Array.isArray(projects) ? projects.reduce((total, project) => total + (project.number_of_users || 0), 0) : 0}
                            </StatNumber>
                            <StatLabel>Total Users</StatLabel>
                        </Stat>
                    </CardBody>
                </Card>
                <Card textAlign="center" p={4}>
                    <CardBody>
                        <ChevronUpIcon w={10} h={10} color="orange.500" mb={2} />
                        <Stat>
                            <StatNumber fontSize="2xl">
                                {Array.isArray(projects) ? projects.filter(p => p.status === 'active').length : 0}
                            </StatNumber>
                            <StatLabel>Active Projects</StatLabel>
                        </Stat>
                    </CardBody>
                </Card>
            </SimpleGrid>

            {/* Projects Section */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading as="h2" size="lg">
                    Your Projects
                </Heading>
                <Button
                    colorScheme="brand"
                    leftIcon={<AddIcon />}
                    onClick={onAddProjectOpen}
                    size="lg"
                >
                    Create New Project
                </Button>
            </Flex>

            {!Array.isArray(projects) || projects.length === 0 ? (
                <Card p={8} textAlign="center">
                    <VStack spacing={4}>
                        <Heading as="h3" size="md">
                            No projects yet
                        </Heading>
                        <Text color="gray.600">
                            Get started by creating your first IT infrastructure project
                        </Text>
                        <Button
                            colorScheme="brand"
                            leftIcon={<AddIcon />}
                            onClick={() => navigate('/projects/new')}
                            size="lg"
                        >
                            Create Your First Project
                        </Button>
                    </VStack>
                </Card>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {Array.isArray(projects) && projects.map((project) => (
                        <Card key={project.id} h="100%" display="flex" flexDirection="column">
                            <CardBody flexGrow={1}>
                                <Heading as="h3" size="md" mb={3}>
                                    {project.name}
                                </Heading>
                                <VStack align="stretch" spacing={2} mb={4}>
                                    <Text fontSize="sm" color="gray.600">
                                        <Text as="span" fontWeight="bold">Entity:</Text> {project.entity}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        <Text as="span" fontWeight="bold">Users:</Text> {project.number_of_users}
                                    </Text>
                                    <Text fontSize="sm" color="gray.600">
                                        <Text as="span" fontWeight="bold">Period:</Text> {project.start_date} to {project.end_date}
                                    </Text>
                                </VStack>
                                
                                <Divider my={4} />
                                
                                <HStack spacing={2} flexWrap="wrap">
                                    <Badge colorScheme="blue" variant="subtle">
                                        France: {formatCurrency(project.total_cost_france)}
                                    </Badge>
                                    <Badge colorScheme="purple" variant="subtle">
                                        Morocco: {formatCurrency(project.total_cost_morocco, 'MAD')}
                                    </Badge>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            {/* Project Details Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Project Details</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        {selectedProject && (
                            <VStack align="stretch" spacing={4}>
                                <Heading as="h3" size="md">{selectedProject.name}</Heading>
                                <VStack align="stretch" spacing={2}>
                                    <Text><Text as="span" fontWeight="bold">Entity:</Text> {selectedProject.entity}</Text>
                                    <Text><Text as="span" fontWeight="bold">Users:</Text> {selectedProject.number_of_users}</Text>
                                    <Text><Text as="span" fontWeight="bold">Period:</Text> {selectedProject.start_date} to {selectedProject.end_date}</Text>
                                    <Text><Text as="span" fontWeight="bold">Addresses:</Text> {selectedProject.addresses}</Text>
                                </VStack>
                                
                                {selectedProject.items && selectedProject.items.length > 0 && (
                                    <Box>
                                        <Heading as="h4" size="sm" mb={3}>Budget Breakdown</Heading>
                                        <Box maxH="300px" overflowY="auto" border="1px" borderColor="gray.200" borderRadius="md" p={3}>
                                            <VStack align="stretch" spacing={2}>
                                                {selectedProject.items.map((item, index) => (
                                                    <Flex key={index} justify="space-between" align="center" py={2} borderBottom="1px" borderColor="gray.100">
                                                        <Box>
                                                            <Text fontSize="sm" fontWeight="medium">{item.material_name}</Text>
                                                            <HStack spacing={2}>
                                                                <Text fontSize="xs" color="gray.600">
                                                                    {item.category_name} • Qty: {item.quantity}
                                                                </Text>
                                                                {item.is_auto_calculated && (
                                                                    <Badge size="sm" colorScheme="green">Auto</Badge>
                                                                )}
                                                            </HStack>
                                                        </Box>
                                                        <VStack align="end" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="medium">{formatCurrency(item.total_cost_france)}</Text>
                                                            <Text fontSize="xs" color="gray.600">{formatCurrency(item.total_cost_morocco, 'MAD')}</Text>
                                                        </VStack>
                                                    </Flex>
                                                ))}
                                            </VStack>
                                        </Box>
                                        <Box mt={4} pt={4} borderTop="2px" borderColor="gray.300">
                                            <Text fontSize="lg" fontWeight="bold" textAlign="right">
                                                Total: {formatCurrency(selectedProject.total_cost_france)} / {formatCurrency(selectedProject.total_cost_morocco, 'MAD')}
                                            </Text>
                                        </Box>
                                    </Box>
                                )}
                            </VStack>
                        )}
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Add Project Modal */}
            <Modal isOpen={isAddProjectOpen} onClose={onAddProjectClose} size="6xl">
                <ModalOverlay 
                    bg="rgba(0,0,0,0.8)" 
                    backdropFilter="blur(12px)"
                />
                <ModalContent 
                    maxW="90vw" 
                    maxH="95vh" 
                    overflowY="auto"
                    borderRadius="3xl"
                    boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                    bg="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
                    border="2px solid"
                    borderColor="rgba(255, 107, 53, 0.2)"
                    position="relative"
                    _before={{
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: "linear-gradient(90deg, #FF6B35 0%, #20B2AA 50%, #FF6B35 100%)",
                        borderRadius: "3xl 3xl 0 0"
                    }}
                >
                    <ModalHeader 
                        bg="transparent"
                        borderBottom="none"
                        p={8}
                        position="relative"
                    >
                        <Flex justify="space-between" align="center" w="full">
                            <HStack spacing={6} align="center">
                                <Box
                                    p={4}
                                    borderRadius="2xl"
                                    bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
                                    boxShadow="0 12px 35px rgba(255, 107, 53, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)"
                                    position="relative"
                                    _before={{
                                        content: '""',
                                        position: "absolute",
                                        inset: "-2px",
                                        borderRadius: "2xl",
                                        background: "linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)",
                                        zIndex: -1,
                                        opacity: 0.3,
                                        filter: "blur(8px)"
                                    }}
                                >
                                    <Icon as={MdAdd} w="28px" h="28px" color="white" />
                                </Box>
                                <VStack align="start" spacing={2}>
                                    <Heading 
                                        size="xl" 
                                        color="gray.800" 
                                        fontWeight="800"
                                        bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                                        bgClip="text"
                                        textShadow="0 2px 4px rgba(0,0,0,0.1)"
                                    >
                                        Create New Project
                                    </Heading>
                                    <Text fontSize="md" color="gray.600" fontWeight="500">
                                        🚀 Build your infrastructure project with precision
                                    </Text>
                                </VStack>
                            </HStack>
                            <IconButton
                                aria-label="Close"
                                icon={<Icon as={MdClose} />}
                                size="md"
                                variant="ghost"
                                color="gray.500"
                                _hover={{ 
                                    bg: "rgba(255, 107, 53, 0.1)", 
                                    color: "#FF6B35",
                                    transform: "scale(1.1)"
                                }}
                                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                borderRadius="xl"
                                onClick={onAddProjectClose}
                            />
                        </Flex>
                    </ModalHeader>

                    <ModalBody p={8} bg="transparent">
                        <VStack spacing={8} align="stretch">
                            {/* 🎯 PROJECT FOUNDATION SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                                border="2px solid"
                                borderColor="rgba(255, 107, 53, 0.1)"
                                position="relative"
                                _before={{
                                    content: '"🎯"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                                        Project Foundation
                                    </Heading>
                                    
                                    {/* Project Name */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            Project Name *
                                        </Text>
                                        <Input
                                            id="project-name"
                                            placeholder="Enter your project name"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#FF6B35",
                                                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)",
                                                bg: "white"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        />
                                    </Box>

                                    {/* Entity */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            Entity *
                                        </Text>
                                        <Select
                                            id="entity"
                                            defaultValue="OTHER"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#FF6B35",
                                                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            <option value="BOUYGUES_CONSTRUCTION">Bouygues Construction</option>
                                            <option value="BOUYGUES_IMMOBILIER">Bouygues Immobilier</option>
                                            <option value="COLAS">Colas</option>
                                            <option value="TF1">TF1</option>
                                            <option value="BOUYGUES_ENERGIES_SERVICES">Bouygues Energies & Services</option>
                                            <option value="EQUANS">Equans</option>
                                            <option value="BOUYGUES_TELECOM">Bouygues Telecom</option>
                                            <option value="BOUYGUES_SA">Bouygues SA (Holding)</option>
                                            <option value="OTHER">Other</option>
                                        </Select>
                                    </Box>

                                    {/* Start Date and End Date */}
                                    <HStack spacing={4}>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                                Start Date
                                            </Text>
                                            <Input
                                                id="start-date"
                                                type="date"
                                                size="lg"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                                End Date
                                            </Text>
                                            <Input
                                                id="end-date"
                                                type="date"
                                                size="lg"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                    </HStack>

                                    {/* Number of Users */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            Number of Users *
                                        </Text>
                                        <Input
                                            id="number-of-users"
                                            type="number"
                                            placeholder="Enter number of users"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#FF6B35",
                                                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        />
                                    </Box>
                                </VStack>
                            </Box>

                            {/* 💻 PC CONFIGURATION SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(32, 178, 170, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)"
                                border="2px solid"
                                borderColor="rgba(32, 178, 170, 0.1)"
                                position="relative"
                                _before={{
                                    content: '"💻"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                                        PC Configuration
                                    </Heading>
                                    
                                    {/* PC Type */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            PC Type
                                        </Text>
                                        <Select
                                            id="pc-type"
                                            defaultValue="BOTH"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#20B2AA",
                                                boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                            onChange={(e) => setPcTypeSelection(e.target.value)}
                                        >
                                            <option value="LAPTOP_ONLY">Laptop Only</option>
                                            <option value="DESKTOP_ONLY">Desktop Only</option>
                                            <option value="BOTH">Both</option>
                                        </Select>
                                    </Box>

                                    {/* Device Quantities - Conditional based on PC Type */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
                                            Device Quantities
                                        </Text>
                                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                            {/* Laptop Office - Show if LAPTOP_ONLY or BOTH */}
                                            {(pcTypeSelection === 'LAPTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                                                <Box>
                                                    <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                        💻 Laptop Office
                                                    </Text>
                                                    <Input
                                                        id="num-laptop-office"
                                                        type="number"
                                                        placeholder="0"
                                                        size="md"
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        _focus={{
                                                            borderColor: "#20B2AA",
                                                            boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                        }}
                                                        _hover={{
                                                            borderColor: "gray.300"
                                                        }}
                                                        transition="all 0.3s ease"
                                                    />
                                                </Box>
                                            )}
                                            
                                            {/* Laptop Technical - Show if LAPTOP_ONLY or BOTH */}
                                            {(pcTypeSelection === 'LAPTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                                                <Box>
                                                    <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                        🔧 Laptop Technical
                                                    </Text>
                                                    <Input
                                                        id="num-laptop-tech"
                                                        type="number"
                                                        placeholder="0"
                                                        size="md"
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        _focus={{
                                                            borderColor: "#20B2AA",
                                                            boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                        }}
                                                        _hover={{
                                                            borderColor: "gray.300"
                                                        }}
                                                        transition="all 0.3s ease"
                                                    />
                                                </Box>
                                            )}
                                            
                                            {/* Desktop Office - Show if DESKTOP_ONLY or BOTH */}
                                            {(pcTypeSelection === 'DESKTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                                                <Box>
                                                    <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                        🖥️ Desktop Office
                                                    </Text>
                                                    <Input
                                                        id="num-desktop-office"
                                                        type="number"
                                                        placeholder="0"
                                                        size="md"
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        _focus={{
                                                            borderColor: "#20B2AA",
                                                            boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                        }}
                                                        _hover={{
                                                            borderColor: "gray.300"
                                                        }}
                                                        transition="all 0.3s ease"
                                                    />
                                                </Box>
                                            )}
                                            
                                            {/* Desktop Technical - Show if DESKTOP_ONLY or BOTH */}
                                            {(pcTypeSelection === 'DESKTOP_ONLY' || pcTypeSelection === 'BOTH') && (
                                                <Box>
                                                    <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                        ⚙️ Desktop Technical
                                                    </Text>
                                                    <Input
                                                        id="num-desktop-tech"
                                                        type="number"
                                                        placeholder="0"
                                                        size="md"
                                                        borderRadius="xl"
                                                        border="2px solid"
                                                        borderColor="gray.200"
                                                        bg="white"
                                                        _focus={{
                                                            borderColor: "#20B2AA",
                                                            boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                        }}
                                                        _hover={{
                                                            borderColor: "gray.300"
                                                        }}
                                                        transition="all 0.3s ease"
                                                    />
                                                </Box>
                                            )}
                                        </Grid>
                                    </Box>
                                </VStack>
                            </Box>

                            {/* 🏢 APPLICATIONS & INFRASTRUCTURE SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                                border="2px solid"
                                borderColor="rgba(255, 107, 53, 0.1)"
                                position="relative"
                                _before={{
                                    content: '"🏢"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                                        Applications & Infrastructure
                                    </Heading>
                                    
                                    {/* Local Applications */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            Are there local applications?
                                        </Text>
                                        <Select
                                            id="local-apps"
                                            defaultValue="false"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#FF6B35",
                                                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                            onChange={(e) => setLocalAppsEnabled(e.target.value === 'true')}
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </Select>
                                    </Box>

                                    {/* Local Applications List - Conditional */}
                                    {localAppsEnabled && (
                                        <Box
                                            p={4}
                                            borderRadius="xl"
                                            bg="rgba(255, 107, 53, 0.05)"
                                            border="2px solid"
                                            borderColor="rgba(255, 107, 53, 0.2)"
                                            animation="slideIn 0.3s ease-out"
                                        >
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                                Which ones? (Example: SAGE, GMAO)
                                            </Text>
                                            <Input
                                                id="local-apps-list"
                                                placeholder="Enter local applications (e.g., SAGE, GMAO)"
                                                size="lg"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                    )}

                                    {/* File Server */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            File Server?
                                        </Text>
                                        <Select
                                            id="file-server"
                                            defaultValue="false"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#FF6B35",
                                                boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </Select>
                                    </Box>
                                </VStack>
                            </Box>

                            {/* 🌐 LOCATION & CONNECTIVITY SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(32, 178, 170, 0.05) 0%, rgba(255, 107, 53, 0.05) 100%)"
                                border="2px solid"
                                borderColor="rgba(32, 178, 170, 0.1)"
                                position="relative"
                                _before={{
                                    content: '"🌐"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                                        Location & Connectivity
                                    </Heading>
                                    
                                    {/* Site Addresses */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            Addresses of each site/workshop
                                        </Text>
                                        <Textarea
                                            id="site-addresses"
                                            placeholder="Enter site addresses (one per line)"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            rows={3}
                                            resize="vertical"
                                            _focus={{
                                                borderColor: "#20B2AA",
                                                boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        />
                                    </Box>

                                    {/* GPS Coordinates */}
                                    <Box>
                                        <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                            GPS Coordinates (Example: 24.793387, 46.654397)
                                        </Text>
                                        <Input
                                            id="gps-coordinates"
                                            placeholder="Enter GPS coordinates (e.g., 24.793387, 46.654397)"
                                            size="lg"
                                            borderRadius="xl"
                                            border="2px solid"
                                            borderColor="gray.200"
                                            bg="white"
                                            _focus={{
                                                borderColor: "#20B2AA",
                                                boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                            }}
                                            _hover={{
                                                borderColor: "gray.300"
                                            }}
                                            transition="all 0.3s ease"
                                        />
                                    </Box>

                                    {/* Internet Line */}
                                    <HStack spacing={4}>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                                Internet Line Type
                                            </Text>
                                            <Select
                                                id="internet-line-type"
                                                defaultValue="FO"
                                                size="lg"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#20B2AA",
                                                    boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            >
                                                <option value="FO">FO</option>
                                                <option value="VSAT">VSAT</option>
                                                <option value="STARLINK">STARLINK</option>
                                                <option value="OTHER">OTHER</option>
                                            </Select>
                                        </Box>
                                        <Box flex={1}>
                                            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={3}>
                                                Internet Line Speed
                                            </Text>
                                            <Select
                                                id="internet-line-speed"
                                                defaultValue="100MBps"
                                                size="lg"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#20B2AA",
                                                    boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            >
                                                <option value="100MBps">100MBps</option>
                                                <option value="200MB">200MB</option>
                                                <option value="500MB">500MB</option>
                                                <option value="1GB">1GB</option>
                                            </Select>
                                        </Box>
                                    </HStack>
                                </VStack>
                            </Box>

                            {/* 🖨️ ADDITIONAL EQUIPMENT SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(32, 178, 170, 0.05) 100%)"
                                border="2px solid"
                                borderColor="rgba(255, 107, 53, 0.1)"
                                position="relative"
                                _before={{
                                    content: '"🖨️"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <VStack spacing={6} align="stretch">
                                    <Heading size="md" color="gray.800" fontWeight="700" mb={2}>
                                        Additional Equipment
                                    </Heading>
                                    
                                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                🖨️ Number of Printers
                                            </Text>
                                            <Input
                                                id="num-printers"
                                                type="number"
                                                placeholder="0"
                                                size="md"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                📐 Number of Traceau
                                            </Text>
                                            <Input
                                                id="num-traceau"
                                                type="number"
                                                placeholder="0"
                                                size="md"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                📹 Number of Videoconference
                                            </Text>
                                            <Input
                                                id="num-videoconference"
                                                type="number"
                                                placeholder="0"
                                                size="md"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                        <Box>
                                            <Text fontSize="xs" color="gray.600" mb={2} fontWeight="500">
                                                📶 Number of AP
                                            </Text>
                                            <Input
                                                id="num-aps"
                                                type="number"
                                                placeholder="0"
                                                size="md"
                                                borderRadius="xl"
                                                border="2px solid"
                                                borderColor="gray.200"
                                                bg="white"
                                                _focus={{
                                                    borderColor: "#FF6B35",
                                                    boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)"
                                                }}
                                                _hover={{
                                                    borderColor: "gray.300"
                                                }}
                                                transition="all 0.3s ease"
                                            />
                                        </Box>
                                    </Grid>
                                </VStack>
                            </Box>

                            {/* 🚀 ACTION BUTTONS SECTION */}
                            <Box
                                p={6}
                                borderRadius="2xl"
                                bg="linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(32, 178, 170, 0.1) 100%)"
                                border="2px solid"
                                borderColor="rgba(255, 107, 53, 0.2)"
                                position="relative"
                                _before={{
                                    content: '"🚀"',
                                    position: "absolute",
                                    top: "-12px",
                                    left: "24px",
                                    bg: "white",
                                    px: 3,
                                    py: 1,
                                    borderRadius: "full",
                                    fontSize: "lg",
                                    fontWeight: "bold"
                                }}
                            >
                                <HStack spacing={4} justify="flex-end" pt={2}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => {
                                            clearAddForm();
                                            onAddProjectClose();
                                        }}
                                        borderColor="gray.300"
                                        color="gray.600"
                                        _hover={{ 
                                            bg: "gray.50",
                                            borderColor: "gray.400",
                                            transform: "translateY(-1px)"
                                        }}
                                        transition="all 0.3s ease"
                                        borderRadius="xl"
                                        px={8}
                                        py={3}
                                        fontWeight="600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="lg"
                                        bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
                                        color="white"
                                        _hover={{
                                            bg: "linear-gradient(135deg, #e55a2b 0%, #17a2b8 100%)",
                                            transform: "translateY(-2px) scale(1.02)",
                                            boxShadow: "0 12px 35px rgba(255, 107, 53, 0.4)",
                                            _before: {
                                                left: "100%"
                                            }
                                        }}
                                        _active={{ 
                                            transform: "translateY(0) scale(1)" 
                                        }}
                                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                        onClick={handleCreateProject}
                                        isLoading={isCreatingProject}
                                        loadingText="Creating..."
                                        disabled={isCreatingProject}
                                        borderRadius="xl"
                                        px={8}
                                        py={3}
                                        fontWeight="700"
                                        fontSize="md"
                                        boxShadow="0 8px 25px rgba(255, 107, 53, 0.3)"
                                        position="relative"
                                        overflow="hidden"
                                        _before={{
                                            content: '""',
                                            position: "absolute",
                                            top: 0,
                                            left: "-100%",
                                            width: "100%",
                                            height: "100%",
                                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                                            transition: "left 0.5s"
                                        }}
                                    >
                                        {isCreatingProject ? "Creating..." : "✨ Create Project"}
                                    </Button>
                                </HStack>
                            </Box>

                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Container>
    );
};

export default ProjectList;