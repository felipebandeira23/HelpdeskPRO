import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('api/billing')
export class BillingController {
  constructor(private service: BillingService) {}

  @Post('contracts')
  async createContract(@Body() data: any): Promise<any> {
    return this.service.createContract(data);
  }

  @Get('contracts/:id')
  async getContractStatus(@Param('id') id: string): Promise<any> {
    return this.service.getContractStatus(id);
  }

  @Post('invoices')
  async generateInvoice(
    @Body() data: { contractId: string; from: Date; to: Date },
  ): Promise<any> {
    return this.service.generateInvoice(data.contractId, {
      from: new Date(data.from),
      to: new Date(data.to),
    });
  }

  @Post('payments')
  async recordPayment(
    @Body() data: { contractId: string; amount: number; method: string },
  ): Promise<any> {
    return this.service.recordPayment(data.contractId, data.amount, data.method);
  }

  @Post('suspend')
  async suspendContract(@Body() data: { contractId: string; reason: string }): Promise<any> {
    return this.service.suspendContract(data.contractId, data.reason);
  }

  @Get('history/:customerId')
  async getBillingHistory(@Param('customerId') customerId: string): Promise<any> {
    return this.service.getCustomerBillingHistory(customerId);
  }
}
