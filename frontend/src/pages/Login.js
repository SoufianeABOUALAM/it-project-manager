import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import { RiEyeCloseLine } from 'react-icons/ri';
import { FaChevronLeft } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
// Custom components
import { HSeparator } from '../components/separator/Separator';
import FixedPlugin from '../components/fixedPlugin/FixedPlugin';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  // Chakra color mode
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const textColorDetails = useColorModeValue("navy.700", "secondaryGray.600");
  const textColorBrand = useColorModeValue("brand.500", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const googleBg = useColorModeValue("white", "whiteAlpha.200");
  const googleText = useColorModeValue("navy.700", "white");
  const googleHover = useColorModeValue(
    { bg: "gray.100" },
    { bg: "whiteAlpha.300" }
  );
  const googleActive = useColorModeValue(
    { bg: "gray.200" },
    { bg: "whiteAlpha.200" }
  );

  const handleClick = () => setShow(!show);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(formData.username, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    }
    
    setLoading(false);
  };

  return (
    <Flex position='relative' h='100vh' bg='white' overflow='hidden'>
      <Flex
        h='100vh'
        w='100%'
        maxW={{ md: "66%", lg: "1313px" }}
        mx='auto'
        pt={{ sm: "20px", md: "0px" }}
        px={{ lg: "30px", xl: "0px" }}
        ps={{ xl: "70px" }}
        justifyContent='center'
        direction='column'
        bg='white'>
        

        {/* Form Content */}
        <Flex
          maxW={{ base: "100%", md: "max-content" }}
          w='100%'
          mx={{ base: "auto", lg: "0px" }}
          me='auto'
          h='100%'
          alignItems='start'
          justifyContent='center'
          mb={{ base: "30px", md: "60px" }}
          px={{ base: "25px", md: "0px" }}
          mt={{ base: "40px", md: "14vh" }}
          flexDirection='column'>
          
          <Box me='auto'>
            <Heading color={textColor} fontSize='36px' mb='10px'>
                  Sign In
                </Heading>
            <Text
              mb='36px'
              ms='4px'
              color={textColorSecondary}
              fontWeight='400'
              fontSize='md'>
              Enter your email and password to sign in!
            </Text>
          </Box>

          <Flex
            zIndex='2'
            direction='column'
            w={{ base: "100%", md: "420px" }}
            maxW='100%'
            background='transparent'
            borderRadius='15px'
            mx={{ base: "auto", lg: "unset" }}
            me='auto'
            mb={{ base: "20px", md: "auto" }}>
            
            {/* Google Sign In Button */}
            <Button
              fontSize='sm'
              me='0px'
              mb='26px'
              py='15px'
              h='50px'
              borderRadius='16px'
              bg={googleBg}
              color={googleText}
              fontWeight='500'
              border='1px solid'
              borderColor='secondaryGray.100'
              _hover={googleHover}
              _active={googleActive}
              _focus={googleActive}>
              <Icon as={FcGoogle} w='20px' h='20px' me='10px' />
              Sign in with Google
            </Button>

            {/* Divider */}
            <Flex align='center' mb='25px'>
              <HSeparator />
              <Text color='gray.400' mx='14px'>
                or
              </Text>
              <HSeparator />
            </Flex>

            {/* Error Alert */}
              {error && (
              <Alert status="error" borderRadius="md" mb='24px'>
                  <AlertIcon />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
            {/* Form */}
              <Box as="form" onSubmit={handleSubmit}>
              <FormControl>
                <FormLabel
                  display='flex'
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  mb='8px'>
                  Username<Text color={brandStars}>*</Text>
                </FormLabel>
                    <Input
                  isRequired={true}
                  variant='auth'
                  fontSize='sm'
                  ms={{ base: "0px", md: "0px" }}
                  type='text'
                  name='username'
                  value={formData.username}
                      onChange={handleChange}
                  placeholder='Enter your username'
                  mb='24px'
                  fontWeight='500'
                  size='lg'
                  h='50px'
                  borderRadius='16px'
                  border='1px solid'
                  borderColor='secondaryGray.100'
                  _focus={{
                    borderColor: 'brand.500',
                    boxShadow: '0 0 0 1px #422AFB'
                  }}
                />
                
                <FormLabel
                  ms='4px'
                  fontSize='sm'
                  fontWeight='500'
                  color={textColor}
                  display='flex'>
                  Password<Text color={brandStars}>*</Text>
                </FormLabel>
                <InputGroup size='md'>
                    <Input
                    isRequired={true}
                    fontSize='sm'
                    name='password'
                      value={formData.password}
                      onChange={handleChange}
                    placeholder='Min. 8 characters'
                    mb='24px'
                    size='lg'
                    h='50px'
                    borderRadius='16px'
                    border='1px solid'
                    borderColor='secondaryGray.100'
                    type={show ? "text" : "password"}
                    variant='auth'
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 1px #422AFB'
                    }}
                  />
                  <InputRightElement display='flex' alignItems='center' mt='4px'>
                    <Icon
                      color={textColorSecondary}
                      _hover={{ cursor: "pointer" }}
                      as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
                      onClick={handleClick}
                    />
                  </InputRightElement>
                </InputGroup>
                
                <Flex justifyContent='space-between' align='center' mb='24px'>
                  <FormControl display='flex' alignItems='center'>
                    <Checkbox
                      id='remember-login'
                      colorScheme='brandScheme'
                      me='10px'
                    />
                    <FormLabel
                      htmlFor='remember-login'
                      mb='0'
                      fontWeight='normal'
                      color={textColor}
                      fontSize='sm'>
                      Keep me logged in
                    </FormLabel>
                  </FormControl>
                  <Link to='/auth/forgot-password'>
                    <Text
                      color={textColorBrand}
                      fontSize='sm'
                      w='124px'
                      fontWeight='500'>
                      Forgot password?
                    </Text>
                  </Link>
                </Flex>
                  
                  <Button
                    type="submit"
                  fontSize='sm'
                  variant='brand'
                  fontWeight='500'
                  w='100%'
                  h='50'
                  mb='24px'
                    disabled={loading}
                    isLoading={loading}
                  loadingText="Signing In...">
                    Sign In
                  </Button>
              </FormControl>
              
              <Flex
                flexDirection='column'
                justifyContent='center'
                alignItems='start'
                maxW='100%'
                mt='0px'>
                <Text color={textColorDetails} fontWeight='400' fontSize='14px'>
                  Not registered yet?
                  <Link to='/register'>
                    <Text
                      color={textColorBrand}
                      as='span'
                      ms='5px'
                      fontWeight='500'>
                      Create an Account
                    </Text>
                  </Link>
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>

        {/* Right Panel - Branding */}
        <Box
          display={{ base: "none", md: "block" }}
          h='100%'
          minH='100vh'
          w={{ lg: "50vw", "2xl": "44vw" }}
          position='absolute'
          right='0px'>
          <Flex
            bg="linear-gradient(135deg, #FF6B35 0%, #F7931E 30%, #FF6B35 60%, #20B2AA 100%)"
            justify='center'
            align='center'
            w='100%'
            h='100%'
            position='absolute'
            borderBottomLeftRadius={{ lg: "120px", xl: "200px" }}>
            
            {/* Creative Background Elements */}
            <Box
              position='absolute'
              top='10%'
              left='10%'
              w='60px'
              h='60px'
              bg='rgba(255,255,255,0.1)'
              borderRadius='50%'
              animation='float 4s ease-in-out infinite'
            />
            <Box
              position='absolute'
              top='20%'
              right='15%'
              w='40px'
              h='40px'
              bg='rgba(255,255,255,0.15)'
              borderRadius='8px'
              animation='float 3s ease-in-out infinite reverse'
            />
            <Box
              position='absolute'
              bottom='25%'
              left='20%'
              w='30px'
              h='30px'
              bg='rgba(255,255,255,0.2)'
              borderRadius='50%'
              animation='float 5s ease-in-out infinite'
            />
            <Box
              position='absolute'
              bottom='15%'
              right='25%'
              w='50px'
              h='50px'
              bg='rgba(255,255,255,0.1)'
              borderRadius='12px'
              animation='float 3.5s ease-in-out infinite reverse'
            />
            
            {/* Logo and Branding */}
            <Flex direction='column' align='center' textAlign='center'>
              {/* Creative Logo Container */}
              <Box
                position='relative'
                mb='30px'>
                {/* Outer Glow Effect */}
                <Box
                  position='absolute'
                  top='-10px'
                  left='-10px'
                  right='-10px'
                  bottom='-10px'
                  bg='rgba(255,255,255,0.1)'
                  borderRadius='full'
                  filter='blur(20px)'
                  zIndex='0'
                />
                
                {/* Main Logo Container */}
                <Box
                  w='220px'
                  h='220px'
                  bg='white'
                  borderRadius='full'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  boxShadow='0 25px 50px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)'
                  position='relative'
                  zIndex='1'
                  overflow='hidden'>
                  
                  {/* Animated Background Gradient */}
                  <Box
                    position='absolute'
                    top='0'
                    left='0'
                    right='0'
                    bottom='0'
                    bg='linear-gradient(45deg, #FF6B35, #F7931E, #FF6B35)'
                    borderRadius='full'
                    opacity='0.1'
                    animation='pulse 3s ease-in-out infinite'
                  />
                  
                  {/* Logo Image */}
                  <Box
                    w='180px'
                    h='180px'
                    borderRadius='full'
                    overflow='hidden'
                    position='relative'
                    zIndex='2'
                    boxShadow='inset 0 0 20px rgba(0,0,0,0.1)'
                    cursor='pointer'
                    onClick={() => window.open('https://www.bouygues-construction.com/', '_blank')}
                    _hover={{ transform: 'scale(1.05)' }}
                    transition='transform 0.3s ease'>
                    <Image
                      src='/logo.png'
                      alt='Bouygues Logo'
                      w='100%'
                      h='100%'
                      objectFit='contain'
                      fallback={
                        <Box
                          w='100%'
                          h='100%'
                          bg='linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
                          borderRadius='full'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                          position='relative'>
                          {/* Fallback Design */}
                          <Box
                            w='80%'
                            h='80%'
                            bg='white'
                            borderRadius='full'
                            border='2px solid #FF6B35'
                            display='flex'
                            flexDirection='column'
                            alignItems='center'
                            justifyContent='center'
                            px={2}
                            py={1}>
                            <Text
                              fontSize='xs'
                              fontWeight='900'
                              color='#FF6B35'
                              lineHeight='0.8'
                              letterSpacing='0.1em'
                              textAlign='center'
                              fontFamily='Arial, sans-serif'>
                              BOUYGUES
                            </Text>
                            <Text
                              fontSize='2xs'
                              fontWeight='900'
                              color='#20B2AA'
                              lineHeight='0.8'
                              letterSpacing='0.1em'
                              textAlign='center'
                              fontFamily='Arial, sans-serif'
                              mt={0.5}>
                              IT
                            </Text>
                          </Box>
                        </Box>
                      }
                    />
                  </Box>
                  
                  {/* Floating Particles */}
                  <Box
                    position='absolute'
                    top='10px'
                    right='10px'
                    w='8px'
                    h='8px'
                    bg='rgba(255,255,255,0.6)'
                    borderRadius='full'
                    animation='float 2s ease-in-out infinite'
                  />
                  <Box
                    position='absolute'
                    bottom='15px'
                    left='15px'
                    w='6px'
                    h='6px'
                    bg='rgba(255,255,255,0.4)'
                    borderRadius='full'
                    animation='float 2.5s ease-in-out infinite reverse'
                  />
                </Box>
              </Box>
              
              {/* Brand Text with Creative Styling */}
              <Box position='relative' mb='20px'>
                <Text 
                  color='rgba(255,255,255,0.9)' 
                  fontSize='2xl' 
                  fontWeight='600'
                  textShadow='0 1px 2px rgba(0,0,0,0.2)'
                  letterSpacing='0.02em'>
                  BOUYGUES CONSTRUCTION
                </Text>
              </Box>
              
              {/* Creative Button */}
              <Button
                bg='linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)'
                color='white'
                border='1px solid rgba(255,255,255,0.3)'
                _hover={{ 
                  bg: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.2) 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
                _active={{
                  transform: 'translateY(0px)'
                }}
                borderRadius='full'
                px='35px'
                py='18px'
                fontWeight='600'
                fontSize='md'
                letterSpacing='0.05em'
                transition='all 0.3s ease'
                position='relative'
                overflow='hidden'
                onClick={() => window.open('https://www.bouygues-construction.com/', '_blank')}
                cursor='pointer'>
                {/* Button Shine Effect */}
                <Box
                  position='absolute'
                  top='0'
                  left='-100%'
                  w='100%'
                  h='100%'
                  bg='linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                  transition='left 0.5s ease'
                  _groupHover={{ left: '100%' }}
                />
                <Text position='relative' zIndex='1'>
                  BOUYGUES.COM
                </Text>
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
      <FixedPlugin />
    </Flex>
  );
};

export default Login;
