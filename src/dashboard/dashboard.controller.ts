import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ExportRequest } from './interface/dashboard.interface';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  async getDashboard() {
    const dashboard = await this.dashboardService.getDashboard();
    return dashboard;
  }

  @Get('/money')
  async getMoney(@Query('date_time') date_time: string) {
    const res = await this.dashboardService.getMoney({ date_time });
    return res;
  }

  @Patch('/money/status/:money_id')
  async updateMoneyStatus(
    @Param('money_id') money_id: number,
    @Body('status') status: 'pending' | 'confirmed' | 'cancelled'
  ) {
    return this.dashboardService.updateMoneyStatus(money_id, status);
  }

  @Patch('/location/:car_id')
  async updateLocation(
    @Param('car_id') car_id: number,
    @Body() body: { latitude: string; longitude: string },
  ) {
    const res = await this.dashboardService.updateLocation(car_id, body);
    return res;
  }

  @Get('/car/location')
  async getCarLocation() {
    const res = await this.dashboardService.getCarLocation();
    return res;
  }

  @Patch('/export')
  async export(@Body() body: ExportRequest) {
    try {
      if (!body.type) {
        return { error: 'Type is required' };
      }
      if (body.type !== 'stock') {
        if (!body.date_from) {
          return { error: 'Date from is required' };
        }
        if (!body.date_to) {
          return { error: 'Date to is required' };
        }
      }
      const res = await this.dashboardService.export(body);
      return res;
    } catch (error) {
      return { error: error.message };
    }
  }
}
