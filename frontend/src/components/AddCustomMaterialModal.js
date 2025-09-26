import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  HStack,
  Text,
  Switch,
  FormHelperText,
  useToast,
  Divider,
  Box,
  Badge,
  Icon,
  useDisclosure
} from '@chakra-ui/react';
import { MdAdd, MdInfo, MdCalculate, MdClose } from 'react-icons/md';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/';

const AddCustomMaterialModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price_france: 0,
    price_morocco: 0,
    unit: 'unit',
    calculation_type: 'FIXED',
    multiplier: 1.0,
    min_quantity: 0,
    max_quantity: 999999,
    conditions: {}
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const toast = useToast();

  const calculationTypes = [
    { 
      value: 'PER_USER', 
      label: 'Per User (Number of Users)', 
      description: 'Quantity = Number of Users × Multiplier',
      icon: '👥'
    },
    { 
      value: 'PER_SERVER', 
      label: 'Per Server', 
      description: 'Quantity = Number of Servers × Multiplier',
      icon: '🖥️'
    },
    { 
      value: 'PER_PC', 
      label: 'Per PC (Number of PCs)', 
      description: 'Quantity = Number of PCs × Multiplier',
      icon: '💻'
    },
    { 
      value: 'PER_DEVICE', 
      label: 'Per Device', 
      description: 'Quantity = Number of Devices × Multiplier',
      icon: '📱'
    },
    { 
      value: 'FIXED', 
      label: 'Fixed Amount', 
      description: 'Always add this exact quantity',
      icon: '🔒'
    },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}materials/categories/`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        conditions: {}
      };

      const response = await axios.post(`${API_URL}materials/custom-material/`, submitData, {
        headers: { Authorization: `Token ${localStorage.getItem('authToken')}` }
      });

      toast({
        title: 'Custom Material Added!',
        description: `${formData.name} has been added successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSuccess && onSuccess(response.data);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        price_france: 0,
        price_morocco: 0,
        unit: 'unit',
        calculation_type: 'FIXED',
        multiplier: 1.0,
        min_quantity: 0,
        max_quantity: 999999,
        conditions: {}
      });

    } catch (error) {
      toast({
        title: 'Error Adding Material',
        description: error.response?.data?.error || 'Failed to add material. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getCalculationDescription = () => {
    const type = calculationTypes.find(t => t.value === formData.calculation_type);
    return type ? type.description : '';
  };

  const getCalculationIcon = () => {
    const type = calculationTypes.find(t => t.value === formData.calculation_type);
    return type ? type.icon : '📋';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay bg="rgba(0,0,0,0.8)" backdropFilter="blur(12px)" />
      <ModalContent 
        borderRadius="2xl"
        boxShadow="0 32px 64px -12px rgba(0, 0, 0, 0.4)"
        bg="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)"
      >
        <ModalHeader 
          bg="transparent"
          borderBottom="none"
          p={6}
          position="relative"
        >
          <HStack spacing={4} align="center">
            <Box
              p={3}
              borderRadius="xl"
              bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
              boxShadow="0 8px 25px rgba(255, 107, 53, 0.3)"
            >
              <Icon as={MdAdd} w="24px" h="24px" color="white" />
            </Box>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="800" color="gray.800">
                Add Custom Material
              </Text>
              <Text fontSize="sm" color="gray.600">
                Create smart materials that auto-calculate based on project requirements
              </Text>
            </VStack>
          </HStack>
          
          {/* X Close Button */}
          <Button
            position="absolute"
            top={4}
            right={4}
            size="sm"
            variant="ghost"
            onClick={onClose}
            borderRadius="full"
            p={2}
            _hover={{
              bg: "rgba(0, 0, 0, 0.1)",
              transform: "scale(1.1)"
            }}
            _active={{
              transform: "scale(0.95)"
            }}
            transition="all 0.2s ease"
            color="gray.500"
            _hover={{ color: "gray.700" }}
          >
            <Icon as={MdClose} w="20px" h="20px" />
          </Button>
        </ModalHeader>

        <ModalBody p={6} bg="transparent">
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box
              p={4}
              borderRadius="xl"
              bg="rgba(255, 107, 53, 0.05)"
              border="2px solid"
              borderColor="rgba(255, 107, 53, 0.1)"
            >
              <Text fontSize="md" fontWeight="700" color="gray.800" mb={4}>
                📋 Basic Information
              </Text>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Material Name
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Network Cable, Enterprise Router"
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Description
                  </FormLabel>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the material"
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                  />
                </FormControl>

                <HStack spacing={4}>
                  <FormControl isRequired flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Category
                    </FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Unit
                    </FormLabel>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      placeholder="e.g., unit, meter, piece"
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                    />
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Pricing */}
            <Box
              p={4}
              borderRadius="xl"
              bg="rgba(32, 178, 170, 0.05)"
              border="2px solid"
              borderColor="rgba(32, 178, 170, 0.1)"
            >
              <Text fontSize="md" fontWeight="700" color="gray.800" mb={4}>
                💰 Pricing
              </Text>
              
              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Price France (€)
                  </FormLabel>
                  <NumberInput
                    value={formData.price_france}
                    onChange={(value) => setFormData({...formData, price_france: parseFloat(value) || 0})}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#20B2AA", boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)" }}
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Price Morocco (MAD)
                  </FormLabel>
                  <NumberInput
                    value={formData.price_morocco}
                    onChange={(value) => setFormData({...formData, price_morocco: parseFloat(value) || 0})}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField
                      borderRadius="lg"
                      border="2px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: "#20B2AA", boxShadow: "0 0 0 3px rgba(32, 178, 170, 0.1)" }}
                    />
                  </NumberInput>
                </FormControl>
              </HStack>
            </Box>

            {/* Smart Calculation */}
            <Box
              p={4}
              borderRadius="xl"
              bg="rgba(255, 107, 53, 0.05)"
              border="2px solid"
              borderColor="rgba(255, 107, 53, 0.1)"
            >
              <HStack spacing={2} mb={4}>
                <Text fontSize="md" fontWeight="700" color="gray.800">
                  🧠 Smart Calculation
                </Text>
                <Badge colorScheme="orange" variant="subtle">
                  {getCalculationIcon()} {formData.calculation_type.replace('_', ' ')}
                </Badge>
              </HStack>
              
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                    Calculation Method
                  </FormLabel>
                  <Select
                    value={formData.calculation_type}
                    onChange={(e) => setFormData({...formData, calculation_type: e.target.value})}
                    borderRadius="lg"
                    border="2px solid"
                    borderColor="gray.200"
                    _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                  >
                    {calculationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label} - {type.description}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText color="gray.600">
                    {getCalculationDescription()}
                  </FormHelperText>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Multiplier
                    </FormLabel>
                    <NumberInput
                      value={formData.multiplier}
                      onChange={(value) => setFormData({...formData, multiplier: parseFloat(value) || 0})}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                      />
                    </NumberInput>
                    <FormHelperText color="gray.600">
                      {formData.calculation_type === 'PER_USER' && 'Units per user'}
                      {formData.calculation_type === 'PER_SERVER' && 'Units per server'}
                      {formData.calculation_type === 'PER_DEVICE' && 'Units per computer/device'}
                      {formData.calculation_type === 'PER_PROJECT' && 'Total units for project'}
                      {formData.calculation_type === 'FIXED' && 'Fixed quantity to add'}
                    </FormHelperText>
                  </FormControl>

                  <FormControl flex={1}>
                    <FormLabel fontSize="sm" fontWeight="600" color="gray.700">
                      Min Quantity
                    </FormLabel>
                    <NumberInput
                      value={formData.min_quantity}
                      onChange={(value) => setFormData({...formData, min_quantity: parseInt(value) || 0})}
                      min={0}
                    >
                      <NumberInputField
                        borderRadius="lg"
                        border="2px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: "#FF6B35", boxShadow: "0 0 0 3px rgba(255, 107, 53, 0.1)" }}
                      />
                    </NumberInput>
                  </FormControl>
                </HStack>

              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter p={6} bg="transparent">
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={onClose}
              borderColor="gray.300"
              color="gray.600"
              _hover={{ bg: "gray.50", borderColor: "gray.400" }}
              borderRadius="xl"
              px={6}
            >
              Cancel
            </Button>
            <Button
              bg="linear-gradient(135deg, #FF6B35 0%, #20B2AA 100%)"
              color="white"
              _hover={{
                bg: "linear-gradient(135deg, #e55a2b 0%, #17a2b8 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 8px 25px rgba(255, 107, 53, 0.3)"
              }}
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Adding..."
              borderRadius="xl"
              px={6}
              fontWeight="700"
            >
              ✨ Add Custom Material
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddCustomMaterialModal;
