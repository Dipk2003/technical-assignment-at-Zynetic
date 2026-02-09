import { Controller, Get, Param } from '@nestjs/common';
import { StatusService } from './status.service';

@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get('vehicle/:vehicleId')
  async getVehicleStatus(@Param('vehicleId') vehicleId: string) {
    return this.statusService.getVehicleStatus(vehicleId);
  }

  @Get('meter/:meterId')
  async getMeterStatus(@Param('meterId') meterId: string) {
    return this.statusService.getMeterStatus(meterId);
  }
}
