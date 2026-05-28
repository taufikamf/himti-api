import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('media')
  @ApiOperation({ summary: 'Upload a media file (image, video, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 5MB max size (5 * 1024 * 1024 bytes)
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          // Allow common image and video formats
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|webp)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadService.uploadFile(file);
  }

  @Get('media/:id')
  @ApiOperation({ summary: 'Get media by ID' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  async getMediaById(@Param('id') id: string) {
    return this.uploadService.getMediaById(id);
  }
}
