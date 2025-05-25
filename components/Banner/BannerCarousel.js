import React, { useState, useRef, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ScrollView, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Use percentage of screen width for banner
const BANNER_WIDTH = screenWidth * 0.95; // 90% of screen width
const BANNER_HEIGHT = BANNER_WIDTH * 0.5; // Maintain aspect ratio (160/340 = 0.47)

const BannerCarousel = () => {
  // Get colors from theme context
  const { colors } = useTheme();
  
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Use local images instead of URLs
  const bannerData = [
    {
      id: '1',
      image: require('../../assets/images/banner1.jpg') 
    },
    {
      id: '2',
      image: require('../../assets/images/banner2.jpg')
    },
    {
      id: '3',
      image: require('../../assets/images/banner3.jpg')
    },
    {
      id: '4',
      image: require('../../assets/images/banner4.jpg')
    },
    {
      id: '5',
      image: require('../../assets/images/banner5.jpg')
    },
  ];

  // Auto scroll effect
  useEffect(() => {
    const autoplayInterval = 3000;
    
    const intervalId = setInterval(() => {
      if (scrollViewRef.current && bannerData.length > 1) {
        const nextIndex = (activeSlide + 1) % bannerData.length;
        scrollViewRef.current.scrollTo({
          x: nextIndex * BANNER_WIDTH,
          animated: true
        });
        setActiveSlide(nextIndex);
      }
    }, autoplayInterval);
    
    return () => clearInterval(intervalId);
  }, [activeSlide]);

  // Handle manual scroll
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / BANNER_WIDTH);
    setActiveSlide(index);
  };

  // Create styles with current theme colors
  const themedStyles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      backgroundColor: colors.transparent,
      paddingHorizontal: 8,
    },
    carouselWrapper: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
    },
    scrollViewStyle: {
      width: BANNER_WIDTH,
    },
    scrollViewContent: {
      alignItems: 'center',
    },
    slide: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      overflow: 'hidden',
    },
    image: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      borderRadius: 12,
    },
    fallbackText: {
      fontSize: 20,
      color: colors.card,
      fontWeight: 'bold',
    },
    paginationContainer: {
      position: 'absolute',
      bottom: 10,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 4,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
    }
  });

  // Render dots indicator
  const renderPagination = () => {
    return (
      <View style={themedStyles.paginationContainer}>
        {bannerData.map((_, index) => (
          <View
            key={index}
            style={[
              themedStyles.paginationDot,
              { backgroundColor: index === activeSlide ? colors.highlight : colors.disabled }
            ]}
          />
        ))}
      </View>
    );
  };

  // If we can't load images, show colored blocks instead
  const renderFallbackBanner = (index) => {
    const bannerColors = [colors.error, colors.success, colors.primary];
    return (
      <View style={[themedStyles.slide, { backgroundColor: bannerColors[index % bannerColors.length] }]}>
        <Text style={[themedStyles.fallbackText, { color: colors.card }]}>Banner {index + 1}</Text>
      </View>
    );
  };

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.carouselWrapper}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={themedStyles.scrollViewStyle}
          contentContainerStyle={themedStyles.scrollViewContent}
        >
          {bannerData.map((item, index) => (
            <View key={item.id} style={themedStyles.slide}>
              {imageLoadError ? (
                renderFallbackBanner(index)
              ) : (
                <Image
                  source={item.image}
                  style={themedStyles.image}
                  resizeMode="cover"
                  onError={() => setImageLoadError(true)}
                />
              )}
            </View>
          ))}
        </ScrollView>
        {renderPagination()}
      </View>
    </View>
  );
};

export default BannerCarousel;
