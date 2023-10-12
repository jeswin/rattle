import exif from "exif-js";

// Function to get exif data for a file
const getExifData = async (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Create an image element
    const img = new Image();

    // Set the source of the image to the file path
    img.src = filePath;

    // Event listener to handle when the image has loaded
    img.onload = function () {
      // Get the exif data using exif-js library
      const exifData = exif.getData(this);

      // Check if exif data exists
      if (exifData) {
        resolve(exifData);
      } else {
        resolve(undefined);
      }
    };

    // Event listener to handle any errors while loading the image
    img.onerror = function () {
      reject(new Error("Failed to load image"));
    };
  });
};

export default getExifData;