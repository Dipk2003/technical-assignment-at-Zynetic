import { Body, Controller, Put } from '@nestjs/common';
import { LinkDto } from './dto/link.dto';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Put()
  async upsertLink(@Body() body: LinkDto) {
    await this.linksService.upsertLink(body);
    return { status: 'ok' };
  }
}
