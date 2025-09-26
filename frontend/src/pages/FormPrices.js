import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const FormPrices = () => {
  const { user, authToken } = useAuth();
  const toast = useToast();
  
  // All price fields from the form
  const [prices, setPrices] = useState({
    // PC Equipment
    laptop_bureautique_price: 0,
    laptop_technique_price: 0,
    desktop_bureautique_price: 0,
    desktop_technique_price: 0,
    
    // Other Equipment
    printer_price: 0,
    workstation_price: 0,
    video_conference_price: 0,
    access_point_price: 0,
    
    // FO (Fiber Optic) Internet Prices
    fo_100mbps_price: 0,
    fo_200mbps_price: 0,
    fo_500mbps_price: 0,
    fo_1gbps_price: 0,
    
    // VSAT Internet Prices
    vsat_100mbps_price: 0,
    vsat_200mbps_price: 0,
    vsat_500mbps_price: 0,
    vsat_1gbps_price: 0,
    
    // STARLINK Internet Prices
    starlink_100mbps_price: 0,
    starlink_200mbps_price: 0,
    starlink_500mbps_price: 0,
    starlink_1gbps_price: 0,
    
    // AUTRE (Other) Internet Prices
    autre_100mbps_price: 0,
    autre_200mbps_price: 0,
    autre_500mbps_price: 0,
    autre_1gbps_price: 0,
    
    // Software & Services
    local_apps_price: 0,
    file_server_price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}form-prices/active/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setPrices(response.data);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      toast({
        title: "Error",
        description: "Failed to load form prices",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (field, value) => {
    const newPrices = {
      ...prices,
      [field]: parseFloat(value) || 0
    };
    setPrices(newPrices);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await axios.post(`${API_URL}form-prices/save/`, prices, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      toast({
        title: "Prices saved successfully!",
        description: "All equipment prices have been updated",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error('Failed to save prices:', error);
      toast({
        title: "Error",
        description: "Failed to save form prices",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPrices({
      laptop_bureautique_price: 0,
      laptop_technique_price: 0,
      desktop_bureautique_price: 0,
      desktop_technique_price: 0,
      printer_price: 0,
      workstation_price: 0,
      video_conference_price: 0,
      access_point_price: 0,
      fo_100mbps_price: 0,
      fo_200mbps_price: 0,
      fo_500mbps_price: 0,
      fo_1gbps_price: 0,
      vsat_100mbps_price: 0,
      vsat_200mbps_price: 0,
      vsat_500mbps_price: 0,
      vsat_1gbps_price: 0,
      starlink_100mbps_price: 0,
      starlink_200mbps_price: 0,
      starlink_500mbps_price: 0,
      starlink_1gbps_price: 0,
      autre_100mbps_price: 0,
      autre_200mbps_price: 0,
      autre_500mbps_price: 0,
      autre_1gbps_price: 0,
      local_apps_price: 0,
      file_server_price: 0,
    });
  };

  if (!user || !user.is_admin) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <Container maxW="container.xl">
        {/* Header */}
        <VStack align="start" spacing={4} mb={8}>
          <HStack spacing={4} align="center">
            <Heading size="xl" color="secondaryGray.900">
              💰 Form Prices Management
            </Heading>
            <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
              Admin Only
            </Badge>
          </HStack>
          <Text color="secondaryGray.600" fontSize="lg">
            Set the prices for each equipment type. These prices will be used to automatically calculate project budgets when users fill out the form.
          </Text>
        </VStack>

        {/* PC Equipment Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🖥️ PC Equipment Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for laptops and desktops (per unit)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  💻 Laptop Bureautique (€)
                </FormLabel>
                <NumberInput
                  value={prices.laptop_bureautique_price}
                  onChange={(value) => handlePriceChange('laptop_bureautique_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🔧 Laptop Technique (€)
                </FormLabel>
                <NumberInput
                  value={prices.laptop_technique_price}
                  onChange={(value) => handlePriceChange('laptop_technique_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🖥️ Desktop Bureautique (€)
                </FormLabel>
                <NumberInput
                  value={prices.desktop_bureautique_price}
                  onChange={(value) => handlePriceChange('desktop_bureautique_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ⚙️ Desktop Technique (€)
                </FormLabel>
                <NumberInput
                  value={prices.desktop_technique_price}
                  onChange={(value) => handlePriceChange('desktop_technique_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Other Equipment Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🖨️ Other Equipment Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for printers, workstations, and networking equipment (per unit)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🖨️ Printer (€)
                </FormLabel>
                <NumberInput
                  value={prices.printer_price}
                  onChange={(value) => handlePriceChange('printer_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🖥️ Workstation (€)
                </FormLabel>
                <NumberInput
                  value={prices.workstation_price}
                  onChange={(value) => handlePriceChange('workstation_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  📹 Video Conference (€)
                </FormLabel>
                <NumberInput
                  value={prices.video_conference_price}
                  onChange={(value) => handlePriceChange('video_conference_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  📶 Access Point (€)
                </FormLabel>
                <NumberInput
                  value={prices.access_point_price}
                  onChange={(value) => handlePriceChange('access_point_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* FO (Fiber Optic) Internet Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🔗 FO (Fiber Optic) Internet Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for FO internet connections (per month)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🐌 FO 100MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.fo_100mbps_price}
                  onChange={(value) => handlePriceChange('fo_100mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 FO 200MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.fo_200mbps_price}
                  onChange={(value) => handlePriceChange('fo_200mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ⚡ FO 500MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.fo_500mbps_price}
                  onChange={(value) => handlePriceChange('fo_500mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 FO 1GBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.fo_1gbps_price}
                  onChange={(value) => handlePriceChange('fo_1gbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* VSAT Internet Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🛰️ VSAT Internet Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for VSAT satellite internet connections (per month)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🐌 VSAT 100MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.vsat_100mbps_price}
                  onChange={(value) => handlePriceChange('vsat_100mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 VSAT 200MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.vsat_200mbps_price}
                  onChange={(value) => handlePriceChange('vsat_200mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ⚡ VSAT 500MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.vsat_500mbps_price}
                  onChange={(value) => handlePriceChange('vsat_500mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 VSAT 1GBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.vsat_1gbps_price}
                  onChange={(value) => handlePriceChange('vsat_1gbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* STARLINK Internet Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🚀 STARLINK Internet Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for STARLINK satellite internet connections (per month)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🐌 STARLINK 100MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.starlink_100mbps_price}
                  onChange={(value) => handlePriceChange('starlink_100mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 STARLINK 200MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.starlink_200mbps_price}
                  onChange={(value) => handlePriceChange('starlink_200mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ⚡ STARLINK 500MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.starlink_500mbps_price}
                  onChange={(value) => handlePriceChange('starlink_500mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 STARLINK 1GBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.starlink_1gbps_price}
                  onChange={(value) => handlePriceChange('starlink_1gbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* AUTRE (Other) Internet Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              🔧 AUTRE (Other) Internet Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for other internet connection types (per month)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🐌 AUTRE 100MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.autre_100mbps_price}
                  onChange={(value) => handlePriceChange('autre_100mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 AUTRE 200MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.autre_200mbps_price}
                  onChange={(value) => handlePriceChange('autre_200mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  ⚡ AUTRE 500MBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.autre_500mbps_price}
                  onChange={(value) => handlePriceChange('autre_500mbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🚀 AUTRE 1GBps (€/month)
                </FormLabel>
                <NumberInput
                  value={prices.autre_1gbps_price}
                  onChange={(value) => handlePriceChange('autre_1gbps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Software & Services Prices */}
        <Card bg="white" borderRadius="xl" boxShadow="sm" mb={6}>
          <CardHeader>
            <Heading size="md" color="brand.500">
              💿 Software & Services Prices
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Set prices for software setup and services (one-time costs)
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  💿 Local Applications (€)
                </FormLabel>
                <NumberInput
                  value={prices.local_apps_price}
                  onChange={(value) => handlePriceChange('local_apps_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="gray.700" mb={2}>
                  🗄️ File Server (€)
                </FormLabel>
                <NumberInput
                  value={prices.file_server_price}
                  onChange={(value) => handlePriceChange('file_server_price', value)}
                  min={0}
                  precision={2}
                >
                  <NumberInputField
                    placeholder="0.00"
                    bg="white"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    h="48px"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Card bg="white" borderRadius="xl" boxShadow="sm">
          <CardBody>
            <HStack justify="center" spacing={4}>
              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleSave}
                isLoading={saving}
                loadingText="Saving..."
                px={12}
                leftIcon={<Text>💾</Text>}
              >
                Save All Prices
              </Button>
              
              <Button
                variant="outline"
                colorScheme="gray"
                size="lg"
                onClick={handleReset}
                px={8}
                leftIcon={<Text>🔄</Text>}
              >
                Reset to Zero
              </Button>
            </HStack>
            
            <Divider my={4} />
            
            <VStack spacing={2} align="center">
              <Text fontSize="sm" color="gray.600" textAlign="center">
                💡 <strong>Tip:</strong> These prices will be used to automatically calculate project budgets when users fill out the project form.
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Prices are saved locally and will be used for budget calculations in real-time.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default FormPrices;
