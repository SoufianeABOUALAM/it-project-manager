import React from 'react';
import { Box, Text, VStack, HStack, Image } from '@chakra-ui/react';

const BouyguesLogo = ({ size = 'md', showText = false, variant = 'default' }) => {
  const sizes = {
    sm: { logo: '100px', text: 'sm', subtext: 'xs' },
    md: { logo: '130px', text: 'lg', subtext: 'xs' },
    lg: { logo: '160px', text: 'xl', subtext: 'sm' },
    xl: { logo: '180px', text: '2xl', subtext: 'sm' }
  };

  const currentSize = sizes[size];

  const logoVariants = {
    default: {
      primaryText: 'BOUYGUES',
      secondaryText: 'IT INFRASTRUCTURE'
    },
    construction: {
      primaryText: 'BOUYGUES',
      secondaryText: 'CONSTRUCTION'
    },
    engineering: {
      primaryText: 'BOUYGUES',
      secondaryText: 'ENGINEERING'
    }
  };

  const variantConfig = logoVariants[variant];

  return (
    <HStack spacing={4}>
      {/* Official Bouygues Logo - Using actual logo.png */}
      <Image
        src="/logo.png"
        alt="Bouygues Logo"
        w={currentSize.logo}
        h={currentSize.logo * 0.55}
        objectFit="contain"
        fallback={
          <Box
            w={currentSize.logo}
            h={currentSize.logo * 0.55}
            bg="#FF6B35"
            borderRadius="full"
            border="2px solid"
            borderColor="black"
            display="flex"
            alignItems="center"
            justifyContent="center"
            position="relative"
            boxShadow="0 4px 12px rgba(0,0,0,0.15)"
          >
            <Box
              w="75%"
              h="65%"
              bg="white"
              borderRadius="full"
              border="1px solid"
              borderColor="black"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              px={1}
              py={0.5}
            >
              <Text
                fontSize="2xs"
                fontWeight="900"
                color="black"
                lineHeight="0.7"
                letterSpacing="0.1em"
                textAlign="center"
                fontFamily="Arial, sans-serif"
              >
                BOUYGUES
              </Text>
              <Text
                fontSize="3xs"
                fontWeight="900"
                color="#20B2AA"
                lineHeight="0.7"
                letterSpacing="0.1em"
                textAlign="center"
                fontFamily="Arial, sans-serif"
                mt={0.5}
              >
                {variantConfig.secondaryText.split(' ')[0]}
              </Text>
            </Box>
          </Box>
        }
      />

      {/* Logo Text */}
      {showText && (
        <VStack align="start" spacing={0}>
          <Text 
            fontSize={currentSize.text} 
            fontWeight="900" 
            color="black"
            lineHeight="0.9"
            letterSpacing="0.05em"
            textTransform="uppercase"
            fontFamily="Arial, sans-serif"
          >
            {variantConfig.primaryText}
          </Text>
          <Text 
            fontSize={currentSize.subtext} 
            color="#20B2AA" 
            fontWeight="900"
            letterSpacing="0.1em"
            textTransform="uppercase"
            fontFamily="Arial, sans-serif"
          >
            {variantConfig.secondaryText}
          </Text>
        </VStack>
      )}
    </HStack>
  );
};

export default BouyguesLogo;