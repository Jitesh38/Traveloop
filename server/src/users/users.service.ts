import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async register(
    createUserDto: CreateUserDto,
    pictureUrl?: string,
  ): Promise<Omit<User, 'password' | 'hashPassword'>> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.usersRepository.create({ ...createUserDto, pictureUrl });
    const saved = await this.usersRepository.save(user);

    // Strip password from the response
    const { password: _, ...result } = saved;
    return result;
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
