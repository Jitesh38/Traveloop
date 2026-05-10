import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private buildAuthResponse(user: User): AuthResponseDto {
    const { password: _, hashPassword: __, ...userPayload } = user as any;

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    // Decode to read the actual expiry the JwtService applied
    const decoded = this.jwtService.decode(accessToken) as { exp: number; iat: number };
    const expiresIn = decoded.exp - decoded.iat;

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: userPayload,
    };
  }

  async register(
    createUserDto: CreateUserDto,
    pictureUrl?: string,
  ): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.usersRepository.create({ ...createUserDto, pictureUrl });
    const saved = await this.usersRepository.save(user);

    return this.buildAuthResponse(saved);
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { email, password } = loginUserDto;

    // Explicitly select password (marked select:false on entity)
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Same generic message — never reveal which field was wrong
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
