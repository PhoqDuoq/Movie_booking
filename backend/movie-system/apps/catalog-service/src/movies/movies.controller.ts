import { Controller, Get, Param } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  
  @Get()
  async findAll() {
    return this.moviesService.findAll();
  }

  @Get('now-showing')
  async findNowShowing() {
    const all = await this.moviesService.findAll();
    return all.filter(m => m.status === 'NOW_SHOWING');
  }

  @Get('coming-soon')
  async findComingSoon() {
    const all = await this.moviesService.findAll();
    return all.filter(m => m.status === 'COMING_SOON');
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }
}
