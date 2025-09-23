import React, { useState } from 'react';
import { Box, Button, Text, VStack, HStack, Code, Alert, AlertIcon } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

const TestProjectsAPI = () => {
  const { user, authToken } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint, description) => {
    setLoading(true);
    try {
      console.log(`Testing ${description}:`, endpoint);
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Token ${authToken}` }
      });
      
      setTestResults(prev => ({
        ...prev,
        [description]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
    } catch (error) {
      console.error(`Error testing ${description}:`, error);
      setTestResults(prev => ({
        ...prev,
        [description]: {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults({});
    
    // Test user profile
    await testAPI('auth/profile/', 'User Profile');
    
    // Test projects endpoint
    await testAPI('projects/projects/', 'Projects List');
    
    // Test materials endpoint
    await testAPI('materials/', 'Materials List');
  };

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">API Test Dashboard</Text>
        
        <HStack spacing={4}>
          <Button onClick={runAllTests} isLoading={loading} colorScheme="blue">
            Run All Tests
          </Button>
          <Button onClick={() => testAPI('auth/profile/', 'User Profile')} isLoading={loading}>
            Test Profile
          </Button>
          <Button onClick={() => testAPI('projects/projects/', 'Projects')} isLoading={loading}>
            Test Projects
          </Button>
        </HStack>

        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>User Info:</Text>
          <Code p={2} display="block" whiteSpace="pre-wrap">
            {JSON.stringify({ user, authToken: authToken ? 'Present' : 'Missing' }, null, 2)}
          </Code>
        </Box>

        {Object.entries(testResults).map(([testName, result]) => (
          <Box key={testName} p={4} border="1px" borderColor="gray.200" borderRadius="md">
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              {testName} - Status: {result.status}
            </Text>
            
            {result.success ? (
              <Alert status="success" mb={2}>
                <AlertIcon />
                Success!
              </Alert>
            ) : (
              <Alert status="error" mb={2}>
                <AlertIcon />
                Error: {result.error?.detail || result.error}
              </Alert>
            )}
            
            <Code p={2} display="block" whiteSpace="pre-wrap" maxH="300px" overflowY="auto">
              {JSON.stringify(result.data || result.error, null, 2)}
            </Code>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default TestProjectsAPI;
