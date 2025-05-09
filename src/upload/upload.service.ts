import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly THREE_MB_IN_BYTES = 3 * 1024 * 1024; // 3MB in bytes

  constructor() {
    cloudinary.config({
      cloud_name: 'dppmsqwgi',
      api_key: '679814612734721',
      api_secret: '9YvbEgrUt9tDaNXVz4rye1Wq0o4',
    });
  }

  /**
   * Compresses an image file if it's larger than 3MB
   * This function can be removed later as mentioned by the user
   * 
   * @param file The file to compress
   * @returns The compressed file buffer
   */
  private async compressImageIfNeeded(file: Express.Multer.File): Promise<Buffer> {
    // Only compress if file is larger than 3MB and is an image
    if (file.size <= this.THREE_MB_IN_BYTES || !file.mimetype.startsWith('image/')) {
      return file.buffer;
    }

    this.logger.log(`Compressing image: ${file.originalname} (${file.size} bytes)`);
    
    try {
      // Use sharp to compress the image and maintain orientation
      // Setting quality to 80% for JPG and WebP
      // For PNG, we use compressionLevel 6 (0-9, higher = smaller file size but more CPU)
      const compressedBuffer = await sharp(file.buffer)
        // Preserve the original orientation of the image (fixes rotation issues)
        .rotate() // Auto-rotate based on EXIF orientation
        .jpeg({ quality: 80 })
        .png({ compressionLevel: 6 })
        .webp({ quality: 80 })
        .toBuffer();
      
      this.logger.log(`Image compressed: ${file.originalname} (${compressedBuffer.length} bytes)`);
      return compressedBuffer;
    } catch (error) {
      this.logger.error(`Error compressing image: ${error.message}`, error.stack);
      // If compression fails, return the original buffer
      return file.buffer;
    }
  }

  /**
   * Uploads a file to Cloudinary with rotation correction for images
   * @param file The file to upload (from multer)
   * @returns The Cloudinary upload response with the URL
   */
  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      let processedBuffer: Buffer;
      let uploadOptions: any = {
        resource_type: 'auto',
        folder: 'himti-api',
      };

      // Process images to fix rotation
      if (file.mimetype.startsWith('image/')) {
        // For images, apply compression and orientation fix
        processedBuffer = await this.compressImageIfNeeded(file);
        
        // Tell Cloudinary to respect image orientation
        uploadOptions.angle = 'exif';
      } else {
        // For non-images, use the original buffer
        processedBuffer = file.buffer;
      }
      
      // Convert the buffer to base64
      const fileBase64 = processedBuffer.toString('base64');
      const dataURI = `data:${file.mimetype};base64,${fileBase64}`;
      
      // Upload to Cloudinary with orientation fix
      const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

      return { 
        url: result.secure_url 
      };
    } catch (error) {
      throw new BadRequestException(`Error uploading file: ${error.message}`);
    }
  }
} 