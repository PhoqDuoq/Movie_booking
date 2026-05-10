import { Controller, Get } from '@nestjs/common';
import { TheatersService } from './theaters.service';

@Controller('theaters')
export class TheatersController {
  constructor(private readonly theatersService: TheatersService) {}

  @Get()
  async findAll() {
    return this.theatersService.findAll();
  }
}
