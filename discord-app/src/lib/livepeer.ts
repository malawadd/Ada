interface GenerateImageOptions {
    modelId: string;
    prompt: string;
    steps?: number;
    width?: number;
    height?: number;
  }
  
  interface LivepeerResponse {
    images: {
      nsfw: boolean;
      seed: number;
      url: string;
    }[];
  }
  
  export const generateImageFromPrompt = async ({
    modelId,
    prompt,
    steps = 6,
    width = 1024,
    height = 576,
  }: GenerateImageOptions): Promise<string | null> => {
    const options = {
      method: 'POST',
      headers: {
        Authorization: 'Bearer 2e3dfc14-83f7-431a-8dc1-6e85e0ac6892', 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: modelId,
        prompt,
        num_inference_steps: steps,
        width,
        height,
        safety_check: false,
      }),
    };
  
    try {
      const response = await fetch('https://dream-gateway.livepeer.cloud/text-to-image', options);
      const data: LivepeerResponse = await response.json();
  
      if (data.images && data.images.length > 0) {
        return data.images[0].url;
      }
      return null;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };
  