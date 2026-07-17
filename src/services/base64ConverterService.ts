const base64ConverterService = async (base64: string, type: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const splitBase64 = base64.split(',')[1];
      if (!splitBase64) {
        throw new Error('Invalid base64 string format');
      }
      const byteCharacters = atob(splitBase64);
      const byteNumbers = new Array<number>(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        const charCode = byteCharacters.charCodeAt(i);
        if (charCode !== undefined) {
          byteNumbers[i] = charCode;
        }
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: type });

      const blobUrl = URL.createObjectURL(blob);

      resolve(blobUrl);
    } catch (error) {
      reject(error);
    }
  });
};

export default base64ConverterService;
