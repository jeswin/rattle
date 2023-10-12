import { ExifImage } from 'exif';
import { promisify } from 'util';

// Function to get the exif data for a file
export async function getExifData(filePath: string): Promise<any> {
  try {
    // Promisify the ExifImage constructor
    const ExifImagePromise = promisify(ExifImage);

    // Create a new ExifImage instance with the file path
    const exifData = await ExifImagePromise({ image: filePath });

    // Return the exif data
    return exifData;
  } catch (error) {
    // If there is no exif data, return undefined
    if (error.code === 'NO_EXIF_SEGMENT') {
      return undefined;
    }

    // Throw the error if it's not related to missing exif data
    throw error;
  }
}