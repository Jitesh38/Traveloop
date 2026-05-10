import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UploadedFile,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadService } from '../modules/upload/services/upload.service';
import { UploadSingle } from '../modules/upload/decorators/upload.decorator';
import { FileValidationPipe } from '../modules/upload/validators/file-validation.pipe';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UploadSingle('picture')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['firstName', 'lastName', 'email', 'password'],
      properties: {
        firstName:            { type: 'string', example: 'John' },
        lastName:             { type: 'string', example: 'Doe' },
        email:                { type: 'string', example: 'john.doe@example.com' },
        phone:                { type: 'string', example: '+1234567890' },
        city:                 { type: 'string', example: 'New York' },
        country:              { type: 'string', example: 'USA' },
        additionalInformation:{ type: 'string', example: 'Travel enthusiast.' },
        password:             { type: 'string', example: 'StrongPass@123' },
        picture:              { type: 'string', format: 'binary', description: 'Optional profile picture (JPEG, PNG, WEBP, GIF — max 5 MB)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(new FileValidationPipe({ optional: true }))
    picture?: Express.Multer.File,
  ) {
    let pictureUrl: string | undefined;

    if (picture) {
      const uploaded = await this.uploadService.uploadSingle(picture);
      pictureUrl = uploaded.data.url;
    }

    return this.usersService.register(createUserDto, pictureUrl);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
