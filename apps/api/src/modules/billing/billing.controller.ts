import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BillingService, Contract } from './billing.service';


interface CreateContractDto {
  customerId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
}

@Controller('api/billing')
export class BillingController {
  constructor(private service: BillingService) {}

  @Post('contracts')
  async createContract(@Body() data: CreateContractDto): Promise<Contract> {
    return this.service.createContract(data);
  }

  @Get('contracts/:id')
  async getContractStatus(@Param('id') id: string): Promise<unknown> {
    return this.service.getContractStatus(id);
  }

  @Post('invoices')
  async generateInvoice(
    @Body() data: { contractId: string; from: Date; to: Date },
  ): Promise<unknown> {
    return this.service.generateInvoice(data.contractId, {
      from: new Date(data.from),
      to: new Date(data.to),
    });
  }

  @Post('payments')
  async recordPayment(
    @Body() data: { contractId: string; amount: number; method: string },
  ): Promise<unknown> {
    return this.service.recordPayment(data.contractId, data.amount, data.method);
  }

  @Post('suspend')
  async suspendContract(@Body() data: { contractId: string; reason: string }): Promise<unknown> {
    return this.service.suspendContract(data.contractId, data.reason);
  }

  @Get('history/:customerId')
  async getBillingHistory(@Param('customerId') customerId: string): Promise<unknown> {
    return this.service.getCustomerBillingHistory(customerId);
  }
}
