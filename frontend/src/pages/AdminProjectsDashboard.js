import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Icon,
  Flex,
  Button,
  Container,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Grid,
  GridItem,
  SimpleGrid,
  IconButton,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Image,
  Avatar,
  Wrap,
  WrapItem,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  TagRightIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  ScaleFade,
  SlideFade,
  Fade,
} from '@chakra-ui/react';
import {
  MdBusiness,
  MdTrendingUp,
  MdTrendingDown,
  MdAttachMoney,
  MdPeople,
  MdDateRange,
  MdStar,
  MdStarBorder,
  MdRefresh,
  MdSearch,
  MdFilterList,
  MdSort,
  MdVisibility,
  MdArrowForward,
  MdComputer,
  MdRouter,
  MdStorage,
  MdWifi,
  MdNetworkCheck,
  MdSettings,
  MdVideocam,
  MdVideoCall,
  MdPrint,
  MdCable,
  MdMemory,
  MdSecurity,
  MdCloud,
  MdSpeed,
  MdAnalytics,
  MdAutoGraph,
  MdDesktopMac,
  MdLaptop,
  MdDownload,
  MdEdit,
  MdDelete,
  MdMoreVert,
  MdAdminPanelSettings,
  MdPerson,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdCalendarToday,
  MdTimeline,
  MdAssessment,
  MdShowChart,
  MdPieChart,
  MdBarChart,
  MdTableChart,
  MdViewModule,
  MdViewList,
  MdGridView,
  MdExpandMore,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdClose,
  MdUpdate,
  MdAdd,
  MdSave,
  MdBuild,
} from 'react-icons/md';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const AdminProjectsDashboard = () => {
  const { user, authToken } = useAuth();
  const [searchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEntity, setFilterEntity] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [selectedProject, setSelectedProject] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [localAppsEnabled, setLocalAppsEnabled] = useState(false);
  const [pcTypeSelection, setPcTypeSelection] = useState('BOTH');
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalBudget: 0,
    activeProjects: 0,
    recentProjects: 0,
  });
  const [financialDetails, setFinancialDetails] = useState(null);
  const [loadingFinancialDetails, setLoadingFinancialDetails] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const toast = useToast();

  const textColor = useColorModeValue('gray.800', 'white');
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    // AdminProjectsDashboard component loaded
    
    if (user && authToken) {
      // User authentication verified
      fetchProjects();
    } else {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
    }
  }, [user, authToken]);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, filterStatus, filterEntity, sortBy, sortOrder]);

  // Auto-open modal if URL parameter is present
  useEffect(() => {
    const openModal = searchParams.get('open');
    if (openModal === 'add') {
      onAddOpen();
    }
  }, [searchParams, onAddOpen]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // Fetching projects data
      
      const response = await axios.get(`${API_URL}projects/projects/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Projects data received
      
      // Handle both paginated and non-paginated responses
      let projectsData = [];
      if (response.data?.results) {
        // Paginated response
        projectsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        projectsData = response.data;
      } else {
        // Unexpected response format
        projectsData = [];
      }
      
      // Projects data processed
      setProjects(projectsData);
      await calculateStats(projectsData);
      setError(null);
    } catch (error) {
      // Failed to fetch projects
      setError(`Failed to load projects: ${error.response?.data?.detail || error.message}`);
      toast({
        title: 'Error',
        description: `Failed to load projects: ${error.response?.data?.detail || error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialDetails = async (projectId) => {
    if (!projectId) return;
    
    try {
      setLoadingFinancialDetails(true);
      // Fetching financial details
      
      const response = await axios.get(`${API_URL}projects/projects/${projectId}/financial-details/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Financial details received
      setFinancialDetails(response.data);
    } catch (error) {
      // Failed to fetch financial details
      toast({
        title: 'Warning',
        description: `Failed to load financial details: ${error.response?.data?.detail || error.message}`,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingFinancialDetails(false);
    }
  };

  const calculateStats = async (projectsData) => {
    const totalProjects = projectsData.length;
    const totalUsers = projectsData.reduce((sum, project) => sum + (project.number_of_users || 0), 0);
    const activeProjects = projectsData.filter(p => p.status === 'active' || !p.status).length;
    const recentProjects = projectsData.filter(p => {
      const createdDate = new Date(p.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return createdDate > weekAgo;
    }).length;

    // Get total budget from dashboard stats API (same as backend calculation)
    let totalBudget = 0;
    try {
      const dashboardResponse = await axios.get(`${API_URL}dashboard/stats/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      totalBudget = dashboardResponse.data.financial?.total_cost_france || 0;
    } catch (error) {
      console.warn('Failed to fetch dashboard stats, using project sum:', error);
      // Fallback to project sum if dashboard stats fail
      totalBudget = projectsData.reduce((sum, project) => sum + (parseFloat(project.total_cost_france) || 0), 0);
    }

    setStats({
      totalProjects,
      totalUsers,
      totalBudget,
      activeProjects,
      recentProjects,
    });
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.created_by_username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(project => project.status === filterStatus);
    }

    // Entity filter
    if (filterEntity !== 'all') {
      filtered = filtered.filter(project => project.entity === filterEntity);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  };

  const handleViewProject = async (project) => {
    // Viewing project details
    // Authentication verified
    
    try {
      // Fetch detailed project data
      const url = `${API_URL}projects/projects/${project.id}/`;
      // Fetching project details
      
      const response = await axios.get(url, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      // Project details received
      // Project data processed
      
      setSelectedProject(response.data);
      setEditFormData(response.data);
      // Project selection updated
      
      // Fetch financial details for the selected project
      fetchFinancialDetails(response.data.id);
    } catch (error) {
      // Error fetching project details
      // Error details logged
      
      // Fallback to list data if detail fetch fails
      // Falling back to list data
    setSelectedProject(project);
      setEditFormData(project);
    }
    
    setIsEditMode(false);
    onOpen();
  };


  // New inline edit functions
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setEditFormData(selectedProject);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Auto-update company name when entity changes
      if (field === 'entity') {
        const entityMapping = {
          'BOUYGUES_CONSTRUCTION': 'Bouygues Construction',
          'BOUYGUES_IMMOBILIER': 'Bouygues Immobilier',
          'COLAS': 'Colas',
          'TF1': 'TF1',
          'BOUYGUES_ENERGIES_SERVICES': 'Bouygues Energies & Services',
          'EQUANS': 'Equans',
          'BOUYGUES_TELECOM': 'Bouygues Telecom',
          'BOUYGUES_SA': 'Bouygues SA (Holding)',
          'OTHER': 'Other Company'
        };
        newData.company_name = entityMapping[value] || '';
      }
      
      // Auto-update progress when status changes
      if (field === 'status') {
        const statusProgressMapping = {
          'draft': 0,
          'submitted': 20,
          'approved': 40,
          'in_progress': 70,
          'completed': 100
        };
        newData.progress = statusProgressMapping[value] || 0;
      }
      
      return newData;
    });
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !authToken) {
      // Missing project or auth token
      return;
    }
    
    // Updating project
    console.log('Form data:', editFormData);
    
    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `${API_URL}projects/projects/${selectedProject.id}/`,
        editFormData,
        {
          headers: { 
            Authorization: `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Exit edit mode immediately
      setIsEditMode(false);
      
      // Reload the page instantly to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Failed to update project:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to update project';
      if (error.response?.status === 403) {
        errorMessage = 'Permission denied. Please check your login status.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditFormData(selectedProject);
    setIsEditMode(false);
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !authToken) {
      // Missing project or auth token
      return;
    }

    try {
      console.log('Deleting project:', projectToDelete.id);
      
      await axios.delete(
        `${API_URL}projects/projects/${projectToDelete.id}/`,
        {
          headers: { Authorization: `Token ${authToken}` }
        }
      );

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Close modals and refresh projects list
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
      onClose();
      fetchProjects();

    } catch (error) {
      console.error('Error deleting project:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to delete project';
      if (error.response?.status === 403) {
        errorMessage = 'Permission denied. You cannot delete this project.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const cancelDeleteProject = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

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
      if (element) {
        element.value = '';
      }
    });
    
    // Reset selects to default values
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

      // Get form data with null checks
      const projectName = getElementValue('project-name');
      const entity = getElementValue('entity', 'OTHER');
      const startDate = getElementValue('start-date');
      const endDate = getElementValue('end-date');
      const numberOfUsers = getElementValueAsNumber('number-of-users');
      const pcType = getElementValue('pc-type', 'BOTH');
      const numLaptopOffice = getElementValueAsNumber('num-laptop-office');
      const numLaptopTech = getElementValueAsNumber('num-laptop-tech');
      const numDesktopOffice = getElementValueAsNumber('num-desktop-office');
      const numDesktopTech = getElementValueAsNumber('num-desktop-tech');
      const localApps = getElementValue('local-apps', 'false') === 'true';
      const localAppsList = getElementValue('local-apps-list');
      const fileServer = getElementValue('file-server', 'false') === 'true';
      const siteAddresses = getElementValue('site-addresses');
      const gpsCoordinates = getElementValue('gps-coordinates');
      const internetLineType = getElementValue('internet-line-type', 'FO');
      const internetLineSpeed = getElementValue('internet-line-speed', '100MBps');
      const numPrinters = getElementValueAsNumber('num-printers');
      const numTraceau = getElementValueAsNumber('num-traceau');
      const numVideoconference = getElementValueAsNumber('num-videoconference');
      const numAps = getElementValueAsNumber('num-aps');

      // Validate required fields
      if (!projectName) {
        toast({
          title: 'Error',
          description: 'Project name is required!',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Create project data
      const projectData = {
        name: projectName,
        entity: entity,
        start_date: startDate || null,
        end_date: endDate || null,
        number_of_users: numberOfUsers,
        pc_type: pcType,
        num_laptop_office: numLaptopOffice,
        num_laptop_tech: numLaptopTech,
        num_desktop_office: numDesktopOffice,
        num_desktop_tech: numDesktopTech,
        local_apps: localApps,
        local_apps_list: localAppsList,
        file_server: fileServer,
        site_addresses: siteAddresses,
        gps_coordinates: gpsCoordinates,
        internet_line_type: internetLineType,
        internet_line_speed: internetLineSpeed,
        num_printers: numPrinters,
        num_traceau: numTraceau,
        num_videoconference: numVideoconference,
        num_aps: numAps,
      };

      console.log('Creating project with data:', projectData);
      console.log('PC Type Selection:', pcTypeSelection);
      console.log('Local Apps Enabled:', localAppsEnabled);

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
      console.log('POST URL:', `${API_URL}projects/projects/`);
      // Authentication verified
      
      let createResponse;
      try {
        createResponse = await axios.post(`${API_URL}projects/projects/`, {
          name: projectName,
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
      const updateResponse = await axios.patch(`${API_URL}projects/projects/${projectId}/`, projectData, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Project created successfully:', updateResponse.data);

      toast({
        title: 'Success',
        description: 'New project created successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Refresh projects list
      fetchProjects();
      clearAddForm();
      onAddClose();

    } catch (error) {
      console.error('Error creating project:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create project. Please try again.';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleExportProject = async (project) => {
    try {
      const response = await axios.get(`${API_URL}projects/projects/${project.id}/export-excel/`, {
        headers: { Authorization: `Token ${authToken}` },
        responseType: 'blob'
      });
      
      // Create a safe filename from the project name
      const safeProjectName = project.name
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${safeProjectName}_budget.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: 'Success',
        description: 'Project exported successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to export project:', error);
      toast({
        title: 'Error',
        description: 'Failed to export project',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRecalculateAllBudgets = async () => {
    try {
      // First, check materials status
      const statusResponse = await axios.get(`${API_URL}materials/check-materials-status/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Materials status:', statusResponse.data);
      
      // Setup default materials if needed
      if (statusResponse.data.status === 'empty') {
        console.log('Setting up default materials...');
        await axios.post(`${API_URL}materials/setup-default-materials/`, {}, {
          headers: { Authorization: `Token ${authToken}` }
        });
      }
      
      // Then recalculate all project budgets
      const response = await axios.post(`${API_URL}projects/projects/recalculate-all/`, {}, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      console.log('Recalculate response:', response.data);
      
      toast({
        title: 'Success',
        description: response.data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the projects data
      await fetchProjects();
      
    } catch (error) {
      console.error('Failed to recalculate budgets:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to recalculate budgets';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
      return '0,00 €';
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'N/A';
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'draft': return 'gray';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const getEntityColor = (entity) => {
    switch (entity) {
      case 'BOUYGUES_CONSTRUCTION': return 'blue';
      case 'BOUYGUES_IMMOBILIER': return 'green';
      case 'COLAS': return 'orange';
      case 'TF1': return 'red';
      case 'BOUYGUES_ENERGIES_SERVICES': return 'purple';
      case 'EQUANS': return 'teal';
      case 'BOUYGUES_TELECOM': return 'cyan';
      case 'BOUYGUES_SA': return 'yellow';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'green';
      case 'medium': return 'blue';
      case 'high': return 'orange';
      case 'urgent': return 'red';
      default: return 'blue';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 60) return 'blue';
    if (progress >= 40) return 'orange';
    if (progress >= 20) return 'yellow';
    return 'red';
  };

  const calculateProgressFromStatus = (status) => {
    const statusProgressMapping = {
      'draft': 0,
      'submitted': 20,
      'approved': 40,
      'in_progress': 70,
      'completed': 100
    };
    return statusProgressMapping[status] || 0;
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>Loading admin projects dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #f8fafc 0%, #e2e8f0 100%)" position="relative" overflow="hidden">
      {/* Animated Background */}
      <Box position="absolute" top="0" left="0" right="0" bottom="0" overflow="hidden" zIndex={0}>
        <Box position="absolute" top="10%" left="5%" w="300px" h="300px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 20s ease-in-out infinite" />
        <Box position="absolute" top="60%" right="10%" w="200px" h="200px" borderRadius="full" bg="rgba(32, 178, 170, 0.05)" animation="float 25s ease-in-out infinite reverse" />
        <Box position="absolute" bottom="20%" left="20%" w="150px" h="150px" borderRadius="full" bg="rgba(255, 107, 53, 0.05)" animation="float 30s ease-in-out infinite" />
      </Box>

      <Container maxW="container.xl" py={8} position="relative" zIndex={1}>
        {/* Filters and Controls */}
        <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" mb={8}>
          <CardBody p={6}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={4} align="center">
              <InputGroup maxW="400px">
                <InputLeftElement>
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects, companies, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="xl"
                />
              </InputGroup>

              <HStack spacing={4}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  borderRadius="xl"
                  maxW="150px"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </Select>

                <Select
                  value={filterEntity}
                  onChange={(e) => setFilterEntity(e.target.value)}
                  borderRadius="xl"
                  maxW="200px"
                >
                  <option value="all">All Entities</option>
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

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  borderRadius="xl"
                  maxW="150px"
                >
                  <option value="created_at">Date Created</option>
                  <option value="name">Name</option>
                  <option value="total_cost_france">Budget</option>
                  <option value="number_of_users">Users</option>
                </Select>

                <IconButton
                  icon={<Icon as={sortOrder === 'asc' ? MdTrendingUp : MdTrendingDown} />}
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  borderRadius="xl"
                  aria-label="Toggle sort order"
                />

                <HStack spacing={2}>
                  <IconButton
                    icon={<Icon as={MdGridView} />}
                    onClick={() => setViewMode('grid')}
                    colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
                    borderRadius="xl"
                    aria-label="Grid view"
                  />
                  <IconButton
                    icon={<Icon as={MdViewList} />}
                    onClick={() => setViewMode('list')}
                    colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
                    borderRadius="xl"
                    aria-label="List view"
                  />
                  <IconButton
                    icon={<Icon as={MdTableChart} />}
                    onClick={() => setViewMode('table')}
                    colorScheme={viewMode === 'table' ? 'brand' : 'gray'}
                    borderRadius="xl"
                    aria-label="Table view"
                  />
                </HStack>

                <Button
                  bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                  color="white"
                  _hover={{
                    bgGradient: "linear(to-r, #e55a2b 0%, #17a2b8 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255, 107, 53, 0.4)"
                  }}
                  _active={{
                    transform: "translateY(0)"
                  }}
                  borderRadius="xl"
                  px={4}
                  py={2}
                  fontWeight="bold"
                  transition="all 0.3s ease"
                  onClick={onAddOpen}
                  minW="auto"
                >
                  +
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }} gap={6} mb={8}>
          <ScaleFade in={true} delay={0.1}>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} transition="all 0.3s ease">
              <CardBody textAlign="center" p={6}>
                <Icon as={MdBusiness} w="32px" h="32px" color="#FF6B35" mb={3} />
                <Stat>
                  <StatNumber fontSize="2xl" color={textColor}>{stats.totalProjects}</StatNumber>
                  <StatLabel color="gray.500">Total Projects</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={true} delay={0.2}>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} transition="all 0.3s ease">
              <CardBody textAlign="center" p={6}>
                <Icon as={MdPeople} w="32px" h="32px" color="#20B2AA" mb={3} />
                <Stat>
                  <StatNumber fontSize="2xl" color={textColor}>{stats.totalUsers}</StatNumber>
                  <StatLabel color="gray.500">Total Users</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={true} delay={0.3}>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} transition="all 0.3s ease">
              <CardBody textAlign="center" p={6}>
                <Icon as={MdAttachMoney} w="32px" h="32px" color="green.500" mb={3} />
                <Stat>
                  <StatNumber fontSize="2xl" color={textColor}>{formatCurrency(stats.totalBudget)}</StatNumber>
                  <StatLabel color="gray.500">Total Budget</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={true} delay={0.4}>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} transition="all 0.3s ease">
              <CardBody textAlign="center" p={6}>
                <Icon as={MdCheckCircle} w="32px" h="32px" color="blue.500" mb={3} />
                <Stat>
                  <StatNumber fontSize="2xl" color={textColor}>{stats.activeProjects}</StatNumber>
                  <StatLabel color="gray.500">Active Projects</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={true} delay={0.5}>
            <Card bg={cardBg} borderRadius="2xl" boxShadow="0 8px 32px rgba(0,0,0,0.1)" _hover={{ transform: 'translateY(-4px)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }} transition="all 0.3s ease">
              <CardBody textAlign="center" p={6}>
                <Icon as={MdTimeline} w="32px" h="32px" color="purple.500" mb={3} />
                <Stat>
                  <StatNumber fontSize="2xl" color={textColor}>{stats.recentProjects}</StatNumber>
                  <StatLabel color="gray.500">This Week</StatLabel>
                </Stat>
              </CardBody>
            </Card>
          </ScaleFade>
        </Grid>


        {/* Projects Display */}
        {viewMode === 'grid' && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(3, 1fr)" }} gap={4} alignItems="stretch">
            {filteredProjects.map((project, index) => (
              <SlideFade in={true} key={project.id} offsetY="20px" delay={index * 0.1}>
                <Card
                  bg="linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)"
                  borderRadius="2xl"
                  maxW="100%"
                  boxShadow="0 8px 32px rgba(0,0,0,0.08)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.2)"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 25px 80px rgba(255, 107, 53, 0.25)',
                    borderColor: 'rgba(255, 107, 53, 0.3)',
                    '&::before': {
                      opacity: 1,
                    }
                  }}
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #FF6B35 0%, #20B2AA 50%, #FF6B35 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                  transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  cursor="pointer"
                  onClick={() => handleViewProject(project)}
                  h="380px"
                  display="flex"
                  flexDirection="column"
                >
                  <CardHeader pb={1}>
                    <Flex justify="space-between" align="start">
                      <VStack align="start" spacing={2} flex={1} minW={0}>
                        <Heading 
                          size="md" 
                          bgGradient="linear(to-r, #2D3748 0%, #4A5568 100%)"
                          bgClip="text"
                          noOfLines={2} 
                          w="full"
                          fontWeight="700"
                          letterSpacing="-0.02em"
                          _hover={{
                            bgGradient: 'linear(to-r, #FF6B35 0%, #20B2AA 100%)',
                            bgClip: 'text',
                          }}
                          transition="all 0.3s ease"
                        >
                          {project.name}
                        </Heading>
                        <Text fontSize="sm" color="gray.500" noOfLines={1} w="full">
                          {project.company_name || 'No company'}
                        </Text>
                      </VStack>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<Icon as={MdMoreVert} />}
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <MenuList 
                          bg="rgba(255, 255, 255, 0.95)"
                          backdropFilter="blur(20px)"
                          borderRadius="xl"
                          border="1px solid rgba(255, 255, 255, 0.3)"
                          boxShadow="0 8px 32px rgba(0,0,0,0.15)"
                        >
                          <MenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportProject(project);
                            }}
                            _hover={{
                              bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              color: 'white',
                              transform: 'translateY(-2px) scale(1.02)',
                              boxShadow: '0 8px 25px rgba(79, 172, 254, 0.4)',
                            }}
                            borderRadius="xl"
                            mx={2}
                            my={1}
                            p={4}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            overflow="hidden"
                            bg="rgba(255, 255, 255, 0.1)"
                            backdropFilter="blur(10px)"
                            border="1px solid rgba(255, 255, 255, 0.2)"
                          >
                            {/* Animated Background Gradient */}
                            <Box
                              position="absolute"
                              top="0"
                              left="-100%"
                              w="100%"
                              h="100%"
                              bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                              transition="left 0.5s ease"
                              _groupHover={{ left: "100%" }}
                            />
                            
                            <HStack spacing={3} position="relative" zIndex={1}>
                              {/* Professional Icon Container */}
                              <Box
                                p={2}
                            borderRadius="lg"
                                bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                boxShadow="0 4px 15px rgba(79, 172, 254, 0.3)"
                                _groupHover={{
                                  transform: 'rotate(5deg) scale(1.1)',
                                  boxShadow: '0 6px 20px rgba(79, 172, 254, 0.5)',
                                }}
                                transition="all 0.3s ease"
                              >
                                <Icon as={MdDownload} w="18px" h="18px" color="white" />
                              </Box>
                              
                              <VStack align="start" spacing={0} flex={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="md"
                                  bgGradient="linear(135deg, #4facfe 0%, #00f2fe 100%)"
                                  bgClip="text"
                                  _groupHover={{ color: 'white' }}
                                  transition="color 0.3s ease"
                                >
                                  Export Excel
                                </Text>
                                <Text 
                                  fontSize="xs" 
                                  color="gray.500"
                                  _groupHover={{ color: 'rgba(255,255,255,0.8)' }}
                                  transition="color 0.3s ease"
                                >
                                  📊 Download data
                                </Text>
                              </VStack>
                              
                              {/* Professional Arrow */}
                              <Box
                                opacity="0.6"
                                _groupHover={{ 
                                  opacity: 1,
                                  transform: 'translateX(3px)',
                                }}
                                transition="all 0.3s ease"
                              >
                                <Icon as={MdArrowForward} w="16px" h="16px" />
                              </Box>
                            </HStack>
                          </MenuItem>
                          <MenuDivider 
                            borderColor="rgba(255, 255, 255, 0.3)"
                            my={2}
                            mx={4}
                          />
                          <MenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project);
                            }}
                            _hover={{
                              bg: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                              color: 'white',
                              transform: 'translateY(-2px) scale(1.02)',
                              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
                            }}
                            borderRadius="xl"
                            mx={2}
                            my={1}
                            p={4}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            position="relative"
                            overflow="hidden"
                            bg="rgba(255, 107, 107, 0.1)"
                            backdropFilter="blur(10px)"
                            border="1px solid rgba(255, 107, 107, 0.2)"
                          >
                            {/* Animated Background Gradient */}
                            <Box
                              position="absolute"
                              top="0"
                              left="-100%"
                              w="100%"
                              h="100%"
                              bg="linear-gradient(90deg, transparent, rgba(255,107,107,0.2), transparent)"
                              transition="left 0.5s ease"
                              _groupHover={{ left: "100%" }}
                            />
                            
                            <HStack spacing={3} position="relative" zIndex={1}>
                              {/* Professional Icon Container */}
                              <Box
                                p={2}
                                borderRadius="lg"
                                bg="linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
                                boxShadow="0 4px 15px rgba(255, 107, 107, 0.3)"
                                _groupHover={{
                                  transform: 'rotate(5deg) scale(1.1)',
                                  boxShadow: '0 6px 20px rgba(255, 107, 107, 0.5)',
                                }}
                                transition="all 0.3s ease"
                              >
                                <Icon as={MdDelete} w="18px" h="18px" color="white" />
                              </Box>
                              
                              <VStack align="start" spacing={0} flex={1}>
                                <Text 
                                  fontWeight="bold" 
                                  fontSize="md"
                                  bgGradient="linear(135deg, #ff6b6b 0%, #ee5a52 100%)"
                                  bgClip="text"
                                  _groupHover={{ color: 'white' }}
                                  transition="color 0.3s ease"
                                >
                                  Delete Project
                                </Text>
                                <Text 
                                  fontSize="xs" 
                                  color="gray.500"
                                  _groupHover={{ color: 'rgba(255,255,255,0.8)' }}
                                  transition="color 0.3s ease"
                                >
                                  🗑️ Remove permanently
                                </Text>
                              </VStack>
                              
                              {/* Professional Arrow */}
                              <Box
                                opacity="0.6"
                                _groupHover={{ 
                                  opacity: 1,
                                  transform: 'translateX(3px)',
                                }}
                                transition="all 0.3s ease"
                              >
                                <Icon as={MdArrowForward} w="16px" h="16px" />
                              </Box>
                            </HStack>
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Flex>
                  </CardHeader>

                  <CardBody pt={0} flex={1} display="flex" flexDirection="column">
                    {/* Top Content Section */}
                    <VStack align="stretch" spacing={3} flex={1}>
                      <HStack justify="space-between">
                        <HStack spacing={2} flexWrap="wrap" maxW="100%">
                          <Tag 
                            colorScheme={getProjectStatusColor(project.status)} 
                            size="sm"
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontWeight="600"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            maxW="100px"
                            _hover={{
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                            transition="all 0.2s ease"
                          >
                            <TagLabel fontSize="xs" isTruncated>{project.status || 'Draft'}</TagLabel>
                          </Tag>
                          <Tag 
                            colorScheme={getEntityColor(project.entity)} 
                            size="sm"
                            borderRadius="full"
                            px={2}
                            py={1}
                            fontWeight="600"
                            boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            maxW="100px"
                            _hover={{
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            }}
                            transition="all 0.2s ease"
                          >
                            <TagLabel fontSize="xs" isTruncated>{project.entity || 'Other'}</TagLabel>
                          </Tag>
                        </HStack>
                        <Text fontSize="xs" color="gray.400">
                          {formatDate(project.created_at)}
                        </Text>
                      </HStack>

                      {/* Project Description */}
                      {project.description && (
                        <Box
                          p={3}
                          bg="linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)"
                          borderRadius="lg"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <Text fontSize="sm" color="gray.700" noOfLines={3}>
                            {project.description}
                          </Text>
                        </Box>
                      )}

                      <HStack justify="space-between" align="center">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2} align="center">
                            <Box
                              p={1.5}
                              borderRadius="full"
                              bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              boxShadow="0 2px 8px rgba(102, 126, 234, 0.3)"
                            >
                              <Icon as={MdPerson} color="white" w={3} h={3} />
                            </Box>
                            <Text fontSize="sm" color="gray.600" fontWeight="500">
                            Created by: {project.created_by_username || 'Unknown'}
                          </Text>
                          </HStack>
                          <HStack spacing={2} align="center">
                            <Box
                              p={1.5}
                              borderRadius="full"
                              bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                              boxShadow="0 2px 8px rgba(240, 147, 251, 0.3)"
                            >
                              <Icon as={MdPeople} color="white" w={3} h={3} />
                            </Box>
                            <Text fontSize="sm" color="gray.600" fontWeight="500">
                            Users: {project.number_of_users || 0}
                          </Text>
                          </HStack>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          {project.total_cost_france && (
                          <Text fontSize="sm" fontWeight="bold" color="green.600">
                            {formatCurrency(project.total_cost_france)}
                          </Text>
                          )}
                          {project.total_cost_morocco && (
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(project.total_cost_morocco, 'MAD')}
                          </Text>
                          )}
                        </VStack>
                      </HStack>

                      <HStack justify="space-between" w="full">
                        <HStack spacing={2} align="center" flex={1}>
                          <Box
                            p={1.5}
                            borderRadius="full"
                            bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                            boxShadow="0 2px 8px rgba(79, 172, 254, 0.3)"
                          >
                            <Icon as={MdDateRange} color="white" w={3} h={3} />
                          </Box>
                          <Text fontSize="sm" color="gray.600" noOfLines={1} fontWeight="500">
                          {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </Text>
                        </HStack>
                      </HStack>

                      {/* Additional Project Info */}
                      <HStack justify="space-between" w="full" spacing={4}>
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2} align="center">
                            <Box
                              p={1.5}
                              borderRadius="full"
                              bg="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                              boxShadow="0 2px 8px rgba(255, 236, 210, 0.3)"
                            >
                              <Icon as={MdInfo} color="white" w={3} h={3} />
                            </Box>
                            <HStack spacing={2}>
                              <Tag colorScheme={getPriorityColor(project.priority)} size="sm">
                                <TagLabel>{project.priority || 'medium'}</TagLabel>
                              </Tag>
                            </HStack>
                          </HStack>
                        </VStack>
                        <VStack align="end" spacing={1} flex={1}>
                          <HStack spacing={2} align="center">
                            <Box
                              p={1.5}
                              borderRadius="full"
                              bg="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                              boxShadow="0 2px 8px rgba(168, 237, 234, 0.3)"
                            >
                              <Icon as={MdCheckCircle} color="white" w={3} h={3} />
                            </Box>
                            <VStack spacing={1} align="start" w="full">
                              {(() => {
                                const actualProgress = project.progress || calculateProgressFromStatus(project.status);
                                return (
                                  <>
                                    <Text fontSize="xs" color="gray.500" fontWeight="500">
                                      Progress: {actualProgress}%
                            </Text>
                                    <Progress 
                                      value={actualProgress} 
                                      size="sm" 
                                      colorScheme={getProgressColor(actualProgress)}
                                      borderRadius="full"
                                      w="100px"
                                    />
                                  </>
                                );
                              })()}
                            </VStack>
                          </HStack>
                        </VStack>
                      </HStack>
                    </VStack>

                    {/* Button Section - Centered */}
                    <Box display="flex" justifyContent="center" py={4}>
                        <Button
                          size="sm"
                          bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                          color="white"
                          variant="solid"
                          borderRadius="xl"
                          px={6}
                          py={2}
                          fontSize="sm"
                          fontWeight="bold"
                          position="relative"
                          overflow="hidden"
                          boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                          _hover={{
                            transform: 'translateY(-3px) scale(1.05)',
                            boxShadow: '0 12px 35px rgba(255, 107, 53, 0.5)',
                            bgGradient: 'linear(to-r, #e55a2b 0%, #17a2b8 100%)',
                          }}
                          _active={{
                            transform: 'translateY(-1px) scale(1.02)',
                          }}
                          transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                          leftIcon={
                            <Icon 
                              as={MdVisibility} 
                              w="16px" 
                              h="16px"
                            />
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProject(project);
                          }}
                        >
                          <Text
                            bgGradient="linear(to-r, white 0%, rgba(255,255,255,0.9) 100%)"
                            bgClip="text"
                            fontWeight="bold"
                            textShadow="0 1px 2px rgba(0,0,0,0.1)"
                          >
                            View Details
                          </Text>
                        </Button>
                    </Box>
                  </CardBody>
                </Card>
              </SlideFade>
            ))}
          </Grid>
        )}

        {viewMode === 'list' && (
          <VStack spacing={4} align="stretch">
            {filteredProjects.map((project, index) => (
              <SlideFade in={true} key={project.id} offsetY="20px" delay={index * 0.05}>
                <Card
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="0 4px 20px rgba(0,0,0,0.1)"
                  _hover={{
                    transform: 'translateX(8px)',
                    boxShadow: '0 8px 30px rgba(255, 107, 53, 0.15)',
                  }}
                  transition="all 0.3s ease"
                  cursor="pointer"
                  onClick={() => handleViewProject(project)}
                >
                  <CardBody p={6}>
                    <Flex justify="space-between" align="center">
                      <HStack spacing={6}>
                        <Avatar
                          name={project.name}
                          size="lg"
                          bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                        />
                        <VStack align="start" spacing={2}>
                          <Heading size="md" color={textColor}>
                            {project.name}
                          </Heading>
                          <Text fontSize="sm" color="gray.500">
                            {project.company_name || 'No company'} • Created by {project.created_by_username || 'Unknown'}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap" maxW="100%">
                            <Tag colorScheme={getProjectStatusColor(project.status)} size="sm" maxW="120px">
                              <TagLabel fontSize="xs" isTruncated>{project.status || 'Draft'}</TagLabel>
                            </Tag>
                            <Tag colorScheme={getEntityColor(project.entity)} size="sm" maxW="120px">
                              <TagLabel fontSize="xs" isTruncated>{project.entity || 'Other'}</TagLabel>
                            </Tag>
                          </HStack>
                        </VStack>
                      </HStack>

                      <HStack spacing={6}>
                        <VStack align="center" spacing={1}>
                          <Text fontSize="sm" color="gray.600">Users</Text>
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>
                            {project.number_of_users || 0}
                          </Text>
                        </VStack>
                        <VStack align="center" spacing={1}>
                          <Text fontSize="sm" color="gray.600">Budget</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatCurrency(project.total_cost_france)}
                          </Text>
                        </VStack>
                        <VStack align="center" spacing={1}>
                          <Text fontSize="sm" color="gray.600">Created</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatDate(project.created_at)}
                          </Text>
                        </VStack>
                      </HStack>
                    </Flex>
                  </CardBody>
                </Card>
              </SlideFade>
            ))}
          </VStack>
        )}

        {viewMode === 'table' && (
          <Card 
            bg="white" 
            borderRadius="3xl" 
            boxShadow="0 20px 60px rgba(0,0,0,0.1)"
            border="1px solid rgba(255, 107, 53, 0.1)"
            overflow="hidden"
          >
            <Box 
              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)" 
              p={4}
              borderBottom="1px solid rgba(255, 255, 255, 0.2)"
            >
              <Text color="white" fontWeight="bold" fontSize="lg" textAlign="center">
                📊 Projects Overview
              </Text>
            </Box>
            <TableContainer maxW="100%" overflowY="auto" maxH="70vh" overflowX="hidden">
              <Table variant="unstyled" size="sm" w="100%">
                <Thead>
                  <Tr bg="gray.50">
                    <Th 
                      w="25%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      🏗️ Project
                    </Th>
                    <Th 
                      w="15%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      🏢 Company
                    </Th>
                    <Th 
                      w="12%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      👤 Created By
                    </Th>
                    <Th 
                      w="8%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      📋 Status
                    </Th>
                    <Th 
                      w="12%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      🏛️ Entity
                    </Th>
                    <Th 
                      w="6%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      👥 Users
                    </Th>
                    <Th 
                      w="12%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      💰 Budget
                    </Th>
                    <Th 
                      w="10%" 
                      py={4} 
                      px={2}
                      color="gray.700" 
                      fontWeight="bold" 
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="wide"
                    >
                      ⚡ Actions
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredProjects.map((project, index) => (
                    <Tr 
                      key={project.id} 
                      _hover={{ 
                        bg: 'rgba(255, 107, 53, 0.05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                      }}
                      transition="all 0.3s ease"
                      borderBottom="1px solid rgba(0,0,0,0.05)"
                    >
                      <Td py={4} px={2}>
                        <VStack align="start" spacing={1}>
                          <Text 
                            fontWeight="bold" 
                            color="gray.800" 
                            fontSize="sm" 
                            noOfLines={1}
                            _hover={{ color: '#FF6B35' }}
                            transition="color 0.3s ease"
                          >
                            {project.name}
                          </Text>
                          <Text 
                            fontSize="xs" 
                            color="gray.500" 
                            noOfLines={1}
                            bg="gray.100"
                            px={1}
                            py={0.5}
                            borderRadius="md"
                          >
                            {project.company_name || 'No company'}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={4} px={2}>
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium"
                          color="gray.700"
                          noOfLines={1}
                        >
                          {project.company_name || 'N/A'}
                        </Text>
                      </Td>
                      <Td py={4} px={2}>
                        <HStack spacing={2}>
                          <Avatar
                            name={project.created_by_username}
                            size="sm"
                            bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                            boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                          />
                          <Text 
                            fontSize="sm" 
                            fontWeight="medium"
                            color="gray.700"
                            noOfLines={1}
                          >
                            {project.created_by_username || 'Unknown'}
                          </Text>
                        </HStack>
                      </Td>
                      <Td py={4} px={2}>
                        <Tag 
                          colorScheme={getProjectStatusColor(project.status)} 
                          size="sm"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontWeight="bold"
                          boxShadow="0 4px 15px rgba(0,0,0,0.1)"
                        >
                          <TagLabel fontSize="xs">{project.status || 'Draft'}</TagLabel>
                        </Tag>
                      </Td>
                      <Td py={4} px={2}>
                        <Tag 
                          colorScheme={getEntityColor(project.entity)} 
                          size="sm"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontWeight="bold"
                          boxShadow="0 4px 15px rgba(0,0,0,0.1)"
                        >
                          <TagLabel fontSize="xs">{project.entity || 'Other'}</TagLabel>
                        </Tag>
                      </Td>
                      <Td py={4} px={2}>
                        <Box
                          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          color="white"
                          px={2}
                          py={1}
                          borderRadius="full"
                          textAlign="center"
                          fontWeight="bold"
                          fontSize="sm"
                          boxShadow="0 4px 15px rgba(102, 126, 234, 0.3)"
                        >
                          {project.number_of_users || 0}
                        </Box>
                      </Td>
                      <Td py={4} px={2}>
                        <VStack align="start" spacing={0.5}>
                          <Text 
                            fontWeight="bold" 
                            color="green.600" 
                            fontSize="sm" 
                            noOfLines={1}
                            bg="green.50"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                          >
                            {formatCurrency(project.total_cost_france)}
                          </Text>
                          <Text 
                            fontSize="xs" 
                            color="gray.500" 
                            noOfLines={1}
                            bg="gray.50"
                            px={1}
                            py={0.5}
                            borderRadius="md"
                          >
                            {formatCurrency(project.total_cost_morocco, 'MAD')}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={4} px={2}>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<Icon as={MdVisibility} />}
                            size="sm"
                            bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                            color="white"
                            borderRadius="xl"
                            _hover={{
                              transform: 'scale(1.15) rotate(5deg)',
                              boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
                            }}
                            transition="all 0.3s ease"
                            onClick={() => handleViewProject(project)}
                            aria-label="View project"
                          />
                          <IconButton
                            icon={<Icon as={MdDownload} />}
                            size="sm"
                            bg="linear-gradient(135deg, #20B2AA 0%, #32CD32 100%)"
                            color="white"
                            borderRadius="xl"
                            _hover={{
                              transform: 'scale(1.15) rotate(-5deg)',
                              boxShadow: '0 8px 25px rgba(32, 178, 170, 0.4)',
                            }}
                            transition="all 0.3s ease"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportProject(project);
                            }}
                            aria-label="Export project"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Center py={20}>
            <VStack spacing={6}>
              <Box
                p={8}
                borderRadius="full"
                bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                boxShadow="0 8px 32px rgba(255, 107, 53, 0.3)"
              >
                <Icon as={MdBusiness} w="48px" h="48px" color="white" />
              </Box>
              <VStack spacing={2}>
                <Heading size="lg" color={textColor}>
                  No projects found
                </Heading>
                <Text color="gray.500" textAlign="center" maxW="md">
                  {searchTerm || filterStatus !== 'all' || filterEntity !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'No projects have been created yet'}
                </Text>
              </VStack>
            </VStack>
          </Center>
        )}

        {/* Enterprise Project Details Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="7xl">
          <ModalOverlay 
            bg="rgba(0,0,0,0.8)" 
            backdropFilter="blur(4px)"
          />
          <ModalContent 
            maxW="95vw" 
            maxH="95vh" 
            overflowY="auto"
            borderRadius="lg"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            bg="white"
            border="1px solid"
            borderColor="gray.300"
            position="relative"
          >
            {/* Enterprise Modal Header */}
            <ModalHeader 
              bg="white"
              borderBottom="2px solid"
              borderColor="gray.200"
              p={8}
              position="relative"
            >
              <Flex justify="space-between" align="center" w="full">
                <HStack spacing={8} align="center">
                  {/* Corporate Icon Container */}
                  <Box
                    p={3}
                    borderRadius="md"
                    bg="gray.800"
                    border="1px solid"
                    borderColor="gray.300"
                  >
                    <Icon as={MdBusiness} w="24px" h="24px" color="white" />
                </Box>
                
                  <VStack align="start" spacing={3} flex={1}>
                  {isEditMode ? (
                    <Input
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditFormChange('name', e.target.value)}
                      size="lg"
                      bg="white"
                      borderColor="gray.300"
                      fontWeight="600"
                      fontSize="lg"
                      placeholder="Project name"
                    />
                  ) : (
                  <Heading 
                      size="lg" 
                      color="gray.900"
                      fontWeight="600"
                      letterSpacing="-0.025em"
                      fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {selectedProject?.name}
                  </Heading>
                  )}
                  <HStack spacing={4}>
                    <Text 
                        fontSize="sm" 
                        color="gray.700" 
                        fontWeight="500"
                        bg="gray.50"
                      px={3}
                      py={1}
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.200"
                    >
                        {selectedProject?.company_name || 'No company'}
                    </Text>
                      <Badge 
                      colorScheme={getEntityColor(selectedProject?.entity)} 
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                      >
                        {selectedProject?.entity || 'Other'}
                      </Badge>
                  </HStack>
                </VStack>
                </HStack>
                
                {/* Action Buttons */}
                <HStack spacing={2}>
                  {/* Edit Button */}
                  <IconButton
                    aria-label={isEditMode ? "Cancel Edit" : "Edit Project"}
                    icon={<Icon as={isEditMode ? MdClose : MdEdit} />}
                    size="sm"
                    variant="ghost"
                    color={isEditMode ? "red.400" : "blue.400"}
                    _hover={{
                      bg: isEditMode ? "red.50" : "blue.50",
                      color: isEditMode ? "red.600" : "blue.600"
                    }}
                    transition="all 0.15s ease"
                    borderRadius="md"
                    onClick={isEditMode ? handleCancelEdit : handleEditModeToggle}
                  />
                  
                  {/* Delete Button */}
                  <IconButton
                    aria-label="Delete Project"
                    icon={<Icon as={MdDelete} />}
                    size="sm"
                    variant="ghost"
                    color="red.400"
                    _hover={{
                      bg: "red.50",
                      color: "red.600"
                    }}
                    transition="all 0.15s ease"
                    borderRadius="md"
                    onClick={() => handleDeleteProject(selectedProject)}
                  />
                  
                  {/* Save Button (only visible in edit mode) */}
                  {isEditMode && (
                    <IconButton
                      aria-label="Save Changes"
                      icon={<Icon as={MdSave} />}
                      size="sm"
                      variant="ghost"
                      color="green.400"
                      _hover={{
                        bg: "green.50",
                        color: "green.600"
                      }}
                      transition="all 0.15s ease"
                      borderRadius="md"
                      onClick={handleUpdateProject}
                      isLoading={isUpdating}
                      loadingText="Saving..."
                    />
                  )}
                  
                  {/* Close Button */}
                <IconButton
                  aria-label="Close"
                  icon={<Icon as={MdClose} />}
                  size="sm"
                  variant="ghost"
                  color="gray.400"
                  _hover={{
                    bg: "gray.50",
                    color: "gray.600"
                  }}
                  transition="all 0.15s ease"
                  borderRadius="md"
                  onClick={onClose}
                />
                </HStack>
              </Flex>
            </ModalHeader>
            
            <ModalBody p={8} bg="white">
              {selectedProject && (
                <Tabs variant="line" colorScheme="gray">
                  <TabList 
                    borderBottom="2px solid"
                    borderColor="gray.200"
                    mb={8}
                  >
                    <Tab 
                      _selected={{ 
                        color: "gray.900",
                        borderBottom: "3px solid",
                        borderColor: "gray.800",
                        fontWeight: "600"
                      }}
                      _hover={{
                        color: "gray.700"
                      }}
                      fontWeight="500"
                      fontSize="sm"
                      px={6}
                      py={4}
                      transition="all 0.15s ease"
                      textTransform="none"
                      letterSpacing="0.025em"
                    >
                      Project Overview
                    </Tab>
                    <Tab 
                      _selected={{ 
                        color: "gray.900",
                        borderBottom: "3px solid",
                        borderColor: "gray.800",
                        fontWeight: "600"
                      }}
                      _hover={{
                        color: "gray.700"
                      }}
                      fontWeight="500"
                      fontSize="sm"
                      px={6}
                      py={4}
                      transition="all 0.15s ease"
                      textTransform="none"
                      letterSpacing="0.025em"
                    >
                      Financial Details
                    </Tab>
                    <Tab 
                      _selected={{ 
                        color: "gray.900",
                        borderBottom: "3px solid",
                        borderColor: "gray.800",
                        fontWeight: "600"
                      }}
                      _hover={{
                        color: "gray.700"
                      }}
                      fontWeight="500"
                      fontSize="sm"
                      px={6}
                      py={4}
                      transition="all 0.15s ease"
                      textTransform="none"
                      letterSpacing="0.025em"
                    >
                      Infrastructure
                    </Tab>
                    <Tab 
                      _selected={{ 
                        color: "gray.900",
                        borderBottom: "3px solid",
                        borderColor: "gray.800",
                        fontWeight: "600"
                      }}
                      _hover={{
                        color: "gray.700"
                      }}
                      fontWeight="500"
                      fontSize="sm"
                      px={6}
                      py={4}
                      transition="all 0.15s ease"
                      textTransform="none"
                      letterSpacing="0.025em"
                    >
                      Project Timeline
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel p={0}>
                      <VStack spacing={8} align="stretch">
                        {/* Corporate Project Overview */}
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="full">
                          {/* Project Status Card */}
                          <Card
                            bg="white"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            overflow="hidden"
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box
                                    p={2}
                                    borderRadius="md"
                                    bg="gray.100"
                                    border="1px solid"
                                    borderColor="gray.200"
                                  >
                                    <Icon as={MdBusiness} w="20px" h="20px" color="gray.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                                      Project Status
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                      Current Phase
                                    </Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="lg" fontWeight="600" color="gray.900">
                                    {selectedProject?.status || 'Draft'}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {selectedProject?.description || 'No description available'}
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Team Size Card */}
                          <Card
                            bg="white"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            overflow="hidden"
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box
                                    p={2}
                                    borderRadius="md"
                                    bg="gray.100"
                                    border="1px solid"
                                    borderColor="gray.200"
                                  >
                                    <Icon as={MdPeople} w="20px" h="20px" color="gray.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                                      Team Size
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                      Active Users
                                    </Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="gray.900">
                                    {selectedProject?.number_of_users || 0}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Users assigned to this project
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Project Timeline Card */}
                          <Card
                            bg="white"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            overflow="hidden"
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box
                                    p={2}
                                    borderRadius="md"
                                    bg="gray.100"
                                    border="1px solid"
                                    borderColor="gray.200"
                                  >
                                    <Icon as={MdDateRange} w="20px" h="20px" color="gray.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                                      Project Timeline
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                      Duration
                                    </Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="sm" fontWeight="600" color="gray.900">
                                    {formatDate(selectedProject?.start_date)} - {formatDate(selectedProject?.end_date)}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Created: {formatDate(selectedProject?.created_at)}
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>

                        {/* 🏢 Enhanced Project Information Form */}
                        <Card
                          bg="rgba(255, 255, 255, 0.95)"
                          backdropFilter="blur(30px)"
                          borderRadius="3xl"
                          border="2px solid rgba(255, 255, 255, 0.3)"
                          boxShadow="0 20px 60px rgba(0,0,0,0.15)"
                            overflow="hidden"
                            position="relative"
                          w="full"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              right="0"
                              h="4px"
                              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                            />
                            <CardHeader pb={4}>
                              <HStack spacing={3}>
                                <Box
                                  p={2}
                                  borderRadius="xl"
                                  bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                                  boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                                >
                                  <Icon as={MdInfo} w="20px" h="20px" color="white" />
                                </Box>
                                <Heading size="md" color={textColor} fontWeight="bold">
                                {isEditMode ? 'Edit Project Information' : 'Project Information'}
                                </Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                            {isEditMode ? (
                              // Enhanced Edit Form
                              <VStack spacing={6} align="stretch">
                                {/* Basic Information Section */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                    Basic Information
                                  </Text>
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Project Name
                                      </Text>
                                      <Input
                                        value={editFormData.name || ''}
                                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                                        placeholder="Enter project name"
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Company Name
                                      </Text>
                                      <Input
                                        value={editFormData.company_name || ''}
                                        onChange={(e) => handleEditFormChange('company_name', e.target.value)}
                                        placeholder="Enter company name"
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                  </SimpleGrid>
                                </Box>

                                {/* Project Details Section */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                    Project Details
                                  </Text>
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    {(user?.role === 'admin' || user?.role === 'super_admin' || user?.is_staff) ? (
                                      <>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            Status
                                          </Text>
                                          <Select
                                            value={editFormData.status || 'draft'}
                                            onChange={(e) => handleEditFormChange('status', e.target.value)}
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          >
                                            <option value="draft">Draft</option>
                                            <option value="submitted">Submitted</option>
                                            <option value="approved">Approved</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                          </Select>
                                        </Box>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            Priority
                                          </Text>
                                          <Select
                                            value={editFormData.priority || 'medium'}
                                            onChange={(e) => handleEditFormChange('priority', e.target.value)}
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                          </Select>
                                        </Box>
                                      </>
                                    ) : (
                                      <>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            Status
                                          </Text>
                                          <Text fontSize="sm" color="gray.600" p={2} bg="gray.50" borderRadius="md">
                                            {editFormData.status || 'draft'}
                                          </Text>
                                        </Box>
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            Priority
                                          </Text>
                                          <Text fontSize="sm" color="gray.600" p={2} bg="gray.50" borderRadius="md">
                                            {editFormData.priority || 'medium'}
                                          </Text>
                                        </Box>
                                      </>
                                    )}
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Progress (%)
                                      </Text>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editFormData.progress || calculateProgressFromStatus(editFormData.status)}
                                        onChange={(e) => handleEditFormChange('progress', parseInt(e.target.value) || 0)}
                                        size="md"
                                        bg="gray.50"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                        readOnly
                                        color="gray.600"
                                        placeholder="Auto-calculated from status"
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Entity
                                      </Text>
                                      <Select
                                        value={editFormData.entity || 'OTHER'}
                                        onChange={(e) => handleEditFormChange('entity', e.target.value)}
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
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
                                  </SimpleGrid>
                                </Box>

                                {/* Technical Specifications Section */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                    Technical Specifications
                                  </Text>
                                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Number of Users
                                      </Text>
                                      <Input
                                        type="number"
                                        value={editFormData.number_of_users || 0}
                                        onChange={(e) => handleEditFormChange('number_of_users', parseInt(e.target.value) || 0)}
                                        placeholder="0"
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        PC Type
                                      </Text>
                                      <Select
                                        value={editFormData.pc_type || 'BOTH'}
                                        onChange={(e) => handleEditFormChange('pc_type', e.target.value)}
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      >
                                        <option value="LAPTOP_ONLY">Laptop uniquement</option>
                                        <option value="DESKTOP_ONLY">Desktop uniquement</option>
                                        <option value="BOTH">Les deux</option>
                                      </Select>
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Internet Type
                                      </Text>
                                      <Select
                                        value={editFormData.internet_line_type || 'FO'}
                                        onChange={(e) => handleEditFormChange('internet_line_type', e.target.value)}
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      >
                                        <option value="FO">FO</option>
                                        <option value="VSAT">VSAT</option>
                                        <option value="STARLINK">STARLINK</option>
                                        <option value="OTHER">OTHER</option>
                                      </Select>
                                    </Box>
                                  </SimpleGrid>
                                </Box>

                                {/* Device Quantities Section - Conditional based on PC Type */}
                                {(editFormData.pc_type === 'LAPTOP_ONLY' || editFormData.pc_type === 'BOTH' || editFormData.pc_type === 'DESKTOP_ONLY') && (
                                  <Box>
                                    <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                      Device Quantities
                                    </Text>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                      {/* Laptop Office - Show if LAPTOP_ONLY or BOTH */}
                                      {(editFormData.pc_type === 'LAPTOP_ONLY' || editFormData.pc_type === 'BOTH') && (
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            💻 Laptop Office
                                          </Text>
                                          <Input
                                            type="number"
                                            value={editFormData.num_laptop_office || 0}
                                            onChange={(e) => handleEditFormChange('num_laptop_office', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          />
                                        </Box>
                                      )}
                                      
                                      {/* Laptop Technical - Show if LAPTOP_ONLY or BOTH */}
                                      {(editFormData.pc_type === 'LAPTOP_ONLY' || editFormData.pc_type === 'BOTH') && (
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            💻 Laptop Technical
                                          </Text>
                                          <Input
                                            type="number"
                                            value={editFormData.num_laptop_tech || 0}
                                            onChange={(e) => handleEditFormChange('num_laptop_tech', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          />
                                        </Box>
                                      )}
                                      
                                      {/* Desktop Office - Show if DESKTOP_ONLY or BOTH */}
                                      {(editFormData.pc_type === 'DESKTOP_ONLY' || editFormData.pc_type === 'BOTH') && (
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            🖥️ Desktop Office
                                          </Text>
                                          <Input
                                            type="number"
                                            value={editFormData.num_desktop_office || 0}
                                            onChange={(e) => handleEditFormChange('num_desktop_office', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          />
                                        </Box>
                                      )}
                                      
                                      {/* Desktop Technical - Show if DESKTOP_ONLY or BOTH */}
                                      {(editFormData.pc_type === 'DESKTOP_ONLY' || editFormData.pc_type === 'BOTH') && (
                                        <Box>
                                          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                            🖥️ Desktop Technical
                                          </Text>
                                          <Input
                                            type="number"
                                            value={editFormData.num_desktop_tech || 0}
                                            onChange={(e) => handleEditFormChange('num_desktop_tech', parseInt(e.target.value) || 0)}
                                            placeholder="0"
                                            size="md"
                                            bg="white"
                                            borderColor="gray.300"
                                            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                          />
                                        </Box>
                                      )}
                                    </SimpleGrid>
                                  </Box>
                                )}

                                {/* Project Timeline Section */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                    Project Timeline
                                  </Text>
                                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Start Date
                                      </Text>
                                      <Input
                                        type="date"
                                        value={editFormData.start_date || ''}
                                        onChange={(e) => handleEditFormChange('start_date', e.target.value)}
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        End Date
                                      </Text>
                                      <Input
                                        type="date"
                                        value={editFormData.end_date || ''}
                                        onChange={(e) => handleEditFormChange('end_date', e.target.value)}
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                  </SimpleGrid>
                                </Box>

                                {/* Additional Information Section */}
                                <Box>
                                  <Text fontSize="sm" fontWeight="600" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="0.05em">
                                    Additional Information
                                  </Text>
                                  <VStack spacing={4} align="stretch">
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        Site Addresses
                                      </Text>
                                      <Textarea
                                        value={editFormData.site_addresses || ''}
                                        onChange={(e) => handleEditFormChange('site_addresses', e.target.value)}
                                        placeholder="Enter site addresses"
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                        rows={3}
                                        resize="vertical"
                                      />
                                    </Box>
                                    <Box>
                                      <Text fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
                                        GPS Coordinates
                                      </Text>
                                      <Input
                                        value={editFormData.gps_coordinates || ''}
                                        onChange={(e) => handleEditFormChange('gps_coordinates', e.target.value)}
                                        placeholder="Enter GPS coordinates"
                                        size="md"
                                        bg="white"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                                      />
                                    </Box>
                                  </VStack>
                                </Box>
                              </VStack>
                            ) : (
                              // View Mode - Original Design
                              <VStack align="stretch" spacing={4}>
                                <HStack justify="space-between" p={3} bg="rgba(255, 107, 53, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdCheckCircle} color="green.500" />
                                    <Text fontWeight="semibold">Status:</Text>
                                  </HStack>
                                  <Tag 
                                    colorScheme={getProjectStatusColor(selectedProject.status)}
                                    size="lg"
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                    fontWeight="bold"
                                  >
                                    <TagLabel>{selectedProject.status || 'Draft'}</TagLabel>
                                  </Tag>
                                </HStack>
                                
                                <HStack justify="space-between" p={3} bg="rgba(32, 178, 170, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdBusiness} color="blue.500" />
                                    <Text fontWeight="semibold">Entity:</Text>
                                  </HStack>
                                  <Tag 
                                    colorScheme={getEntityColor(selectedProject.entity)}
                                    size="lg"
                                    borderRadius="full"
                                    px={4}
                                    py={2}
                                    fontWeight="bold"
                                  >
                                    <TagLabel>{selectedProject.entity || 'Other'}</TagLabel>
                                  </Tag>
                                </HStack>
                                
                                <HStack justify="space-between" p={3} bg="rgba(255, 107, 53, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdPeople} color="purple.500" />
                                    <Text fontWeight="semibold">Users:</Text>
                                  </HStack>
                                  <Text fontSize="lg" fontWeight="bold" color="purple.600">
                                    {selectedProject.number_of_users || 0}
                                  </Text>
                                </HStack>
                                
                                <HStack justify="space-between" p={3} bg="rgba(32, 178, 170, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdComputer} color="orange.500" />
                                    <Text fontWeight="semibold">PC Type:</Text>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="medium" color="orange.600">
                                    {selectedProject.pc_type || 'N/A'}
                                  </Text>
                                </HStack>
                                
                                <HStack justify="space-between" p={3} bg="rgba(255, 107, 53, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdWifi} color="cyan.500" />
                                    <Text fontWeight="semibold">Internet:</Text>
                                  </HStack>
                                  <Text fontSize="md" fontWeight="medium" color="cyan.600">
                                    {selectedProject.internet_line_type || 'N/A'}
                                  </Text>
                                </HStack>
                              </VStack>
                            )}
                            </CardBody>
                          </Card>

                          {/* Ultra-Creative Budget Summary Card */}
                          <Card
                            bg="rgba(255, 255, 255, 0.9)"
                            backdropFilter="blur(20px)"
                            borderRadius="2xl"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                            overflow="hidden"
                            position="relative"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              right="0"
                              h="4px"
                              bgGradient="linear(to-r, #20B2AA 0%, #FF6B35 100%)"
                            />
                            <CardHeader pb={4}>
                              <HStack spacing={3}>
                                <Box
                                  p={2}
                                  borderRadius="xl"
                                  bgGradient="linear(to-br, #20B2AA 0%, #FF6B35 100%)"
                                  boxShadow="0 4px 15px rgba(32, 178, 170, 0.3)"
                                >
                                  <Icon as={MdAttachMoney} w="20px" h="20px" color="white" />
                                </Box>
                                <Heading size="md" color={textColor} fontWeight="bold">
                                  Budget Summary
                                </Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              <VStack align="stretch" spacing={4}>
                                <Box
                                  p={4}
                                  bg="linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)"
                                  borderRadius="xl"
                                  border="1px solid rgba(34, 197, 94, 0.2)"
                                >
                                  <HStack justify="space-between" align="center">
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                        🇫🇷 France Budget
                                      </Text>
                                      <Text fontSize="2xl" fontWeight="black" color="green.600">
                                        {formatCurrency(selectedProject.total_cost_france)}
                                      </Text>
                                    </VStack>
                                    <Box
                                      p={3}
                                      borderRadius="full"
                                      bg="rgba(34, 197, 94, 0.1)"
                                      border="2px solid rgba(34, 197, 94, 0.3)"
                                    >
                                      <Icon as={MdAttachMoney} w="24px" h="24px" color="green.600" />
                                    </Box>
                                  </HStack>
                                </Box>
                                
                                <Box
                                  p={4}
                                  bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)"
                                  borderRadius="xl"
                                  border="1px solid rgba(59, 130, 246, 0.2)"
                                >
                                  <HStack justify="space-between" align="center">
                                    <VStack align="start" spacing={1}>
                                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                        🇲🇦 Morocco Budget
                                      </Text>
                                      <Text fontSize="2xl" fontWeight="black" color="blue.600">
                                        {formatCurrency(selectedProject.total_cost_morocco, 'MAD')}
                                      </Text>
                                    </VStack>
                                    <Box
                                      p={3}
                                      borderRadius="full"
                                      bg="rgba(59, 130, 246, 0.1)"
                                      border="2px solid rgba(59, 130, 246, 0.3)"
                                    >
                                      <Icon as={MdAttachMoney} w="24px" h="24px" color="blue.600" />
                                    </Box>
                                  </HStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>
                        </VStack>

                        <VStack align="stretch" spacing={6}>
                          {/* Ultra-Creative Created By Card */}
                          <Card
                            bg="rgba(255, 255, 255, 0.9)"
                            backdropFilter="blur(20px)"
                            borderRadius="2xl"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                            overflow="hidden"
                            position="relative"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              right="0"
                              h="4px"
                              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                            />
                            <CardHeader pb={4}>
                              <HStack spacing={3}>
                                <Box
                                  p={2}
                                  borderRadius="xl"
                                  bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                                  boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                                >
                                  <Icon as={MdPerson} w="20px" h="20px" color="white" />
                                </Box>
                                <Heading size="md" color={textColor} fontWeight="bold">
                                  Project Creator
                                </Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              <HStack spacing={4} p={4} bg="rgba(255, 107, 53, 0.05)" borderRadius="xl">
                                <Avatar
                                  name={selectedProject.created_by_username}
                                  size="xl"
                                  bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                                  boxShadow="0 8px 25px rgba(255, 107, 53, 0.3)"
                                  border="3px solid white"
                                />
                                <VStack align="start" spacing={2} flex={1}>
                                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                                    {selectedProject.created_by_username || 'Unknown'}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    📧 {selectedProject.created_by?.email || 'No email'}
                                  </Text>
                                  <HStack spacing={2}>
                                    <Tag colorScheme="blue" size="sm" borderRadius="full">
                                      <TagLabel>{selectedProject.created_by?.role || 'User'}</TagLabel>
                                    </Tag>
                                    {selectedProject.created_by?.is_admin && (
                                      <Tag colorScheme="green" size="sm" borderRadius="full">
                                        <TagLabel>Admin</TagLabel>
                                      </Tag>
                                    )}
                                  </HStack>
                                  <Text fontSize="xs" color="gray.400">
                                    🕒 Created: {formatDate(selectedProject.created_at)}
                                  </Text>
                                </VStack>
                              </HStack>
                            </CardBody>
                          </Card>

                          {/* Ultra-Creative Timeline Card */}
                          <Card
                            bg="rgba(255, 255, 255, 0.9)"
                            backdropFilter="blur(20px)"
                            borderRadius="2xl"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                            overflow="hidden"
                            position="relative"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              right="0"
                              h="4px"
                              bgGradient="linear(to-r, #20B2AA 0%, #FF6B35 100%)"
                            />
                            <CardHeader pb={4}>
                              <HStack spacing={3}>
                                <Box
                                  p={2}
                                  borderRadius="xl"
                                  bgGradient="linear(to-br, #20B2AA 0%, #FF6B35 100%)"
                                  boxShadow="0 4px 15px rgba(32, 178, 170, 0.3)"
                                >
                                  <Icon as={MdTimeline} w="20px" h="20px" color="white" />
                                </Box>
                                <Heading size="md" color={textColor} fontWeight="bold">
                                  Project Timeline
                                </Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              <VStack align="stretch" spacing={4}>
                                <Box p={3} bg="rgba(34, 197, 94, 0.05)" borderRadius="lg" border="1px solid rgba(34, 197, 94, 0.2)">
                                  <HStack justify="space-between">
                                    <HStack spacing={2}>
                                      <Icon as={MdDateRange} color="green.500" />
                                      <Text fontWeight="semibold">Start Date:</Text>
                                    </HStack>
                                    <Text fontWeight="bold" color="green.600">
                                      {formatDate(selectedProject.start_date)}
                                    </Text>
                                  </HStack>
                                </Box>
                                
                                <Box p={3} bg="rgba(239, 68, 68, 0.05)" borderRadius="lg" border="1px solid rgba(239, 68, 68, 0.2)">
                                  <HStack justify="space-between">
                                    <HStack spacing={2}>
                                      <Icon as={MdDateRange} color="red.500" />
                                      <Text fontWeight="semibold">End Date:</Text>
                                    </HStack>
                                    <Text fontWeight="bold" color="red.600">
                                      {formatDate(selectedProject.end_date)}
                                    </Text>
                                  </HStack>
                                </Box>
                                
                                <Box p={3} bg="rgba(59, 130, 246, 0.05)" borderRadius="lg" border="1px solid rgba(59, 130, 246, 0.2)">
                                  {console.log('=== RENDERING LAST UPDATED ===')}
                                  {console.log('selectedProject.updated_at:', selectedProject.updated_at)}
                                  {console.log('formatDate result:', formatDate(selectedProject.updated_at))}
                                  <HStack justify="space-between">
                                    <HStack spacing={2}>
                                      <Icon as={MdUpdate} color="blue.500" />
                                      <Text fontWeight="semibold">Last Updated:</Text>
                                    </HStack>
                                    <Text fontWeight="bold" color="blue.600">
                                      {formatDate(selectedProject.updated_at)}
                                    </Text>
                                  </HStack>
                                </Box>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Ultra-Creative Site Information Card */}
                          <Card
                            bg="rgba(255, 255, 255, 0.9)"
                            backdropFilter="blur(20px)"
                            borderRadius="2xl"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            boxShadow="0 8px 32px rgba(0,0,0,0.1)"
                            overflow="hidden"
                            position="relative"
                          >
                            <Box
                              position="absolute"
                              top="0"
                              left="0"
                              right="0"
                              h="4px"
                              bgGradient="linear(to-r, #FF6B35 0%, #20B2AA 100%)"
                            />
                            <CardHeader pb={4}>
                              <HStack spacing={3}>
                                <Box
                                  p={2}
                                  borderRadius="xl"
                                  bgGradient="linear(to-br, #FF6B35 0%, #20B2AA 100%)"
                                  boxShadow="0 4px 15px rgba(255, 107, 53, 0.3)"
                                >
                                  <Icon as={MdLocationOn} w="20px" h="20px" color="white" />
                                </Box>
                                <Heading size="md" color={textColor} fontWeight="bold">
                                  Site Information
                                </Heading>
                              </HStack>
                            </CardHeader>
                            <CardBody pt={0}>
                              <VStack align="stretch" spacing={4}>
                                <Box p={3} bg="rgba(255, 107, 53, 0.05)" borderRadius="lg">
                                  <Text fontWeight="semibold" mb={2} color="gray.700">
                                    📍 Site Addresses:
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                                    {selectedProject.site_addresses || 'No addresses provided'}
                                  </Text>
                                </Box>
                                
                                <Box p={3} bg="rgba(32, 178, 170, 0.05)" borderRadius="lg">
                                  <Text fontWeight="semibold" mb={2} color="gray.700">
                                    🗺️ GPS Coordinates:
                                  </Text>
                                  <Text fontSize="sm" color="gray.600" fontFamily="mono">
                                    {selectedProject.gps_coordinates || 'No coordinates provided'}
                                  </Text>
                                </Box>
                                
                                <HStack justify="space-between" p={3} bg="rgba(255, 107, 53, 0.05)" borderRadius="lg">
                                  <HStack spacing={2}>
                                    <Icon as={MdBusiness} color="orange.500" />
                                    <Text fontWeight="semibold">Sites Count:</Text>
                                  </HStack>
                                  <Text fontSize="lg" fontWeight="bold" color="orange.600">
                                    {selectedProject.number_of_sites || 1}
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                      </VStack>
                    </TabPanel>

                    <TabPanel p={0}>
                      <VStack spacing={8} align="stretch">
                        {/* Financial Overview Cards */}
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                          {/* Total Cost France Card */}
                          <Card
                            bg="white"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            overflow="hidden"
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box
                                    p={2}
                                    borderRadius="md"
                                    bg="blue.100"
                                    border="1px solid"
                                    borderColor="blue.200"
                                  >
                                    <Icon as={MdAttachMoney} w="20px" h="20px" color="blue.600" />
                          </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                                      Total Cost (France)
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                      EUR
                            </Text>
                          </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="blue.600">
                                    {formatCurrency(selectedProject?.total_cost_france || 0, 'EUR')}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Equipment & Services
                                  </Text>
                        </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Total Cost Morocco Card */}
                          <Card
                            bg="white"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.200"
                            boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                            overflow="hidden"
                          >
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box
                                    p={2}
                                    borderRadius="md"
                                    bg="green.100"
                                    border="1px solid"
                                    borderColor="green.200"
                                  >
                                    <Icon as={MdAttachMoney} w="20px" h="20px" color="green.600" />
                          </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">
                                      Total Cost (Morocco)
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">
                                      MAD
                            </Text>
                          </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="green.600">
                                    {formatCurrency(selectedProject?.total_cost_morocco || 0, 'MAD')}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Local Equipment & Services
                                  </Text>
                        </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>

                        {/* Cost Breakdown Table */}
                        <Card
                          bg="white"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)"
                        >
                          <CardHeader pb={4}>
                            <HStack spacing={3} align="center">
                              <Box
                                p={2}
                                borderRadius="md"
                                bg="gray.100"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Icon as={MdTrendingUp} w="20px" h="20px" color="gray.600" />
                              </Box>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="lg" fontWeight="600" color="gray.900">
                                  Cost Breakdown
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  Detailed cost analysis by category
                                </Text>
                              </VStack>
                            </HStack>
                          </CardHeader>
                          <CardBody pt={0}>
                            <TableContainer>
                              <Table variant="simple" size="sm">
                                <Thead>
                                  <Tr>
                                    <Th>Category</Th>
                                    <Th isNumeric>France (EUR)</Th>
                                    <Th isNumeric>Morocco (MAD)</Th>
                                    <Th isNumeric>Total Items</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {loadingFinancialDetails ? (
                                    <Tr>
                                      <Td colSpan={4} textAlign="center" py={8}>
                                        <Spinner size="md" color="blue.500" />
                                        <Text mt={2} color="gray.500">Loading financial details...</Text>
                                      </Td>
                                    </Tr>
                                  ) : (
                                    <>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdComputer} w="16px" h="16px" color="blue.500" />
                                            <Text>User Devices</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.user_devices?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.user_devices?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.user_devices?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdRouter} w="16px" h="16px" color="green.500" />
                                            <Text>Network Equipment</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.network_equipment?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.network_equipment?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.network_equipment?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdStorage} w="16px" h="16px" color="purple.500" />
                                            <Text>Server Equipment</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.server_equipment?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.server_equipment?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.server_equipment?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdCloud} w="16px" h="16px" color="orange.500" />
                                            <Text>Software Licenses</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.software_licenses?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.software_licenses?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.software_licenses?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdSettings} w="16px" h="16px" color="red.500" />
                                            <Text>Services</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.services?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.services?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.services?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdBuild} w="16px" h="16px" color="teal.500" />
                                            <Text>Infrastructure Equipment</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.infrastructure?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.infrastructure?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.infrastructure?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdBusiness} w="16px" h="16px" color="cyan.500" />
                                            <Text>BYCN IT Costs</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.bycn_it_costs?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.bycn_it_costs?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.bycn_it_costs?.items || 0}</Td>
                                      </Tr>
                                      <Tr>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Icon as={MdVideoCall} w="16px" h="16px" color="pink.500" />
                                            <Text>Visio Conference</Text>
                                          </HStack>
                                        </Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.visio_conference?.france || 0, 'EUR')}</Td>
                                        <Td isNumeric>{formatCurrency(financialDetails?.breakdown?.visio_conference?.morocco || 0, 'MAD')}</Td>
                                        <Td isNumeric>{financialDetails?.breakdown?.visio_conference?.items || 0}</Td>
                                      </Tr>
                                    </>
                                  )}
                                </Tbody>
                              </Table>
                            </TableContainer>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>

                    <TabPanel p={0}>
                      <VStack spacing={8} align="stretch">
                        {/* Equipment Overview Cards */}
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} w="full">
                          {/* User Devices Card */}
                          <Card bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box p={2} borderRadius="md" bg="blue.100" border="1px solid" borderColor="blue.200">
                                    <Icon as={MdComputer} w="20px" h="20px" color="blue.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">User Devices</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Total Count</Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="blue.600">{selectedProject?.number_of_user_devices || 0}</Text>
                                  <Text fontSize="sm" color="gray.600">Laptops & Desktops</Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Network Equipment Card */}
                          <Card bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box p={2} borderRadius="md" bg="green.100" border="1px solid" borderColor="green.200">
                                    <Icon as={MdRouter} w="20px" h="20px" color="green.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">Network Equipment</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Access Points</Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="green.600">{selectedProject?.num_aps || 0}</Text>
                                  <Text fontSize="sm" color="gray.600">Wireless Access Points</Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Printers Card */}
                          <Card bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box p={2} borderRadius="md" bg="purple.100" border="1px solid" borderColor="purple.200">
                                    <Icon as={MdPrint} w="20px" h="20px" color="purple.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">Printers</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Total Units</Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="2xl" fontWeight="700" color="purple.600">{selectedProject?.num_printers || 0}</Text>
                                  <Text fontSize="sm" color="gray.600">Printing Devices</Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </VStack>
                    </TabPanel>

                    <TabPanel p={0}>
                      <VStack spacing={8} align="stretch">
                        {/* Timeline Overview Cards */}
                        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} w="full">
                          {/* Project Duration Card */}
                          <Card bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box p={2} borderRadius="md" bg="blue.100" border="1px solid" borderColor="blue.200">
                                    <Icon as={MdDateRange} w="20px" h="20px" color="blue.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">Project Duration</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Timeline</Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Text fontSize="lg" fontWeight="700" color="blue.600">
                                    {selectedProject?.start_date && selectedProject?.end_date 
                                      ? `${formatDate(selectedProject.start_date)} - ${formatDate(selectedProject.end_date)}`
                                      : 'Not specified'
                                    }
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    {selectedProject?.start_date && selectedProject?.end_date 
                                      ? `${Math.ceil((new Date(selectedProject.end_date) - new Date(selectedProject.start_date)) / (1000 * 60 * 60 * 24))} days`
                                      : 'Duration not calculated'
                                    }
                                  </Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Project Status Card */}
                          <Card bg="white" borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="0 1px 3px rgba(0, 0, 0, 0.1)">
                            <CardBody p={6}>
                              <VStack spacing={4} align="start">
                                <HStack spacing={3} align="center">
                                  <Box p={2} borderRadius="md" bg="green.100" border="1px solid" borderColor="green.200">
                                    <Icon as={MdTrendingUp} w="20px" h="20px" color="green.600" />
                                  </Box>
                                  <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="600" color="gray.900">Current Status</Text>
                                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" letterSpacing="0.05em">Phase</Text>
                                  </VStack>
                                </HStack>
                                <VStack align="start" spacing={2} w="full">
                                  <Badge 
                                    colorScheme={getProjectStatusColor(selectedProject?.status)} 
                                    fontSize="sm" 
                                    px={3} 
                                    py={1} 
                                    borderRadius="full"
                                  >
                                    {selectedProject?.status || 'Draft'}
                                  </Badge>
                                  <Text fontSize="sm" color="gray.600">Project Phase</Text>
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        </Grid>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Beautiful Delete Confirmation Modal */}
        <Modal isOpen={isDeleteModalOpen} onClose={cancelDeleteProject} isCentered>
          <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
          <ModalContent 
            mx={4}
            borderRadius="2xl"
            boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            border="1px solid"
            borderColor="red.200"
          >
            <ModalHeader 
              bg="linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
              color="white"
              borderRadius="2xl 2xl 0 0"
              textAlign="center"
              py={6}
            >
              <VStack spacing={3}>
                <Box
                  p={4}
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.2)"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={MdDelete} w="32px" h="32px" color="white" />
                </Box>
                <Text fontSize="xl" fontWeight="bold">
                  Delete Project
                </Text>
              </VStack>
            </ModalHeader>
            
            <ModalBody py={8} textAlign="center">
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.700" fontWeight="500">
                  Are you sure you want to delete this project?
                </Text>
                <Box
                  p={4}
                  bg="red.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="red.200"
                  w="full"
                >
                  <Text fontSize="md" fontWeight="bold" color="red.700">
                    "{projectToDelete?.name}"
                  </Text>
                </Box>
                <Text fontSize="sm" color="red.600" fontWeight="500">
                  ⚠️ This action cannot be undone
                </Text>
              </VStack>
            </ModalBody>

            <ModalFooter 
              justifyContent="center" 
              pb={8}
              gap={4}
            >
              <Button
                onClick={cancelDeleteProject}
                variant="outline"
                colorScheme="gray"
                size="lg"
                px={8}
                borderRadius="xl"
                _hover={{
                  bg: "gray.50",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)"
                }}
                transition="all 0.3s ease"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteProject}
                colorScheme="red"
                size="lg"
                px={8}
                borderRadius="xl"
                bg="linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)"
                _hover={{
                  bg: "linear-gradient(135deg, #ff5252 0%, #e53935 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(255, 107, 107, 0.4)"
                }}
                transition="all 0.3s ease"
                leftIcon={<Icon as={MdDelete} />}
              >
                Delete Project
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
      
      {/* Global CSS */}
      <style>{`
        body {
          overflow-x: hidden;
        }
        * {
          box-sizing: border-box;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        .creative-button {
          position: relative;
          overflow: hidden;
        }
        .creative-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s ease;
        }
        .creative-button:hover::before {
          left: 100%;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .gradient-text {
          background: linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Add Project Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="6xl">
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
                onClick={onAddClose}
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
                        <option value="200MBps">200MBps</option>
                        <option value="500MBps">500MBps</option>
                        <option value="1GBps">1GBps</option>
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
                        📐 Number of Traceur A0
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
                      onAddClose();
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
    </Box>
  );
};

export default AdminProjectsDashboard;
