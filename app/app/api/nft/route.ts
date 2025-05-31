import { NextRequest, NextResponse } from 'next/server';

// Define the NFT categories and their corresponding images
const NFT_CATEGORIES = {
  access: {
    name: 'Access to Knowledge',
    description: 'Unlock the power of open science and research access',
    image: '/nft/access-scihub.png',
    external_url: 'https://sci-hub.se/'
  },
  time: {
    name: 'Time & Innovation',
    description: 'Contributing valuable time to technological advancement',
    image: '/nft/Time-ethglobal.png',
    external_url: 'https://ethglobal.com/'
  },
  knowledge: {
    name: 'Knowledge Sharing',
    description: 'Advancing collective knowledge through open source contributions',
    image: '/nft/knowledge-github.png',
    external_url: 'https://github.com/'
  },
  gift: {
    name: 'Gift & Donations',
    description: 'Acts of generosity and giving that make a meaningful difference in the world',
    image: '/nft/gift-wiki.png',
    external_url: 'https://wikipedia.org/'
  },
  ecology: {
    name: 'Ecological Impact',
    description: 'Contributing to environmental awareness and conservation',
    image: '/nft/ecology-inaturalist.png',
    external_url: 'https://www.inaturalist.org/'
  },
  care: {
    name: 'Community Care',
    description: 'Nurturing and supporting community growth',
    image: '/nft/care-NTF.png',
    external_url: 'https://example.com/care'
  }
} as const;

type CategoryKey = keyof typeof NFT_CATEGORIES;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const karmaAmount = searchParams.get('karmaAmount');
    const category = searchParams.get('category') as CategoryKey;

    // Validate required parameters
    if (!karmaAmount) {
      return NextResponse.json(
        { error: 'karmaAmount parameter is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'category parameter is required' },
        { status: 400 }
      );
    }

    // Validate category exists
    if (!NFT_CATEGORIES[category]) {
      const validCategories = Object.keys(NFT_CATEGORIES).join(', ');
      return NextResponse.json(
        { 
          error: `Invalid category. Valid categories are: ${validCategories}` 
        },
        { status: 400 }
      );
    }

    // Get the category data
    const categoryData = NFT_CATEGORIES[category];
    
    // Get the full URL origin from the request
    const origin = new URL(request.url).origin;
    const fullImageUrl = `${origin}${categoryData.image}`;
    
    // Generate NFT metadata based on karma amount and category
    const nftMetadata = {
      name: `Karma NFT - ${categoryData.name} (${karmaAmount} Karma)`,
      description: `${categoryData.description}. This NFT represents ${karmaAmount} karma points earned through meaningful contributions to the community.`,
      image: fullImageUrl,
      external_url: categoryData.external_url,
      attributes: [
        {
          trait_type: 'Karma Amount',
          value: parseInt(karmaAmount),
          display_type: 'number'
        },
        {
          trait_type: 'Category',
          value: categoryData.name
        },
        {
          trait_type: 'Rarity',
          value: getKarmaRarity(parseInt(karmaAmount))
        }
      ],
      background_color: getCategoryColor(category),
      animation_url: null,
      youtube_url: null
    };

    return NextResponse.json(nftMetadata, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating NFT metadata:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to determine rarity based on karma amount
function getKarmaRarity(karmaAmount: number): string {
  if (karmaAmount >= 10000) return 'Legendary';
  if (karmaAmount >= 5000) return 'Epic';
  if (karmaAmount >= 1000) return 'Rare';
  if (karmaAmount >= 100) return 'Uncommon';
  return 'Common';
}

// Helper function to get category-specific background color
function getCategoryColor(category: CategoryKey): string {
  const colors = {
    access: '#FF6B6B',    // Red
    time: '#4ECDC4',      // Teal
    knowledge: '#45B7D1', // Blue
    gift: '#96CEB4',      // Green
    ecology: '#FFEAA7',   // Yellow
    care: '#DDA0DD'       // Plum
  };
  
  return colors[category] || '#FFFFFF';
} 